import { Brackets, getRepository } from 'typeorm';
import { randomUUID } from 'crypto';
import Study from '../../entity/StudyEntity';
import { orderByEnum, paginationDTO, studyDTO } from '../../types/study.dto';
import User from '../../entity/UserEntity';
import Category from '../../entity/CategoryEntity';

const getLastStudy = async (paginationDto: paginationDTO) => {
  // for DESC sorting
  const { frequencyFilter, weekdayFilter, locationFilter, orderBy } =
    paginationDto;

  const query = getRepository(Study).createQueryBuilder('study');

  if (frequencyFilter) {
    query.andWhere('study.frequency = :frequencyFilter', { frequencyFilter });
  }
  if (weekdayFilter) {
    query.andWhere('study.weekday = :weekdayFilter', { weekdayFilter });
  }
  if (locationFilter) {
    query.andWhere('study.location = :locationFilter', { locationFilter });
  }

  if (orderBy === orderByEnum.LATEST) {
    return await query
      .orderBy('study.createdAt', 'DESC')
      .addOrderBy('study.id', 'ASC')
      .limit(1)
      .getOne();
  } else if (orderBy === orderByEnum.LARGE_VACANCY) {
    return await query
      .orderBy('study.vacancy', 'DESC')
      .addOrderBy('study.id', 'ASC')
      .limit(1)
      .getOne();
  }
};

const getAllStudy = async (paginationDTO: paginationDTO) => {
  const { frequencyFilter, weekdayFilter, locationFilter, orderBy, cursor } =
    paginationDTO;
  const last = cursor.split('_'); // id, createdAt, vacancy 순

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
    if (!cursor) {
      const study = await getLastStudy(paginationDTO);
      if (study) {
        return await sq
          .andWhere(
            'study.createdAt <= :date OR (study.createdAt = :date AND study.id >= :id)',
            { date: study.createdAt, id: study.id }
          )
          .orderBy('study.createdAt', 'DESC')
          .addOrderBy('study.id', 'ASC')
          .limit(12)
          .getMany();
      } else {
        return null;
      }
    } else {
      return await sq
        .andWhere(
          'study.createdAt < :date OR (study.createdAt = :date AND study.id > :id)',
          { date: last[1], id: last[0] }
        )
        .orderBy('study.createdAt', 'DESC')
        .addOrderBy('study.id', 'ASC')
        .limit(12)
        .getMany();
    }
  } else if (orderBy === orderByEnum.LAST) {
    if (!cursor) {
      return await sq
        .orderBy('study.createdAt', 'ASC')
        .addOrderBy('study.id', 'ASC')
        .limit(12)
        .getMany();
    } else {
      return await sq
        .andWhere(
          'study.createdAt > :date OR (study.createdAt = :date AND study.id > :id)',
          { date: last[1], id: last[0] }
        )
        .orderBy('study.createdAt', 'ASC')
        .addOrderBy('study.id', 'ASC')
        .limit(12)
        .getMany();
    }
  } else if (orderBy === orderByEnum.SMALL_VACANCY) {
    if (!cursor) {
      return await sq
        .orderBy('study.vacancy', 'ASC')
        .addOrderBy('study.id', 'ASC')
        .limit(12)
        .getMany();
    } else {
      return await sq
        .andWhere(
          'study.vacancy > :vacancy OR (study.vacancy = :vacancy AND study.id > :id)',
          { vacancy: last[2], id: last[0] }
        )
        .orderBy('study.vacancy', 'ASC')
        .addOrderBy('study.id', 'ASC')
        .limit(12)
        .getMany();
    }
  } else if (orderBy === orderByEnum.LARGE_VACANCY) {
    if (!cursor) {
      const study = await getLastStudy(paginationDTO);
      if (study) {
        return await sq
          .andWhere(
            'study.vacancy <= :vacancy OR (study.vacancy = :vacancy AND study.id >= :id)',
            { vacancy: study.vacancy, id: study.id }
          )
          .orderBy('study.vacancy', 'DESC')
          .addOrderBy('study.id', 'ASC')
          .limit(12)
          .getMany();
      } else {
        return null;
      }
    } else {
      return await sq
        .andWhere(
          'study.vacancy < :vacancy OR (study.vacancy = :vacancy AND study.id > :id)',
          { vacancy: last[2], id: last[0] }
        )
        .orderBy('study.vacancy', 'DESC')
        .addOrderBy('study.id', 'ASC')
        .limit(12)
        .getMany();
    }
  }
};

const findStudyById = async (id: string) => {
  return await getRepository(Study)
    .createQueryBuilder('study')
    .leftJoinAndSelect('study.hostId', 'user')
    .leftJoinAndSelect('study.categoryCode', 'category')
    .where('study.id = :id', { id })
    .getOne();
};

const createStudy = async (
  { title, studyAbout, weekday, frequency, location, capacity }: studyDTO,
  user: User,
  category: Category
) => {
  const studyId = randomUUID();
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

  await getRepository(Study).save(study);
  return studyId;
};

const updateStudy = async (
  { title, studyAbout, weekday, frequency, location, capacity }: studyDTO,
  study: Study,
  category: Category | null
) => {
  if (title) study.title = title;
  if (studyAbout) study.studyAbout = studyAbout;
  if (weekday) study.weekday = weekday;
  if (frequency) study.frequency = frequency;
  if (location) study.location = location;
  if (capacity) study.capacity = capacity;
  if (category) study.categoryCode = category;

  return await getRepository(Study).save(study);
};

const deleteStudy = async (study: Study) => {
  return await getRepository(Study).remove(study);
};

const checkStudyById = async (id: string) => {
  // only for check
  return await getRepository(Study)
    .createQueryBuilder('study')
    .where('study.id = :id', { id })
    .getCount();
};

export default {
  getLastStudy,
  getAllStudy,
  findStudyById,
  createStudy,
  updateStudy,
  deleteStudy,
  checkStudyById,
};
