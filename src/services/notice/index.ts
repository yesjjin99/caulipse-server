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

export const updateNoticeById = async ({
  noticeId,
  title,
  noticeAbout,
}: {
  noticeId: string;
  title: string;
  noticeAbout: string;
}) => {
  return await getRepository(Notice)
    .createQueryBuilder()
    .update()
    .set({
      title,
      about: noticeAbout,
    })
    .where('id = :id', { id: noticeId })
    .execute();
};
