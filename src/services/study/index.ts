import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { randomUUID } from 'crypto';
import Study from '../../entity/StudyEntity';
import User from '../../entity/UserEntity';
import { createStudyDTO } from '../../type/study.dto';
import Category from '../../entity/CategoryEntity';

/**
 * @swagger
 * paths:
 *  /study:
 *    get:
 *      summary: "스터디 목록 조회"
 *      tags:
 *      - "study"
 *      description: "메인페이지에서 모든 스터디의 목록을 조회하기 위한 엔드포인트"
 *      parameters:
 *      - name: "row_num"
 *        in: "query"
 *        description: "한 페이지에 포함할 항목의 갯수, 기본값: 12"
 *        required: false
 *        type: integer
 *      - name: "frequency"
 *        in: "query"
 *        description: "필터 조건 - 스터디 빈도 / FrequencyEnum"
 *        required: false
 *        type: string
 *      - name: "weekday"
 *        in: "query"
 *        description: "필터 조건 - 요일 / WeekDayEnum"
 *        required: false
 *        type: string
 *      - name: "location"
 *        in: "query"
 *        description: "필터 조건 - 장소 / LocationEnum"
 *        required: false
 *        type: string
 *      - name: "order_by"
 *        in: "query"
 *        description: "정렬 조건 기본값: 최근 등록순 (enum: latest, small_vacancy, large_vacancy)"
 *        required: false
 *        type: string
 *      - name: "cursor"
 *        in: "query"
 *        description: "페이지네이션에 사용할 커서 위치값: 지난 페이지에서 다음 조회에 사용될 커서 위치를 받아 사용 (정렬 조건에 따라 createdAt, vacancy)"
 *        required: false
 *        type: string
 *      responses:
 *        200:
 *          description: "정상적으로 응답"
 *          schema:
 *            type: object
 *            allOf:
 *              - type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "OK. 스터디 목록 조회 성공."
 *              - $ref: "#/definitions/Study"
 *              - type: object
 *                properties:
 *                  next_cursor:
 *                    type: string
 *                    description: "다음 페이지네이션 조회에 사용될 커서 위치"
 *        404:
 *          description: "요청한 자원이 존재하지 않음."
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "Not Found. 요청한 자원이 존재하지 않음."
 */

export const getAllStudy = async (req: Request, res: Response) => {
  const row_num = Number(req.query.row_num) || 12; // 한 페이지에서 포함할 스터디의 개수
  const frequencyFilter = req.query.frequency; // enum
  const weekdayFilter = req.query.weekday; // enum
  const locationFilter = req.query.location; // enum
  const order_by = req.query.order_by || 'latest'; // enum
  const cursor = req.query.cursor; // pagination
  let perPage_studies = null;
  let next_cursor = null;

  try {
    const studyRepo = getRepository(Study);
    const studyQuery = studyRepo.createQueryBuilder('study');

    if (frequencyFilter) {
      studyQuery.andWhere('study.frequency = :frequencyFilter', {
        frequencyFilter,
      });
    }
    if (weekdayFilter) {
      studyQuery.andWhere('study.weekday = :weekdayFilter', { weekdayFilter });
    }
    if (locationFilter) {
      studyQuery.andWhere('study.location = :locationFilter', {
        locationFilter,
      });
    }

    if (order_by === 'latest') {
      if (cursor) {
        studyQuery.andWhere('study.createdAt < :cursor', { cursor });
      }
      studyQuery.orderBy('study.createdAt', 'DESC');

      perPage_studies = await studyQuery.limit(row_num).getMany();
      next_cursor = perPage_studies[row_num - 1].createdAt;
    } else if (order_by === 'small_vacancy') {
      if (cursor) {
        studyQuery.andWhere('study.vacancy > :cursor', { cursor });
      }
      studyQuery.orderBy('study.vacancy', 'ASC');

      perPage_studies = await studyQuery.limit(row_num).getMany();
      next_cursor = perPage_studies[row_num - 1].vacancy;
    } else if (order_by === 'large_vacancy') {
      if (cursor) {
        studyQuery.andWhere('study.vacancy < :cursor', { cursor });
      }
      studyQuery.orderBy('study.vacancy', 'DESC');

      perPage_studies = await studyQuery.limit(row_num).getMany();
      next_cursor = perPage_studies[row_num - 1].vacancy;
    }

    if (!perPage_studies) throw new Error('Not Found. ');

    res.status(200).json({
      message: 'OK. 스터디 목록 조회 성공.',
      perPage_studies,
      next_cursor,
    }); // 각 페이지별 스터디 목록, 다음 조회에 사용될 cursor 위치(페이지네이션)
  } catch (e) {
    res.status(404).json({
      message: (e as Error).message + '요청한 자원이 존재하지 않음.',
    });
  }
};

