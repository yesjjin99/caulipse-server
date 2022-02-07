import { getRepository } from 'typeorm';
import Notice from '../../entity/NoticeEntity';

export const findAllNotice = async () => {
  await getRepository(Notice).createQueryBuilder().select().execute();
};
