import { getRepository } from 'typeorm';
import User from '../../entity/UserEntity';

export const postInterestCategory = async (user: User, category: number) => {
  await getRepository(User).save({
    ...user,
    categories: [category],
  });
};
