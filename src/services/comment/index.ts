import { getRepository } from 'typeorm';
import { randomUUID } from 'crypto';
import Comment from '../../entity/CommentEntity';
import studyService from '../study';
import { findUserById } from '../user';

interface commentType {
  content: string;
  userId: string; // FIX
  replyTo: string | null;
}

const findById = async (id: string) => {
  const comment = await getRepository(Comment)
    .createQueryBuilder('comment')
    .where('comment.id = :id', { id })
    .getOne();

  if (!comment) throw new Error('데이터베이스에 일치하는 요청값이 없습니다');
  // status 404

  return comment;
};

const getAllByStudy = async (id: string) => {
  const study = await studyService.findById(id);

  return await getRepository(Comment)
    .createQueryBuilder('comment')
    .where('comment.study = :study', { study })
    .orderBy('comment.createdAt', 'ASC')
    .getMany();
};

const createComment = async (
  studyid: string,
  { content, userId, replyTo }: commentType
) => {
  const id = randomUUID();

  const study = await studyService.findById(studyid);
  const user = await findUserById(userId);

  const repo = getRepository(Comment);
  const comment = new Comment();
  comment.id = id;
  comment.createdAt = new Date();
  comment.content = content;
  comment.user = user;
  comment.study = study;

  if (replyTo) {
    const reply = await findById(replyTo);
    comment.isNested = true;
    comment.parentComment = reply;
  } else {
    comment.isNested = false;
  }

  await repo.save(comment);
  return id;
};

export default { findById, getAllByStudy, createComment };
