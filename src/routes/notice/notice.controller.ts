import { Request, Response } from 'express';
import { findAllNotice } from '../../services/notice';

export default {
  async findAllNotice(req: Request, res: Response) {
    try {
      const result = await findAllNotice();
      res.json(result);
    } catch (e) {
      res.status(500).json({ message: '오류 발생' });
    }
  },
};
