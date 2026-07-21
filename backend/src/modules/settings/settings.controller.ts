import { Request, Response, NextFunction } from 'express';
import { SettingsService } from './settings.service';
import { sendSuccess } from '../../utils/response';
import { AuditService } from '../audit/audit.service';

export class SettingsController {
  private settingsService: SettingsService;

  constructor() {
    this.settingsService = new SettingsService();
  }

  public get = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.settingsService.getSettings();
      sendSuccess(res, result, 200, 'Company settings retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }

      const previousValue = await this.settingsService.getSettings();
      const result = await this.settingsService.updateSettings(req.body);

      // Write audit trail entry
      await AuditService.logAudit({
        userId,
        module: 'SETTINGS',
        action: 'UPDATE',
        previousValue,
        newValue: result,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      sendSuccess(res, result, 200, 'Company settings updated successfully');
    } catch (error) {
      next(error);
    }
  };
}
