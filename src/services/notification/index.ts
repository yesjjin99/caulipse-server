import { getRepository } from 'typeorm';
import Notification from '../../entity/NotificationEntity';

export const findAllByUserId = async (userId: string) => {
  return await getRepository(Notification)
    .createQueryBuilder()
    .select()
    .where('USER_ID = :id', { id: userId })
    .execute();
};
