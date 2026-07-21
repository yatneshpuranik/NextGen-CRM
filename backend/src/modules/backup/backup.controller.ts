import { Request, Response, NextFunction } from 'express';
import { BackupService } from './backup.service';
import { sendSuccess } from '../../utils/response';
import { AuditService } from '../audit/audit.service';
import { BadRequestError } from '../../utils/errors';

export class BackupController {
  private backupService: BackupService;

  constructor() {
    this.backupService = new BackupService();
  }

  public exportJson = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.backupService.exportDatabase();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="nextgen_erp_backup.json"');
      res.status(200).send(JSON.stringify(data, null, 2));
    } catch (error) {
      next(error);
    }
  };

  public restoreJson = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }

      if (!req.body || typeof req.body !== 'object') {
        throw new BadRequestError('Invalid JSON backup payload');
      }

      const previousValue = await this.backupService.exportDatabase();
      await this.backupService.importDatabase(req.body);

      // Log audit trail event
      await AuditService.logAudit({
        userId,
        module: 'BACKUP',
        action: 'RESTORE',
        previousValue,
        newValue: { description: 'Database restored successfully from backup file' },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      sendSuccess(res, null, 200, 'Database successfully restored from JSON backup');
    } catch (error) {
      next(error);
    }
  };

  public exportCsv = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type } = req.params;
      const csvData = await this.backupService.exportCSV(type);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_export_${new Date().toISOString().split('T')[0]}.csv"`);
      res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  };
}
