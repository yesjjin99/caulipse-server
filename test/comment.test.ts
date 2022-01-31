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
import Comment from '../src/entity/CommentEntity';

let conn: Connection;
let userid: string;
let studyid: string;
let commentid: string;

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
  await getRepository(Comment)
    .createQueryBuilder('comment')
    .delete()
    .where('comment.NESTED_COMMENT_ID IS NOT NULL')
    .execute();
  await getRepository(Comment).createQueryBuilder().delete().execute();
  await getRepository(Study).createQueryBuilder().delete().execute();
  await getRepository(User).createQueryBuilder().delete().execute();
  await getRepository(Category).createQueryBuilder().delete().execute();

  conn.close();
});

describe('POST /api/study/:studyid/comment', () => {
  let cookies = '';
  beforeEach(async () => {
    // login
    const res = await request(app).post('/api/user/login').send({
      email: 'test@gmail.com',
      password: 'test',
    });
    cookies = res.headers['set-cookie'];
  });

  it('body에 작성내용, 유저 id가 포함된 요청을 받으면 studyid에 해당하는 스터디에 문의글을 등록하고 아이디 반환', async () => {
    const res = await request(app)
      .post(`/api/study/${studyid}/comment`)
      .set('Cookie', cookies)
      .send({
        content: '댓글 내용',
      });

    const { commentId } = res.body;
    commentid = commentId;

    expect(res.status).toBe(201);
    expect(commentId).not.toBeNull();
  });

  it('body에 작성내용, 유저id, 댓글을 작성한 문의글 id가 포함된 요청을 받으면 문의글을 등록하고 아이디 반환', async () => {
    const res = await request(app)
      .post(`/api/study/${studyid}/comment`)
      .set('Cookie', cookies)
      .send({
        content: '대댓글 내용',
        replyTo: commentid,
      });

    const { commentId } = res.body;
    commentid = commentId;

    expect(res.status).toBe(201);
    expect(commentId).not.toBeNull();
  });

  it('로그인이 되어있지 않은 경우 401 응답', async () => {
    const res = await request(app).post(`/api/study/${studyid}/comment`).send({
      content: '대댓글 내용',
    });

    expect(res.status).toBe(401);
  });

  it('유효하지 않은 body를 포함하거나 body를 포함하지 않은 요청을 받으면 400 응답', async () => {
    const res = await request(app)
      .post(`/api/study/${studyid}/comment`)
      .set('Cookie', cookies)
      .send();

    expect(res.status).toBe(400);
  });

  it('요청된 studyid가 데이터베이스에 존재하지 않으면 404 응답', async () => {
    const res = await request(app)
      .post('/api/study/wrong/comment')
      .set('Cookie', cookies)
      .send({
        content: '댓글 내용',
      });

    expect(res.status).toBe(404);
  });
});

describe('GET /api/:studyid/comment', () => {
  it('요청된 studyid에 해당하는 스터디의 모든 문의글 목록 조회', async () => {
    const res = await request(app).get(`/api/study/${studyid}/comment`);

    const { comments } = res.body;

    expect(res.status).toBe(200);
    expect(comments).not.toBeNull();
  });

  it('요청된 studyid가 데이터베이스에 존재하지 않으면 404 응답', async () => {
    const res = await request(app).get('/api/study/wrong/comment');

    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/study/:studyid/comment/:commentid', () => {
  let cookies = '';
  beforeEach(async () => {
    // login
    const res = await request(app).post('/api/user/login').send({
      email: 'test@gmail.com',
      password: 'test',
    });
    cookies = res.headers['set-cookie'];
  });

  it('body를 포함한 요청을 받으면 studyid, commentid에 해당하는 문의글 업데이트', async () => {
    const res = await request(app)
      .patch(`/api/study/${studyid}/comment/${commentid}`)
      .set('Cookie', cookies)
      .send({
        content: '수정한 내용',
      });

    expect(res.status).toBe(200);
  });

  it('유효하지 않은 body를 포함하거나 body를 포함하지 않은 요청을 받으면 400 응답', async () => {
    const res = await request(app)
      .patch(`/api/study/${studyid}/comment/${commentid}`)
      .set('Cookie', cookies)
      .send();

    expect(res.status).toBe(400);
  });

  it('로그인이 되어있지 않은 경우 401 응답', async () => {
    const res = await request(app)
      .patch(`/api/study/${studyid}/comment/${commentid}`)
      .send({
        content: '수정한 내용',
      });

    expect(res.status).toBe(401);
  });

  it('요청된 commentid가 데이터베이스에 존재하지 않으면 404 응답', async () => {
    const res = await request(app)
      .patch(`/api/study/${studyid}/comment/wrong`)
      .set('Cookie', cookies)
      .send({
        content: '수정한 내용',
      });

    expect(res.status).toBe(404);
  });

  it('요청된 studyid 또는 commentid가 데이터베이스에 존재하지 않으면 404 응답', async () => {
    const res = await request(app)
      .patch('/api/study/wrong/comment/wrong')
      .set('Cookie', cookies)
      .send({
        content: '수정한 내용',
      });

    expect(res.status).toBe(404);
  });
});
