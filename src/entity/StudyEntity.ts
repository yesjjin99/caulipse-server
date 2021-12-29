import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import User from './UserEntity';
import Category from './CategoryEntity';

enum WeekDayEnum {
  MON = '월',
  TUE = '화',
  WED = '수',
  THU = '목',
  FRI = '금',
  SAT = '토',
  SUN = '일',
}
enum FrequencyEnum {
  ONCE = '1회',
  TWICE = '주 2-4회',
  MORE = '주 5회 이상',
}
enum LocationEnum {
  NO_CONTACT = '비대면',
  ROOM = '학교 스터디룸',
  LIBRARY = '중앙도서관',
  S_CAFE = '스터디카페',
  CAFE = '일반카페',
  LOC1 = '흑석, 상도',
  LOC2 = '서울대입구, 낙성대',
  ELSE = '기타',
}

@Entity({ name: 'STUDY' })
export default class Study extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'ID' })
  id!: string;

  @CreateDateColumn({ name: 'CREATED_AT' })
  createdAt!: Date;

  @Column({ name: 'TITLE' })
  title!: string;

  @Column({ name: 'STUDY_ABOUT' })
  studyAbout!: string;

  @Column('enum', { enum: WeekDayEnum, name: 'WEEKDAY' })
  weekday!: WeekDayEnum;

  @Column('enum', { enum: FrequencyEnum, name: 'FREQUENCY' })
  frequency!: FrequencyEnum;

  @Column('enum', { enum: LocationEnum, name: 'LOCATION' })
  location!: LocationEnum;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'HOST_ID' })
  hostId!: User;

  @Column('int', { name: 'CAPACITY' })
  capacity!: number;

  @Column('int', { name: 'MEMBERS_COUNT' })
  membersCount!: number;

  @Column('int', { name: 'VACANCY' })
  vacancy!: number;

  @Column({ name: 'IS_OPEN' })
  isOpen!: boolean;

  @ManyToOne(() => Category, (category) => category.code)
  @JoinColumn({ name: 'CATEGORY_CODE' })
  categoryCode!: Category;

  @Column('int', { name: 'VIEWS' })
  views!: number;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'BOOKMARK',
    joinColumn: {
      name: 'STUDY_ID',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'USER_ID',
      referencedColumnName: 'id',
    },
  })
  bookmarks!: User[];
}

/**
 * @swagger
 * definitions:
 *  Study:
 *    type: object
 *    properties:
 *      id:
 *        type: string
 *        format: uuid
 *        description: "개별 스터디 구분하는 고유 id"
 *      createdAt:
 *        type: string
 *        format: date-time
 *        description: "스터디 등록 날짜와 시간"
 *      title:
 *        type: string
 *        description: "스터디 이름"
 *      studyAbout:
 *        type: string
 *        description: "스터디 내용"
 *      weekday:
 *        type: string
 *        enum:
 *        - "월"
 *        - "화"
 *        - "수"
 *        - "목"
 *        - "금"
 *        - "토"
 *        - "일"
 *        description: "스터디 요일"
 *      frequency:
 *        type: string
 *        enum:
 *        - "1회"
 *        - "주 2-4회"
 *        - "주 5회 이상"
 *        description: "스터디 빈도"
 *      location:
 *        type: string
 *        enum:
 *        - "비대면"
 *        - "학교 스터디룸"
 *        - "중앙도서관"
 *        - "스터디카페"
 *        - "일반카페"
 *        - "흑석, 상도"
 *        - "서울대입구, 낙성대"
 *        - "기타"
 *        description: "스터디 장소"
 *      hostId:
 *        type: string
 *        format: uuid
 *        description: "스터디 host의 id"
 *      capacity:
 *        type: integer
 *        description: "스터디 정원"
 *      membersCount:
 *        type: integer
 *        description: "현재 스터디 참가인원수"
 *      vacancy:
 *        type: integer
 *        description: "현재 빈자리 수"
 *      isOpen:
 *        type: boolean
 *        description: "모집중 여부"
 *      categoryCode:
 *        $ref: "#/definitions/Category"
 *        description: "스터디의 카테고리 코드"
 *      views:
 *        type: integer
 *        description: "현재 스터디 조회수"
 */
