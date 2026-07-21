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
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }

      const result = await this.notificationService.getUserNotifications(userId);
      sendSuccess(res, result, 200, 'Notifications list retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public markRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }

      const result = await this.notificationService.markAsRead(id, userId);
      sendSuccess(res, result, 200, 'Notification marked as read successfully');
    } catch (error) {
      next(error);
    }
  };

  public markAllRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }

      await this.notificationService.markAllAsRead(userId);
      sendSuccess(res, null, 200, 'All notifications marked as read successfully');
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }

      await this.notificationService.deleteNotification(id, userId);
      sendSuccess(res, null, 200, 'Notification deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
