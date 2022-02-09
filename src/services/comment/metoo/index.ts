import { getRepository } from 'typeorm';
import Comment from '../../../entity/CommentEntity';
import User from '../../../entity/UserEntity';

const findMetooByCommentId = async (id: string) => {
  return await getRepository(Comment).find({
    where: { id },
    relations: ['metooComment'],
  });
};

const registerMetoo = async (metoo: Comment[], user: User) => {
  metoo.forEach((metoo) => {
    metoo.metooComment.push(user);
  });

  await getRepository(Comment).save(metoo);
};

const getMetooCount = async (id: string) => {
  return await getRepository(Comment)
    .createQueryBuilder('comment')
    .where('comment.id = :id', { id })
    .leftJoin('comment.metooComment', 'user')
    .getCount();
};

const deleteMetoo = async (comment: Comment, user: User) => {
  return await getRepository(Comment)
    .createQueryBuilder('comment')
    .relation('metooComment')
    .of(comment)
    .remove(user);
};

export default {
  findMetooByCommentId,
  registerMetoo,
  getMetooCount,
  deleteMetoo,
};
