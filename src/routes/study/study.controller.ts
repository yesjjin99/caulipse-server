import { Request, Response } from 'express';
import { findCategoryByCode } from '../../services/category';
import studyService from '../../services/study';
import { findUserById } from '../../services/user';
import { orderByEnum } from '../../types/study.dto';

const getAllStudy = async (req: Request, res: Response) => {
  const frequencyFilter: string = req.query.frequency as string;
  const weekdayFilter: string = req.query.weekday as string;
  const locationFilter: string = req.query.location as string;
  const orderBy: string = req.query.order_by
    ? (req.query.order_by as string)
    : orderByEnum.LATEST;
  const cursor: string = req.query.cursor as string;

  try {
    let studies;

    if (orderBy === orderByEnum.LAST || orderBy === orderByEnum.SMALL_VACANCY) {
      studies = await studyService.getAllStudy({
        frequencyFilter,
        weekdayFilter,
        locationFilter,
        orderBy,
        cursor,
      });
    } else {
      if (!cursor) {
        // 1 page
        const last = await studyService.getLastStudy({
          frequencyFilter,
          weekdayFilter,
          locationFilter,
          orderBy,
          cursor,
        });
        if (!last) {
          return res
            .status(200)
            .json({ message: '요청에 해당하는 스터디가 존재하지 않습니다' });
        } else {
          const last_cursor = `${last.id}_${last.createdAt}_${last.vacancy}`;
          studies = await studyService.getAllStudy({
            frequencyFilter,
            weekdayFilter,
            locationFilter,
            orderBy,
            cursor: last_cursor,
          });
        }
      } else {
        studies = await studyService.getAllStudy({
          frequencyFilter,
          weekdayFilter,
          locationFilter,
          orderBy,
          cursor,
        });
      }
    }

    if (!studies) {
      return res
        .status(200)
        .json({ message: '요청에 해당하는 스터디가 존재하지 않습니다' });
    } else {
      const study = studies[studies.length - 1];
      const next_cursor = `${study.id}_${study.createdAt}_${study.vacancy}`;

      return res.status(200).json({
        message: '스터디 목록 조회 성공',
        studies,
        next_cursor,
      }); // 각 페이지별 스터디 목록, 다음 조회에 사용될 cursor 위치(페이지네이션)
    }
  } catch (e) {
    return res.status(500).json({
      message: (e as Error).message,
    });
  }
};

const createStudy = async (req: Request, res: Response) => {
  const BAD_REQUEST = '요청값이 유효하지 않음';
  const NOT_FOUND = '데이터베이스에 일치하는 요청값이 없습니다';

  try {
    const {
      title,
      studyAbout,
      weekday,
      frequency,
      location,
      capacity,
      categoryCode,
    } = req.body;

    const { id } = req.user as { id: string };

    if (
      !title ||
      !studyAbout ||
      !weekday ||
      !frequency ||
      !location ||
      !capacity ||
      !categoryCode
    )
      throw new Error(BAD_REQUEST);

    const user = await findUserById(id);
    const category = await findCategoryByCode(categoryCode);

    if (!user || !category) {
      throw new Error(NOT_FOUND);
    }

    const studyId = await studyService.createStudy(req.body, user, category);

    return res.status(201).json({
      message: '새로운 스터디 생성 성공',
      studyId,
    });
  } catch (e) {
    if ((e as Error).message === BAD_REQUEST) {
      return res.status(400).json({
        message: BAD_REQUEST,
      });
    } else if ((e as Error).message === NOT_FOUND) {
      return res.status(404).json({
        message: NOT_FOUND,
      });
    } else {
      return res.status(500).json({
        message: (e as Error).message,
      });
    }
  }
};

const getStudybyId = async (req: Request, res: Response) => {
  const NOT_FOUND = '데이터베이스에 일치하는 요청값이 없습니다';

  try {
    const { studyid } = req.params;
    const study = await studyService.findStudyById(studyid);

    if (!study) {
      throw new Error(NOT_FOUND);
    }
    return res.status(200).json({
      message: '각 스터디별 상세 정보 조회 성공',
      study,
    });
  } catch (e) {
    if ((e as Error).message === NOT_FOUND) {
      return res.status(404).json({
        message: NOT_FOUND,
      });
    } else {
      return res.status(500).json({
        message: (e as Error).message,
      });
    }
  }
};

