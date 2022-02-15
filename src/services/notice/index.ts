import { getRepository } from 'typeorm';
import Notice from '../../entity/NoticeEntity';

export const findAllNotice = async ({
  amount,
  cursor,
}: {
  amount: number;
  cursor: string;
}) => {
  return await getRepository(Notice)
    .createQueryBuilder()
    .select()
    .orderBy('createdAt', 'DESC')
    .limit(amount)
    .execute();
};
