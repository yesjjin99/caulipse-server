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
    metoo.metooCount += 1;
  });

  await getRepository(Comment).save(metoo);
};

const deleteMetoo = async (comment: Comment, user: User) => {
  return await getRepository(Comment)
    .createQueryBuilder('comment')
    .relation('metooComment')
    .of(comment)
    .remove(user);
};

// 나도 궁금해요 여부
const checkMetoo = async (userId: string, commentId: string) => {
  return await getRepository(Comment)
    .createQueryBuilder('comment')
    .leftJoin('comment.metooComment', 'user')
    .where('comment.id = :commentId', { commentId })
    .where('user.id = :userId', { userId })
    .getCount();
};

export default {
  findMetooByCommentId,
  registerMetoo,
  deleteMetoo,
  checkMetoo,
};
