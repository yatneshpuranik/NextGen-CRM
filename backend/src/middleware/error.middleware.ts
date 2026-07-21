import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { sendError } from '../utils/response';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: any[];
}

export const globalErrorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const errorMessage = statusCode === 500 ? 'An unexpected server error occurred' : err.message;

  // Log error stacks to Winston
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, {
    stack: err.stack,
    details: err.details
  });

  return sendError(res, errorMessage, statusCode, err.details || [{ code: errorCode, message: err.message }]);
};
