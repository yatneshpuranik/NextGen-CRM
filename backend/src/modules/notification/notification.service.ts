import { prisma } from '../../config/db';
import { NotFoundError } from '../../utils/errors';

export class NotificationService {
  /**
   * Insert in-app notification
   */
  public async createNotification(params: {
    userId: string | null;
    title: string;
    message: string;
    type: string;
  }): Promise<any> {
    return prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        isRead: false
      }
    });
  }

  /**
   * Retrieve active alerts for user
   */
  public async getUserNotifications(userId: string): Promise<any[]> {
    return prisma.notification.findMany({
      where: {
        OR: [
          { userId },
          { userId: null } // Global system alerts
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 alerts
    });
  }

  /**
   * Toggle single alert to read
   */
  public async markAsRead(id: string, userId: string): Promise<any> {
    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    // Security check: ensure notification belongs to user or is global
    if (notification.userId && notification.userId !== userId) {
      throw new Error('Access denied to update this notification');
    }

    return prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  }

  /**
   * Mark all alerts read
   */
  public async markAllAsRead(userId: string): Promise<any> {
    return prisma.notification.updateMany({
      where: {
        OR: [
          { userId },
          { userId: null }
        ],
        isRead: false
      },
      data: { isRead: true }
    });
  }

  /**
   * Remove single notification
   */
  public async deleteNotification(id: string, userId: string): Promise<void> {
    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    if (notification.userId && notification.userId !== userId) {
      throw new Error('Access denied to delete this notification');
    }

    await prisma.notification.delete({
      where: { id }
    });
  }
}
