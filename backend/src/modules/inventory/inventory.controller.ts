import { Request, Response, NextFunction } from 'express';
import { InventoryService } from './inventory.service';
import { sendSuccess } from '../../utils/response';
import { 
  UpdateInventorySettingsDTO, 
  StockInDTO, 
  StockOutDTO, 
  StockAdjustmentDTO, 
  MarkDamageDTO, 
  StockReturnDTO, 
  GetInventoryQuery, 
  GetTransactionHistoryQuery 
} from './inventory.types';
import { AuditService } from '../audit/audit.service';
import { prisma } from '../../config/db';

export class InventoryController {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  public getInventory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query: GetInventoryQuery = req.query;
      const result = await this.inventoryService.getInventory(query);
      sendSuccess(res, result, 200, 'Inventory list retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getInventoryByProductId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId } = req.params;
      const result = await this.inventoryService.getInventoryByProductId(productId);
      sendSuccess(res, result, 200, 'Product inventory retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId } = req.params;
      const dto: UpdateInventorySettingsDTO = req.body;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }

      const previousValue = await this.inventoryService.getInventoryByProductId(productId);
      const result = await this.inventoryService.updateSettings(productId, dto);

      // Write Audit Log entry
      await AuditService.logAudit({
        userId,
        module: 'INVENTORY',
        action: 'UPDATE_SETTINGS',
        previousValue,
        newValue: result,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      sendSuccess(res, result, 200, 'Inventory settings updated successfully');
    } catch (error) {
      next(error);
    }
  };

  public stockIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: StockInDTO = req.body;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }

      const previousValue = await this.inventoryService.getInventoryByProductId(dto.productId);
      const transaction = await this.inventoryService.stockIn(dto, userId);

      // Write Audit Log entry
      await AuditService.logAudit({
        userId,
        module: 'INVENTORY',
        action: 'STOCK_IN',
        previousValue,
        newValue: transaction,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      // Dispatch in-app notification
      await prisma.notification.create({
        data: {
          userId: null,
          title: 'Inventory Inflow Registered',
          message: `Added +${dto.quantity} items for product: ${(transaction as any).product?.productName} under reference: ${dto.reference || 'N/A'}.`,
          type: 'INVENTORY_UPDATED'
        }
      });

      sendSuccess(res, transaction, 200, 'Stock-In transaction completed successfully');
    } catch (error) {
      next(error);
    }
  };

  public stockOut = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: StockOutDTO = req.body;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }

      const previousValue = await this.inventoryService.getInventoryByProductId(dto.productId);
      const transaction = await this.inventoryService.stockOut(dto, userId);

      // Write Audit Log entry
      await AuditService.logAudit({
        userId,
        module: 'INVENTORY',
        action: 'STOCK_OUT',
        previousValue,
        newValue: transaction,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      // Dispatch in-app notification
      await prisma.notification.create({
        data: {
          userId: null,
          title: 'Inventory Outflow Registered',
          message: `Dispatched -${dto.quantity} items for product: ${(transaction as any).product?.productName} under reference: ${dto.reference || 'N/A'}.`,
          type: 'INVENTORY_UPDATED'
        }
      });

      sendSuccess(res, transaction, 200, 'Stock-Out transaction completed successfully');
    } catch (error) {
      next(error);
    }
  };

  public adjustStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: StockAdjustmentDTO = req.body;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }

      const previousValue = await this.inventoryService.getInventoryByProductId(dto.productId);
      const transaction = await this.inventoryService.adjustStock(dto, userId);

      // Write Audit Log entry
      await AuditService.logAudit({
        userId,
        module: 'INVENTORY',
        action: 'ADJUSTMENT',
        previousValue,
        newValue: transaction,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      // Dispatch in-app notification
      await prisma.notification.create({
        data: {
          userId: null,
          title: 'Inventory Adjusted',
          message: `Inventory stock adjusted to ${dto.quantity} for product: ${(transaction as any).product?.productName}.`,
          type: 'INVENTORY_UPDATED'
        }
      });

      sendSuccess(res, transaction, 200, 'Stock adjustment completed successfully');
    } catch (error) {
      next(error);
    }
  };

  public markDamage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: MarkDamageDTO = req.body;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }

      const previousValue = await this.inventoryService.getInventoryByProductId(dto.productId);
      const transaction = await this.inventoryService.markDamage(dto, userId);

      // Write Audit Log entry
      await AuditService.logAudit({
        userId,
        module: 'INVENTORY',
        action: 'DAMAGE',
        previousValue,
        newValue: transaction,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      // Dispatch in-app notification
      await prisma.notification.create({
        data: {
          userId: null,
          title: 'Damaged Stock Logged',
          message: `Moved ${dto.quantity} units of product ${(transaction as any).product?.productName} into damaged stock.`,
          type: 'INVENTORY_UPDATED'
        }
      });

      sendSuccess(res, transaction, 200, 'Stock marked as damaged successfully');
    } catch (error) {
      next(error);
    }
  };

  public returnStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: StockReturnDTO = req.body;
      const userId = req.user?.id;
      if (!userId) {
        throw new Error('User context missing');
      }

      const previousValue = await this.inventoryService.getInventoryByProductId(dto.productId);
      const transaction = await this.inventoryService.returnStock(dto, userId);

      // Write Audit Log entry
      await AuditService.logAudit({
        userId,
        module: 'INVENTORY',
        action: 'RETURN',
        previousValue,
        newValue: transaction,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      // Dispatch in-app notification
      await prisma.notification.create({
        data: {
          userId: null,
          title: 'Stock Return Processed',
          message: `Returned +${dto.quantity} units for product ${(transaction as any).product?.productName} (Return classification: ${dto.returnToType}).`,
          type: 'INVENTORY_UPDATED'
        }
      });

      sendSuccess(res, transaction, 200, 'Stock return processed successfully');
    } catch (error) {
      next(error);
    }
  };

  public getTransactionHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query: GetTransactionHistoryQuery = req.query;
      const result = await this.inventoryService.getTransactionHistory(query);
      sendSuccess(res, result, 200, 'Stock transactions history retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getSummary = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.inventoryService.getSummary();
      sendSuccess(res, result, 200, 'Inventory summary statistics retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getLowStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query: GetInventoryQuery = { ...req.query, lowStock: 'true' };
      const result = await this.inventoryService.getInventory(query);
      sendSuccess(res, result, 200, 'Low-stock inventory report retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public getOutOfStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query: GetInventoryQuery = { ...req.query, outOfStock: 'true' };
      const result = await this.inventoryService.getInventory(query);
      sendSuccess(res, result, 200, 'Out-of-stock inventory report retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}
