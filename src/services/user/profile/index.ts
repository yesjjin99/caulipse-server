import { getRepository } from 'typeorm';
import UserProfile from '../../../entity/UserProfileEntity';

/**
 * @swagger
 * paths:
 *  /api/user/profile:
 *    post:
 *      summary: "유저 프로필 생성"
 *      tags:
 *      - "user"
 *      description: "유저 프로필 생성을 위한 엔드포인트"
 *      parameters:
 *      - in: "body"
 *        description: "유저 프로필 객체"
 *        required: true
 *        schema:
 *          type: object
 *          properties:
 *            userId:
 *              type: string
 *              example: "sampleId"
 *            userName:
 *              type: string
 *              example: "홍길동"
 *            dept:
 *              type: string
 *              example: "경영학과"
 *            grade:
 *              type: number
 *              example: 3
 *            bio:
 *              type: string
 *              example: "남"
 */
interface UserProfileInterface {
  userId: string;
  userName: string;
  dept: string;
  grade?: number;
  bio: string;
  userAbout?: string;
  showDept?: boolean;
  showGrade?: boolean;
  onBreak?: boolean;
  link1?: string;
  link2?: string;
}

export const postUserProfile = async ({
  userId,
  userName,
  dept,
  grade = 0,
  bio,
  userAbout = '',
  showGrade = true,
  showDept = true,
  onBreak = false,
  link1 = '',
  link2 = '',
}: UserProfileInterface) => {
  const userProfileRepo = getRepository(UserProfile);
  const userProfile = new UserProfile();
  userProfile.USER_ID = userId;
  userProfile.userName = userName;
  userProfile.dept = dept;
  userProfile.grade = grade;
  userProfile.bio = bio;
  userProfile.userAbout = userAbout;
  userProfile.showGrade = showGrade;
  userProfile.showDept = showDept;
  userProfile.onBreak = onBreak;
  userProfile.link1 = link1;
  userProfile.link2 = link2;

  await userProfileRepo.save(userProfile);
};

export const findUserProfileById = async (paramId: string) => {
  const userProfile = await getRepository(UserProfile)
    .createQueryBuilder('userProfile')
    .select()
    .where('userProfile.user_id = :id', { id: paramId })
    .execute();

  if (!userProfile?.length)
    throw new Error('데이터베이스에 일치하는 요청값이 없습니다');

  return userProfile;
};

export const updateUserProfile = async ({
  userId,
  userName,
  dept,
  grade,
  bio,
  showDept,
  showGrade,
  onBreak,
  link1,
  link2,
}: UserProfileInterface) => {
  const result = await getRepository(UserProfile)
    .createQueryBuilder()
    .update()
    .set({
      userName,
      dept,
      grade,
      bio,
      showDept,
      showGrade,
      onBreak,
      link1,
      link2,
    })
    .where('user_id = :id', { id: userId })
    .execute();
  return result;
};
