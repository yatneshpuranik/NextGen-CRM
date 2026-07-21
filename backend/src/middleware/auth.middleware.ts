import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response';
export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: Role;
}

// Extend global Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(
      res,
      'Authentication token is missing or malformed',
      401,
      [{ code: 'UNAUTHORIZED', message: 'Token missing' }]
    );
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'local_development_jwt_secret_key_12345';
    const decoded = jwt.verify(token, secret) as UserPayload;
    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (error) {
    sendError(
      res,
      'Authentication token is invalid or expired',
      401,
      [{ code: 'INVALID_TOKEN', message: 'Token invalid or expired' }]
    );
    return;
  }
};
