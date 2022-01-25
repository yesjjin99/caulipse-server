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

const findCommentById = async (id: string) => {
  const comment = await getRepository(Comment)
    .createQueryBuilder('comment')
    .where('comment.id = :id', { id })
    .getOne();

  if (!comment) throw new Error('데이터베이스에 일치하는 요청값이 없습니다');
  // status 404

  return comment;
};

const getAllByStudy = async (id: string) => {
  await studyService.findStudyById(id);

  return await getRepository(Comment)
    .createQueryBuilder('comment')
    .where('comment.STUDY_ID = :id', { id })
    .orderBy('comment.createdAt', 'ASC')
    .getMany();
};

const createComment = async (
  studyid: string,
  { content, userId, replyTo }: commentType
) => {
  const id = randomUUID();

  const study = await studyService.findStudyById(studyid);
  const user = await findUserById(userId);

  const repo = getRepository(Comment);
  const comment = new Comment();
  comment.id = id;
  comment.createdAt = new Date();
  comment.content = content;
  comment.user = user;
  comment.study = study;

  if (replyTo) {
    const reply = await findCommentById(replyTo);
    comment.isNested = true;
    comment.parentComment = reply;
  } else {
    comment.isNested = false;
  }

  await repo.save(comment);
  return id;
};

const updateComment = async (commentid: string, content: string) => {
  const comment = await findCommentById(commentid);

  const repo = getRepository(Comment);
  comment.content = content;

  await repo.save(comment);
};

export default { findCommentById, getAllByStudy, createComment, updateComment };
