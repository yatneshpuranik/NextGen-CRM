import { Request, Response, NextFunction } from 'express';
import { WarehouseService } from './warehouse.service';
import { sendSuccess } from '../../utils/response';
import { CreateWarehouseDTO, UpdateWarehouseDTO, StockTransferDTO } from './warehouse.types';

export class WarehouseController {
  private warehouseService = new WarehouseService();

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: CreateWarehouseDTO = req.body;
      const wh = await this.warehouseService.createWarehouse(dto);
      sendSuccess(res, wh, 201, 'Warehouse profile created successfully');
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const dto: UpdateWarehouseDTO = req.body;
      const wh = await this.warehouseService.updateWarehouse(id, dto);
      sendSuccess(res, wh, 200, 'Warehouse profile updated successfully');
    } catch (error) {
      next(error);
    }
  };

  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        search: req.query.search as string,
        status: req.query.status as string,
        page: req.query.page as string,
        limit: req.query.limit as string
      };
      const result = await this.warehouseService.listWarehouses(filters);
      sendSuccess(res, result, 200, 'Warehouses fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  public getDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const wh = await this.warehouseService.getWarehouseDetails(id);
      sendSuccess(res, wh, 200, 'Warehouse details retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const stock = await this.warehouseService.getWarehouseStock(id);
      sendSuccess(res, stock, 200, 'Warehouse stock levels retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const result = await this.warehouseService.getWarehouseHistory(id, page, limit);
      sendSuccess(res, result, 200, 'Warehouse history retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getDashboardSummary = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await this.warehouseService.getWarehouseDashboardSummary();
      sendSuccess(res, summary, 200, 'Warehouse dashboard summary loaded successfully');
    } catch (error) {
      next(error);
    }
  };

  public transfer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: StockTransferDTO = req.body;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }
      const transfer = await this.warehouseService.transferStock(dto, userId);
      sendSuccess(res, transfer, 200, 'Stock transfer completed successfully');
    } catch (error) {
      next(error);
    }
  };
}
