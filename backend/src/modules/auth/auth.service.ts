// AuthService manages user account registrations, credentials validation, and security notifications.
import { prisma } from '../../config/db';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../utils/errors';
import { User } from '../../../node_modules/.prisma/client';
import { Role, RegisterDTO, LoginDTO, ChangePasswordDTO } from './auth.types';
import { sendWelcomeEmail, sendPasswordChangeNotification } from '../../services/email.service';
import { signToken } from '../../utils/jwt';
import { hashPassword, comparePassword } from '../../utils/password';

export class AuthService {
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

    const hashedPassword = await hashPassword(dto.password);

    const user = await prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        password: hashedPassword,
        role: dto.role as Role,
        isActive: true
      }
    });

    // Asynchronously send welcome email to the newly registered user's email
    sendWelcomeEmail(user.email, user.fullName).catch(() => {});

    return this.excludePassword(user);
  }

  public async login(dto: LoginDTO): Promise<{ accessToken: string; user: Omit<User, 'password'> }> {
    const user = await prisma.user.findUnique({
      where: { email: dto.email }
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email address or password');
    }

    // Security Gate: Reject deactivated/inactive users
    if (!user.isActive) {
      throw new UnauthorizedError('Your account is currently deactivated. Please contact an administrator.');
    }

    const isPasswordValid = await comparePassword(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email address or password');
    }

    const accessToken = signToken({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role as Role
    });

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

    if (!user.isActive) {
      throw new UnauthorizedError('Your account has been deactivated');
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

    if (!user.isActive) {
      throw new UnauthorizedError('Your account has been deactivated');
    }

    const isCurrentPasswordValid = await comparePassword(dto.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError('Incorrect current password');
    }

    const hashedNewPassword = await hashPassword(dto.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    // Send security notification email to the current user's email
    sendPasswordChangeNotification(user.email, user.fullName).catch(() => {});
  }
}
