import request from 'supertest';
import app from '../src';
import { db } from '../src/config/db';
import { Connection, ConnectionOptions, createConnection } from 'typeorm';

let conn: Connection;

beforeAll(async () => {
  conn = await createConnection({
    ...db,
    database: process.env.DB_DATABASE_TEST,
  } as ConnectionOptions);
});

afterAll(async () => {
  conn.close();
});

describe('GET /api/study', () => {
  it('스터디 조회 성공', async () => {
    await request(app).get('/api/study').expect(200).end();
  });

  it('row_num 갯수만큼 조회', async () => {
    const RequestBody = {
      row_num: 12,
      page_num: 1,
    };
    const res = await request(app)
      .get('/api/study')
      .expect(200)
      .query({ RequestBody });

    expect(res.body).toHaveLength(RequestBody.row_num);
  });

  it('필터링 성공', async () => {
    const RequestBody = {
      frequency: 'ONCE',
      weekday: 'TUE',
      location: 'CAFE',
      order_by: 'latest',
    };
    const res = await request(app)
      .get('/api/study')
      .expect(200)
      .query({ RequestBody });

    expect(res.body.frequency).toBe(RequestBody.frequency);
    expect(res.body.weekday).toBe(RequestBody.weekday);
    expect(res.body.location).toBe(RequestBody.location);
  });
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
    categoryCode: 101,
  };

  it('스터디 생성 성공', async () => {
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: 'userId=0a6e3059-f576-4593-a66d-6e7c447b99c7',
    });

    await request(app).post('/api/study').expect(201).send(studyData);
  });

  // 회원가입 되어있지 않은 사용자인 경우 추가
  it('로그인이 되어있지 않으면 401 발생', async () => {
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: 'userId=wrong',
    });

    await request(app).post('/api/study').expect(401).send();
  });

  it('title, weekday, frequency, location, capacity, categoryCode 입력하지 않으면 401 발생', async () => {
    const Data = {
      title: null,
      studyAbout: '스터디 상세설명',
      weekday: null,
      frequency: null,
      location: null,
      capacity: null,
      categoryCode: null,
    };
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: 'userId=0a6e3059-f576-4593-a66d-6e7c447b99c7',
    });

    await request(app).post('/api/study').expect(401).send(Data);
  });
});
