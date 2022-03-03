import {
  WeekDayEnum,
  FrequencyEnum,
  LocationEnum,
} from '../entity/StudyEntity';

export enum orderByEnum {
  LATEST = '최근 등록순',
  SMALL_VACANCY = '남은 모집인원: 적은 순',
  LARGE_VACANCY = '남은 모집인원: 많은 순',
  LAST = '오래된 순',
}

export interface paginationDTO {
  categoryCode: number;
  frequencyFilter: string;
  weekdayFilter: string;
  locationFilter: string;
  orderBy: string;
  pageNo: number;
  limit: number;
}
export interface studyDTO {
  title: string;
  studyAbout: string;
  weekday: WeekDayEnum;
  frequency: FrequencyEnum;
  location: LocationEnum;
  capacity: number;
  categoryCode: number;
}
