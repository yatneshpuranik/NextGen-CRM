import { prisma } from '../../config/db';

export interface EmailLogFilters {
  search?: string;
  status?: string;
  page?: string;
  limit?: string;
}

export class EmailLogService {
  public async listEmailLogs(filters: EmailLogFilters) {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 15;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (filters.status) {
      whereClause.status = filters.status;
    }
    if (filters.search) {
      whereClause.OR = [
        { recipient: { contains: filters.search, mode: 'insensitive' } },
        { subject: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where: whereClause,
        orderBy: { sentTime: 'desc' },
        skip,
        take: limit
      }),
      prisma.emailLog.count({ where: whereClause })
    ]);

    return {
      records: logs,
      pagination: {
        totalRecords: total,
        totalPages: Math.ceil(total / limit) || 1,
        currentPage: page,
        limit
      }
    };
  }
}
