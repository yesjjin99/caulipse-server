import request from 'supertest';
import {
  Connection,
  ConnectionOptions,
  createConnection,
  getRepository,
} from 'typeorm';
import app from '../src';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import { db } from '../src/config/db';
import User, { UserRoleEnum } from '../src/entity/UserEntity';
import Study, {
  WeekDayEnum,
  FrequencyEnum,
  LocationEnum,
} from '../src/entity/StudyEntity';
import Category from '../src/entity/CategoryEntity';

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

  const categoryRepo = getRepository(Category);
  const category = new Category();
  category.code = 101;
  category.main = '프로그래밍';
  category.sub = '자바스크립트';

  await categoryRepo.save(category);

  studyid = randomUUID();
  const studyRepo = getRepository(Study);
  const study = new Study();
  study.id = studyid;
  study.createdAt = new Date();
  study.title = '스터디 제목';
  study.studyAbout = '스터디 내용';
  study.weekday = WeekDayEnum.MON;
  study.frequency = FrequencyEnum.ONCE;
  study.location = LocationEnum.CAFE;
  study.hostId = user;
  study.capacity = 10;
  study.membersCount = 0;
  study.vacancy = 10;
  study.isOpen = true;
  study.categoryCode = category;
  study.views = 0;

  await studyRepo.save(study);
});

afterAll(async () => {
  await getRepository(Study).createQueryBuilder().delete().execute();
  await getRepository(User).createQueryBuilder().delete().execute();
  await getRepository(Category).createQueryBuilder().delete().execute();

  conn.close();
});

describe('POST /api/study/:studyid/bookmark', () => {
  let cookies = '';
  beforeEach(async () => {
    // login
    const res = await request(app).post('/api/user/login').send({
      email: 'test@gmail.com',
      password: 'test',
    });
    cookies = res.headers['set-cookie'];
  });

  it('studyid에 해당하는 스터디를 찾아 북마크 생성', async () => {
    const res = await request(app)
      .post(`/api/study/${studyid}/bookmark`)
      .set('Cookie', cookies)
      .send();

    expect(res.status).toBe(201);
  });

  it('로그인이 되어있지 않은 경우 401 응답', async () => {
    const res = await request(app)
      .post(`/api/study/${studyid}/bookmark`)
      .send();

    expect(res.status).toBe(401);
  });

  it('요청된 studyid가 데이터베이스에 존재하지 않으면 404 응답', async () => {
    const res = await request(app)
      .post(`/api/study/wrong/bookmark`)
      .set('Cookie', cookies)
      .send();

    expect(res.status).toBe(404);
  });
});

describe('GET /api/user/bookmark', () => {
  let cookies = '';
  beforeEach(async () => {
    // login
    const res = await request(app).post('/api/user/login').send({
      email: 'test@gmail.com',
      password: 'test',
    });
    cookies = res.headers['set-cookie'];
  });

  it('해당 사용자의 모든 북마크 목록 반환', async () => {
    const res = await request(app)
      .get('/api/user/bookmark')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
  });

  it('로그인이 되어있지 않은 경우 401 응답', async () => {
    const res = await request(app).get('/api/user/bookmark');

    expect(res.status).toBe(401);
  });
});
