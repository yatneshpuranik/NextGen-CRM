import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';
import { sendSuccess } from '../../utils/response';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        throw new Error('User context missing');
      }

      const result = await this.notificationService.getUserNotifications(user.id, user.role);
      sendSuccess(res, result, 200, 'Notifications list retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        throw new Error('User context missing');
      }

      const count = await this.notificationService.getUnreadCount(user.id, user.role);
      sendSuccess(res, { count }, 200, 'Unread notification count retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public markRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = req.user;
      if (!user) {
        throw new Error('User context missing');
      }

      const result = await this.notificationService.markAsRead(id, user.id, user.role);
      sendSuccess(res, result, 200, 'Notification marked as read successfully');
    } catch (error) {
      next(error);
    }
  };

  public markAllRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        throw new Error('User context missing');
      }

      await this.notificationService.markAllAsRead(user.id, user.role);
      sendSuccess(res, null, 200, 'All notifications marked as read successfully');
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = req.user;
      if (!user) {
        throw new Error('User context missing');
      }

      await this.notificationService.deleteNotification(id, user.id, user.role);
      sendSuccess(res, null, 200, 'Notification deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
