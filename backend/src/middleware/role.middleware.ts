import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { Role } from './auth.middleware';

export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(
        res,
        'Authentication required',
        401,
        [{ code: 'UNAUTHORIZED', message: 'Authentication required to access this resource' }]
      );
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        'Access denied: Insufficient role privileges',
        403,
        [{ code: 'FORBIDDEN', message: `Role ${req.user.role} is not permitted to access this resource` }]
      );
      return;
    }

    next();
  };
};
