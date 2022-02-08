import { getRepository } from 'typeorm';
import { randomUUID } from 'crypto';
import Comment from '../../entity/CommentEntity';
import studyService from '../study';
import { findUserById } from '../user';
import Study from '../../entity/StudyEntity';
import User from '../../entity/UserEntity';

const findCommentById = async (id: string) => {
  return await getRepository(Comment)
    .createQueryBuilder('comment')
    .where('comment.id = :id', { id })
    .getOne();
};

const getAllByStudy = async (id: string) => {
  return await getRepository(Comment)
    .createQueryBuilder('comment')
    .leftJoinAndSelect('comment.study', 'study')
    .leftJoinAndSelect('comment.user', 'user')
    .where('comment.study.id = :id', { id })
    .orderBy('comment.parentComment.id')
    .addOrderBy('comment.createdAt', 'ASC')
    .addOrderBy('comment.isNested', 'ASC')
    .getMany();
};

const createComment = async (
  content: string,
  study: Study,
  user: User,
  reply: Comment | null
) => {
  const commentId = randomUUID();

  const comment = new Comment();
  comment.id = commentId;
  comment.createdAt = new Date();
  comment.content = content;
  comment.user = user;
  comment.study = study;

  if (reply === null) {
    // 댓글인 경우
    comment.isNested = false;
    comment.parentComment = comment;
  } else {
    // 대댓글인 경우
    comment.isNested = true;
    comment.parentComment = reply;
  }

  await getRepository(Comment).save(comment);
  return commentId;
};

const updateComment = async (content: string, comment: Comment) => {
  comment.content = content;
  await getRepository(Comment).save(comment);
};

const deleteComment = async (comment: Comment) => {
  const repo = getRepository(Comment);
  if (comment.isNested === false) {
    // 댓글인 경우
    const reply = await repo
      .createQueryBuilder('comment')
      .select('comment.nestedComments')
      .getCount();

    if (reply === 1) {
      // 자기 자신 포함 : reply = 1
      // 대댓글이 아예 존재하지 않는 경우
      comment.parentComment = null;
      await repo.save(comment);

      await repo.remove(comment);
    } else if (reply > 1) {
      // 대댓글이 남아있는 경우
      comment.user = null;
      comment.content = '삭제된 문의글입니다.';
      await repo.save(comment);
    }
  } else {
    // 대댓글인 경우
    await repo.remove(comment);
  }
};

export default {
  findCommentById,
  getAllByStudy,
  createComment,
  updateComment,
  deleteComment,
};
