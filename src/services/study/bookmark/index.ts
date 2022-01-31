import { getRepository } from 'typeorm';
import Study from '../../../entity/StudyEntity';
import { findUserById } from '../../user';

const createBookmark = async (studyid: string, id: string) => {
  const user = await findUserById(id);
  const repo = getRepository(Study);
  const bookmark = await repo
    .createQueryBuilder('study')
    .leftJoinAndSelect('study.bookmarks', 'user')
    .where('study.id = :studyid', { studyid })
    .getOne();

  if (!bookmark) {
    throw new Error('데이터베이스에 일치하는 요청값이 없습니다');
  }

  bookmark?.bookmarks?.push(user);
  await repo.save(bookmark);
};

export default { createBookmark };
