import { prisma } from '../../config/db';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { Role } from '../auth/auth.types';

// Notification Types allowed by role for global (userId: null) notifications:
const ROLE_NOTIFICATION_TYPES: Record<Role, string[] | null> = {
  ADMIN: null, // ADMIN can see all notifications
  SALES: [
    'NEW_CUSTOMER',
    'CUSTOMER_UPDATED',
    'NEW_CHALLAN',
    'CHALLAN_CONFIRMED',
    'CHALLAN_CANCELLED',
    'CHALLAN_COMPLETED',
    'INVOICE_GENERATED',
    'SYSTEM',
    'GENERAL',
    'SECURITY'
  ],
  WAREHOUSE: [
    'NEW_PRODUCT',
    'PRODUCT_UPDATED',
    'LOW_STOCK',
    'INVENTORY_UPDATED',
    'STOCK_IN',
    'STOCK_OUT',
    'STOCK_ADJUSTMENT',
    'STOCK_DAMAGE',
    'STOCK_RETURN',
    'WAREHOUSE_CREATED',
    'WAREHOUSE_UPDATED',
    'STOCK_TRANSFER',
    'NEW_CHALLAN',
    'CHALLAN_CONFIRMED',
    'CHALLAN_COMPLETED',
    'SYSTEM',
    'GENERAL',
    'SECURITY'
  ],
  ACCOUNTS: [
    'INVOICE_GENERATED',
    'NEW_CHALLAN',
    'CHALLAN_CONFIRMED',
    'CHALLAN_CANCELLED',
    'CHALLAN_COMPLETED',
    'SYSTEM',
    'GENERAL',
    'SECURITY'
  ]
};

const isNotificationAllowedForRole = (
  notification: { userId: string | null; type: string },
  userId: string,
  role: Role
): boolean => {
  // Directly targeted to user ID
  if (notification.userId && notification.userId === userId) {
    return true;
  }
  // Targeted to another user ID
  if (notification.userId && notification.userId !== userId) {
    return false;
  }
  // Global notification (userId is null)
  if (role === 'ADMIN') {
    return true;
  }
  const allowedTypes = ROLE_NOTIFICATION_TYPES[role];
  if (!allowedTypes) return true;
  return allowedTypes.includes(notification.type);
};

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
   * Retrieve active alerts for user based on role authorization
   */
  public async getUserNotifications(userId: string, role: Role): Promise<any[]> {
    const allowedTypes = ROLE_NOTIFICATION_TYPES[role];

    let whereClause: any;
    if (role === 'ADMIN') {
      whereClause = {
        OR: [
          { userId },
          { userId: null }
        ]
      };
    } else {
      whereClause = {
        OR: [
          { userId },
          {
            userId: null,
            type: { in: allowedTypes || [] }
          }
        ]
      };
    }

    return prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 alerts
    });
  }

  /**
   * Retrieve unread count for user based on role authorization
   */
  public async getUnreadCount(userId: string, role: Role): Promise<number> {
    const allowedTypes = ROLE_NOTIFICATION_TYPES[role];

    let whereClause: any;
    if (role === 'ADMIN') {
      whereClause = {
        OR: [
          { userId },
          { userId: null }
        ],
        isRead: false
      };
    } else {
      whereClause = {
        OR: [
          { userId },
          {
            userId: null,
            type: { in: allowedTypes || [] }
          }
        ],
        isRead: false
      };
    }

    return prisma.notification.count({
      where: whereClause
    });
  }

  /**
   * Toggle single alert to read if authorized
   */
  public async markAsRead(id: string, userId: string, role: Role): Promise<any> {
    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    if (!isNotificationAllowedForRole(notification, userId, role)) {
      throw new ForbiddenError('Access denied: You are not authorized to access this notification');
    }

    return prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  }

  /**
   * Mark all authorized alerts read
   */
  public async markAllAsRead(userId: string, role: Role): Promise<any> {
    const allowedTypes = ROLE_NOTIFICATION_TYPES[role];

    let whereClause: any;
    if (role === 'ADMIN') {
      whereClause = {
        OR: [
          { userId },
          { userId: null }
        ],
        isRead: false
      };
    } else {
      whereClause = {
        OR: [
          { userId },
          {
            userId: null,
            type: { in: allowedTypes || [] }
          }
        ],
        isRead: false
      };
    }

    return prisma.notification.updateMany({
      where: whereClause,
      data: { isRead: true }
    });
  }

  /**
   * Remove single notification if authorized
   */
  public async deleteNotification(id: string, userId: string, role: Role): Promise<void> {
    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    if (!isNotificationAllowedForRole(notification, userId, role)) {
      throw new ForbiddenError('Access denied: You are not authorized to delete this notification');
    }

    await prisma.notification.delete({
      where: { id }
    });
  }
}
