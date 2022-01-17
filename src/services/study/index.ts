import { getRepository } from 'typeorm';
import { randomUUID } from 'crypto';
import Study from '../../entity/StudyEntity';
import { orderByEnum, paginationDTO, studyDTO } from '../../types/study.dto';
import User from '../../entity/UserEntity';
import categoryService from '../category';

const getAllStudy = async ({
  row_num,
  frequencyFilter,
  weekdayFilter,
  locationFilter,
  order_by,
  cursor,
}: paginationDTO) => {
  let perPage_studies = null;
  let next_cursor = null;

  const sq = getRepository(Study).createQueryBuilder('study');

  if (frequencyFilter) {
    sq.andWhere('study.frequency = :frequencyFilter', { frequencyFilter });
  }
  if (weekdayFilter) {
    sq.andWhere('study.weekday = :weekdayFilter', { weekdayFilter });
  }
  if (locationFilter) {
    sq.andWhere('study.location = :locationFilter', { locationFilter });
  }

  if (order_by === orderByEnum.LATEST) {
    sq.orderBy('study.createdAt', 'DESC');
    if (cursor) {
      sq.andWhere('study.createdAt < :cursor', { cursor });
    }

    perPage_studies = await sq.limit(row_num).getMany();
    next_cursor = perPage_studies[row_num - 1].createdAt;
  } else if (order_by === orderByEnum.SMALL_VACANCY) {
    sq.orderBy('study.vacancy', 'ASC');
    if (cursor) {
      sq.andWhere('study.vacancy > :cursor', { cursor });
    }

    perPage_studies = await sq.limit(row_num).getMany();
    next_cursor = perPage_studies[row_num - 1].vacancy;
  } else if (order_by === orderByEnum.LARGE_VACANCY) {
    sq.orderBy('study.vacancy', 'DESC');
    if (cursor) {
      sq.andWhere('study.vacancy < :cursor', { cursor });
    }

    perPage_studies = await sq.limit(row_num).getMany();
    next_cursor = perPage_studies[row_num - 1].vacancy;
  }

  return { perPage_studies, next_cursor };
};

const createStudy = async (
  {
    title,
    studyAbout,
    weekday,
    frequency,
    location,
    capacity,
    categoryCode,
  }: studyDTO,
  hostId: User
) => {
  const id = randomUUID();
  const date = new Date();

  const category = await categoryService.findByCode(categoryCode);

  const repo = getRepository(Study);
  const study = new Study();
  study.id = id;
  study.createdAt = date;
  study.title = title;
  study.studyAbout = studyAbout;
  study.weekday = weekday;
  study.frequency = frequency;
  study.location = location;
  study.capacity = capacity;
  study.membersCount = 0;
  study.vacancy = capacity;
  study.isOpen = true;
  study.hostId = hostId;
  study.views = 0;
  study.categoryCode = category;

  await repo.save(study);
  return id;
};

const findById = async (id: string) => {
  const study = await getRepository(Study)
    .createQueryBuilder('study')
    .where('study.id = :id', { id })
    .getOne();

  if (!study) throw new Error('데이터베이스에 일치하는 스터디 id가 없습니다');
  // ststus 404

  return study;
};

export default { getAllStudy, createStudy, findById };
