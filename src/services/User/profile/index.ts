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
      link1?: string;
      link2?: string;
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
      link1 = '',
      link2 = '',
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
    userProfile.link1 = link1;
    userProfile.link2 = link2;

    await userProfileRepo.save(userProfile);

    res.status(201).json({ message: 'Created. 유저가 생성되었습니다.' });
  } catch (err) {
    console.error(err);
    res.json({ error: (err as Error).message || (err as Error).toString() });
  }
};

export const getUserProfileById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const findUserProfileById = async (paramId: string) => {
      const userProfile = await getRepository(UserProfile)
        .createQueryBuilder('userProfile')
        .select()
        .where('userProfile.user_id = :id', { id: paramId })
        .execute();

      if (!userProfile?.length)
        throw new Error('데이터베이스에 일치하는 요청값이 없습니다');

      return userProfile;
    };

    const userProfile = await findUserProfileById(id);

    // Todo: Link Json 파싱하기 : string -> array로 뿌리기

    return res.status(200).json({
      message: '해당 아이디의 유저 프로필 조회 성공',
      userProfile: userProfile,
    });
  } catch (err) {
    console.error(err);
    res.json({ error: (err as Error).message || (err as Error).toString() });
  }
};
