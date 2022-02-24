import { Request, Response } from 'express';
import { UserRoleEnum } from '../../entity/UserEntity';
import { findAllNotice, updateNoticeById } from '../../services/notice';
import { findUserById } from '../../services/user';

export default {
  async findAllNotice(req: Request, res: Response) {
    try {
      const rowNum = req.query.row_num || 12;
      const cursor = req.query.cursor || ''; // FIXME: cursor 디폴트값 설정

      const result = await findAllNotice({
        amount: rowNum as number,
        cursor: cursor as string,
      });
      res.json(result);
    } catch (e) {
      res.status(500).json({ message: '오류 발생' });
    }
  },
  async updateNoticeById(req: Request, res: Response) {
    const OK = '공지사항 정보 업데이트 성공';
    const BAD_REQUEST = 'request is not valid';
    const FORBIDDEN = '권한이 없어 승인 불가능';
    const NOT_FOUND = '일치하는 noticeid가 없음';

    try {
      const noticeId = req.params.notiid;
      const { title, noticeAbout } = req.body;
      if (!noticeId || !title || !noticeAbout) throw new Error(BAD_REQUEST);

      const userId = (req.user as { id: string }).id;
      const user = await findUserById(userId);
      if (user?.role !== UserRoleEnum.ADMIN) throw new Error(FORBIDDEN);

      const result = await updateNoticeById({ noticeId, title, noticeAbout });
      if (result.affected === 0) throw new Error(NOT_FOUND);
      res.json({ message: OK });
    } catch (e) {
      const err = e as Error;
      if (err.message === BAD_REQUEST) {
        res.status(400).json({ message: BAD_REQUEST });
      } else if (err.message === FORBIDDEN) {
        res.status(403).json({ message: FORBIDDEN });
      } else if (err.message === NOT_FOUND) {
        res.status(404).json({ message: NOT_FOUND });
      } else {
        res.status(500).json({ message: '오류 발생' });
      }
    }
  },
};

/**
 * @swagger
 * /api/notice/{noticeid}:
 *   patch:
 *     summary: "공지사항 정보 업데이트"
 *     description: "각 공지사항의 정보를 업데이트하기 위한 엔드포인트입니다"
 *     tags:
 *     - "notice"
 *     consumes:
 *     - "application/json"
 *     produces:
 *     - "application/json"
 *     parameters:
 *     - name: "noticeid"
 *       in: "path"
 *       description: "수정할 공지사항 id"
 *       required: true
 *       type: string
 *       format: uuid
 *     - in: "body"
 *       name: "notice_body"
 *       description: "수정할 공지사항 정보 객체"
 *       required: true
 *       schema:
 *         type: object
 *         allOf:
 *           - type: object
 *             properties:
 *               title:
 *                 type: string
 *               noticeAbout:
 *                 type: string
 *
 *     responses:
 *       200:
 *         description: "올바른 요청"
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "공지사항 정보 업데이트 성공"
 *       400:
 *         description: "요청값이 유효하지 않은 경우입니다"
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "request is not valid"
 *       401:
 *         description: "로그인이 되어있지 않은 경우"
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "로그인 필요"
 *       403:
 *         description: "로그인된 사용자가 어드민 계정이 아닌 경우"
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "권한이 없어 승인 불가능"
 *       404:
 *         description: "전달한 noticeid가 데이터베이스에 없는 경우입니다"
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "일치하는 noticeid가 없음"
 */
