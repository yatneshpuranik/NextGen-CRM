import jwt from 'jsonwebtoken';
import { Role } from '../modules/auth/auth.types';

export interface TokenPayload {
  id: string;
  fullName: string;
  email: string;
  role: Role;
}

const getSecret = (): string => {
  return process.env.JWT_SECRET || 'local_development_jwt_secret_key_12345';
};

const getExpiry = (): string => {
  return process.env.JWT_EXPIRES_IN || '24h';
};

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, getSecret(), { expiresIn: getExpiry() as any });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, getSecret()) as TokenPayload;
};
