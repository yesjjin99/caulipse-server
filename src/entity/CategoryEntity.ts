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

/**
 * @swagger
 * definitions:
 *  Category:
 *    type: object
 *    properties:
 *      code:
 *        type: integer
 *        description: "카테고리 고유번호"
 *      main:
 *        type: string
 *        enum:
 *        - "상위"
 *        description: "상위 카테고리"
 *      sub:
 *        type: string
 *        enum:
 *        - "하위"
 *        description: "하위 카테고리"
 */
