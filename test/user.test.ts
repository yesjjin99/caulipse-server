import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { Connection, ConnectionOptions, createConnection } from 'typeorm';
import app from '../src';
import { db } from '../src/config/db';
import User, { UserRoleEnum } from '../src/entity/UserEntity';

let conn: Connection;

beforeAll(async () => {
  conn = await createConnection({
    ...db,
    database: process.env.DB_DATABASE_TEST,
  } as ConnectionOptions);
});

afterAll(async () => {
  await conn.getRepository(User).createQueryBuilder().delete().execute();
  conn.close();
});

describe('회원가입 api', () => {
  test('email, password 정보를 포함한 회원가입 요청을 보낼 시 정상적으로 데이터베이스에 유저 정보가 생성된다', async () => {
    // given
    const email = 'example@test.com';
    const password = 'testpassword';

    // when
    const res = await request(app).post('/api/user').send({ email, password });
    const { message, id } = res.body;
    const repo = conn.getRepository(User);
    const user = await repo.findOne(id);

    // then
    expect(res.statusCode).toBe(201);
    expect(message).toBeTruthy();
    expect(id).toBeTruthy();

    expect(user).toBeTruthy();
    expect(user?.id).toEqual(id);
    expect(user?.email).toEqual('example@test.com');
    /* eslint-disable-next-line */
    expect(bcrypt.compareSync('testpassword', user!.password)).toBeTruthy();
    expect(user?.isLogout).toBe(false);
    expect(user?.token).toBeTruthy();
    expect(user?.role).toEqual(UserRoleEnum.GUEST);
  });

  test('email 또는 password 정보를 body에 포함하지 않으면 코드 400으로 응답한다', async () => {
    // given
    const signupFailureLabel = '회원가입 실패';

    // when
    const res = await request(app).post('/api/user').send({});

    // then
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain(signupFailureLabel);
    expect(res.body.id).toBeFalsy();
  });

  test('이메일 링크를 클릭할 시 사용자 권한을 USER로 업데이트한다', async () => {
    // given
    const repo = conn.getRepository(User);
    const user = await repo.findOne();

    // when
    const res = await request(app)
      .patch(`/api/user/${user?.id}/role`)
      .send({ token: user?.token });
    const { message, id } = res.body;
    const updatedUser = await repo.findOne({ id: user?.id });

    // then
    expect(res.statusCode).toBe(200);
    expect(message).toBeTruthy();
    expect(id).toEqual(user?.id);

    expect(updatedUser).toBeTruthy();
    expect(updatedUser?.id).toEqual(id);
    expect(updatedUser?.email).toEqual(user?.email);
    expect(updatedUser?.password).toEqual(user?.password);
    expect(updatedUser?.isLogout).toEqual(user?.isLogout);
    expect(updatedUser?.token).toEqual(user?.token);
    expect(updatedUser?.role).toEqual(UserRoleEnum.USER);
  });

  test('이메일 링크를 클릭할 시 경로가 잘못되었을 경우 403 응답을 반환한다', async () => {
    // given
    const repo = conn.getRepository(User);
    const user = await repo.findOne();
    const invalidUserId = 'aaaaaa';
    const invalidUserIdLabel = '회원가입 실패';

    // when
    const res = await request(app)
      .patch(`/api/user/${invalidUserId}/role`)
      .send({ token: user?.token });
    const { message, id } = res.body;

    // then
    expect(res.statusCode).toBe(403);
    expect(message).toContain(invalidUserIdLabel);
    expect(id).toBeFalsy();
  });

  test('이메일 링크를 클릭할 시 토큰이 만료되었을 경우 403 응답을 반환한다', async () => {
    // given
    const expiredTokenLabel = '회원가입 실패';
    const repo = conn.getRepository(User);
    const user = await repo.findOne();
    const invalidToken = jwt.sign(
      { id: user?.id },
      process.env.SIGNUP_TOKEN_SECRET as string,
      {
        algorithm: 'HS256',
        expiresIn: 0,
      }
    );

    // when
    const res = await request(app)
      .patch(`/api/user/${user?.id}/role`)
      .send({ token: invalidToken });
    const { message, id } = res.body;

    // then
    expect(res.statusCode).toBe(403);
    expect(message).toContain(expiredTokenLabel);
    expect(id).toBeFalsy();
  });

  test('이메일 링크를 클릭할 시 토큰이 요청에 포함되지 않을 경우 400 응답을 반환한다', async () => {
    // given
    const repo = conn.getRepository(User);
    const user = await repo.findOne();
    const invalidToken = 'asdfasdf';
    const invalidTokenLabel = '회원가입 실패';

    // when
    const res = await request(app)
      .patch(`/api/user/${user?.id}/role`)
      .send({ token: invalidToken });
    const { message, id } = res.body;

    // then
    expect(res.statusCode).toBe(400);
    expect(message).toContain(invalidTokenLabel);
    expect(id).toBeFalsy();
  });

  test('이메일 클릭 시 이미 가입이 완료된 사용자에 대한 요청을 보낼 시 404 응답을 반환한다', async () => {
    // given
    const email = 'user@test.com';
    const password = 'userpassword';
    const invalidRequestLabel = '회원가입 실패';

    const repo = conn.getRepository(User);
    const userResult = await request(app)
      .post('/api/user')
      .send({ email, password });
    const userId = userResult.body.id;
    await repo
      .createQueryBuilder()
      .update()
      .set({ role: UserRoleEnum.USER })
      .where('id = :id', { id: userId })
      .execute();
    const user = await repo.findOne(userId);

    // when
    const res = await request(app)
      .patch(`/api/user/${user?.id}/role`)
      .send({ token: user?.token });
    const { message, id } = res.body;

    // then
    expect(user?.role).toEqual(UserRoleEnum.USER);
    expect(res.statusCode).toBe(404);
    expect(message).toContain(invalidRequestLabel);
    expect(id).toBeFalsy();

    repo.delete({ id: userId });
  });
});

