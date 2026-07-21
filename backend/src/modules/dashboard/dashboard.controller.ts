import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';
import { sendSuccess } from '../../utils/response';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  public getSummary = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.dashboardService.getSummary();
      sendSuccess(res, result, 200, 'Dashboard summary retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getSalesOverview = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.dashboardService.getSalesOverview();
      sendSuccess(res, result, 200, 'Sales overview trend metrics retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getInventoryOverview = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.dashboardService.getInventoryOverview();
      sendSuccess(res, result, 200, 'Inventory overview breakdown metrics retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getCustomerOverview = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.dashboardService.getCustomerOverview();
      sendSuccess(res, result, 200, 'Customer overview growth metrics retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getRecentActivity = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.dashboardService.getRecentActivity();
      sendSuccess(res, result, 200, 'Recent activities log timeline retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getTopProducts = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.dashboardService.getTopProducts();
      sendSuccess(res, result, 200, 'Top selling products retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getLowStock = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.dashboardService.getLowStockList();
      sendSuccess(res, result, 200, 'Low stock products warnings checklist retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
