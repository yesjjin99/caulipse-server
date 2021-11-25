import { Entity, BaseEntity, ManyToOne, JoinColumn } from 'typeorm';
import User from './UserEntity';
import Study from './StudyEntity';

@Entity({ name: 'BOOKMARK' })
export default class Bookmark extends BaseEntity {
  @ManyToOne((type) => User, (user) => user.id)
  @JoinColumn({ name: 'USER_ID' })
  userId!: User;

  @ManyToOne((type) => Study, (study) => study.id)
  @JoinColumn({ name: 'STUDY_ID' })
  studyId!: Study;
}
