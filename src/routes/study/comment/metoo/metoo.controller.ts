import { Request, Response } from 'express';
import studyService from '../../../../services/study';
import { findUserById } from '../../../../services/user';
import metooService from '../../../../services/comment/metoo';
import commentService from '../../../../services/comment';

const registerMetoo = async (req: Request, res: Response) => {
  const NOT_FOUND = '데이터베이스에 일치하는 요청값이 없습니다';

  try {
    const { studyid, commentid } = req.params;
    const { id } = req.user as { id: string };
    const study = await studyService.findStudyById(studyid);
    const user = await findUserById(id);

    if (!study || !user) {
      throw new Error(NOT_FOUND);
    }
    const metoo = await metooService.findMetooByCommentId(commentid);
    if (metoo.length === 0) {
      throw new Error(NOT_FOUND);
    }

    await metooService.registerMetoo(metoo, user);
    return res.status(201).json({
      message: '나도 궁금해요 생성 성공',
    });
  } catch (e) {
    if ((e as Error).message === NOT_FOUND) {
      return res.status(404).json({
        message: NOT_FOUND,
      });
    } else {
      return res.status(500).json({
        message: (e as Error).message,
      });
    }
  }
};

const getMetooCount = async (req: Request, res: Response) => {
  const NOT_FOUND = '데이터베이스에 일치하는 요청값이 없습니다';

  try {
    const { studyid, commentid } = req.params;
    const study = await studyService.findStudyById(studyid);
    const comment = await commentService.findCommentById(commentid);

    if (!study || !comment) {
      throw new Error(NOT_FOUND);
    }
    const count = await metooService.getMetooCount(commentid);

    return res.status(200).json({
      count,
      message: '나도 궁금해요 총 개수 조회 성공',
    });
  } catch (e) {
    if ((e as Error).message === NOT_FOUND) {
      return res.status(404).json({
        message: NOT_FOUND,
      });
    } else {
      return res.status(500).json({
        message: (e as Error).message,
      });
    }
  }
};

export default { registerMetoo, getMetooCount };

/**
 * @swagger
 * paths:
 *  /study/:studyid/comment/:commentid/metoo:
 *    get:
 *      summary: "스터디 문의글의 나도 궁금해요 카운트"
 *      description: "해당 문의글에 등록되어 있는 나도 궁금해요의 총 개수를 불러오기 위한 엔드포인트입니다"
 *      tags:
 *      - study/comment/metoo
 *      parameters:
 *      - name: "studyid"
 *        in: "path"
 *        description: "문의글이 등록되어 있는 스터디 id"
 *        required: true
 *        type: string
 *        format: uuid
 *      - name: "commentid"
 *        in: "path"
 *        description: "나도 궁금해요를 카운트할 문의글의 id"
 *        required: true
 *        type: string
 *        format: uuid
 *      responses:
 *        200:
 *          description: "올바른 요청"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "나도 궁금해요 총 개수 조회 성공"
 *              count:
 *                type: integer
 *                example: "해당 문의글에 등록된 나도 궁금해요 총 개수"
 *        404:
 *          description: "전달한 studyid 또는 commentid가 데이터베이스에 없는 경우입니다"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "일치하는 studyid 또는 commentid가 없음"
 *
 *    post:
 *      summary: "스터디 문의글에 나도 궁금해요 등록"
 *      description: "해당 문의글에 나도 궁금해요를 등록하기 위한 엔드포인트입니다"
 *      tags:
 *      - study/comment/metoo
 *      parameters:
 *      - name: "studyid"
 *        in: "path"
 *        description: "문의글이 등록되어 있는 스터디 id"
 *        required: true
 *        type: string
 *        format: uuid
 *      - name: "commentid"
 *        in: "path"
 *        description: "나도 궁금해요를 등록할 문의글의 id"
 *        required: true
 *        type: string
 *        format: uuid
 *      responses:
 *        201:
 *          description: "올바른 요청"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "나도 궁금해요 생성 성공"
 *        401:
 *          description: "로그인이 되어있지 않은 경우"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "로그인 필요"
 *        404:
 *          description: "전달한 studyid 또는 commentid가 데이터베이스에 없는 경우입니다"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "일치하는 studyid 또는 commentid가 없음"
 */
