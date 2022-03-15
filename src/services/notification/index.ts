import { randomUUID } from 'crypto';
import { getRepository } from 'typeorm';
import Notification from '../../entity/NotificationEntity';

export const findAllByUserId = async (userId: string) => {
  return await getRepository(Notification)
    .createQueryBuilder()
    .select()
    .where('USER_ID = :id', { id: userId })
    .execute();
};

export const createStudyNoti = async (
  studyId: string,
  userId: string,
  title: string,
  about: string,
  type: number
) => {
  const noti = new Notification();
  noti.id = randomUUID();
  noti.USER_ID = userId;
  noti.STUDY_ID = studyId;
  noti.type = type;
  noti.title = title;
  noti.notiAbout = about;
  noti.read = false;
  noti.createdAt = new Date();

  return await getRepository(Notification).save(noti);
};

export const createNoticeNoti = async (
  noticeId: string,
  userId: string,
  title: string,
  about: string,
  type: number
) => {
  const noti = new Notification();
  noti.id = randomUUID();
  noti.USER_ID = userId;
  noti.NOTICE_ID = noticeId;
  noti.type = type;
  noti.title = title;
  noti.notiAbout = about;
  noti.read = false;
  noti.createdAt = new Date();

  return await getRepository(Notification).save(noti);
};

export const updateReadstatusByNotiAndUserId = async (
  notiId: string,
  userId: string
) => {
  return await getRepository(Notification)
    .createQueryBuilder()
    .update()
    .set({ read: true })
    .where('ID = :id', { id: notiId })
    .andWhere('USER_ID = :userid', { userid: userId })
    .execute();
};

export const deleteByNotiAndUserId = async (notiId: string, userId: string) => {
  return await getRepository(Notification)
    .createQueryBuilder()
    .delete()
    .where('id = :id', { id: notiId })
    .andWhere('USER_ID = :userid', { userid: userId })
    .execute();
};
