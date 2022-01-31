import { getRepository } from 'typeorm';
import UserProfile from '../../../entity/UserProfileEntity';
import { Request, Response } from 'express';

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

export const createProfile = async (req: Request, res: Response) => {
  try {
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
      links?: string;
    }
    const {
      userId,
      userName,
      dept,
      grade = 0,
      bio,
      userAbout = '',
      showGrade = true,
      showDept = true,
      onBreak = false,
      links = '',
    }: UserProfileInterface = req.body;

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
    userProfile.links = links;

    await userProfileRepo.save(userProfile);

    res.status(201).json({ message: 'Created. 유저가 생성되었습니다.' });
  } catch (err) {
    console.error(err);
    res.json({ error: (err as Error).message || (err as Error).toString() });
  }
};

export const getUserProfileById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const findUserProfileById = async (id: string) => {
      const userProfile = await getRepository(UserProfile)
        .createQueryBuilder('userProfile')
        .where('userProfile.user_id = :userId', { id })
        .getOne();

      if (!userProfile)
        throw new Error('데이터베이스에 일치하는 요청값이 없습니다');

      return userProfile;
    };

    const userProfile = await findUserProfileById(userId);

    return res.status(200).json({
      message: '해당 아이디의 유저 프로필 조회 성공',
      userProfile,
    });
  } catch (err) {
    console.error(err);
    res.json({ error: (err as Error).message || (err as Error).toString() });
  }
};
