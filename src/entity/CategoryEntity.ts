import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import Study from './StudyEntity';

@Entity({ name: 'CATEGORY' })
export default class Category extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'CODE' })
  code!: number;

  // enum 타입으로 수정 필요
  @Column({ name: 'MAIN' })
  main!: string;

  // enum 타입으로 수정 필요
  @Column({ name: 'SUB' })
  sub!: string;

  @OneToMany(() => Study, (study) => study.categoryCode)
  studyIds!: Study[];
}
