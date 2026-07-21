import { Request, Response, NextFunction } from 'express';
import { EmailLogService } from './email-log.service';
import { sendSuccess } from '../../utils/response';

export class EmailLogController {
  private service = new EmailLogService();

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        search: req.query.search as string,
        status: req.query.status as string,
        page: req.query.page as string,
        limit: req.query.limit as string
      };
      const result = await this.service.listEmailLogs(filters);
      sendSuccess(res, result, 200, 'Email delivery logs retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
