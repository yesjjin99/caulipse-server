import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';

export const renewAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const cookie = req.cookies;
  if (cookie.accessToken && cookie.refreshToken) next();
  if (cookie.accessToken && !cookie.refreshToken) next();

  if (!cookie.accessToken && !cookie.refreshToken) {
    res.status(401).json({ message: '로그인이 필요한 서비스입니다' });
    return;
  }

  try {
    const decoded = jwt.verify(
      cookie.refreshToken,
      process.env.SIGNUP_TOKEN_SECRET as string
    ) as {
      id: string;
    };

    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.SIGNUP_TOKEN_SECRET as string,
      {
        algorithm: 'HS256',
        expiresIn: '3h',
      }
    );

    const hour = 1000 * 60 * 60;
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 3 * hour),
    });
  } catch (e) {
    res.status(403).json({ message: '토큰 오류' });
  }

  next();
};
