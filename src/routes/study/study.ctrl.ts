import { Request, Response } from 'express';
import { orderByEnum } from '../../types/study.dto';
import studyService from '../../services/study';
import userService from '../../services/user';

/**
 * @swagger
 * paths:
 *  /study:
 *    get:
 *      summary: "스터디 목록 조회"
 *      tags:
 *      - "study"
 *      description: "메인페이지에서 모든 스터디의 목록을 조회하기 위한 엔드포인트입니다"
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
 *          description: "올바른 요청"
 *          schema:
 *            type: object
 *            allOf:
 *              - $ref: "#/definitions/Study"
 *              - type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "스터디 목록 조회 성공"
 *                  next_cursor:
 *                    type: string
 *                    description: "다음 페이지네이션 조회에 사용될 커서 위치"
 */

export const getAllStudy = async (req: Request, res: Response) => {
  const row_num = Number(req.query.row_num) || 12; // 한 페이지에서 포함할 스터디의 개수
  const frequencyFilter = String(req.query.frequency); // enum
  const weekdayFilter = String(req.query.weekday); // enum
  const locationFilter = String(req.query.location); // enum
  const order_by = String(req.query.order_by) || orderByEnum.LATEST; // enum
  const cursor =
    Number(req.query.cursor) | Date.parse(String(req.query.cursor)); // pagination

  try {
    const { perPage_studies, next_cursor } = await studyService.getAllStudy({
      row_num,
      frequencyFilter,
      weekdayFilter,
      locationFilter,
      order_by,
      cursor,
    });

    res.status(200).json({
      message: 'OK. 스터디 목록 조회 성공.',
      perPage_studies,
      next_cursor,
    }); // 각 페이지별 스터디 목록, 다음 조회에 사용될 cursor 위치(페이지네이션)
  } catch (e) {
    res.json({ message: (e as Error).message });
  }
};

/**
 * @swagger
 * paths:
 *  /study:
 *    post:
 *      summary: "새로운 스터디 생성"
 *      description: "사용자가 스터디를 생성할 때 사용되는 엔드포인트입니다"
 *      tags:
 *      - "study"
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
 *          description: "올바른 요청"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "새로운 스터디 생성 성공"
 *              id:
 *                type: string
 *                format: uuid
 *                description: "생성된 스터디의 아이디"
 *        400:
 *          description: "요청값이 유효하지 않은 경우입니다"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "Request is not valid"
 *        401:
 *          description: "로그인이 되어있지 않은 경우"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "로그인 필요"
 */

export const createStudy = async (req: Request, res: Response) => {
  const BAD_REQUEST = 'Request is not valid';
  const UNAUTHORIZED = '로그인 필요';

  try {
    const {
      title,
      studyAbout,
      weekday,
      frequency,
      location,
      capacity,
      categorycode,
    } = req.body;

    if (
      !title ||
      !studyAbout ||
      !weekday ||
      !frequency ||
      !location ||
      !capacity ||
      !categorycode ||
      !req.body
    )
      throw new Error(BAD_REQUEST);

    // FIX + TEST
    if (!req.user || !(req.user as { id: string }).id)
      throw new Error(UNAUTHORIZED);

    const { id } = req.user as { id: string };
    const hostId = await userService.findById(id);

    const studyId = await studyService.createStudy(req.body, hostId);

    res.status(201).json({
      message: '새로운 스터디 생성 성공',
      studyId,
    });
  } catch (e) {
    if ((e as Error).message === BAD_REQUEST) {
      res.status(400).json({
        message: (e as Error).message,
      });
    } else if ((e as Error).message === UNAUTHORIZED) {
      res.status(401).json({
        message: (e as Error).message,
      });
    } else {
      res.status(404).json({
        message: (e as Error).message,
      });
    }
  }
};

/**
 * @swagger
 * paths:
 *  /study/:studyid:
 *    get:
 *      summary: "스터디 아이디에 해당하는 스터디 정보 조회"
 *      description: "스터디 상세페이지에서 각 스터디 아이디 아이디에 해당하는 모든 상세 정보들을 조회할 엔드포인트입니다"
 *      tags:
 *      - "study"
 *      parameters:
 *      - name: "studyid"
 *        in: "path"
 *        description: "정보를 조회할 스터디 id"
 *        required: true
 *        type: string
 *        format: uuid
 *      responses:
 *        200:
 *          description: "올바른 요청"
 *          schema:
 *            type: object
 *            allOf:
 *              - type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "각 스터디별 상세 정보 조회 성공"
 *              - $ref: "#/definitions/Study"
 *        404:
 *          description: "전달한 studyid가 데이터베이스에 없는 경우입니다"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "일치하는 studyid가 없음"
 */

export const getStudybyId = async (req: Request, res: Response) => {
  try {
    const studyid = req.params.studyid;
    const study = await studyService.findById(studyid);

    res.status(200).json({
      message: '각 스터디별 상세 정보 조회 성공',
      study,
    });
  } catch (e) {
    res.status(404).json({
      message: (e as Error).message,
    });
  }
};
