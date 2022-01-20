import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { changeUserRoleById } from '../../../services/user';

export default {
  async changeUserRole(req: Request, res: Response) {
    const BAD_REQUEST = 'request is not valid';
    const UNAUTHORIZED = 'id not valid';
    const NOT_FOUND = 'no user with given id found';
    const OK = '사용자 권한 수정 성공';

    try {
      if (!req.params.id) throw new Error(UNAUTHORIZED);

      const { id } = req.params;
      const { token } = req.body;
      const decoded = jwt.verify(
        token,
        process.env.SIGNUP_TOKEN_SECRET as string
      ) as {
        id: string;
        exp: number;
      };
      if (decoded.id !== id) throw new Error(UNAUTHORIZED);

      const result = await changeUserRoleById(id);
      if (!result.affected) throw new Error(NOT_FOUND);
      res.json({
        message: OK,
        id,
      });
    } catch (e) {
      if ((e as Error).message === NOT_FOUND) {
        res
          .status(404)
          .json({ message: '회원가입 실패: ' + (e as Error).message });
      } else if ((e as Error).message === UNAUTHORIZED) {
        res.status(403).json({ message: '회원가입 실패: ' + 'id 변조됨' });
      } else if ((e as Error).message.includes('expire')) {
        res.status(403).json({ message: '회원가입 실패: ' + '토큰 만료됨' });
      } else {
        res.status(400).json({ message: '회원가입 실패: ' + BAD_REQUEST });
      }
    }
  },
};

/**
 * @swagger
 * /user/:userid/role:
 *  patch:
 *    tags:
 *    - user
 *    summary: 사용자 권한 수정(회원가입 절차 마무리)
 *    description: 회원가입을 요청한 사용자가 이메일에서 링크를 클릭해 학교메일을 인증할 시 사용될 api
 *    parameters:
 *    - in: path
 *      name: userid
 *      description: 회원가입하는 사용자의 id
 *      required: true
 *      example: 15f6d6ee-32e2-4036-b050-fa79e38dcd36
 *    - in: body
 *      name: body
 *      schema:
 *        type: object
 *        properties:
 *          token:
 *            type: string
 *            example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUxYjg0M2I5LWE5ZTEtNDk3Mi05NWNiLWVmYTcxYzY2ODI5NSIsImlhdCI6MTY0MDYzMDg2MiwiZXhwIjoxNjQwNzE3MjYyfQ.zLJtNN-VCuYlghtE2v0yDJbz7YuxedGHKLt6CW7tUnA
 *            description: 사용자를 인증할 jwt토큰, email의 링크에 쿼리스트링으로 보내줄 예정
 *      responses:
 *        "200":
 *          description: "올바른 요청"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "사용자 권한 수정 성공"
 *        "400":
 *          description: "아래 두 에러가 아닌 다른 이유의 에러입니다. 코드 실행중 에러가 발생한 상황입니다"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "회원가입 실패: request is not valid"
 *        "403":
 *          description: "전달한 토큰값에 저장된 사용자 id와 url 경로상의 id가 일치하지 않거나, 토큰이 만료된 경우입니다"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example:
 *                - "회원가입 실패: id 변조됨"
 *                - "회원가입 실패 :토큰 만료됨"
 *        "404":
 *          description: "전달된 userid값이 데이터베이스에 없는 경우입니다"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "회원가입 실패: no user with given id found"
 */