const updateStudy = async (req: Request, res: Response) => {
  const BAD_REQUEST = '요청값이 유효하지 않음';
  const NOT_FOUND = '데이터베이스에 일치하는 요청값이 없습니다';

  try {
    const { studyid } = req.params;
    const {
      title,
      studyAbout,
      weekday,
      frequency,
      location,
      capacity,
      categoryCode,
    } = req.body;

    if (
      !title &&
      !studyAbout &&
      !weekday &&
      !frequency &&
      !location &&
      !capacity &&
      !categoryCode
    )
      throw new Error(BAD_REQUEST);

    const study = await studyService.findStudyById(studyid);
    let category = null;
    if (!study) {
      throw new Error(NOT_FOUND);
    }
    if (categoryCode) {
      category = await findCategoryByCode(categoryCode);
      if (!category) {
        throw new Error(NOT_FOUND);
      }
    }
    await studyService.updateStudy(req.body, study, category);
    return res.status(200).json({ message: '스터디 정보 업데이트 성공' });
  } catch (e) {
    if ((e as Error).message === BAD_REQUEST) {
      return res.status(400).json({
        message: BAD_REQUEST,
      });
    } else if ((e as Error).message === NOT_FOUND) {
      return res.status(404).json({
        message: NOT_FOUND,
      });
    } else {
      return res.status(500).json({
        message: (e as Error).message,
      });
    }
  }
};

const deleteStudy = async (req: Request, res: Response) => {
  const NOT_FOUND = '데이터베이스에 일치하는 요청값이 없습니다';

  try {
    const { studyid } = req.params;
    const study = await studyService.findStudyById(studyid);

    if (!study) {
      throw new Error(NOT_FOUND);
    }
    await studyService.deleteStudy(study);
    return res.status(200).json({ message: '스터디 삭제 성공' });
  } catch (e) {
    if ((e as Error).message === NOT_FOUND) {
      return res.status(404).json({
        message: NOT_FOUND,
      });
    } else {
      return res.status(500).json({
        message: (e as Error).message,
      });
    }
  }
};

export default {
  getAllStudy,
  createStudy,
  getStudybyId,
  updateStudy,
  deleteStudy,
};

/**
 * @swagger
 * paths:
 *  /api/study:
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
 *          description: "올바른 요청. next_cursor(다음 페이지 조회를 위해 사용될 페이지네이션 커서), message와 함께 스터디 목록을 반환합니다"
 *          schema:
 *            allOf:
 *            - type: array
 *              items:
 *                $ref: "#/definitions/Study"
 *
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
 *
 *  /api/study/{studyid}:
 *    get:
 *      summary: "스터디 아이디에 해당하는 스터디 정보 조회"
 *      description: "스터디 상세페이지에서 각 스터디 아이디에 해당하는 모든 상세 정보들을 조회할 엔드포인트입니다"
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
 *          description: "올바른 요청, message와 함께 스터디 정보를 반환합니다"
 *          schema:
 *            $ref: "#/definitions/Study"
 *        404:
 *          description: "전달한 studyid가 데이터베이스에 없는 경우입니다"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "일치하는 studyid가 없음"
 *
 *    patch:
 *      summary: "스터디 정보 업데이트"
 *      description: "각 스터디의 정보를 업데이트하기 위한 엔드포인트입니다"
 *      tags:
 *      - "study"
 *      parameters:
 *      - name: "studyid"
 *        in: "path"
 *        description: "수정할 스터디 id"
 *        required: true
 *        type: string
 *        format: uuid
 *      - in: "body"
 *        name: "study_body"
 *        description: "수정할 스터디 정보 객체"
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
 *        200:
 *          description: "올바른 요청"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "스터디 정보 업데이트 성공"
 *        400:
 *          description: "요청값이 유효하지 않은 경우입니다"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "request is not valid"
 *        401:
 *          description: "로그인이 되어있지 않은 경우"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "로그인 필요"
 *        404:
 *          description: "전달한 studyid가 데이터베이스에 없는 경우입니다"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "일치하는 studyid가 없음"
 *
 *    delete:
 *      summary: "스터디 삭제"
 *      description: "스터디를 삭제하기 위한 엔드포인트입니다"
 *      tags:
 *      - "study"
 *      parameters:
 *      - name: "studyid"
 *        in: "path"
 *        description: "삭제할 스터디 id"
 *        required: true
 *        type: string
 *        format: uuid
 *      responses:
 *        200:
 *          description: "올바른 요청"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "스터디 삭제 성공"
 *        401:
 *          description: "로그인이 되어있지 않은 경우"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "로그인 필요"
 *        404:
 *          description: "전달한 studyid가 데이터베이스에 없는 경우입니다"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "일치하는 studyid가 없음"
 */
