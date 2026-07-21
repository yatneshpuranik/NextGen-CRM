import { Request, Response, NextFunction } from 'express';
import { ReportsService, ReportQueryParams } from './reports.service';
import { sendSuccess } from '../../utils/response';

export class ReportsController {
  private reportsService: ReportsService;

  constructor() {
    this.reportsService = new ReportsService();
  }

  public getSalesReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query: ReportQueryParams = req.query;
      const result = await this.reportsService.getSalesReport(query);
      sendSuccess(res, result, 200, 'Sales report retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getInventoryReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query: ReportQueryParams = req.query;
      const result = await this.reportsService.getInventoryReport(query);
      sendSuccess(res, result, 200, 'Inventory report retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getProductReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query: ReportQueryParams = req.query;
      const result = await this.reportsService.getProductReport(query);
      sendSuccess(res, result, 200, 'Product catalog report retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getCustomerReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query: ReportQueryParams = req.query;
      const result = await this.reportsService.getCustomerReport(query);
      sendSuccess(res, result, 200, 'Customer growth and spenders report retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getStockMovementReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query: ReportQueryParams = req.query;
      const result = await this.reportsService.getStockMovementReport(query);
      sendSuccess(res, result, 200, 'Stock movement audit report retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getChallanReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query: ReportQueryParams = req.query;
      const result = await this.reportsService.getChallanReport(query);
      sendSuccess(res, result, 200, 'Challans audit report retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
