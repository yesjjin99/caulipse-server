import { randomUUID } from 'crypto';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { Connection, ConnectionOptions, createConnection } from 'typeorm';
import app from '../src';
import { db } from '../src/config/db';
import Category from '../src/entity/CategoryEntity';
import Study, {
  FrequencyEnum,
  LocationEnum,
  WeekDayEnum,
} from '../src/entity/StudyEntity';
import StudyUser from '../src/entity/StudyUserEntity';
import User, { UserRoleEnum } from '../src/entity/UserEntity';
import { saveStudyUserRecord } from '../src/services/studyUser';

let conn: Connection;
let mockHost: User;
let mockUser1: User;
let mockUser2: User;
const studyId = randomUUID();

beforeAll(async () => {
  conn = await createConnection({
    ...db,
    database: process.env.DB_DATABASE_TEST,
  } as ConnectionOptions);

  mockHost = new User();
  mockHost.id = randomUUID();
  mockHost.email = 'mockhost@test.com';
  mockHost.password = bcrypt.hashSync('testpassword', 10);
  mockHost.isLogout = false;
  mockHost.token = '';
  await conn.getRepository(User).save(mockHost);

  mockUser1 = new User();
  mockUser1.id = randomUUID();
  mockUser1.email = 'mockuser1@test.com';
  mockUser1.password = 'testpassword';
  mockUser1.isLogout = false;
  mockUser1.token = '';
  await conn.getRepository(User).save(mockUser1);

  mockUser2 = new User();
  mockUser2.id = randomUUID();
  mockUser2.email = 'mockuser2@test.com';
  mockUser2.password = 'testpassword';
  mockUser2.isLogout = false;
  mockUser2.token = '';
  await conn.getRepository(User).save(mockUser2);

  const mockStudy = new Study();
  mockStudy.id = studyId;
  mockStudy.title = 'STUDY TITLE';
  mockStudy.studyAbout = 'STUDY ABOUT';
  mockStudy.weekday = WeekDayEnum.TUE;
  mockStudy.frequency = FrequencyEnum.MORE;
  mockStudy.location = LocationEnum.LIBRARY;
  mockStudy.capacity = 10;
  mockStudy.hostId = mockHost;
  mockStudy.categoryCode = new Category();
  mockStudy.membersCount = 10;
  mockStudy.vacancy = 10;
  mockStudy.isOpen = true;
  mockStudy.views = 0;

  await conn.getRepository(Study).save(mockStudy);
});

afterAll(async () => {
  await conn.getRepository(StudyUser).createQueryBuilder().delete().execute();
  await conn.getRepository(Study).createQueryBuilder().delete().execute();
  await conn.getRepository(User).createQueryBuilder().delete().execute();
  conn.close();
});

describe('참가신청 api', () => {
  test('서비스 로직이 데이터베이스에 레코드를 생성한다', async () => {
    // given
    const userId = randomUUID();
    await conn.getRepository(User).save({
      id: userId,
      email: 'testtt@example.com',
      password: 'testpw',
      isLogout: false,
      token: '',
    });
    const tempBio = 'hi';

    // when
    await saveStudyUserRecord({ userId, studyId, tempBio });
    const found = await conn
      .getRepository(StudyUser)
      .findOne({ USER_ID: userId });

    // then
    expect(found).toBeTruthy();
    expect(found?.tempBio).toBe(tempBio);
  });

  test('참가신청 요청을 보내면 데이터베이스에 레코드를 생성한다', async () => {
    // given
    const userId = randomUUID();
    const email = 'asjdkf@test.com';
    const password = 'testpassword';
    await conn.getRepository(User).save({
      id: userId,
      email,
      password: bcrypt.hashSync(password, 10),
      isLogout: false,
      token: '',
    });
    const tempBio = 'adjsfojasdof';
    const loginRes = await request(app)
      .post('/api/user/login')
      .send({ email, password });
    const cookies = loginRes.headers['set-cookie'];

    // when
    const res = await request(app)
      .post(`/api/study/user/${studyId}`)
      .set('Cookie', cookies)
      .send({ tempBio });
    const record = await conn
      .getRepository(StudyUser)
      .findOne({ STUDY_ID: studyId, USER_ID: userId });

    // then
    expect(res.statusCode).toBe(201);
    expect(record).toBeTruthy();
    expect(record?.tempBio).toBe(tempBio);
  });

  test('요청 body에 tempBio 프로퍼티가 없을 경우 400 코드로 응답한다', async () => {
    // given
    const userId = randomUUID();
    const email = 'asjdkf@test.com';
    const password = 'testpassword';
    await conn.getRepository(User).save({
      id: userId,
      email,
      password: bcrypt.hashSync(password, 10),
      isLogout: false,
      token: '',
    });
    const loginRes = await request(app)
      .post('/api/user/login')
      .send({ email, password });
    const cookies = loginRes.headers['set-cookie'];

    // when
    const res = await request(app)
      .post(`/api/study/user/${studyId}`)
      .set('Cookie', cookies)
      .send();
    const record = await conn
      .getRepository(StudyUser)
      .findOne({ STUDY_ID: studyId, USER_ID: userId });

    // then
    expect(res.statusCode).toBe(400);
    expect(record).toBeFalsy();
  });

  test('로그인하지 않은 채로 참가신청 요청을 보내면 401 코드로 응답한다', async () => {
    // given
    const userId = randomUUID();
    const email = 'asjsdkjfdkf@test.com';
    const password = 'testpassword';
    await conn.getRepository(User).save({
      id: userId,
      email,
      password,
      isLogout: false,
      token: '',
    });
    const tempBio = 'adjsfojasdofsadf';

    // when
    const res = await request(app)
      .post(`/api/study/user/${studyId}`)
      .send({ tempBio });
    const record = await conn
      .getRepository(StudyUser)
      .findOne({ STUDY_ID: studyId, USER_ID: userId });

    // then
    expect(res.statusCode).toBe(401);
    expect(record).toBeFalsy();
  });

  test('올바르지 않은 스터디 id 로 참가신청 요청을 보낼 경우 404 코드로 응답한다', async () => {
    // given
    const userId = randomUUID();
    const email = 'asdjfoj@test.com';
    const password = 'testpassword';
    await conn.getRepository(User).save({
      id: userId,
      email,
      password: bcrypt.hashSync(password, 10),
      isLogout: false,
      token: '',
    });
    const tempBio = 'adjsfojasdof';
    const loginRes = await request(app)
      .post('/api/user/login')
      .send({ email, password });
    const cookies = loginRes.headers['set-cookie'];
    const wrongStudyId = '123423434234244324123';

    // when
    const res = await request(app)
      .post(`/api/study/user/${wrongStudyId}`)
      .set('Cookie', cookies)
      .send({ tempBio });
    const record = await conn
      .getRepository(StudyUser)
      .findOne({ STUDY_ID: studyId, USER_ID: userId });

    // then
    expect(res.statusCode).toBe(404);
    expect(record).toBeFalsy();
  });
});

