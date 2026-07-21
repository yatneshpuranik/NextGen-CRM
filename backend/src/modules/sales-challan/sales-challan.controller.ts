import { Request, Response, NextFunction } from 'express';
import { SalesChallanService } from './sales-challan.service';
import { sendSuccess } from '../../utils/response';
import { CreateSalesChallanDTO, UpdateSalesChallanDTO, GetSalesChallanQuery } from './sales-challan.types';
import { AuditService } from '../audit/audit.service';

export class SalesChallanController {
  private challanService: SalesChallanService;

  constructor() {
    this.challanService = new SalesChallanService();
  }

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateSalesChallanDTO = req.body;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }
      const result = await this.challanService.createChallan(dto, userId);

      // Write Audit Log entry
      await AuditService.logAudit({
        userId,
        module: 'CHALLAN',
        action: 'CREATE',
        newValue: result,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      sendSuccess(res, result, 201, 'Sales Challan draft created successfully');
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const dto: UpdateSalesChallanDTO = req.body;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }

      const previousValue = await this.challanService.getChallanById(id);
      const result = await this.challanService.updateChallan(id, dto);

      // Write Audit Log entry
      await AuditService.logAudit({
        userId,
        module: 'CHALLAN',
        action: 'UPDATE',
        previousValue,
        newValue: result,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      sendSuccess(res, result, 200, 'Sales Challan updated successfully');
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }

      const previousValue = await this.challanService.getChallanById(id);
      await this.challanService.deleteChallan(id);

      // Write Audit Log entry
      await AuditService.logAudit({
        userId,
        module: 'CHALLAN',
        action: 'DELETE',
        previousValue,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      sendSuccess(res, null, 200, 'Draft Sales Challan deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.challanService.getChallanById(id);
      sendSuccess(res, result, 200, 'Sales Challan retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query: GetSalesChallanQuery = req.query;
      const result = await this.challanService.getChallans(query);
      sendSuccess(res, result, 200, 'Sales Challans list retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public confirm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }

      const previousValue = await this.challanService.getChallanById(id);
      const result = await this.challanService.confirmChallan(id, userId);

      // Write Audit Log entry
      await AuditService.logAudit({
        userId,
        module: 'CHALLAN',
        action: 'CONFIRM',
        previousValue,
        newValue: result,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      sendSuccess(res, result, 200, 'Sales Challan confirmed successfully and stock dispatched');
    } catch (error) {
      next(error);
    }
  };

  public cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }

      const previousValue = await this.challanService.getChallanById(id);
      const result = await this.challanService.cancelChallan(id, userId);

      // Write Audit Log entry
      await AuditService.logAudit({
        userId,
        module: 'CHALLAN',
        action: 'CANCEL',
        previousValue,
        newValue: result,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      sendSuccess(res, result, 200, 'Sales Challan cancelled successfully and stock restored');
    } catch (error) {
      next(error);
    }
  };

  public complete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }

      const previousValue = await this.challanService.getChallanById(id);
      const result = await this.challanService.completeChallan(id);

      // Write Audit Log entry
      await AuditService.logAudit({
        userId,
        module: 'CHALLAN',
        action: 'COMPLETE',
        previousValue,
        newValue: result,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      sendSuccess(res, result, 200, 'Sales Challan marked as completed');
    } catch (error) {
      next(error);
    }
  };

  public getCustomerHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { customerId } = req.params;
      const result = await this.challanService.getCustomerChallans(customerId);
      sendSuccess(res, result, 200, 'Customer challan history retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
