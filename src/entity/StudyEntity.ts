import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
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

  @OneToOne(() => Category, (category) => category.code)
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
