import request from 'supertest';
import app from '../src';

describe('app', () => {
  test('루트 url에 GET요청을 보낼 시 404코드로 응답한다', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(404);
  });

  test('핸들러가 등록된 라우터에 GET요청을 보낼 시 hello world로 응답한다', async () => {
    const res = await request(app).get('/api/user/profile/aaaa');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'hello world' });
  });
});
