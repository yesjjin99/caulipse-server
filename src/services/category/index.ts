import { getRepository } from 'typeorm';
import Category from '../../entity/CategoryEntity';

const findByCode = async (code: number) => {
  const category = await getRepository(Category)
    .createQueryBuilder('category')
    .where('category.code = :code', { code })
    .getOne();

  if (!category) throw new Error('데이터베이스에 일치하는 요청값이 없습니다');
  // status 404

  return category;
};

export default { findByCode };
