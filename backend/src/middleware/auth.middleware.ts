// Enforces JWT validation and deactivation checking
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../config/db';
import { sendError } from '../utils/response';
import { Role } from '../modules/auth/auth.types';

export interface UserPayload {
  id: string;
  fullName: string;
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

export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
    const decoded = verifyToken(token);

    // Verify user still exists in database and is active
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!dbUser) {
      sendError(
        res,
        'Authenticated user profile not found',
        401,
        [{ code: 'USER_NOT_FOUND', message: 'The user associated with this token no longer exists' }]
      );
      return;
    }

    if (!dbUser.isActive) {
      sendError(
        res,
        'User account is deactivated',
        401,
        [{ code: 'DEACTIVATED_USER', message: 'Your account has been deactivated. Please contact an administrator.' }]
      );
      return;
    }

    req.user = {
      id: decoded.id,
      fullName: decoded.fullName,
      email: decoded.email,
      role: decoded.role as Role
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