describe('참가 신청중인 사용자 목록 조회 api', () => {
  const email = 'qwernm@test.com';
  const password = 'testpassword';
  const userId = randomUUID();

  test('로그인 하지 않았을 경우 401 코드로 응답한다', async () => {
    const res = await request(app).get(`/api/study/user/${studyId}`);
    expect(res.statusCode).toBe(401);
  });

  test('올바르지 않은 스터디 id로 요청을 보내면 404 코드로 응답한다', async () => {
    // given
    await conn.getRepository(User).save({
      id: userId,
      email,
      password: bcrypt.hashSync(password, 10),
      isLogout: false,
      token: '',
    });
    const loginRes = await request(app)
      .post('/api/user/login')
      .send({ email, password });
    const cookies = loginRes.headers['set-cookie'];
    const wrongStudyId = 'asdjfalksdj';

    const res = await request(app)
      .get(`/api/study/user/${wrongStudyId}`)
      .set('Cookie', cookies);

    expect(res.statusCode).toBe(404);
  });

  test('자신이 소유하지 않은 스터디에 대한 신청자 현황을 요청하면 403 코드로 응답한다', async () => {
    // given
    const loginRes = await request(app)
      .post('/api/user/login')
      .send({ email, password });
    const cookies = loginRes.headers['set-cookie'];

    // when
    const res = await request(app)
      .get(`/api/study/user/${studyId}`)
      .set('Cookie', cookies);

    // then
    expect(res.statusCode).toBe(403);
  });

  test('자신이 소유한 스터디에 대한 신청자 현황을 요청하면 200 코드로 응답한다', async () => {
    // given
    const newUserEmail = 'asodfjaod@test.com';
    const newUserPassword = 'testPassword';
    const newUser = new User();
    newUser.id = userId;
    newUser.email = newUserEmail;
    newUser.password = bcrypt.hashSync(newUserPassword, 10);
    newUser.token = '';
    newUser.isLogout = false;
    newUser.role = UserRoleEnum.USER;
    await conn.getRepository(User).save(newUser);

    const myStudyId = randomUUID();
    await conn
      .getRepository(Study)
      .createQueryBuilder()
      .insert()
      .values({
        id: myStudyId,
        title: 'STUDY TITLE',
        studyAbout: 'STUDY ABOUT',
        weekday: WeekDayEnum.TUE,
        frequency: FrequencyEnum.MORE,
        location: LocationEnum.LIBRARY,
        capacity: 10,
        hostId: newUser,
        categoryCode: new Category(),
        membersCount: 10,
        vacancy: 10,
        isOpen: true,
        views: 0,
      })
      .execute();

    const loginRes = await request(app)
      .post('/api/user/login')
      .send({ email: newUserEmail, password: newUserPassword });
    const cookies = loginRes.headers['set-cookie'];

    // when
    const res = await request(app)
      .get(`/api/study/user/${myStudyId}`)
      .set('Cookie', cookies);

    // then
    expect(res.statusCode).toBe(200);
  });

  test('스터디 신청현황에 대한 정보를 반환한다', async () => {
    await conn.getRepository(StudyUser).delete({});
    await conn
      .getRepository(StudyUser)
      .createQueryBuilder()
      .insert()
      .values([
        {
          STUDY_ID: studyId,
          USER_ID: mockUser1.id,
          isAccepted: false,
          tempBio: '',
        },
      ])
      .execute();
    const loginRes = await request(app)
      .post('/api/user/login')
      .send({ email: mockHost.email, password: 'testpassword' });
    const cookies = loginRes.headers['set-cookie'];

    const res = await request(app)
      .get(`/api/study/user/${studyId}`)
      .set('Cookie', cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].userId).toBe(mockUser1.id);
    expect(res.body[0].studyId).toBe(studyId);
  });
});
