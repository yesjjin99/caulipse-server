import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import StudyCategory from './StudyCategoryEntity';
import UserInterestCategory from './UserInterestCategory';

@Entity({ name: 'CATEGORY' })
export default class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  @OneToMany(
    (type) => StudyCategory,
    (studycategory) => studycategory.categoryCode
  )
  @JoinColumn({ name: 'CODE' })
  @OneToMany(
    (type) => UserInterestCategory,
    (userinterestcategory) => userinterestcategory.categoryCode
  )
  @JoinColumn({ name: 'CODE' })
  code!: StudyCategory[] | UserInterestCategory[];
  // ..... 이게 맞나..?

  @Column('enum', { name: 'MAIN' })
  main!: string;

  @Column('enum', { name: 'SUB' })
  sub!: string;
}
