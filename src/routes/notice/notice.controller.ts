import { Request, Response } from 'express';
import { findUserById } from '../../services/user';
import {
  createNotice,
  deleteNotice,
  findAllNotice,
  findNoticeById,
  updateNoticeById,
} from '../../services/notice';
import { UserRoleEnum } from '../../entity/UserEntity';

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

  async findNoticeById(req: Request, res: Response) {
    const NOT_FOUND = '데이터베이스에 일치하는 요청값이 없습니다';

    try {
      const { noticeid } = req.params;
      const notice = await findNoticeById(noticeid);
      if (!notice) throw new Error(NOT_FOUND);

      return res
        .status(200)
        .json({ notice, message: '각 공지사항별 상세 정보 조회 성공' });
    } catch (e) {
      if ((e as Error).message === NOT_FOUND) {
        return res.status(404).json({ message: NOT_FOUND });
      } else {
        return res.status(500).json({ message: (e as Error).message });
      }
    }
  },

  async createNotice(req: Request, res: Response) {
    const BAD_REQUEST = '요청값이 유효하지 않음';
    const NOT_FOUND = '데이터베이스에 일치하는 요청값이 없습니다';
    const FORBIDDEN = '접근할 수 있는 권한이 없습니다';

    try {
      const { title, about } = req.body;
      const { id } = req.user as { id: string };
      const user = await findUserById(id);

      if (!title || !about) throw new Error(BAD_REQUEST);
      if (!user) throw new Error(NOT_FOUND);
      if (user.role !== UserRoleEnum.ADMIN) throw new Error(FORBIDDEN);

      const noticeId = await createNotice(title, about, user);
      return res.status(201).json({
        noticeId,
        message: '공지사항 생성 성공',
      });
    } catch (e) {
      if ((e as Error).message === BAD_REQUEST) {
        return res.status(400).json({ message: BAD_REQUEST });
      } else if ((e as Error).message === FORBIDDEN) {
        return res.status(404).json({ message: FORBIDDEN });
      } else if ((e as Error).message === NOT_FOUND) {
        return res.status(404).json({ message: NOT_FOUND });
      } else {
        return res.status(500).json({ message: (e as Error).message });
      }
    }
  },

  async deleteNotice(req: Request, res: Response) {
    const NOT_FOUND = '데이터베이스에 일치하는 요청값이 없습니다';
    const FORBIDDEN = '접근할 수 있는 권한이 없습니다';

    try {
      const { noticeid } = req.params;
      const { id } = req.user as { id: string };
      const notice = await findNoticeById(noticeid);
      const user = await findUserById(id);
      if (!notice || !user) throw new Error(NOT_FOUND);
      if (user.role !== UserRoleEnum.ADMIN) throw new Error(FORBIDDEN);

      await deleteNotice(notice);
      return res.status(200).json({ message: '공지사항 삭제 성공' });
    } catch (e) {
      if ((e as Error).message === FORBIDDEN) {
        return res.status(403).json({ message: FORBIDDEN });
      } else if ((e as Error).message === NOT_FOUND) {
        return res.status(404).json({ message: NOT_FOUND });
      } else {
        return res.status(500).json({ message: (e as Error).message });
      }
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
 * paths:
 *  /api/notice:
 *    post:
 *      summary: "새로운 공지사항 생성"
 *      description: "ADMIN 권한을 가진 사용자가 공지사항을 생성할 때 사용되는 엔드포인트입니다"
 *      tags:
 *      - "notice"
 *      parameters:
 *      - in: "body"
 *        name: "study_body"
 *        description: "DB에 추가할 새로운 스터디 정보 객체"
 *        required: true
 *        schema:
 *          type: object
 *          allOf:
 *            - type: object
 *              properties:
 *                title:
 *                  type: string
 *                about:
 *                  type: string
 *      responses:
 *        201:
 *          description: "올바른 요청"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "새로운 공지사항 생성 성공"
 *              id:
 *                type: string
 *                format: uuid
 *                description: "생성된 공지사항의 아이디"
 *        400:
 *          description: "요청값이 유효하지 않은 경우입니다"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "Request is not valid"
 *        401:
 *          description: "로그인이 되어있지 않은 경우"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "로그인 필요"
 *        403:
 *          description: "ADMIN이 아닌 사용자 계정일 경우"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "접근할 수 있는 권한이 없습니다"
 *        404:
 *          description: "전달한 userid가 데이터베이스에 없는 경우입니다"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "일치하는 userid가 없음"
 *
 *  /api/notice/{noticeid}:
 *    get:
 *      summary: "공지사항 아이디에 해당하는 공지사항 상제 정보 조회"
 *      description: "공지사항 상세페이지에서 각 공지사항 아이디에 해당하는 모든 상세 정보들을 조회할 엔드포인트입니다"
 *      tags:
 *      - "notice"
 *      parameters:
 *      - name: "noticeid"
 *        in: "path"
 *        description: "정보를 조회할 공지사항 id"
 *        required: true
 *        type: string
 *        format: uuid
 *      responses:
 *        200:
 *          description: "올바른 요청, message와 함께 스터디 정보를 반환합니다"
 *          schema:
 *            $ref: "#/definitions/Notice"
 *        404:
 *          description: "전달한 noticeid가 데이터베이스에 없는 경우입니다"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "일치하는 noticeid가 없음"
 *
 *    patch:
 *      summary: "공지사항 정보 업데이트"
 *      description: "각 공지사항의 정보를 업데이트하기 위한 엔드포인트입니다"
 *      tags:
 *      - "notice"
 *      consumes:
 *      - "application/json"
 *      produces:
 *      - "application/json"
 *      parameters:
 *      - name: "noticeid"
 *        in: "path"
 *        description: "수정할 공지사항 id"
 *        required: true
 *        type: string
 *        format: uuid
 *      - in: "body"
 *        name: "notice_body"
 *        description: "수정할 공지사항 정보 객체"
 *        required: true
 *        schema:
 *          type: object
 *          allOf:
 *            - type: object
 *              properties:
 *                title:
 *                  type: string
 *                noticeAbout:
 *                  type: string
 *
 *      responses:
 *        200:
 *          description: "올바른 요청"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "공지사항 정보 업데이트 성공"
 *        400:
 *          description: "요청값이 유효하지 않은 경우입니다"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "request is not valid"
 *        401:
 *          description: "로그인이 되어있지 않은 경우"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "로그인 필요"
 *        403:
 *          description: "로그인된 사용자가 어드민 계정이 아닌 경우"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "권한이 없어 승인 불가능"
 *        404:
 *          description: "전달한 noticeid가 데이터베이스에 없는 경우입니다"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "일치하는 noticeid가 없음"
 *
 *    delete:
 *      summary: "공지사항 삭제"
 *      description: "공지사항을 삭제하기 위한 엔드포인트입니다"
 *      tags:
 *      - "notice"
 *      parameters:
 *      - name: "noticeid"
 *        in: "path"
 *        description: "삭제할 공지사항 id"
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
 *                example: "공지사항 삭제 성공"
 *        401:
 *          description: "로그인이 되어있지 않은 경우"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "로그인 필요"
 *        403:
 *          description: "ADMIN이 아닌 사용자 계정일 경우"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "접근할 수 있는 권한이 없습니다"
 *        404:
 *          description: "전달한 noticeid가 데이터베이스에 없는 경우입니다"
 *          schema:
 *            type: object
 *            properties:
 *              message:
 *                type: string
 *                example: "일치하는 noticeid가 없음"
 */
