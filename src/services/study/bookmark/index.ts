import { getRepository } from 'typeorm';
import Study from '../../../entity/StudyEntity';
import User from '../../../entity/UserEntity';

const findBookmarksByStudyId = async (id: string) => {
  return await getRepository(Study).find({
    where: { id },
    relations: ['bookmarks'],
  });
};

const registerBookmark = async (bookmarks: Study[], user: User) => {
  bookmarks.forEach((bookmark) => {
    bookmark.bookmarks.push(user);
    // console.log(bookmark.bookmarks);
  });

  await getRepository(Study).save(bookmarks);
};

const getBookmarksByUser = async (id: string) => {
  // TODO: 페이지네이션 추가 + 카테고리별로
  return await getRepository(Study)
    .createQueryBuilder('study')
    .leftJoin('study.bookmarks', 'user')
    .leftJoinAndSelect('study.categoryCode', 'category')
    .where('user.id = :id', { id })
    .orderBy('study.createdAt', 'DESC')
    .getMany();
};

const deleteBookmark = async (study: Study, user: User) => {
  return await getRepository(Study)
    .createQueryBuilder('study')
    .relation('bookmarks')
    .of(study)
    .remove(user);
};

export default {
  findBookmarksByStudyId,
  registerBookmark,
  getBookmarksByUser,
  deleteBookmark,
};
