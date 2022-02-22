import { randomUUID } from 'crypto';
import { getRepository } from 'typeorm';
import Notice from '../../entity/NoticeEntity';
import User from '../../entity/UserEntity';

export const findAllNotice = async () => {
  await getRepository(Notice).createQueryBuilder().select().execute();
};

export const findNoticeById = async (id: string) => {
  return await getRepository(Notice)
    .createQueryBuilder('notice')
    .leftJoinAndSelect('notice.hostId', 'user')
    .where('notice.id = :id', { id })
    .getOne();
};

export const createNotice = async (
  title: string,
  about: string,
  user: User
) => {
  const noticeId = randomUUID();
  const notice = new Notice();
  notice.id = noticeId;
  notice.title = title;
  notice.about = about;
  notice.createdAt = new Date();
  notice.views = 0;
  notice.hostId = user;

  await getRepository(Notice).save(notice);
  return noticeId;
};

export const deleteNotice = async (notice: Notice) => {
  return await getRepository(Notice).remove(notice);
};
