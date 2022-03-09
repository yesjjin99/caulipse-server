import { Brackets, getRepository } from 'typeorm';
import { randomUUID } from 'crypto';
import Study from '../../entity/StudyEntity';
import User from '../../entity/UserEntity';
import { orderByEnum, paginationDTO, studyDTO } from '../../types/study.dto';

const countAllStudy = async (paginationDto: paginationDTO) => {
  const { categoryCode, frequencyFilter, weekdayFilter, locationFilter } =
    paginationDto;

  const query = await getRepository(Study).createQueryBuilder('study');

  if (categoryCode) {
    query.andWhere('study.categoryCode = :categoryCode', { categoryCode });
  }

  if (frequencyFilter) {
    query.andWhere('study.frequency = :frequencyFilter', { frequencyFilter });
  }
  if (weekdayFilter) {
    query.andWhere('study.weekday = :weekdayFilter', { weekdayFilter });
  }
  if (locationFilter) {
    query.andWhere('study.location = :locationFilter', { locationFilter });
  }
  return await query.getCount();
};

const getAllStudy = async (paginationDTO: paginationDTO) => {
  const {
    categoryCode,
    frequencyFilter,
    weekdayFilter,
    locationFilter,
    orderBy,
    pageNo,
    limit,
  } = paginationDTO;
  const offset = (pageNo - 1) * limit;

  const sq = getRepository(Study)
    .createQueryBuilder('study')
    .leftJoinAndSelect('study.hostId', 'user');

  if (categoryCode) {
    sq.andWhere('study.categoryCode = :categoryCode', { categoryCode });
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

  if (orderBy === orderByEnum.LATEST) {
    sq.orderBy('study.createdAt', 'DESC');
  } else if (orderBy === orderByEnum.LAST) {
    sq.orderBy('study.createdAt', 'ASC');
  } else if (orderBy === orderByEnum.SMALL_VACANCY) {
    sq.orderBy('study.vacancy', 'ASC');
  } else if (orderBy === orderByEnum.LARGE_VACANCY) {
    sq.orderBy('study.vacancy', 'DESC');
  }
  return await sq.limit(limit).offset(offset).getMany();
};

const findStudyById = async (id: string) => {
  return await getRepository(Study)
    .createQueryBuilder('study')
    .leftJoinAndSelect('study.hostId', 'user')
    .where('study.id = :id', { id })
    .getOne();
};

const createStudy = async (studyDTO: studyDTO, user: User) => {
  const {
    title,
    studyAbout,
    weekday,
    frequency,
    location,
    capacity,
    categoryCode,
  } = studyDTO;

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
  study.categoryCode = categoryCode;

  await getRepository(Study).save(study);
  return studyId;
};

// eslint-disable-next-line prettier/prettier
const updateStudy = async (
  studyDTO: studyDTO,
  study: Study
) => {
  const {
    title,
    studyAbout,
    weekday,
    frequency,
    location,
    capacity,
    categoryCode,
  } = studyDTO;

  if (title) study.title = title;
  if (studyAbout) study.studyAbout = studyAbout;
  if (weekday) study.weekday = weekday;
  if (frequency) study.frequency = frequency;
  if (location) study.location = location;
  if (capacity) study.capacity = capacity;
  if (categoryCode) study.categoryCode = categoryCode;

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

const searchStudy = async (
  keyword: string,
  frequencyFilter: string,
  weekdayFilter: string,
  locationFilter: string,
  orderBy: string
) => {
  const query = await getRepository(Study)
    .createQueryBuilder('study')
    .leftJoinAndSelect('study.hostId', 'user')
    .where(
      new Brackets((qb) => {
        qb.where('study.title LIKE :keyword', { keyword: `%${keyword}%` });
        qb.orWhere('study.studyAbout LIKE :keyword', {
          keyword: `%${keyword}%`,
        });
      })
    );

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
    query.orderBy('study.createdAt', 'DESC');
  } else if (orderBy === orderByEnum.LAST) {
    query.orderBy('study.createdAt', 'ASC');
  } else if (orderBy === orderByEnum.SMALL_VACANCY) {
    query.orderBy('study.vacancy', 'ASC');
  } else if (orderBy === orderByEnum.LARGE_VACANCY) {
    query.orderBy('study.vacancy', 'DESC');
  }
  return await query.getMany();
};

export default {
  countAllStudy,
  getAllStudy,
  findStudyById,
  createStudy,
  updateStudy,
  deleteStudy,
  checkStudyById,
  searchStudy,
};
