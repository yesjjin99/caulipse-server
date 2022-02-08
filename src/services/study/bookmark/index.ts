import { findUserById } from '../../user';
import { getRepository } from 'typeorm';
import Study from '../../../entity/StudyEntity';

const createBookmark = async (studyid: string, userid: string) => {
  const user = await findUserById(userid);
  const repo = getRepository(Study);

  const bookmarks = await repo.find({
    where: { id: studyid },
    relations: ['bookmarks'],
  });

  if (bookmarks.length === 0) {
    throw new Error('데이터베이스에 일치하는 요청값이 없습니다');
  }

  bookmarks.forEach((bookmark) => {
    bookmark.bookmarks.push(user);
    // console.log(bookmark.bookmarks);
  });

  await repo.save(bookmarks);
};

const getBookmarksByUser = async (id: string) => {
  // TODO: 페이지네이션 추가
  const bookmarks = await getRepository(Study)
    .createQueryBuilder('study')
    .leftJoin('study.bookmarks', 'user')
    .leftJoinAndSelect('study.categoryCode', 'category')
    .where('user.id = :id', { id })
    .orderBy('study.createdAt', 'DESC')
    .getMany();

  return bookmarks;
};

export default { createBookmark, getBookmarksByUser };
