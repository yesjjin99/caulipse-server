import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import User from './UserEntity';
import StudyCategory from './StudyCategoryEntity';

@Entity({ name: 'STUDY' })
export default class Study extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'STUDY_ID' })
  id!: string;

  @CreateDateColumn({ name: 'CREATED_AT' })
  createdAt!: Date;

  @Column({ name: 'TITLE' })
  title!: string;

  @Column({ name: 'STUDY_ABOUT' })
  studyAbout!: string;

  @Column('int', { name: 'TIME' })
  time!: number;

  @Column('int', { name: 'WEEKDAY' })
  weekday!: number;

  @Column('int', { name: 'FREQUENCY' })
  frequency!: number;

  @Column({ name: 'LOCATION' })
  location!: string;

  @ManyToOne((type) => User, (user) => user.id)
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

  @OneToMany((type) => StudyCategory, (studycategory) => studycategory.studyId)
  @JoinColumn({ name: 'CATEGORY' })
  category!: StudyCategory[];

  @Column('int', { name: 'VIEWS' })
  views!: number;
}
