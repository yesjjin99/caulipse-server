import app from '../src';
import request from 'supertest';
import { Connection, ConnectionOptions, createConnection } from 'typeorm';
import { db } from '../src/config/db';
import { randomUUID } from 'crypto';
import Notice from '../src/entity/NoticeEntity';
import User, { UserRoleEnum } from '../src/entity/UserEntity';
import bcrypt from 'bcrypt';
import Notification from '../src/entity/NotificationEntity';

let conn: Connection;
const noticeId = randomUUID();
const admin = new User();

beforeAll(async () => {
  conn = await createConnection({
    ...db,
    database: process.env.DB_DATABASE_TEST,
  } as ConnectionOptions);

  admin.id = randomUUID();
  admin.email = 'testadmin@cau.ac.kr';
  admin.password = bcrypt.hashSync('testadmin', 10);
  admin.isLogout = false;
  admin.role = UserRoleEnum.ADMIN;
  admin.token = '';
  await conn.getRepository(User).save(admin);

  const user = new User();
  user.id = randomUUID();
  user.email = 'testuser@cau.ac.kr';
  user.password = bcrypt.hashSync('testuser', 10);
  user.isLogout = false;
  user.role = UserRoleEnum.USER;
  user.token = '';
  await conn.getRepository(User).save(user);

  const notice = new Notice();
  notice.id = noticeId;
  notice.title = 'test notice title';
  notice.about = 'test notice about';
  notice.views = 0;
  notice.createdAt = new Date();
  notice.hostId = admin;
  await conn.getRepository(Notice).save(notice);
});

afterAll(async () => {
  await conn
    .getRepository(Notification)
    .createQueryBuilder()
    .delete()
    .execute();
  await conn.getRepository(Notice).createQueryBuilder().delete().execute();
  await conn.getRepository(User).createQueryBuilder().delete().execute();
  conn.close();
});

describe('공지사항 조회 api', () => {
  test('로그인하지 않아도 401 코드로 응답하지 않는다.', async () => {
    const res = await request(app).get('/api/notice');
    expect(res.statusCode).not.toBe(401);
  });

  test('데이터를 조회한다', async () => {
    const res = await request(app).get('/api/notice');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe('공지사항 페이지네이션', () => {
  beforeAll(async () => {
    const notices = [];
    const itemNumber = 30;
    const makeNoticeRecord = (idx: number) => {
      const notice = new Notice();
      notice.id = randomUUID();
      notice.title = `페이지네이션 테스트`;
      notice.about = `${idx}`;
      notice.views = 0;
      notice.createdAt = new Date();
      notice.hostId = admin;
      return notice;
    };
    for (let i = 0; i < itemNumber; i++) notices.push(makeNoticeRecord(i));
    await conn
      .getRepository(Notice)
      .createQueryBuilder()
      .insert()
      .values(notices)
      .execute();
  });

  afterAll(async () => {
    await conn
      .getRepository(Notice)
      .createQueryBuilder()
      .delete()
      .where('TITLE = :title', { title: '페이지네이션 테스트' })
      .execute();
  });

  test('5개의 항목을 요청하면 5개의 항목만 반환한다', async () => {
    // given
    const amount = 5;

    // when
    const res = await request(app).get(`/api/notice?amount=${amount}`);

    // then
    expect(res.body.data.length).toBe(5);
  });

  test('쿼리스트링 정보를 아무것도 주지 않으면 12개의 항목을 반환한다', async () => {
    // given
    // when
    const res = await request(app).get('/api/notice');

    // then
    expect(res.body.data.length).toBe(12);
  });
});

describe('공지사항 업데이트 api', () => {
  test('로그인하지 않은 경우 401 코드로 응답한다', async () => {
    const res = await request(app).patch(`/api/notice/${noticeId}`);
    expect(res.statusCode).toBe(401);
  });

  test('유효하지 않은 request body로 요청을 보낼 경우 400 코드로 응답한다', async () => {
    // given
    const loginRes = await request(app)
      .post('/api/user/login')
      .send({ email: 'testadmin@cau.ac.kr', password: 'testadmin' });
    const cookies = loginRes.headers['set-cookie'];

    // when
    const res = await request(app)
      .patch(`/api/notice/${noticeId}`)
      .set('Cookie', cookies)
      .send();

    // then
    expect(res.statusCode).toBe(400);
  });

  test('어드민이 아닌 사용자가 요청을 보낼 경우 403 코드로 응답한다', async () => {
    // given
    const title = 'changed title';
    const noticeAbout = 'changed about';

    const loginRes = await request(app)
      .post('/api/user/login')
      .send({ email: 'testuser@cau.ac.kr', password: 'testuser' });
    const cookies = loginRes.headers['set-cookie'];

    // when
    const res = await request(app)
      .patch(`/api/notice/${noticeId}`)
      .set('Cookie', cookies)
      .send({ title, noticeAbout });

    // then
    expect(res.statusCode).toBe(403);
  });

  test('올바르지 않은 공지사항 id로 요청을 보낼 경우 404 코드로 응답한다', async () => {
    // given
    const title = 'changed title';
    const noticeAbout = 'changed about';
    const wrongNoticeId = 'aksodjfosajd';

    const loginRes = await request(app)
      .post('/api/user/login')
      .send({ email: 'testadmin@cau.ac.kr', password: 'testadmin' });
    const cookies = loginRes.headers['set-cookie'];

    // when
    const res = await request(app)
      .patch(`/api/notice/${wrongNoticeId}`)
      .set('Cookie', cookies)
      .send({ title, noticeAbout });

    // then
    expect(res.statusCode).toBe(404);
  });

  test('올바른 요청을 보낼 경우 공지사항 정보를 업데이트하고 200 코드로 응답한다', async () => {
    // given
    const title = 'changed title';
    const noticeAbout = 'changed about';

    const loginRes = await request(app)
      .post('/api/user/login')
      .send({ email: 'testadmin@cau.ac.kr', password: 'testadmin' });
    const cookies = loginRes.headers['set-cookie'];

    // when
    const before = await conn.getRepository(Notice).findOne(noticeId);
    const res = await request(app)
      .patch(`/api/notice/${noticeId}`)
      .set('Cookie', cookies)
      .send({ title, noticeAbout });
    const after = await conn.getRepository(Notice).findOne(noticeId);

    // then
    expect(res.statusCode).toBe(200);
    expect(before?.title).not.toBe(title);
    expect(before?.about).not.toBe(noticeAbout);
    expect(after?.title).toBe(title);
    expect(after?.about).toBe(noticeAbout);
  });
});