/**
 * @swagger
 * paths:
 *  /study:
 *    post:
 *      summary: "새로운 스터디 생성"
 *      tags:
 *      - "study"
 *      description: "사용자가 스터디를 생성할 때 사용되는 엔드포인트"
 *      parameters:
 *      - in: "body"
 *        name: "study_body"
 *        description: "DB에 추가할 새로운 스터디 정보 객체"
 *        required: true
 *        schema:
 *          type: object
 *          allOf:
 *            - type: object
 *              properties:
 *                title:
 *                  type: string
 *                studyAbout:
 *                  type: string
 *                weekday:
 *                  type: string
 *                  enum:
 *                  - "월"
 *                  - "화"
 *                  - "수"
 *                  - "목"
 *                  - "금"
 *                  - "토"
 *                  - "일"
 *                frequency:
 *                  type: string
 *                  enum:
 *                  - "1회"
 *                  - "주 2-4회"
 *                  - "주 5회 이상"
 *                location:
 *                  type: string
 *                  enum:
 *                  - "비대면"
 *                  - "학교 스터디룸"
 *                  - "중앙도서관"
 *                  - "스터디카페"
 *                  - "일반카페"
 *                  - "흑석, 상도"
 *                  - "서울대입구, 낙성대"
 *                  - "기타"
 *                capacity:
 *                  type: number
 *                categorycode:
 *                  type: number
 *      responses:
 *        201:
 *          description: "정상적으로 처리"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "Created. 새로운 스터디 생성됨."
 *              id:
 *                type: string
 *                format: uuid
 *                description: "생성된 스터디의 아이디"
 *        400:
 *          description: "잘못된 형식의 요청"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "Bad Request. 누락된 또는 잘못된 형식의 스터디 정보(요청)."
 *        401:
 *          description: "클라이언트에게 권한이 없음. 로그인 필요."
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "Unauthorized. 로그인 필요."
 */

export const createStudy = async (req: Request, res: Response) => {
  const BAD_REQUEST = 'Bad request. ';
  const UNAUTHORIZED = 'Unauthorized. ';

  try {
    const studyid = randomUUID();
    const {
      title,
      studyAbout,
      weekday,
      frequency,
      location,
      capacity,
      categorycode,
    }: createStudyDTO = req.body;

    if (
      !title ||
      !studyAbout ||
      !weekday ||
      !frequency ||
      !location ||
      !capacity ||
      !categorycode
    )
      throw new Error(BAD_REQUEST);

    if (!req.user || !(req.user as { id: string }).id)
      throw new Error(UNAUTHORIZED);

    const { id } = req.user as { id: string };

    const userRepo = getRepository(User);
    const hostId = await userRepo
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();

    // 에러 처리: 회원가입 필요..? (if (!hostId))

    const categoryRepo = getRepository(Category);
    const categoryCode = await categoryRepo
      .createQueryBuilder('category')
      .where('category.code = :categorycode', { categorycode })
      .getOne();

    // 에러 처리: 카테고리 필요..? (if (!categoryCode))

    const studyRepo = getRepository(Study);
    const study = new Study();
    study.id = studyid;
    study.createdAt = new Date();
    study.title = title;
    study.studyAbout = studyAbout;
    study.weekday = weekday;
    study.frequency = frequency;
    study.location = location;
    study.capacity = capacity;
    study.membersCount = 0;
    study.vacancy = capacity;
    study.isOpen = true;
    study.hostId = hostId!;
    study.views = 0;
    study.categoryCode = categoryCode!;

    await studyRepo.save(study);

    res.status(201).json({
      message: 'Created. 새로운 스터디 생성됨.',
      studyid,
    });
  } catch (e) {
    if ((e as Error).message === BAD_REQUEST) {
      res.status(400).json({
        message:
          (e as Error).message + '누락된 또는 잘못된 형식의 스터디 정보(요청)',
      });
    } else {
      res.status(401).json({
        message: (e as Error).message + '로그인 필요.',
      });
    }
  }
};

/**
 * @swagger
 * paths:
 *  /study/:id:
 *    get:
 *      summary: "스터디 아이디에 해당하는 스터디 정보 조회"
 *      tags:
 *      - "study"
 *      description: "스터디 상세페이지에서 각 스터디별로 모든 정보들을 조회할 엔드포인트"
 *      parameters:
 *      - name: "id"
 *        in: "path"
 *        description: "정보를 조회할 스터디 id"
 *        required: true
 *        type: string
 *        format: uuid
 *      responses:
 *        200:
 *          description: "정상적으로 응답"
 *          schema:
 *            type: object
 *            allOf:
 *              - type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "OK. 각 스터디별 상세 정보 조회 성공."
 *              - $ref: "#/definitions/Study"
 *        404:
 *          description: "요청한 자원이 존재하지 않음."
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "Not Found. 요청한 자원이 존재하지 않음."
 */

export const getStudybyId = async (req: Request, res: Response) => {
  try {
    const studyId = req.params.id;

    const studyRepo = getRepository(Study);
    const result = await studyRepo
      .createQueryBuilder('study')
      .where('study.id = :studyId', { studyId })
      .getOne();

    if (!result) throw new Error('Not Found. ');

    res.status(200).json({
      message: 'OK. 스터디 상세페이지 조회 성공.',
      result,
    });
  } catch (e) {
    res.status(404).json({
      message: (e as Error).message + '요청한 자원이 존재하지 않음',
    });
  }
};
