import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { randomUUID } from 'crypto';
import Study, {
  WeekDayEnum,
  FrequencyEnum,
  LocationEnum,
} from '../../entity/StudyEntity';
import Category from '../../entity/CategoryEntity';
import User from '../../entity/UserEntity';

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
 *      - name: "page_num"
 *        in: "query"
 *        description: "페이지 번호, 기본값: 1"
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
 */

export const getAllStudy = async (req: Request, res: Response) => {
  const row_num = Number(req.query.row_num) || 12; // 한 페이지에서 포함할 스터디의 개수
  const page_num = Number(req.query.page_num) || 1; // 현재 페이지 번호
  const frequencyFilter = req.query.frequency || null; // enum
  const weekdayFilter = req.query.weekday || null; // enum
  const locationFilter = req.query.location || null; // enum
  const order_by = req.query.order_by || 'latest'; // enum

  try {
    const studyRepo = getRepository(Study);
    const skip = (page_num - 1) * row_num; // 각 페이지마다 스킵해야 할 스터디의 개수
    const studyQuery = await studyRepo
      .createQueryBuilder('study')
      .where('study.frequency = :frequencyFilter', { frequencyFilter })
      .andWhere('study.weekday = :weekdayFilter', { weekdayFilter })
      .andWhere('study.location = :locationFilter', { locationFilter });

    if (order_by === 'latest') studyQuery.orderBy('study.createdAt', 'DESC');
    else if (order_by === 'small_vacancy')
      studyQuery.orderBy('study.vacancy', 'ASC');
    else if (order_by === 'large_vacancy')
      studyQuery.orderBy('study.vacancy', 'DESC');

    const [total_studies, total_count] = await studyQuery.getManyAndCount(); // total_count: 현재 등록된 스터디의 총 개수
    const lastPage_count = total_count % row_num; // 마지막 페이지에 나타날 스터디의 개수
    const total_page =
      lastPage_count === 0
        ? total_count / row_num
        : Math.trunc(total_count / row_num) + 1; // 총 페이지의 개수
    const perPage_studies = await total_studies.slice(skip, skip + row_num); // 각 페이지별 스터디의 개수

    res.status(200).json({ message: 'OK. 스터디 목록 조회 성공.' });
    return res.json({ perPage_studies, total_page }); // 각 페이지별 스터디 목록, 페이지 총 개수
  } catch (e) {
    res.status(404).json({
      message: (e as Error).message + '. 요청한 리소스가 존재하지 않음',
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
 *          $ref: "#/definitions/Study"
 */

export const createStudy = async (req: Request, res: Response) => {
  try {
    const id = randomUUID();
    type RequestBody = {
      title: string;
      studyAbout: string;
      weekday: WeekDayEnum;
      frequency: FrequencyEnum;
      location: LocationEnum;
      capacity: number;
      categoryCode: Category;
    };
    const {
      title,
      studyAbout,
      weekday,
      frequency,
      location,
      capacity,
      categoryCode,
    }: RequestBody = req.body;

    // hostId => redis 수정
    const userId = req.cookies.userId;
    const hostId = await getRepository(User)
      .createQueryBuilder('user')
      .where('user.id = :userId', { userId })
      .getOne();
    if (!hostId) {
      res.status(403).json({ error: 'Forbidden. 접근 권한 없음.' });
      return;
    }

    if (hostId.isLogout === true) {
      res.status(401).json({ error: 'Unauthorized. 로그인 필요.' });
      return;
    }

    const studyRepo = getRepository(Study);
    const study = new Study();
    study.id = id;
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
    study.categoryCode = categoryCode;

    await studyRepo.save(study);

    res.status(201).json({ message: 'Created. 새로운 스터디 생성됨.' });
    // 스터디 상세 화면으로 이동하도록 추가
    res.redirect('/api/study/detail/:id');
  } catch (e) {
    res.json({ error: (e as Error).message || (e as Error).toString() });
  }
};
