import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import User, { UserRoleEnum } from '../../entity/UserEntity';
import { makeSignUpToken } from '../../utils/auth';

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
 */
export const saveUser = async (req: Request, res: Response) => {
  try {
    const id = randomUUID();
    const { email, password } = req.body;
    if (!email || !password)
      throw new Error('no email or password in request body');
    await getRepository(User)
      .createQueryBuilder()
      .insert()
      .values({
        id,
        email,
        password: bcrypt.hashSync(password, 10),
        isLogout: false,
        role: UserRoleEnum.GUEST,
        token: makeSignUpToken(id),
      })
      .execute();
    // TODO: 이메일 전송 로직 추가
    res.status(201).json({ message: '회원가입 성공', id });
  } catch (e) {
    res.status(400).json({ message: '회원가입 실패: ' + (e as Error).message });
  }
};
