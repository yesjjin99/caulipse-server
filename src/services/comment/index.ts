import { getRepository } from 'typeorm';
import { randomUUID } from 'crypto';
import Comment from '../../entity/CommentEntity';
import studyService from '../study';
import { findUserById } from '../user';
import Study from '../../entity/StudyEntity';

interface commentType {
  content: string;
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
  const exist = await getRepository(Study)
    .createQueryBuilder('study')
    .where('study.id = :id', { id })
    .getCount();

  if (exist === 0) {
    // status 404
    throw new Error('데이터베이스에 일치하는 요청값이 없습니다');
  }

  const comments = await getRepository(Comment)
    .createQueryBuilder('comment')
    .leftJoinAndSelect('comment.study', 'study')
    .leftJoinAndSelect('comment.user', 'user')
    .where('comment.study.id = :id', { id })
    .orderBy('comment.parentComment.id')
    .addOrderBy('comment.createdAt', 'ASC')
    .addOrderBy('comment.isNested', 'ASC')
    .getMany();

  return comments;
};

const createComment = async (
  studyid: string,
  { content, replyTo }: commentType,
  id: string
) => {
  const commentId = randomUUID();

  const study = await studyService.findStudyById(studyid);
  const user = await findUserById(id);
  const repo = getRepository(Comment);

  const comment = new Comment();
  comment.id = commentId;
  comment.createdAt = new Date();
  comment.content = content;
  comment.user = user;
  comment.study = study;

  if (replyTo) {
    // 대댓글인 경우
    const reply = await findCommentById(replyTo);
    comment.isNested = true;
    comment.parentComment = reply;
  } else {
    // 댓글인 경우
    comment.isNested = false;
    comment.parentComment = comment;
  }

  await repo.save(comment);
  return commentId;
};

const updateComment = async (commentid: string, content: string) => {
  const comment = await findCommentById(commentid);

  const repo = getRepository(Comment);
  comment.content = content;

  await repo.save(comment);
};

const deleteComment = async (commentid: string) => {
  const comment = await findCommentById(commentid);
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
