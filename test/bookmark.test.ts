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
import Category from '../src/entity/CategoryEntity';
import Study, {
  FrequencyEnum,
  LocationEnum,
  WeekDayEnum,
} from '../src/entity/StudyEntity';

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

describe('PATCH /api/study/:studyid/bookmark', () => {
  let cookies = '';
  beforeEach(async () => {
    // login
    const res = await request(app).post('/api/user/login').send({
      email: 'test@gmail.com',
      password: 'test',
    });
    cookies = res.headers['set-cookie'];
  });

  it('새로운 북마크를 생성해 DB에 북마크를 등록한 study와 user 정보를 저장', async () => {
    const res = await request(app)
      .patch(`/api/study/${studyid}/bookmark`)
      .set('Cookie', cookies)
      .send();

    expect(res.status).toBe(200);
  });
});
