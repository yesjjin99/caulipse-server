import { randomUUID } from 'crypto';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { Connection, ConnectionOptions, createConnection } from 'typeorm';
import app from '../src';
import { db } from '../src/config/db';
import Study, {
  FrequencyEnum,
  LocationEnum,
  WeekDayEnum,
} from '../src/entity/StudyEntity';
import StudyUser from '../src/entity/StudyUserEntity';
import User from '../src/entity/UserEntity';
import UserProfile from '../src/entity/UserProfileEntity';

let conn: Connection;
let mockHost: User;
let mockUser1: User;
let mockUser2: User;
let mockHostProfile: UserProfile;
let mockProfile1: UserProfile;
let mockProfile2: UserProfile;
let mockStudy: Study;

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

  mockHostProfile = new UserProfile();
  mockHostProfile.id = mockHost;
  mockHostProfile.email = mockHost.email;
  mockHostProfile.userName = 'host';
  mockHostProfile.dept = 'dept';
  mockHostProfile.grade = 1;
  mockHostProfile.bio = 'bio';
  mockHostProfile.userAbout = 'about';
  mockHostProfile.showDept = false;
  mockHostProfile.showGrade = false;
  mockHostProfile.onBreak = false;
  mockHostProfile.categories = ['100'];
  mockHostProfile.link1 = 'user_link1';
  mockHostProfile.link2 = 'user_link2';
  mockHostProfile.link3 = 'user_link3';
  mockHostProfile.image = 'image';
  await conn.getRepository(UserProfile).save(mockHostProfile);

  mockUser1 = new User();
  mockUser1.id = randomUUID();
  mockUser1.email = 'mockuser1@test.com';
  mockUser1.password = bcrypt.hashSync('testpassword', 10);
  mockUser1.isLogout = false;
  mockUser1.token = '';
  await conn.getRepository(User).save(mockUser1);

  mockProfile1 = new UserProfile();
  mockProfile1.id = mockUser1;
  mockProfile1.email = mockUser1.email;
  mockProfile1.userName = 'user1';
  mockProfile1.dept = 'dept';
  mockProfile1.grade = 1;
  mockProfile1.bio = 'bio';
  mockProfile1.userAbout = 'about';
  mockProfile1.showDept = false;
  mockProfile1.showGrade = false;
  mockProfile1.onBreak = false;
  mockProfile1.categories = ['100'];
  mockProfile1.link1 = 'user_link1';
  mockProfile1.link2 = 'user_link2';
  mockProfile1.link3 = 'user_link3';
  mockProfile1.image = 'image';
  await conn.getRepository(UserProfile).save(mockProfile1);

  mockUser2 = new User();
  mockUser2.id = randomUUID();
  mockUser2.email = 'mockuser2@test.com';
  mockUser2.password = bcrypt.hashSync('testpassword', 10);
  mockUser2.isLogout = false;
  mockUser2.token = '';
  await conn.getRepository(User).save(mockUser2);

  mockProfile2 = new UserProfile();
  mockProfile2.id = mockUser2;
  mockProfile2.email = mockUser2.email;
  mockProfile2.userName = 'user2';
  mockProfile2.dept = 'dept';
  mockProfile2.grade = 1;
  mockProfile2.bio = 'bio';
  mockProfile2.userAbout = 'about';
  mockProfile2.showDept = false;
  mockProfile2.showGrade = false;
  mockProfile2.onBreak = false;
  mockProfile2.categories = ['100'];
  mockProfile2.link1 = 'user_link1';
  mockProfile2.link2 = 'user_link2';
  mockProfile2.link3 = 'user_link3';
  mockProfile2.image = 'image';
  await conn.getRepository(UserProfile).save(mockProfile2);

  const date = new Date();
  mockStudy = new Study();
  mockStudy.id = randomUUID();
  mockStudy.title = 'STUDY TITLE';
  mockStudy.studyAbout = 'STUDY ABOUT';
  mockStudy.weekday = [WeekDayEnum.MON, WeekDayEnum.TUE];
  mockStudy.frequency = FrequencyEnum.MORE;
  mockStudy.location = [LocationEnum.CAFE, LocationEnum.ELSE];
  mockStudy.capacity = 10;
  mockStudy.hostId = mockHostProfile;
  mockStudy.categoryCode = 100;
  mockStudy.membersCount = 1;
  mockStudy.vacancy = 10;
  mockStudy.isOpen = true;
  mockStudy.views = 0;
  mockStudy.bookmarkCount = 0;
  mockStudy.dueDate = new Date(date.getTime() + 60 * 60 * 5);
  await conn.getRepository(Study).save(mockStudy);
});

afterAll(async () => {
  await conn.getRepository(StudyUser).createQueryBuilder().delete().execute();
  await conn.getRepository(Study).createQueryBuilder().delete().execute();
  await conn.getRepository(UserProfile).createQueryBuilder().delete().execute();
  await conn.getRepository(User).createQueryBuilder().delete().execute();
  conn.close();
});

describe('내가 신청한 스터디 조회 api', () => {
  let user1cookie: string[];
  let user2cookie: string[];
  let hostCookie: string[];

  beforeAll(async () => {
    {
      const { email } = mockUser1;
      const password = 'testpassword';
      const loginRes = await request(app)
        .post('/api/user/login')
        .send({ email, password });
      user1cookie = loginRes.headers['set-cookie'];
    }
    {
      const { email } = mockUser2;
      const password = 'testpassword';
      const loginRes = await request(app)
        .post('/api/user/login')
        .send({ email, password });
      user2cookie = loginRes.headers['set-cookie'];
    }
    {
      const { email } = mockHost;
      const password = 'testpassword';
      const loginRes = await request(app)
        .post('/api/user/login')
        .send({ email, password });
      hostCookie = loginRes.headers['set-cookie'];
    }
  });

  test('로그인하지 않았을 경우 401 코드로 응답한다', async () => {
    const res = await request(app).get('/api/user/study/applied');
    expect(res.statusCode).toBe(401);
  });

  test('신청한 스터디가 없을 경우 빈 배열을 응답한다', async () => {
    // given
    const cookies = user1cookie;

    // when
    const res = await request(app)
      .get(`/api/user/study/applied`)
      .set('Cookie', cookies);

    // then
    expect(res.body).toEqual([]);
  });

  test('신청한 스터디가 있을 경우 해당 스터디의 제목, 생성날짜, 조회수, 북마크수, 수락여부, 스터디의 참석자 수, 정원 수를 응답한다', async () => {
    // given
    const cookies = user2cookie;
    await conn
      .getRepository(StudyUser)
      .createQueryBuilder()
      .insert()
      .values([
        {
          user: mockProfile2,
          study: mockStudy,
          isAccepted: false,
          tempBio: '',
        },
      ])
      .execute();

    // when
    const res = await request(app)
      .get('/api/user/study/applied')
      .set('Cookie', cookies);

    // then
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0]?.title).toEqual(mockStudy.title);
    expect(new Date(res.body[0]?.createdAt).toString()).toEqual(
      new Date(mockStudy.createdAt).toString()
    );
    expect(res.body[0]?.views).toEqual(mockStudy.views);
    expect(res.body[0]?.bookmarkCount).toEqual(mockStudy.bookmarkCount);
    expect(res.body[0]?.isAccepted).toEqual(false);
    expect(res.body[0]?.membersCount).toEqual(mockStudy.membersCount);
    expect(res.body[0]?.capacity).toEqual(mockStudy.capacity);
  });
});
