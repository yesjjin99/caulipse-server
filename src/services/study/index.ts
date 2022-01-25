import { getRepository } from 'typeorm';
import { randomUUID } from 'crypto';
import Study from '../../entity/StudyEntity';
import { orderByEnum, paginationDTO, studyDTO } from '../../types/study.dto';
import { findUserById } from '../user';
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

  if (order_by === orderByEnum.LATEST) {
    sq.orderBy('study.createdAt', 'DESC');
    if (cursor) {
      sq.where('study.createdAt < :cursor', { cursor });
    }
  } else if (order_by === orderByEnum.SMALL_VACANCY) {
    sq.orderBy('study.vacancy', 'ASC');
    if (cursor) {
      sq.where('study.vacancy > :cursor', { cursor });
    }
  } else if (order_by === orderByEnum.LARGE_VACANCY) {
    sq.orderBy('study.vacancy', 'DESC');
    if (cursor) {
      sq.where('study.vacancy < :cursor', { cursor });
    }
  }

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
    perPage_studies = await sq.limit(row_num).getMany();
    next_cursor = perPage_studies[row_num - 1].createdAt;
  } else if (order_by === orderByEnum.SMALL_VACANCY) {
    perPage_studies = await sq.limit(row_num).getMany();
    next_cursor = perPage_studies[row_num - 1].vacancy;
  } else if (order_by === orderByEnum.LARGE_VACANCY) {
    perPage_studies = await sq.limit(row_num).getMany();
    next_cursor = perPage_studies[row_num - 1].vacancy;
  }

  return { perPage_studies, next_cursor };
};

const findStudyById = async (id: string) => {
  const study = await getRepository(Study)
    .createQueryBuilder('study')
    .where('study.id = :id', { id })
    .getOne();

  if (!study) throw new Error('데이터베이스에 일치하는 요청값이 없습니다');
  // ststus 404

  return study;
};

const createStudy = async ({
  title,
  studyAbout,
  weekday,
  frequency,
  location,
  capacity,
  hostId,
  categoryCode,
}: studyDTO) => {
  const id = randomUUID();

  const user = await findUserById(hostId);
  const category = await categoryService.findByCode(categoryCode);

  const repo = getRepository(Study);
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
  study.hostId = user;
  study.views = 0;
  study.categoryCode = category;

  await repo.save(study);
  return id;
};

const updateStudy = async (
  studyid: string,
  {
    title,
    studyAbout,
    weekday,
    frequency,
    location,
    capacity,
    hostId,
    categoryCode,
  }: studyDTO
) => {
  const repo = getRepository(Study);
  const study = await findStudyById(studyid);

  if (title) study.title = title;
  if (studyAbout) study.studyAbout = studyAbout;
  if (weekday) study.weekday = weekday;
  if (frequency) study.frequency = frequency;
  if (location) study.location = location;
  if (capacity) study.capacity = capacity;
  if (categoryCode) {
    study.categoryCode = await categoryService.findByCode(categoryCode);
  }

  await repo.save(study);
};

const deleteStudy = async (id: string) => {
  try {
    const study = await findStudyById(id);

    await getRepository(Study).remove(study);
  } catch (e) {
    throw new Error('데이터베이스에 일치하는 요청값이 없습니다');
  }
};

export default {
  getAllStudy,
  findStudyById,
  createStudy,
  updateStudy,
  deleteStudy,
};
