import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const checkAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) throw new Error('먼저 로그인해야합니다');

    const decoded = jwt.verify(
      accessToken,
      process.env.SIGNUP_TOKEN_SECRET!
    ) as { id: string; email: string };
    req.user = { id: decoded.id, email: decoded.email };

    next();
  } catch (e) {
    res.status(403).json({ message: (e as Error).message });
  }
};
