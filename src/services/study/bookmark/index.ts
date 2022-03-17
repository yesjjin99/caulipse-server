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

    bookmark.bookmarkCount += 1;
  });

  await getRepository(Study).save(bookmarks);
};

const getBookmarksByUser = async (id: string) => {
  return await getRepository(Study)
    .createQueryBuilder('study')
    .leftJoin('study.bookmarks', 'user')
    .where('user.id = :id', { id })
    .orderBy('study.createdAt', 'DESC')
    .getMany();
};

const deleteBookmark = async (study: Study, user: User) => {
  const repo = getRepository(Study);
  study.bookmarkCount -= 1;
  await repo.save(study);

  return await repo
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
