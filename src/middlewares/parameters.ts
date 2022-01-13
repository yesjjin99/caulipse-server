import { NextFunction, Request, Response } from 'express';
import { isRequestWithParams, RequestWithParams } from '../types/types';

export const attachParamter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isRequestWithParams(req)) {
    (req as any).parameters = {};
  }

  Object.entries(req.params).forEach(([name, value]) => {
    if (isRequestWithParams(req))
      (req as RequestWithParams).parameters[name] = value;
  });
  next();
};
