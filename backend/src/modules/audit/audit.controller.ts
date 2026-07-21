import { Request, Response, NextFunction } from 'express';
import { AuditService } from './audit.service';
import { sendSuccess } from '../../utils/response';

export class AuditController {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  public getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.auditService.getAuditLogs(req.query);
      sendSuccess(res, result, 200, 'Audit logs retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
