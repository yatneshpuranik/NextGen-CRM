import { prisma } from '../../config/db';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { Warehouse, StockTransfer, TransactionType } from '@prisma/client';
import { CreateWarehouseDTO, UpdateWarehouseDTO, StockTransferDTO, WarehouseQueryFilters } from './warehouse.types';

export class WarehouseService {
  /**
   * Seeding helper to return Default Warehouse ID
   */
  public async getDefaultWarehouseId(): Promise<string> {
    const wh = await prisma.warehouse.findUnique({
      where: { code: 'WH-DEFAULT' }
    });
    if (!wh) {
      const created = await prisma.warehouse.create({
        data: {
          code: 'WH-DEFAULT',
          name: 'Default Warehouse',
          address: 'Main Headquarters Warehouse',
          contactPerson: 'Operations Manager',
          contactNumber: '0000000000',
          status: 'ACTIVE'
        }
      });
      return created.id;
    }
    return wh.id;
  }

  /**
   * Create new Warehouse
   */
  public async createWarehouse(dto: CreateWarehouseDTO): Promise<Warehouse> {
    const existing = await prisma.warehouse.findUnique({
      where: { code: dto.code }
    });
    if (existing) {
      throw new BadRequestError(`Warehouse with code "${dto.code}" already exists.`);
    }

    return prisma.warehouse.create({
      data: {
        name: dto.name,
        code: dto.code,
        address: dto.address,
        contactPerson: dto.contactPerson,
        contactNumber: dto.contactNumber,
        status: dto.status || 'ACTIVE'
      }
    });
  }

  /**
   * Update Warehouse Profile
   */
  public async updateWarehouse(id: string, dto: UpdateWarehouseDTO): Promise<Warehouse> {
    const wh = await prisma.warehouse.findUnique({ where: { id } });
    if (!wh) {
      throw new NotFoundError('Warehouse not found');
    }

    return prisma.warehouse.update({
      where: { id },
      data: dto
    });
  }

