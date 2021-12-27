import bcrypt from 'bcrypt';
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

afterAll(() => {
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

    await repo.delete({ id });
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
});
