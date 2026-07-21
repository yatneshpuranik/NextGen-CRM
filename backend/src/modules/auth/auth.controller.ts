// AuthController manages user authentication, profile details, and password updates.
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { RegisterDTO, LoginDTO, ChangePasswordDTO } from './auth.types';
import { sendSuccess } from '../../utils/response';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: RegisterDTO = req.body;
      const user = await this.authService.register(dto);
      sendSuccess(res, user, 201, 'User account registered successfully');
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: LoginDTO = req.body;
      const authData = await this.authService.login(dto);
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
      sendSuccess(res, null, 200, 'Password updated successfully');
    } catch (error) {
      next(error);
    }
  };

  public logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // JWT is stateless; client must discard the token.
      sendSuccess(res, null, 200, 'User logged out successfully. Clear your authentication tokens.');
    } catch (error) {
      next(error);
    }
  };
}
