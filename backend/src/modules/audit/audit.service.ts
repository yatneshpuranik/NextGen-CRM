import { prisma } from '../../config/db';
import type { Prisma } from '@prisma/client';

export class AuditService {
  /**
   * Helper to write an audit trail record
   */
  public static async logAudit(params: {
    userId: string | null;
    module: string;
    action: string;
    previousValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: params.userId,
          module: params.module,
          action: params.action,
          previousValue: params.previousValue ? JSON.parse(JSON.stringify(params.previousValue)) : undefined,
          newValue: params.newValue ? JSON.parse(JSON.stringify(params.newValue)) : undefined,
          ipAddress: params.ipAddress || null,
          userAgent: params.userAgent || null
        }
      });
    } catch (error) {
      // Fail silently to prevent interrupting main transaction execution
      console.error('Failed to write audit log entry:', error);
    }
  }

  /**
   * Retrieve and filter audit logs
   */
  public async getAuditLogs(query: {
    page?: string;
    limit?: string;
    userId?: string;
    module?: string;
    action?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, parseInt(query.limit || '15', 10));
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.module) {
      where.module = query.module;
    }

    if (query.action) {
      where.action = query.action;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (query.search) {
      const searchPattern = query.search.trim();
      where.OR = [
        { module: { contains: searchPattern, mode: 'insensitive' } },
        { action: { contains: searchPattern, mode: 'insensitive' } },
        { user: { fullName: { contains: searchPattern, mode: 'insensitive' } } },
        { user: { email: { contains: searchPattern, mode: 'insensitive' } } }
      ];
    }

    const [records, totalRecords] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      records,
      pagination: {
        page,
        limit,
        totalPages,
        totalRecords
      }
    };
  }
}
