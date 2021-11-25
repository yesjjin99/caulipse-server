import { Entity, BaseEntity, ManyToOne, JoinColumn } from 'typeorm';
import Study from './StudyEntity';
import Category from './CategoryEntity';

@Entity({ name: 'STUDY_CATEGORY' })
export default class StudyCategory extends BaseEntity {
  @ManyToOne((type) => Study, (study) => study.category)
  @JoinColumn({ name: 'STUDY_ID' })
  studyId!: Study;

  @ManyToOne((type) => Category, (category) => category.code)
  @JoinColumn({ name: 'CATEGORY_CODE' })
  categoryCode!: Category;
}
