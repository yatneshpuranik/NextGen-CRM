import { prisma } from '../../config/db';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { Inventory, StockTransaction, TransactionType } from '@prisma/client';
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
import { sendLowInventoryAlert } from '../../services/email.service';

export class InventoryService {
  /**
   * Helper to ensure all active products have an inventory record.
   * Auto-creates inventory if missing.
   */
  public async ensureAllInventoriesExist(): Promise<void> {
    const productsWithoutInventory = await prisma.product.findMany({
      where: {
        isDeleted: false,
        inventories: { none: {} }
      },
      select: {
        id: true,
        currentStock: true,
        minimumStock: true
      }
    });

    if (productsWithoutInventory.length > 0) {
      await prisma.$transaction(
        productsWithoutInventory.map(p => prisma.inventory.create({
          data: {
            productId: p.id,
            availableStock: p.currentStock,
            minimumStock: p.minimumStock,
            reorderLevel: p.minimumStock
          }
        }))
      );
    }
  }

  /**
   * Get single inventory by product ID.
   * Auto-creates inventory if missing.
   */
  public async getInventoryByProductId(productId: string): Promise<any> {
    const product = await prisma.product.findFirst({
      where: { id: productId, isDeleted: false }
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    let inventory = await prisma.inventory.findFirst({
      where: { productId }
    });

    if (!inventory) {
      inventory = await prisma.inventory.create({
        data: {
          productId,
          availableStock: product.currentStock,
          minimumStock: product.minimumStock,
          reorderLevel: product.minimumStock
        }
      });
    }

    return {
      ...inventory,
      product
    };
  }

  /**
   * Get paginated and filtered inventory.
   */
  public async getInventory(query: GetInventoryQuery): Promise<{
    inventory: any[];
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
      totalRecords: number;
    };
  }> {
    // 1. Ensure all products have inventory records
    await this.ensureAllInventoriesExist();

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const search = query.search || '';
    const category = query.category || undefined;
    const brand = query.brand || undefined;
    const warehouse = query.warehouse || undefined;

    const lowStock = query.lowStock === 'true';
    const outOfStock = query.outOfStock === 'true';
    const damaged = query.damaged === 'true';

    // Build the query where clause
    const whereClause: any = {
      product: {
        isDeleted: false,
        ...(category && { category }),
        ...(brand && { brand }),
        ...(search && {
          OR: [
            { productName: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
            { productCode: { contains: search, mode: 'insensitive' } }
          ]
        })
      },
      ...(warehouse && { warehouseLocation: { contains: warehouse, mode: 'insensitive' } }),
      ...(outOfStock && { availableStock: 0 }),
      ...(damaged && { damagedStock: { gt: 0 } })
    };

    // If low stock, availableStock <= minimumStock
    if (lowStock) {
      whereClause.availableStock = {
        lte: prisma.inventory.fields.minimumStock // Reference schema minimumStock
      };
      // Note: Prisma 5 allows referencing fields directly, but for compatibility, we can do it via raw filtering or fetch it.
      // Wait, referencing another field in a where clause in prisma requires Lte relation or raw or a fallback.
      // Let's check: if we cannot easily compare two columns inside prisma where clause, we can filter in DB or fetch.
      // A safe way to compare availableStock <= minimumStock in Prisma is using database views or raw queries,
      // or we can construct a where clause using `as` or standard SQL, or just fetch all and filter in JS if the count is small,
      // but for production-quality, let's write a where clause or compare it.
      // Wait, is there a simpler way? Yes, we can use prisma's raw or we can use:
      // whereClause.OR = [ { availableStock: { lte: 0 } } ] etc., or we can do a query with a nested prisma check.
      // Actually, since Prisma 4.3+, we can compare columns using `prisma.inventory.fields.minimumStock` if we use Prisma's field references,
      // but if the database engine or model doesn't support it, we can write a raw query.
      // Let's see: a simple way is using a where filter. Let's write the query and see.
    }

    // Let's implement the lowStock check safely.
    // If lowStock is true, we can check `availableStock` is less than or equal to `minimumStock` (or `reorderLevel`).
    // If we want to do it in standard Prisma, since Prisma doesn't natively support simple multi-column comparisons in `findMany` where clause directly (unless we use a raw query or refer to database fields),
    // let's do this: if lowStock filter is requested, we can use a raw SQL query or check if there is another way.
    // Wait! A raw query for listing inventory:
    // SELECT i.*, p."productName", p.sku, p."productCode", p.category, p.brand, p.unit
    // FROM "Inventory" i
    // JOIN "Product" p ON i."productId" = p.id
    // WHERE p."isDeleted" = false ...
    // Yes! Raw SQL is extremely fast, standard, and handles availableStock <= minimumStock easily:
    // `AND i."availableStock" <= i."minimumStock"`
    // Let's see if we should write a robust Prisma query or a Raw query.
    // Wait, let's see how filters are combined. Using Prisma `findMany` is very clean because of type safety.
    // Can we write the lowStock filter as:
    // `where: { OR: [ { availableStock: { lte: reorderLevel } } ] }` ? No, because reorderLevel is a variable from the DB row.
    // Wait, let's write a raw SQL query if lowStock is enabled, or we can use a where clause with Prisma.
    // Actually, in Prisma we can do:
    // ```typescript
    // const inventory = await prisma.inventory.findMany({
    //   where: whereClause,
    //   include: { product: true }
    // });
    // ```
    // If lowStock is true, we can just do a query using `prisma.$queryRaw` to filter down and get page/limit.
    // Let's write a standard Prisma query but for lowStock, we can use a database-level query or fetch and filter,
    // or let's use a query like this:
    // ```typescript
    // const results = await prisma.inventory.findMany({
    //   where: {
    //     product: { isDeleted: false },
    //     // ...
    //   }
    // })
    // ```
    // Let's see: what if we fetch and filter in memory? If there are thousands of products, memory filtering will be slow.
    // What if we do a raw query?
    // Let's check:
    // `const lowStockProducts = await prisma.$queryRaw`
    // Yes, a raw query is very easy!
    // But wait! Can we do a mix? We can do:
    // ```typescript
    // const count = await prisma.inventory.count({ where: whereClause });
    // ```
    // Wait, if we use `prisma.$queryRaw` only when `lowStock` is true, that is perfect!
    // Let's write the query for both cases.
    // Let's build a query builder in TypeScript:
    // If `lowStock` is true:
    // We can run `prisma.$queryRaw` to get the list and another raw query for count.
    // Let's write the SQL for that:
    // ```sql
    // SELECT count(*) FROM "Inventory" i JOIN "Product" p ON i."productId" = p.id WHERE p."isDeleted" = false AND i."availableStock" <= i."minimumStock"
    // ```
    // This is extremely simple and works 100%!
    // Let's write the standard Prisma check for other filters, and use the raw query when `lowStock` is true.

    const sortBy = query.sortBy || 'productName';
    const sortOrder = query.sortOrder || 'asc';

    let inventory: any[] = [];
    let totalRecords = 0;

    if (lowStock) {
      // Use raw query for lowStock comparison (availableStock <= minimumStock)
      const searchPattern = search ? `%${search}%` : '%';
      const categoryFilter = category ? category : '%';
      const brandFilter = brand ? brand : '%';
      const warehouseFilter = warehouse ? `%${warehouse}%` : '%';

      // Count query
      const countResult: any[] = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*)::int as count 
        FROM "Inventory" i
        JOIN "Product" p ON i."productId" = p.id
        WHERE p."isDeleted" = false
          AND (p."productName" ILIKE $1 OR p.sku ILIKE $1 OR p."productCode" ILIKE $1)
          AND p.category ILIKE $2
          AND p.brand ILIKE $3
          AND ($4 = '%' OR i."warehouseLocation" ILIKE $4)
          AND i."availableStock" <= i."minimumStock"
          ${outOfStock ? 'AND i."availableStock" = 0' : ''}
          ${damaged ? 'AND i."damagedStock" > 0' : ''}
      `, searchPattern, categoryFilter, brandFilter, warehouseFilter);

      totalRecords = countResult[0]?.count || 0;

      // Data query
      // Order By
      let orderBySql = 'p."productName"';
      if (sortBy === 'currentStock') orderBySql = 'i."availableStock"';
      else if (sortBy === 'updatedAt') orderBySql = 'i."updatedAt"';

      const sortDir = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      const dataResult: any[] = await prisma.$queryRawUnsafe(`
        SELECT i.*, 
          p."productName", p.sku, p."productCode", p.category, p.brand, p.unit, p."purchasePrice", p."sellingPrice", p."gstPercentage", p."imageUrl"
        FROM "Inventory" i
        JOIN "Product" p ON i."productId" = p.id
        WHERE p."isDeleted" = false
          AND (p."productName" ILIKE $1 OR p.sku ILIKE $1 OR p."productCode" ILIKE $1)
          AND p.category ILIKE $2
          AND p.brand ILIKE $3
          AND ($4 = '%' OR i."warehouseLocation" ILIKE $4)
          AND i."availableStock" <= i."minimumStock"
          ${outOfStock ? 'AND i."availableStock" = 0' : ''}
          ${damaged ? 'AND i."damagedStock" > 0' : ''}
        ORDER BY ${orderBySql} ${sortDir}
        LIMIT $5 OFFSET $6
      `, searchPattern, categoryFilter, brandFilter, warehouseFilter, limit, skip);

      inventory = dataResult.map(row => ({
        id: row.id,
        productId: row.productId,
        availableStock: row.availableStock,
        reservedStock: row.reservedStock,
        damagedStock: row.damagedStock,
        minimumStock: row.minimumStock,
        maximumStock: row.maximumStock,
        reorderLevel: row.reorderLevel,
        warehouseLocation: row.warehouseLocation,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        product: {
          id: row.productId,
          productCode: row.productCode,
          productName: row.productName,
          sku: row.sku,
          category: row.category,
          brand: row.brand,
          unit: row.unit,
          purchasePrice: row.purchasePrice,
          sellingPrice: row.sellingPrice,
          gstPercentage: row.gstPercentage,
          imageUrl: row.imageUrl
        }
      }));
    } else {
      // Use standard Prisma findMany
      const orderBy: any = {};
      if (sortBy === 'currentStock') {
        orderBy.availableStock = sortOrder;
      } else if (sortBy === 'updatedAt') {
        orderBy.updatedAt = sortOrder;
      } else {
        orderBy.product = { productName: sortOrder };
      }

      const prismaWhereClause: any = {
        product: {
          isDeleted: false,
          ...(category && { category }),
          ...(brand && { brand }),
          ...(search && {
            OR: [
              { productName: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
              { productCode: { contains: search, mode: 'insensitive' } }
            ]
          })
        },
        ...(warehouse && { warehouseLocation: { contains: warehouse, mode: 'insensitive' } }),
        ...(outOfStock && { availableStock: 0 }),
        ...(damaged && { damagedStock: { gt: 0 } })
      };

      const [count, items] = await Promise.all([
        prisma.inventory.count({ where: prismaWhereClause }),
        prisma.inventory.findMany({
          where: prismaWhereClause,
          include: { product: true },
          orderBy,
          skip,
          take: limit
        })
      ]);

      totalRecords = count;
      inventory = items;
    }

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return {
      inventory,
      pagination: {
        page,
        limit,
        totalPages,
        totalRecords
      }
    };
  }

  /**
   * Update Inventory Settings for a product.
   */
  public async updateSettings(productId: string, dto: UpdateInventorySettingsDTO): Promise<Inventory> {
    const inventory = await prisma.inventory.findFirst({
      where: { productId }
    });

    if (!inventory) {
      throw new NotFoundError('Inventory record not found');
    }

    // Update product minimumStock as well to keep in sync
    return prisma.$transaction(async (tx) => {
      const updatedInventory = await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          minimumStock: dto.minimumStock !== undefined ? dto.minimumStock : undefined,
          maximumStock: dto.maximumStock !== undefined ? dto.maximumStock : undefined,
          reorderLevel: dto.reorderLevel !== undefined ? dto.reorderLevel : undefined,
          warehouseLocation: dto.warehouseLocation !== undefined ? dto.warehouseLocation : undefined
        }
      });

      if (dto.minimumStock !== undefined) {
        await tx.product.update({
          where: { id: productId },
          data: { minimumStock: dto.minimumStock }
        });
      }

      return updatedInventory;
    });
  }

  /**
   * Stock In operation.
   */
  public async stockIn(dto: StockInDTO, userId: string): Promise<StockTransaction> {
    const { productId, quantity, reference, remarks } = dto;

    return prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findFirst({
        where: { productId },
        include: { product: true }
      });

      if (!inventory) {
        throw new NotFoundError('Inventory record not found');
      }

      const previousStock = inventory.availableStock;
      const newStock = previousStock + quantity;

      // 1. Update Inventory availableStock
      await tx.inventory.update({
        where: { id: inventory.id },
        data: { availableStock: newStock }
      });

      // 2. Synchronize Product currentStock
      await tx.product.update({
        where: { id: productId },
        data: { currentStock: newStock }
      });

      // 3. Create StockTransaction
      return tx.stockTransaction.create({
        data: {
          productId,
          inventoryId: inventory.id,
          transactionType: TransactionType.STOCK_IN,
          quantity,
          previousStock,
          newStock,
          reference,
          remarks,
          createdBy: userId
        },
        include: {
          product: true
        }
      });
    });
  }

  /**
   * Stock Out operation.
   */
  public async stockOut(dto: StockOutDTO, userId: string): Promise<StockTransaction> {
    const { productId, quantity, reference, remarks } = dto;

    const result = await prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findFirst({
        where: { productId },
        include: { product: true }
      });

      if (!inventory) {
        throw new NotFoundError('Inventory record not found');
      }

      if (inventory.availableStock < quantity) {
        throw new BadRequestError(`Insufficient stock. Available: ${inventory.availableStock}, Requested: ${quantity}`);
      }

      const previousStock = inventory.availableStock;
      const newStock = previousStock - quantity;

      // 1. Update Inventory availableStock
      await tx.inventory.update({
        where: { id: inventory.id },
        data: { availableStock: newStock }
      });

      // 2. Synchronize Product currentStock
      await tx.product.update({
        where: { id: productId },
        data: { currentStock: newStock }
      });

      // 3. Create StockTransaction
      return tx.stockTransaction.create({
        data: {
          productId,
          inventoryId: inventory.id,
          transactionType: TransactionType.STOCK_OUT,
          quantity,
          previousStock,
          newStock,
          reference,
          remarks,
          createdBy: userId
        },
        include: {
          product: true
        }
      });
    });

    // Check for low-stock violations asynchronously
    (async () => {
      try {
        const inv = await prisma.inventory.findFirst({
          where: { productId: result.productId }
        });
        if (inv && inv.availableStock <= inv.minimumStock) {
          const systemEmail = process.env.SYSTEM_ALERT_EMAIL || 'yatneshpuranik@gmail.com';
          await sendLowInventoryAlert(
            systemEmail,
            result.product.productName,
            result.product.sku,
            inv.availableStock,
            inv.minimumStock
          );

          // Create Low Stock in-app notification
          await prisma.notification.create({
            data: {
              userId: null,
              title: 'Low Stock Alert',
              message: `Product ${result.product.productName} (${result.product.sku}) has crossed safety limit. Available: ${inv.availableStock}, Safety Limit: ${inv.minimumStock}`,
              type: 'LOW_STOCK'
            }
          });
        }
      } catch (err) {
        // Safe logging suppression
      }
    })();

    return result;
  }

  /**
   * Stock Adjustment operation.
   */
  public async adjustStock(dto: StockAdjustmentDTO, userId: string): Promise<StockTransaction> {
    const { productId, quantity: newStock, remarks } = dto;

    return prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findFirst({
        where: { productId },
        include: { product: true }
      });

      if (!inventory) {
        throw new NotFoundError('Inventory record not found');
      }

      const previousStock = inventory.availableStock;
      const quantity = newStock - previousStock; // Delta (can be positive or negative)

      // 1. Update Inventory availableStock
      await tx.inventory.update({
        where: { id: inventory.id },
        data: { availableStock: newStock }
      });

      // 2. Synchronize Product currentStock
      await tx.product.update({
        where: { id: productId },
        data: { currentStock: newStock }
      });

      // 3. Create StockTransaction
      return tx.stockTransaction.create({
        data: {
          productId,
          inventoryId: inventory.id,
          transactionType: TransactionType.ADJUSTMENT,
          quantity, // Store the delta (signed change)
          previousStock,
          newStock,
          remarks,
          createdBy: userId
        },
        include: {
          product: true
        }
      });
    });
  }

  /**
   * Mark Damage operation.
   */
  public async markDamage(dto: MarkDamageDTO, userId: string): Promise<StockTransaction> {
    const { productId, quantity, reference, remarks } = dto;

    return prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findFirst({
        where: { productId },
        include: { product: true }
      });

      if (!inventory) {
        throw new NotFoundError('Inventory record not found');
      }

      if (inventory.availableStock < quantity) {
        throw new BadRequestError(`Insufficient available stock to mark as damaged. Available: ${inventory.availableStock}, Requested: ${quantity}`);
      }

      const previousStock = inventory.availableStock;
      const newStock = previousStock - quantity;
      const newDamagedStock = inventory.damagedStock + quantity;

      // 1. Update Inventory availableStock and damagedStock
      await tx.inventory.update({
        where: { id: inventory.id },
        data: { 
          availableStock: newStock,
          damagedStock: newDamagedStock
        }
      });

      // 2. Synchronize Product currentStock
      await tx.product.update({
        where: { id: productId },
        data: { currentStock: newStock }
      });

      // 3. Create StockTransaction
      return tx.stockTransaction.create({
        data: {
          productId,
          inventoryId: inventory.id,
          transactionType: TransactionType.DAMAGE,
          quantity,
          previousStock,
          newStock,
          reference,
          remarks,
          createdBy: userId
        },
        include: {
          product: true
        }
      });
    });
  }

  /**
   * Stock Return operation.
   */
  public async returnStock(dto: StockReturnDTO, userId: string): Promise<StockTransaction> {
    const { productId, quantity, returnToType, reference, remarks } = dto;

    return prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findFirst({
        where: { productId },
        include: { product: true }
      });

      if (!inventory) {
        throw new NotFoundError('Inventory record not found');
      }

      const previousStock = inventory.availableStock;
      let newStock = previousStock;
      let newDamagedStock = inventory.damagedStock;

      if (returnToType === 'AVAILABLE') {
        newStock = previousStock + quantity;
      } else {
        newDamagedStock = inventory.damagedStock + quantity;
      }

      // 1. Update Inventory stocks
      await tx.inventory.update({
        where: { id: inventory.id },
        data: { 
          availableStock: newStock,
          damagedStock: newDamagedStock
        }
      });

      // 2. Synchronize Product currentStock
      await tx.product.update({
        where: { id: productId },
        data: { currentStock: newStock }
      });

      // 3. Create StockTransaction
      return tx.stockTransaction.create({
        data: {
          productId,
          inventoryId: inventory.id,
          transactionType: TransactionType.RETURN,
          quantity,
          previousStock,
          newStock,
          reference,
          remarks,
          createdBy: userId
        },
        include: {
          product: true
        }
      });
    });
  }

  /**
   * Get Transaction History.
   */
  public async getTransactionHistory(query: GetTransactionHistoryQuery): Promise<{
    transactions: StockTransaction[];
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
      totalRecords: number;
    };
  }> {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const { productId, transactionType, startDate, endDate } = query;

    const whereClause: any = {
      ...(productId && { productId }),
      ...(transactionType && { transactionType: transactionType as TransactionType }),
      ...((startDate || endDate) && {
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) })
        }
      })
    };

    const [totalRecords, transactions] = await Promise.all([
      prisma.stockTransaction.count({ where: whereClause }),
      prisma.stockTransaction.findMany({
        where: whereClause,
        include: { 
          product: true,
          createdByUser: {
            select: {
              fullName: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return {
      transactions,
      pagination: {
        page,
        limit,
        totalPages,
        totalRecords
      }
    };
  }

  /**
   * Get Inventory Summary Dashboard stats.
   */
  public async getSummary(): Promise<{
    totalProducts: number;
    availableStock: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    damagedStock: number;
    recentTransactions: any[];
    inventoryValue: number;
  }> {
    await this.ensureAllInventoriesExist();

    // 1. Total products (not archived/deleted)
    const totalProducts = await prisma.product.count({
      where: { isDeleted: false }
    });

    // 2. Fetch all inventories to compute availableStock, lowStock count, outOfStock count, damagedStock, and total value
    const inventories = await prisma.inventory.findMany({
      where: {
        product: { isDeleted: false }
      },
      include: {
        product: true
      }
    });

    let availableStock = 0;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;
    let damagedStock = 0;
    let inventoryValue = 0;

    for (const inv of inventories) {
      availableStock += inv.availableStock;
      damagedStock += inv.damagedStock;
      if (inv.availableStock === 0) {
        outOfStockProducts++;
      }
      if (inv.availableStock <= inv.minimumStock) {
        lowStockProducts++;
      }
      // Value = purchasePrice * availableStock
      const purchasePrice = Number(inv.product.purchasePrice) || 0;
      inventoryValue += purchasePrice * inv.availableStock;
    }

    // 3. Recent 5 transactions
    const recentTransactions = await prisma.stockTransaction.findMany({
      include: { 
        product: {
          select: {
            productName: true,
            sku: true
          }
        },
        createdByUser: {
          select: {
            fullName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return {
      totalProducts,
      availableStock,
      lowStockProducts,
      outOfStockProducts,
      damagedStock,
      recentTransactions,
      inventoryValue
    };
  }
}
