import {
  WeekDayEnum,
  FrequencyEnum,
  LocationEnum,
} from '../entity/StudyEntity';

export interface createStudyDTO {
  title: string;
  studyAbout: string;
  weekday: WeekDayEnum;
  frequency: FrequencyEnum;
  location: LocationEnum;
  capacity: number;
  categorycode: number;
}
