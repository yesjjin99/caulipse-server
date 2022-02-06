import { getRepository } from 'typeorm';
import Notification from '../../entity/NotificationEntity';

export const findAllByUserId = async (userId: string) => {
  return await getRepository(Notification)
    .createQueryBuilder()
    .select()
    .where('USER_ID = :id', { id: userId })
    .execute();
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
