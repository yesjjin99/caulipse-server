import request from 'supertest';
import app from '../src';
import { db } from '../src/config/db';
import { Connection, ConnectionOptions, createConnection } from 'typeorm';
import User from '../src/entity/UserEntity';
import Category from '../src/entity/CategoryEntity';

let conn: Connection;

beforeAll(async () => {
  conn = await createConnection({
    ...db,
  } as ConnectionOptions);
});

afterAll(async () => {
  conn.close();
});

describe('POST /api/study', () => {
  // 입력하는 스터디 정보
  const studyData = {
    title: '스터디 제목',
    studyAbout: '스터디 상세설명',
    weekday: '월',
    frequency: '주 2~4회',
    location: '학교 스터디룸',
    capacity: 10,
    hostId: '065336d4-e309-4304-b739-268e7f3f6fec',
    categoryCode: 101,
  };

  it('스터디 생성 성공', async () => {
    const req = await request(app).post('/api/study').send(studyData);
    const userRepo = conn.getRepository(User);
    const user = await userRepo.findOne(studyData.hostId);

    const categoryRepo = conn.getRepository(Category);
    const category = await categoryRepo.findOne(studyData.categoryCode);

    expect(req.statusCode).toBe(201);

    expect(user).toBeTruthy();
    expect(category).toBeTruthy();
  });

  // 회원가입 되어있지 않은 사용자인 경우 추가
  it('로그인이 되어있지 않으면 401 발생', async () => {
    const req = await request(app).post('/api/study').send();
    const userRepo = conn.getRepository(User);
    const user = await userRepo.findOne(studyData.hostId);

    expect(req.statusCode).toBe(401);
    expect(user?.isLogout).toBeTruthy();
  });

  it('title, weekday, frequency, location, capacity, categoryCode 입력하지 않으면 401 발생', async () => {
    const Data = {
      title: null,
      studyAbout: '스터디 상세설명',
      weekday: null,
      frequency: null,
      location: null,
      capacity: null,
      hostId: '065336d4-e309-4304-b739-268e7f3f6fec',
      categoryCode: null,
    };
    const req = await request(app).post('/api/study').send(Data);

    expect(req.statusCode).toBe(401);

    expect(Data.title).toBeFalsy();
    expect(Data.weekday).toBeFalsy();
    expect(Data.frequency).toBeFalsy();
    expect(Data.location).toBeFalsy();
    expect(Data.capacity).toBeFalsy();
    expect(Data.categoryCode).toBeFalsy();
  });
});
