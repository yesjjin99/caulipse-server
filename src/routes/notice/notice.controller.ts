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
