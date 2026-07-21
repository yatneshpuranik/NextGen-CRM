import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { RegisterDTO, LoginDTO, ChangePasswordDTO } from './auth.types';
import { sendSuccess } from '../../utils/response';
import { AuditService } from '../audit/audit.service';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: RegisterDTO = req.body;
      const user = await this.authService.register(dto);

      // Write audit log entry
      const creatorId = req.user?.id || null;
      await AuditService.logAudit({
        userId: creatorId,
        module: 'AUTH',
        action: 'USER_CREATE',
        newValue: { registeredUserId: user.id, email: user.email, role: user.role },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      sendSuccess(res, user, 201, 'User account registered successfully');
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: LoginDTO = req.body;
      const authData = await this.authService.login(dto);

      // Write audit log entry
      await AuditService.logAudit({
        userId: authData.user.id,
        module: 'AUTH',
        action: 'LOGIN',
        newValue: { email: authData.user.email, role: authData.user.role },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      sendSuccess(res, authData, 200, 'User authentication successful');
    } catch (error) {
      next(error);
    }
  };

  public getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }
      const user = await this.authService.getProfile(userId);
      sendSuccess(res, user, 200, 'Profile details retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }
      const dto: ChangePasswordDTO = req.body;
      await this.authService.changePassword(userId, dto);

      // Write audit log entry
      await AuditService.logAudit({
        userId,
        module: 'AUTH',
        action: 'PASSWORD_CHANGE',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      sendSuccess(res, null, 200, 'Password updated successfully');
    } catch (error) {
      next(error);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id || null;

      // Write audit log entry
      if (userId) {
        await AuditService.logAudit({
          userId,
          module: 'AUTH',
          action: 'LOGOUT',
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        });
      }

      // JWT is stateless; client must discard the token.
      sendSuccess(res, null, 200, 'User logged out successfully. Clear your authentication tokens.');
    } catch (error) {
      next(error);
    }
  };
}
