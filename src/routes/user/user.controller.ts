import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { deleteUserById, saveUser, updateUserById } from '../../services/user';

export default {
  async saveUser(req: Request, res: Response) {
    try {
      const id = randomUUID();
      const { email, password } = req.body;
      if (!email || !password)
        throw new Error('no email or password in request body');

      await saveUser({ id, email, password });
      // TODO: 이메일 전송 로직 추가
      res.status(201).json({ message: '회원가입 성공', id });
    } catch (e) {
      res
        .status(400)
        .json({ message: '회원가입 실패: ' + (e as Error).message });
    }
  },
  async updateUserInfo(req: Request, res: Response) {
    const NOT_FOUND = 'id 에 해당하는 사용자 없음';

    try {
      const result = await updateUserById(req.params.id, req.body);
      if (result.affected === 0) throw new Error(NOT_FOUND);
      else return res.json({ message: '회원정보 수정 성공' });
    } catch (e) {
      if ((e as Error).message === NOT_FOUND) {
        res.status(404).json({ message: '일치하는 id값 없음' });
      } else {
        res.status(400).json({ message: 'request is not valid' });
      }
    }
  },
  async deleteUser(req: Request, res: Response) {
    const NOT_FOUND = 'id와 일치하는 사용자 없음';

    try {
      const { id } = req.user as { id: string };
      const result = await deleteUserById(id);
      if (result.affected === 0) throw new Error(NOT_FOUND);
      res.json({ message: '회원 탈퇴 성공' });
    } catch (e) {
      if ((e as Error).message === NOT_FOUND) {
        res.status(404).json({ message: NOT_FOUND });
      } else {
        res.status(400).json({ message: '회원 탈퇴 실패' });
      }
    }
  },
};

/**
 * @swagger
 * /user:
 *  post:
 *    tags:
 *    - user
 *    summary: 회원가입
 *    description: 사용자가 최초에 회원가입을 요청할 시 사용되는 엔드포인트
 *    parameters:
 *    - in: body
 *      name: body
 *      description: 회원가입하는 사용자의 정보
 *      required: true
 *      schema:
 *        type: object
 *        properties:
 *          email:
 *            type: string
 *            example: example@gmail.com
 *            description: 사용자가 사용할 이메일
 *          password:
 *            type: string
 *            example: abcd1212
 *            description: 사용자가 사용할 비밀번호(프론트단에선 암호화할 필요x)
 *      responses:
 *        "201":
 *          description: "올바른 요청"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "회원가입 성공"
 *        "400":
 *          description: "요청 body에 이메일 또는 비밀번호 값이 없는 경우입니다"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "회원가입 실패: no email or password in request body"
 *
 *  delete:
 *    tags:
 *    - user
 *    summary: "회원 탈퇴"
 *    description: "회원 탈퇴를 위한 엔드포인트입니다."
 *
 *    responses:
 *      200:
 *        description: "올바른 요청"
 *        schema:
 *          type: object
 *          properties:
 *            message:
 *              type: string
 *              example: "회원탈퇴 성공"
 *      401:
 *        description: "로그인이 되어있지 않은 경우"
 *        schema:
 *          type: object
 *          properties:
 *            message:
 *              type: string
 *              example: "로그인 필요"
 *      404:
 *        description: "전달된 userid값이 데이터베이스에 없는 경우입니다"
 *        schema:
 *          type: object
 *          properties:
 *            message:
 *              type: string
 *              example: "일치하는 userid값이 없음"
 */

/**
 * @swagger
 * /user/:userid:
 *   patch:
 *     tags:
 *     - user
 *     summary: "회원정보 수정"
 *     description: "사용자의 인증정보를 업데이트하기 위한 엔드포인트입니다. 유저 리프레시토큰, 비밀번호 등의 항목이 해당됩니다."
 *     parameters:
 *     - in: "path"
 *       name: "userid"
 *       type: string
 *       format: uuid
 *       description: "회원정보를 수정할 사용자의 id"
 *       required: true
 *     - in: "body"
 *       name: "body"
 *       description: "회원정보를 수정할 사용자의 정보 객체"
 *       required: true
 *       schema:
 *         $ref: "#/definitions/User"
 *
 *     responses:
 *       200:
 *         description: "올바른 요청"
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "회원정보 수정 성공"
 *       400:
 *         description: "요청값이 유효하지 않은 경우입니다"
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "회원정보 수정 실패"
 *       404:
 *         description: "전달된 userid값이 데이터베이스에 없는 경우입니다"
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "일치하는 userid값이 없음"
 */
