import { Entity, BaseEntity, ManyToOne, JoinColumn } from 'typeorm';
import User from './UserEntity';
import Category from './CategoryEntity';

@Entity({ name: 'USER_INTEREST_CATEGORY' })
export default class UserInterestCategory extends BaseEntity {
  @ManyToOne((type) => User, (user) => user.id)
  @JoinColumn({ name: 'USER_ID' })
  userId!: User;

  @ManyToOne((type) => Category, (category) => category.code)
  @JoinColumn({ name: 'CATEGORY_CODE' })
  categoryCode!: Category;
}
