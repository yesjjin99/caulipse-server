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
import Study, {
  FrequencyEnum,
  LocationEnum,
  WeekDayEnum,
} from '../src/entity/StudyEntity';
import User, { UserRoleEnum } from '../src/entity/UserEntity';
import Category from '../src/entity/CategoryEntity';

let conn: Connection;
let userId: string;
let studyId: string;

beforeAll(async () => {
  conn = await createConnection({
    ...db,
    database: process.env.DB_DATABASE_TEST,
  } as ConnectionOptions);

  userId = randomUUID();
  const password = bcrypt.hashSync('test', 10);

  const userRepo = getRepository(User);
  const user = new User();
  user.id = userId;
  user.email = 'test@gmail.com';
  user.password = password;
  user.isLogout = false;
  user.token = '';
  user.role = UserRoleEnum.USER;

  await userRepo.save(user);

  const categoryRepo = getRepository(Category);
  const category = new Category();
  category.code = 101;
  category.main = '프로그래밍';
  category.sub = '자바스크립트';

  await categoryRepo.save(category);
});

afterAll(async () => {
  await getRepository(User).createQueryBuilder().delete().execute();
  await getRepository(Category).createQueryBuilder().delete().execute();

  conn.close();
});

describe('POST /api/study', () => {
  //login

  it('body를 포함한 요청을 받으면 새로운 스터디를 생성하고 생성된 아이디를 반환', async () => {
    const res = await request(app).post('/api/study').send({
      title: '스터디 제목',
      studyAbout: '스터디 내용',
      weekday: WeekDayEnum.MON,
      frequency: FrequencyEnum.TWICE,
      location: LocationEnum.CAFE,
      capacity: 8,
      hostId: userId,
      categoryCode: 101,
    });
    const { message, id } = res.body;
    studyId = id;

    expect(res.status).toBe(201);
    expect(id).not.toBeNull();
  });

  it('유효하지 않은 body를 포함하거나 body를 포함하지 않은 요청을 받으면 400 응답', async () => {
    const res = await request(app).post('/api/study').send({ hostId: userId });

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
  it('query를 포함한 요청을 받으면 필터링, 정렬, 페이지네이션을 거친 후 스터디 목록과 페이지 커서 반환', async () => {
    const res = await request(app).get('/api/study').query({
      frequencyFilter: FrequencyEnum.TWICE,
      weekdayFilter: WeekDayEnum.MON,
      locationFilter: LocationEnum.CAFE,
    });
    const { message, perPage_studies, next_cursor } = res.body;

    expect(res.status).toBe(200);
    expect(perPage_studies).not.toBeNull();
    expect(next_cursor).not.toBeNull();
  });
});

describe('GET /api/study/:studyid', () => {
  it('각 studyid에 따라 모든 스터디 상세 정보 반환', async () => {
    const res = await request(app).get(`/api/study/${studyId}`);
    const { message, study } = res.body;

    expect(res.status).toBe(200);
    expect(study).toHaveProperty('id', studyId);
  });

  it('요청된 studyid가 데이터베이스에 존재하지 않으면 404 응답', async () => {
    const res = await request(app).get('/api/study/wrong');

    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/study/:studyid', () => {
  // login

  it('body를 포함한 요청을 받으면 studyid에 해당하는 스터디 업데이트', async () => {
    const res = await request(app).patch(`/api/study/${studyId}`).send({
      title: 'STUDY TITLE',
      studyAbout: 'STUDY ABOUT',
      weekday: WeekDayEnum.TUE,
      frequency: FrequencyEnum.MORE,
      location: LocationEnum.LIBRARY,
      capacity: 10,
      hostId: userId,
      categoryCode: 101,
    });

    expect(res.status).toBe(200);
  });

  it('유효하지 않은 body를 포함하거나 body를 포함하지 않은 요청을 받으면 400 응답', async () => {
    const res = await request(app)
      .patch(`/api/study/${studyId}`)
      .send({ hostId: userId });

    expect(res.status).toBe(400);
  });

  it('로그인이 되어있지 않은 경우 401 응답', async () => {
    const res = await request(app).patch(`/api/study/${studyId}`).send({
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
    const res = await request(app).patch('/api/study/wrong').send({
      title: 'STUDY TITLE',
      studyAbout: 'STUDY ABOUT',
      weekday: WeekDayEnum.TUE,
      frequency: FrequencyEnum.MORE,
      location: LocationEnum.LIBRARY,
      capacity: 10,
      hostId: userId,
      categoryCode: 101,
    });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/study/:studyid', () => {
  // FIX: Add login case

  it('요청된 studyid가 데이터베이스에 존재하지 않으면 404 응답', async () => {
    const res = await request(app).delete('/api/study/wrong');

    expect(res.status).toBe(404);
  });

  it('요청된 studyid에 해당하는 스터디 삭제', async () => {
    const res = await request(app).delete(`/api/study/${studyId}`);

    expect(res.status).toBe(200);
  });
});
