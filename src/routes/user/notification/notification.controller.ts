import { Request, Response } from 'express';
import { findAllByUserId } from '../../../services/notification';

export default {
  async findAllNotification(req: Request, res: Response) {
    try {
      const userId = (req.user as { id: string }).id;
      const result = await findAllByUserId(userId);
      res.json(result);
    } catch (e) {
      res.status(400).json({ message: 'error' });
    }
  },
};

/**
 * @swagger
 * /user/notification:
 *   get:
 *     tags:
 *     - user/notification
 *     summary: "사용자의 알림 목록을 읽어옵니다."
 *     description: "사용자의 알림 목록을 읽어오기 위한 엔드포인트입니다."
 *     produces:
 *     - "application/json"
 *
 *     responses:
 *       200:
 *         description: "올바른 요청"
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             $ref: "#/definitions/Notification"
 *       400:
 *         description: "요청 처리 과정에서 에러가 발생한 경우입니다"
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "error"
 *       401:
 *         description: "로그인이 되어있지 않은 경우"
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "로그인이 필요한 서비스입니다"
 *
 * /user/notification/{notiid}:
 *   patch:
 *     tags:
 *     - user/notification
 *     summary: "사용자의 알림 확인 상태를 갱신합니다."
 *     description: "사용자의 알림 확인 상태를 갱신하기 위한 엔드포인트입니다. 상태 변화는 오로지 read속성이 false 에서 true 으로만 가능합니다."
 *     parameters:
 *     - in: "path"
 *       name: "notiid"
 *       description: "확인 상태를 수정할 알림의 id"
 *       required: true
 *       type: string
 *       format: uuid
 *
 *     responses:
 *       200:
 *         description: "올바른 요청"
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "사용자의 알림 확인 상태 갱신 성공"
 *       401:
 *         description: "로그인이 되어있지 않은 경우"
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "로그인이 필요한 서비스입니다"
 *       404:
 *         description: "전달한 userid 또는 notiid가 데이터베이스에 없는 경우입니다"
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "일치하는 userid 또는 notiid가 없음"
 *
 *
 *   delete:
 *     tags:
 *     - user/notification
 *     summary: "사용자의 알림 항목을 삭제합니다."
 *     description: "사용자의 알림 항목을 삭제하기 위한 엔드포인트입니다."
 *     parameters:
 *     - in: "path"
 *       name: "notiid"
 *       description: "삭제할 알림의 id"
 *       required: true
 *       type: string
 *       format: uuid
 *
 *     responses:
 *       200:
 *         description: "올바른 요청"
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "사용자의 알림 항목 삭제 성공"
 *       401:
 *         description: "로그인이 되어있지 않은 경우"
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "로그인이 필요한 서비스입니다"
 *       404:
 *         description: "전달한 userid 또는 notiid가 데이터베이스에 없는 경우입니다"
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "일치하는 userid 또는 notiid가 없음"
 */
