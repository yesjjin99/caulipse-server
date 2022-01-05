import { randomUUID } from 'crypto';
import request from 'supertest';
import {
  Connection,
  ConnectionOptions,
  createConnection,
  getRepository,
} from 'typeorm';
import User, { UserRoleEnum } from '../src/entity/UserEntity';
import app from '../src';
import { db } from '../src/config/db';
import bcrypt from 'bcrypt';
import { parseCookie } from '../src/utils/cookie';

let conn: Connection;

beforeAll(async () => {
  conn = await createConnection({
    ...db,
    database: process.env.DB_DATABASE_TEST,
  } as ConnectionOptions);

  const password = bcrypt.hashSync('test', 10);

  await getRepository(User)
    .createQueryBuilder()
    .insert()
    .values({
      id: randomUUID(),
      email: 'test@example.com',
      password: password,
      isLogout: false,
      token: '',
      role: UserRoleEnum.USER,
    })
    .execute();
});

afterAll(async () => {
  await conn.getRepository(User).createQueryBuilder().delete().execute();
  conn.close();
});

describe('로그인 api', () => {
  test('/api/user/login에 요청을 전송할 시 쿠키에 액세스 토큰과 리프레시 토큰을 발급한다', async () => {
    // given
    const email = 'test@example.com';
    const password = 'test';

    // when
    const res = await request(app)
      .post('/api/user/login')
      .send({ email, password });
    const cookies = res.headers['set-cookie'].map((cookie: string) =>
      parseCookie(cookie)
    );
    const accessToken = cookies.find(
      (cookie: { name: string }) => cookie.name === 'accessToken'
    );
    const refreshToken = cookies.find(
      (cookie: { name: string }) => cookie.name === 'refreshToken'
    );

    // then
    expect(accessToken).not.toBe(-1);
    expect(refreshToken).not.toBe(-1);
  });
});
