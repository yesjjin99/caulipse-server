import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { randomUUID } from 'crypto';
import Study from '../../entity/StudyEntity';
import User from '../../entity/UserEntity';
interface Body extends Partial<Study> {
  userRepo: Partial<User>;
}

/**
 * @swagger
 * paths:
 *  /study:
 *    post:
 *      summary: "새로운 스터디 생성"
 *      tags:
 *      - "study"
 *      description: "사용자가 스터디를 생성할 때 사용되는 엔드포인트"
 *      parameters:
 *      - in: "body"
 *        name: "study_body"
 *        description: "DB에 추가할 새로운 스터디 정보 객체"
 *        required: true
 *        schema:
 *          $ref: "#/definitions/Study"
 */

export const registerStudy = async (req: Request, res: Response) => {
  try {
    const id = randomUUID();
    const {
      title,
      studyAbout,
      weekday,
      frequency,
      location,
      capacity,
      hostId,
      categoryCode,
    } = req.body as Body;

    // categoryCode, hostId 불러올 방법 수정
    const userRepo = getRepository(User);
    const user = await userRepo.findOne(hostId);
    if (user?.isLogout == false) {
      res.status(401).json({ error: 'Unauthorized. 로그인 필요.' });
      return;
    }

    await getRepository(Study)
      .createQueryBuilder()
      .insert()
      .values({
        id,
        createdAt: Date.now(),
        title,
        studyAbout,
        weekday,
        frequency,
        location,
        capacity,
        membersCount: 0,
        vacancy: capacity,
        isOpen: true,
        views: 0,
        hostId,
        categoryCode,
      })
      .execute();

    res.status(201).json({ message: 'Created. 새로운 스터디 생성됨.' });
  } catch (e) {
    res.json({ error: (e as Error).message || (e as Error).toString() });
  }
};
