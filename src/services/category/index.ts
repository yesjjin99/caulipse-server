import { getRepository } from 'typeorm';
import Category from '../../entity/CategoryEntity';
import User from '../../entity/UserEntity';

export const findCategoryByCode = async (code: number) => {
  return await getRepository(Category)
    .createQueryBuilder('category')
    .where('category.code = :code', { code })
    .getOne();
};

export const postInterestCategory = async (user: User, category: Category) => {
  await getRepository(User).save({
    ...user,
    categories: [category],
  });
};
