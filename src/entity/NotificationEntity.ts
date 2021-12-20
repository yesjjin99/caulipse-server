import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  PrimaryColumn,
} from 'typeorm';
import User from './UserEntity';
import Study from './StudyEntity';

@Entity({ name: 'NOTIFICATION' })
export default class Notification {
  @PrimaryGeneratedColumn('uuid', { name: 'ID' })
  id!: string;

  @PrimaryColumn('uuid')
  USER_ID!: string;

  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: 'USER_ID' })
  user!: User;

  @PrimaryColumn('uuid')
  STUDY_ID!: string;

  @ManyToOne(() => Study, (study) => study.id)
  @JoinColumn({ name: 'STUDY_ID' })
  study!: Study;

  @Column({ name: 'TYPE' })
  type!: number;

  @Column({ name: 'READ' })
  read!: boolean;

  @CreateDateColumn({ name: 'CREATED_AT' })
  createdAt!: Date;
}
