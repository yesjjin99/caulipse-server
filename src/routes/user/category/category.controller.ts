import { Request, Response } from 'express';
import { postInterestCategory } from '../../../services/category';
import { findUserById } from '../../../services/user';

const registerInterestCategory = async (req: Request, res: Response) => {
  const NOT_FOUND = '데이터베이스에 일치하는 요청값이 없습니다';

  try {
    const { userId, categoryCode } = req.body;
    const user = await findUserById(userId);

    if (!user) {
      throw new Error(NOT_FOUND);
    }

    await postInterestCategory(user, categoryCode);

    return res.status(201).json({
      message: '관심 카테고리 생성 성공',
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

export default {
  registerInterestCategory,
};
