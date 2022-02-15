import { Request, Response } from 'express';
import { findAllNotice } from '../../services/notice';

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
};