  /**
   * List Warehouses with filters and pagination
   */
  public async listWarehouses(filters: WarehouseQueryFilters) {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (filters.status) {
      whereClause.status = filters.status;
    }
    if (filters.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
        { contactPerson: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [warehouses, total] = await Promise.all([
      prisma.warehouse.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { code: 'asc' }
      }),
      prisma.warehouse.count({ where: whereClause })
    ]);

    return {
      records: warehouses,
      pagination: {
        totalRecords: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    };
  }

  /**
   * Get Warehouse Details with Stock list
   */
  public async getWarehouseDetails(id: string) {
    const wh = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        inventories: {
          include: {
            product: true
          }
        }
      }
    });
    if (!wh) {
      throw new NotFoundError('Warehouse not found');
    }
    return wh;
  }

  /**
   * Get Warehouse Stock lists
   */
  public async getWarehouseStock(warehouseId: string) {
    return prisma.inventory.findMany({
      where: { warehouseId },
      include: {
        product: true
      }
    });
  }

  /**
   * Get Warehouse Inventory Transaction History list
   */
  public async getWarehouseHistory(warehouseId: string, pageNum: number = 1, limitNum: number = 10) {
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      prisma.stockTransaction.findMany({
        where: { warehouseId },
        include: {
          product: true,
          createdByUser: {
            select: { id: true, fullName: true, role: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.stockTransaction.count({ where: { warehouseId } })
    ]);

    return {
      records: transactions,
      pagination: {
        totalRecords: total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        limit: limitNum
      }
    };
  }

  /**
   * Dashboard Summary of Warehouses
   */
  public async getWarehouseDashboardSummary() {
    const [warehousesCount, totalStockSum] = await Promise.all([
      prisma.warehouse.count(),
      prisma.inventory.aggregate({
        _sum: {
          availableStock: true
        }
      })
    ]);

    // Breakdown per warehouse
    const breakdown = await prisma.warehouse.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        inventories: {
          select: {
            availableStock: true
          }
        }
      }
    });

    const list = breakdown.map(wh => {
      const stock = wh.inventories.reduce((acc, curr) => acc + (curr.availableStock || 0), 0);
      return {
        id: wh.id,
        name: wh.name,
        code: wh.code,
        status: wh.status,
        stockValue: stock
      };
    });

    return {
      totalWarehouses: warehousesCount,
      totalPhysicalStock: totalStockSum._sum.availableStock || 0,
      warehouses: list
    };
  }

  /**
   * Stock Transfer execution under atomic transaction
   */
  public async transferStock(dto: StockTransferDTO, userId: string): Promise<StockTransfer> {
    const { sourceWarehouseId, destWarehouseId, productId, quantity, remarks } = dto;

    if (sourceWarehouseId === destWarehouseId) {
      throw new BadRequestError('Source and Destination warehouses cannot be identical.');
    }
    if (quantity <= 0) {
      throw new BadRequestError('Transfer quantity must be greater than zero.');
    }

    return prisma.$transaction(async (tx) => {
      // 1. SELECT FOR UPDATE locks on both source and dest inventory records to prevent concurrency conflicts
      const sourceLocked = await tx.$queryRawUnsafe<any[]>(
        `SELECT id, "availableStock" FROM "Inventory" WHERE "productId" = CAST($1 AS uuid) AND "warehouseId" = CAST($2 AS uuid) LIMIT 1 FOR UPDATE`,
        productId,
        sourceWarehouseId
      );

      const sourceInv = sourceLocked?.[0];
      if (!sourceInv || sourceInv.availableStock < quantity) {
        throw new BadRequestError(
          `Insufficient stock at source warehouse. Available: ${sourceInv?.availableStock || 0}, Required: ${quantity}`
        );
      }

      // Check if destination inventory record exists, lock it or insert it
      const destLocked = await tx.$queryRawUnsafe<any[]>(
        `SELECT id, "availableStock" FROM "Inventory" WHERE "productId" = CAST($1 AS uuid) AND "warehouseId" = CAST($2 AS uuid) LIMIT 1 FOR UPDATE`,
        productId,
        destWarehouseId
      );

      let destInv = destLocked?.[0];
      if (!destInv) {
        // Create destination inventory record
        destInv = await tx.inventory.create({
          data: {
            productId,
            warehouseId: destWarehouseId,
            availableStock: 0,
            minimumStock: 0
          }
        });
      }

      // 2. Perform Stock Calculations
      const prevSourceStock = sourceInv.availableStock;
      const newSourceStock = prevSourceStock - quantity;

      const prevDestStock = destInv.availableStock;
      const newDestStock = prevDestStock + quantity;

      // 3. Update Inventories stock values
      await tx.inventory.update({
        where: { id: sourceInv.id },
        data: { availableStock: newSourceStock }
      });

      await tx.inventory.update({
        where: { id: destInv.id },
        data: { availableStock: newDestStock }
      });

      // Generate a unique sequential transfer number
      const transferCount = await tx.stockTransfer.count();
      const transferNumber = `TR-${new Date().getFullYear()}-${(transferCount + 1).toString().padStart(6, '0')}`;

      // 4. Log history transaction records
      await tx.stockTransaction.create({
        data: {
          productId,
          inventoryId: sourceInv.id,
          warehouseId: sourceWarehouseId,
          transactionType: TransactionType.STOCK_OUT,
          quantity,
          previousStock: prevSourceStock,
          newStock: newSourceStock,
          reference: transferNumber,
          remarks: `Stock Transfer Outflow to destination warehouse. Remarks: ${remarks || 'N/A'}`,
          createdBy: userId
        }
      });

      await tx.stockTransaction.create({
        data: {
          productId,
          inventoryId: destInv.id,
          warehouseId: destWarehouseId,
          transactionType: TransactionType.STOCK_IN,
          quantity,
          previousStock: prevDestStock,
          newStock: newDestStock,
          reference: transferNumber,
          remarks: `Stock Transfer Inflow from source warehouse. Remarks: ${remarks || 'N/A'}`,
          createdBy: userId
        }
      });

      const transfer = await tx.stockTransfer.create({
        data: {
          transferNumber,
          sourceWarehouseId,
          destWarehouseId,
          productId,
          quantity,
          remarks,
          status: 'COMPLETED',
          createdBy: userId
        },
        include: {
          sourceWarehouse: true,
          destWarehouse: true,
          product: true
        }
      });

      // 5. Update Product currentStock to sync across all warehouses
      const sumStock = await tx.inventory.aggregate({
        where: { productId },
        _sum: { availableStock: true }
      });
      await tx.product.update({
        where: { id: productId },
        data: { currentStock: sumStock._sum.availableStock || 0 }
      });

      return transfer;
    });
  }
}
