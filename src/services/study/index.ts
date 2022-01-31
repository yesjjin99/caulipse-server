import { getRepository } from 'typeorm';
import { randomUUID } from 'crypto';
import Study from '../../entity/StudyEntity';
import { orderByEnum, paginationDTO, studyDTO } from '../../types/study.dto';
import { findUserById } from '../user';
import categoryService from '../category';

const getAllStudy = async ({
  frequencyFilter,
  weekdayFilter,
  locationFilter,
  orderBy,
  cursor,
}: paginationDTO) => {
  let perPage_studies = null;
  let next_cursor = null;

  const sq = getRepository(Study)
    .createQueryBuilder('study')
    .leftJoinAndSelect('study.hostId', 'user')
    .leftJoinAndSelect('study.categoryCode', 'category');

  if (frequencyFilter) {
    sq.andWhere('study.frequency = :frequencyFilter', { frequencyFilter });
  }
  if (weekdayFilter) {
    sq.andWhere('study.weekday = :weekdayFilter', { weekdayFilter });
  }
  if (locationFilter) {
    sq.andWhere('study.location = :locationFilter', { locationFilter });
  }

  if (orderBy === orderByEnum.LATEST) {
    if (cursor === 0) {
      // 1 page
      perPage_studies = await sq
        .orderBy('study.createdAt', 'DESC')
        .limit(12)
        .getMany();
      next_cursor = perPage_studies[perPage_studies.length - 1].createdAt;
    } else {
      perPage_studies = await sq
        .andWhere('study.createdAt < :cursor', { cursor })
        .orderBy('study.createdAt', 'DESC')
        .limit(12)
        .getMany();
      next_cursor = perPage_studies[perPage_studies.length - 1].createdAt;
    }
  } else if (orderBy === orderByEnum.SMALL_VACANCY) {
    if (cursor === 0) {
      // 1 page
      perPage_studies = await sq
        .orderBy('study.vacancy', 'ASC')
        .limit(12)
        .getMany();
      next_cursor = perPage_studies[perPage_studies.length - 1].vacancy;
    } else {
      perPage_studies = await sq
        .andWhere('study.vacancy > :cursor', { cursor })
        .orderBy('study.vacancy', 'ASC')
        .limit(12)
        .getMany();
      next_cursor = perPage_studies[perPage_studies.length - 1].vacancy;
    }
  } else if (orderBy === orderByEnum.LARGE_VACANCY) {
    if (cursor === 0) {
      // 1 page
      perPage_studies = await sq
        .orderBy('study.vacancy', 'DESC')
        .limit(12)
        .getMany();
      next_cursor = perPage_studies[perPage_studies.length - 1].vacancy;
    } else {
      perPage_studies = await sq
        .andWhere('study.vacancy < :cursor', { cursor })
        .orderBy('study.vacancy', 'DESC')
        .limit(12)
        .getMany();
      next_cursor = perPage_studies[perPage_studies.length - 1].vacancy;
    }
  } else if (orderBy === orderByEnum.LAST) {
    if (cursor === 0) {
      // 1 page
      perPage_studies = await sq
        .orderBy('study.createdAt', 'ASC')
        .limit(12)
        .getMany();
      next_cursor = perPage_studies[perPage_studies.length - 1].createdAt;
    } else {
      perPage_studies = await sq
        .andWhere('study.createdAt > :cursor', { cursor })
        .orderBy('study.createdAt', 'ASC')
        .limit(12)
        .getMany();
      next_cursor = perPage_studies[perPage_studies.length - 1].createdAt;
    }
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
  id: string
) => {
  const studyId = randomUUID();

  const user = await findUserById(id);
  const category = await categoryService.findByCode(categoryCode);

  const repo = getRepository(Study);
  const study = new Study();
  study.id = studyId;
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
  return studyId;
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
