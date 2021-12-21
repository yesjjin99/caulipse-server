import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import Study from './StudyEntity';
import User from './UserEntity';

@Entity({ name: 'STUDY_USER' })
export default class StudyUser {
  @PrimaryColumn('uuid')
  USER_ID!: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'USER_ID' })
  user!: User;

  @PrimaryColumn('uuid')
  STUDY_ID!: string;

  @ManyToOne(() => Study, (study) => study.id)
  @JoinColumn({ name: 'STUDY_ID' })
  study!: Study;

  @Column({ name: 'IS_ACCEPTED' })
  isAccepted!: boolean;

  @Column({ name: 'TEMP_BIO' })
  tempBio!: string;
}
