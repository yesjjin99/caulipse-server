import request from 'supertest';
import {
  Connection,
  ConnectionOptions,
  createConnection,
  getRepository,
} from 'typeorm';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import app from '../src';
import { db } from '../src/config/db';
import {
  FrequencyEnum,
  LocationEnum,
  WeekDayEnum,
} from '../src/entity/StudyEntity';
import User, { UserRoleEnum } from '../src/entity/UserEntity';
import Notification from '../src/entity/NotificationEntity';

let conn: Connection;
let userid: string;
let studyid: string;

beforeAll(async () => {
  conn = await createConnection({
    ...db,
    database: process.env.DB_DATABASE_TEST,
  } as ConnectionOptions);

  userid = randomUUID();
  const password = bcrypt.hashSync('test', 10);

  const userRepo = getRepository(User);
  const user = new User();
  user.id = userid;
  user.email = 'test@gmail.com';
  user.password = password;
  user.isLogout = false;
  user.token = '';
  user.role = UserRoleEnum.USER;

  await userRepo.save(user);
});

afterAll(async () => {
  await getRepository(Notification).createQueryBuilder().delete().execute();
  await getRepository(User).createQueryBuilder().delete().execute();

  conn.close();
});

describe('POST /api/study', () => {
  let cookies = '';
  beforeEach(async () => {
    // login
    const res = await request(app).post('/api/user/login').send({
      email: 'test@gmail.com',
      password: 'test',
    });
    cookies = res.headers['set-cookie'];
  });

  it('body를 포함한 요청을 받으면 새로운 스터디를 생성하고 생성된 아이디를 반환', async () => {
    const res = await request(app)
      .post('/api/study')
      .set('Cookie', cookies)
      .send({
        title: '스터디 제목',
        studyAbout: '스터디 내용',
        weekday: '월',
        frequency: FrequencyEnum.TWICE,
        location: LocationEnum.CAFE,
        capacity: 8,
        categoryCode: 101,
      });
    const { studyId } = res.body;
    studyid = studyId;

    expect(res.status).toBe(201);
    expect(studyid).not.toBeNull();
  });

  it('유효하지 않은 body를 포함하거나 body를 포함하지 않은 요청을 받으면 400 응답', async () => {
    const res = await request(app)
      .post('/api/study')
      .set('Cookie', cookies)
      .send();

    expect(res.status).toBe(400);
  });

  it('로그인이 되어있지 않은 경우 401 응답', async () => {
    const res = await request(app).post('/api/study').send({
      title: '스터디 제목',
      studyAbout: '스터디 내용',
      weekday: WeekDayEnum.MON,
      frequency: FrequencyEnum.TWICE,
      location: LocationEnum.CAFE,
      capacity: 8,
      categorycode: 101,
    });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/study', () => {
  it('query를 포함한 요청을 받으면 필터링, 정렬, 페이지네이션을 거친 후 스터디 목록과 페이지 커서 반환(첫번째 페이지)', async () => {
    const res = await request(app).get('/api/study').query({
      categoryCode: 101,
      frequency: FrequencyEnum.TWICE,
      weekday: '월',
      location: LocationEnum.CAFE,
    });
    const { studies, next_cursor } = res.body;

    expect(res.status).toBe(200);
    expect(studies).not.toBeNull();
    expect(next_cursor).not.toBeNull();

    expect(studies[0]).toHaveProperty('frequency', FrequencyEnum.TWICE);
    expect(studies[0]).toHaveProperty('weekday', WeekDayEnum.MON);
    expect(studies[0]).toHaveProperty('location', LocationEnum.CAFE);
  });
});

describe('GET /api/study/:studyid', () => {
  it('각 studyid에 따라 모든 스터디 상세 정보 반환', async () => {
    const res = await request(app).get(`/api/study/${studyid}`);
    const { study } = res.body;

    expect(res.status).toBe(200);
    expect(study).toHaveProperty('id', studyid);
  });

  it('요청된 studyid가 데이터베이스에 존재하지 않으면 404 응답', async () => {
    const res = await request(app).get('/api/study/wrong');

    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/study/:studyid', () => {
  let cookies = '';
  beforeEach(async () => {
    // login
    const res = await request(app).post('/api/user/login').send({
      email: 'test@gmail.com',
      password: 'test',
    });
    cookies = res.headers['set-cookie'];
  });

  it('body를 포함한 요청을 받으면 studyid에 해당하는 스터디 업데이트', async () => {
    const res = await request(app)
      .patch(`/api/study/${studyid}`)
      .set('Cookie', cookies)
      .send({
        title: 'STUDY TITLE',
        studyAbout: 'STUDY ABOUT',
        weekday: WeekDayEnum.TUE,
        frequency: FrequencyEnum.MORE,
        location: LocationEnum.LIBRARY,
        capacity: 10,
        categoryCode: 101,
      });

    expect(res.status).toBe(200);
  });

  it('유효하지 않은 body를 포함한 요청을 받으면 400 응답', async () => {
    const res = await request(app)
      .patch(`/api/study/${studyid}`)
      .set('Cookie', cookies)
      .send({ createdAt: 'abcd', title: 'asdf' });

    expect(res.status).toBe(400);
  });

  it('body를 포함하지 않은 요청을 받으면 400 응답', async () => {
    const res = await request(app)
      .patch(`/api/study/${studyid}`)
      .set('Cookie', cookies)
      .send();

    expect(res.status).toBe(400);
  });

  it('로그인이 되어있지 않은 경우 401 응답', async () => {
    const res = await request(app).patch(`/api/study/${studyid}`).send({
      title: 'STUDY TITLE',
      studyAbout: 'STUDY ABOUT',
      weekday: WeekDayEnum.TUE,
      frequency: FrequencyEnum.MORE,
      location: LocationEnum.LIBRARY,
      capacity: 10,
      categoryCode: 101,
    });

    expect(res.status).toBe(401);
  });

  it('요청된 studyid가 데이터베이스에 존재하지 않으면 404 응답', async () => {
    const res = await request(app)
      .patch('/api/study/wrong')
      .set('Cookie', cookies)
      .send({
        title: 'STUDY TITLE',
        studyAbout: 'STUDY ABOUT',
        weekday: WeekDayEnum.TUE,
        frequency: FrequencyEnum.MORE,
        location: LocationEnum.LIBRARY,
        capacity: 10,
        categoryCode: 101,
      });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/study/:studyid', () => {
  let cookies = '';
  beforeEach(async () => {
    // login
    const res = await request(app).post('/api/user/login').send({
      email: 'test@gmail.com',
      password: 'test',
    });
    cookies = res.headers['set-cookie'];
  });

  it('요청된 studyid가 데이터베이스에 존재하지 않으면 404 응답', async () => {
    const res = await request(app)
      .delete('/api/study/wrong')
      .set('Cookie', cookies)
      .send();

    expect(res.status).toBe(404);
  });

  it('로그인이 되어있지 않은 경우 401 응답', async () => {
    const res = await request(app).delete(`/api/study/${studyid}`).send();

    expect(res.status).toBe(401);
  });

  it('요청된 studyid에 해당하는 스터디 삭제', async () => {
    const res = await request(app)
      .delete(`/api/study/${studyid}`)
      .set('Cookie', cookies)
      .send();

    expect(res.status).toBe(200);
  });
});
