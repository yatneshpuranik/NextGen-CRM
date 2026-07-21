import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { sendError } from '../utils/response';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array().map((err) => ({
      field: err.type === 'field' ? err.path : err.type,
      message: err.msg
    }));

    sendError(
      res,
      'Input validation checks failed',
      400,
      errorArray
    );
    return;
  }
  next();
};
