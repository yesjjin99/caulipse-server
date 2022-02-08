import { getRepository } from 'typeorm';
import Category from '../../entity/CategoryEntity';

export const findCategoryByCode = async (code: number) => {
  return await getRepository(Category)
    .createQueryBuilder('category')
    .where('category.code = :code', { code })
    .getOne();
};
