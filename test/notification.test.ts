import { randomUUID } from 'crypto';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { Connection, ConnectionOptions, createConnection } from 'typeorm';
import app from '../src';
import { db } from '../src/config/db';
import Category from '../src/entity/CategoryEntity';
import User, { UserRoleEnum } from '../src/entity/UserEntity';
import Notification from '../src/entity/NotificationEntity';
import Study, {
  FrequencyEnum,
  LocationEnum,
  WeekDayEnum,
} from '../src/entity/StudyEntity';

let conn: Connection;
let mockStudy: Study;
let mockUser1: User, mockUser2: User;
let mockNoti1: Notification, mockNoti2: Notification, mockNoti3: Notification;

beforeAll(async () => {
  conn = await createConnection({
    ...db,
    database: process.env.DB_DATABASE_TEST,
  } as ConnectionOptions);

  mockUser1 = new User();
  mockUser1.id = randomUUID();
  mockUser1.email = 'mockuser1@test.com';
  mockUser1.password = bcrypt.hashSync('testpassword', 10);
  mockUser1.isLogout = false;
  mockUser1.token = '';
  await conn.getRepository(User).save(mockUser1);

  mockUser2 = new User();
  mockUser2.id = randomUUID();
  mockUser2.email = 'mockuser2@test.com';
  mockUser2.password = bcrypt.hashSync('testpassword', 10);
  mockUser2.isLogout = false;
  mockUser2.token = '';
  await conn.getRepository(User).save(mockUser2);

  mockStudy = new Study();
  mockStudy.id = randomUUID();
  mockStudy.title = 'STUDY TITLE';
  mockStudy.studyAbout = 'STUDY ABOUT';
  mockStudy.weekday = WeekDayEnum.TUE;
  mockStudy.frequency = FrequencyEnum.MORE;
  mockStudy.location = LocationEnum.LIBRARY;
  mockStudy.capacity = 10;
  mockStudy.hostId = mockUser2;
  mockStudy.categoryCode = new Category();
  mockStudy.membersCount = 10;
  mockStudy.vacancy = 10;
  mockStudy.isOpen = true;
  mockStudy.views = 0;
  await conn.getRepository(Study).save(mockStudy);

  mockNoti1 = new Notification();
  mockNoti1.id = randomUUID();
  mockNoti1.user = mockUser1;
  mockNoti1.read = false;
  mockNoti1.study = mockStudy;
  mockNoti1.type = 0;
  mockNoti1.read = false;
  await conn.getRepository(Notification).save(mockNoti1);
});

afterAll(async () => {
  await conn
    .getRepository(Notification)
    .createQueryBuilder()
    .delete()
    .execute();
  await conn.getRepository(Study).createQueryBuilder().delete().execute();
  await conn.getRepository(User).createQueryBuilder().delete().execute();
  conn.close();
});

describe('사용자 알림 조회 api', () => {
  test('로그인하지 않았을 경우 401 코드로 응답한다', async () => {
    const res = await request(app).get('/api/user/notification/');
    expect(res.statusCode).toBe(401);
  });

  test('정상적인 요청의 경우 200 코드와 함께 데이터를 응답한다', async () => {
    // given
    const { email } = mockUser1;
    const password = 'testpassword';
    const loginRes = await request(app)
      .post('/api/user/login')
      .send({ email, password });
    const cookies = loginRes.headers['set-cookie'];

    // when
    const res = await request(app)
      .get('/api/user/notification')
      .set('Cookie', cookies);

    // then
    const data = res.body;
    expect(res.statusCode).toBe(200);
    expect(data.length).toBe(1);
    expect(data[0].Notification_ID).toBe(mockNoti1.id);
    expect(data[0].Notification_USER_ID).toBe(mockUser1.id);
    expect(data[0].Notification_STUDY_ID).toBe(mockStudy.id);
  });
});

// TODO: 사용자 알림 확인 상태 갱신 테스트코드 구현
