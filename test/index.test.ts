import request from 'supertest';
import app from '../src';

describe('app', () => {
  test('should start', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(404);
  });
});
