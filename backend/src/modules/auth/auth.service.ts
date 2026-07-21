// AuthService handles business logic for password hashing, token signatures, and account changes.
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/db';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../utils/errors';
import { User } from '../../../node_modules/.prisma/client';
import { Role, RegisterDTO, LoginDTO, ChangePasswordDTO } from './auth.types';
import { sendWelcomeEmail, sendPasswordChangeNotification } from '../../services/email.service';

export class AuthService {
  private getJwtSecret(): string {
    return process.env.JWT_SECRET || 'local_development_jwt_secret_key_12345';
  }

  private generateToken(user: User): string {
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, this.getJwtSecret(), { expiresIn: '24h' });
  }

  private excludePassword(user: User) {
    const { password, ...userWithoutPassword } = user; // eslint-disable-line @typescript-eslint/no-unused-vars
    return userWithoutPassword;
  }

  public async register(dto: RegisterDTO): Promise<Omit<User, 'password'>> {
    const existingUser = await prisma.user.findUnique({
      where: { email: dto.email }
    });

    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    const hashedPassword = await bcryptjs.hash(dto.password, 10);

    const user = await prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: dto.role as Role
      }
    });

    // Asynchronously send welcome email to the newly registered user's email
    sendWelcomeEmail(user.email, user.name).catch(() => {});

    return this.excludePassword(user);
  }

  public async login(dto: LoginDTO): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
    const user = await prisma.user.findUnique({
      where: { email: dto.email }
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email address or password');
    }

    const isPasswordValid = await bcryptjs.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email address or password');
    }

    const accessToken = this.generateToken(user);

    return {
      accessToken,
      user: this.excludePassword(user)
    };
  }

  public async getProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    return this.excludePassword(user);
  }

  public async changePassword(userId: string, dto: ChangePasswordDTO): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    const isCurrentPasswordValid = await bcryptjs.compare(dto.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError('Incorrect current password');
    }

    const hashedNewPassword = await bcryptjs.hash(dto.newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    // Send security notification email to the current user's email
    sendPasswordChangeNotification(user.email, user.name).catch(() => {});
  }
}