describe('사용자 정보 수정 api', () => {
  test('사용자의 비밀번호 정보를 수정할 수 있다', async () => {
    // given
    const email = 'example@test.com';
    const password = 'testpw';
    const id = randomUUID();
    const userDataBefore = {
      id,
      email,
      password,
      isLogout: false,
      token: '',
      role: UserRoleEnum.USER,
    };
    await conn.getRepository(User).save(userDataBefore);
    const changedPassword = 'changed';

    // when
    const res = await request(app)
      .patch(`/api/user/${id}`)
      .send({ ...userDataBefore, password: changedPassword });
    const userDataAfter = await conn.getRepository(User).findOne({ id });

    // then
    expect(res.statusCode).toBe(200);
    expect(userDataAfter?.password).toBe(changedPassword);
  });

  test('사용자의 이메일 정보를 수정할 수 있다', async () => {
    // given
    const email = 'example@test.com';
    const password = 'testpw';
    const id = randomUUID();
    const userDataBefore = {
      id,
      email,
      password,
      isLogout: false,
      token: '',
      role: UserRoleEnum.USER,
    };
    await conn.getRepository(User).save(userDataBefore);
    const changedEmail = 'changed@test.com';

    // when
    const res = await request(app)
      .patch(`/api/user/${id}`)
      .send({ ...userDataBefore, email: changedEmail });
    const userDataAfter = await conn.getRepository(User).findOne({ id });

    // then
    expect(res.statusCode).toBe(200);
    expect(userDataAfter?.email).toBe(changedEmail);
  });

  test('올바르지 않은 유저에 대한 요청의 경우 404 코드로 응답한다', async () => {
    // given
    const email = 'test@example.com';
    const id = randomUUID();
    const userDataBefore = {
      id,
      email,
      password: 'test',
      isLogout: false,
      token: '',
      role: UserRoleEnum.USER,
    };
    const wrongId = 'xxxx';
    const wrongEmail = 'abcd@example.com';

    // when
    const res = await request(app)
      .patch(`/api/user/${wrongId}`)
      .send({ ...userDataBefore, email: wrongEmail });

    // then
    expect(res.statusCode).toBe(404);
  });
});
