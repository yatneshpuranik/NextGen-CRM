import { prisma } from '../../config/db';
import { ConflictError, NotFoundError, BadRequestError } from '../../utils/errors';
import { Product } from '@prisma/client';
import { CreateProductDTO, UpdateProductDTO, GetProductsQuery } from './product.types';

export class ProductService {
  /**
   * Generates a unique sequential product code.
   * e.g., PROD-00001, PROD-00002
   */
  private async generateProductCode(): Promise<string> {
    let index = (await prisma.product.count()) + 1;
    let productCode = `PROD-${index.toString().padStart(5, '0')}`;
    let codeExists = true;

    while (codeExists) {
      const existing = await prisma.product.findUnique({
        where: { productCode }
      });
      if (!existing) {
        codeExists = false;
      } else {
        index++;
        productCode = `PROD-${index.toString().padStart(5, '0')}`;
      }
    }
    return productCode;
  }

  public async createProduct(dto: CreateProductDTO, userId: string): Promise<Product> {
    // 1. Prevent duplicate SKU
    const existingSku = await prisma.product.findUnique({
      where: { sku: dto.sku }
    });
    if (existingSku) {
      throw new ConflictError('A product with this SKU already exists');
    }

    // 2. Generate unique code
    const productCode = await this.generateProductCode();

    // 3. Create product record and inventory atomically
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          ...dto,
          productCode,
          createdBy: userId,
          isActive: true,
          isDeleted: false
        }
      });

      const availableStock = dto.currentStock || 0;
      const minimumStock = dto.minimumStock || 0;

      const inventory = await tx.inventory.create({
        data: {
          productId: product.id,
          availableStock,
          minimumStock,
          reorderLevel: minimumStock
        }
      });

      // If there is initial stock, create a transaction log
      if (availableStock > 0) {
        await tx.stockTransaction.create({
          data: {
            productId: product.id,
            inventoryId: inventory.id,
            transactionType: 'STOCK_IN',
            quantity: availableStock,
            previousStock: 0,
            newStock: availableStock,
            reference: 'INITIAL_STOCK',
            remarks: 'Initial stock intake upon product registration',
            createdBy: userId
          }
        });
      }

      return product;
    });
  }

  public async getProductById(id: string): Promise<Product> {
    const product = await prisma.product.findFirst({
      where: { id, isDeleted: false }
    });

    if (!product) {
      throw new NotFoundError('Product profile not found');
    }
    return product;
  }

  public async getAllProducts(query: GetProductsQuery): Promise<{
    products: Product[];
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

    const search = query.search || '';
    const isActive = query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined;
    const category = query.category || undefined;
    const brand = query.brand || undefined;
    const sortBy = query.sortBy === 'sellingPrice' ? 'sellingPrice' : query.sortBy === 'createdAt' ? 'createdAt' : 'productName';
    const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';

    // Construct filter clauses
    const whereClause: any = {
      isDeleted: false,
      ...(isActive !== undefined && { isActive }),
      ...(category && { category }),
      ...(brand && { brand }),
      ...(search && {
        OR: [
          { productName: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { productCode: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    // Run parallel queries for count and data
    const [totalRecords, products] = await Promise.all([
      prisma.product.count({ where: whereClause }),
      prisma.product.findMany({
        where: whereClause,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      })
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return {
      products,
      pagination: {
        page,
        limit,
        totalPages,
        totalRecords
      }
    };
  }

  public async updateProduct(id: string, dto: UpdateProductDTO): Promise<Product> {
    // 1. Verify existence
    const product = await prisma.product.findFirst({
      where: { id, isDeleted: false }
    });
    if (!product) {
      throw new NotFoundError('Product profile not found');
    }

    // 2. Prevent duplicate SKU if changed
    if (dto.sku && dto.sku !== product.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: dto.sku }
      });
      if (existingSku) {
        throw new ConflictError('A product with this SKU already exists');
      }
    }

    // 3. Verify prices rule (sellingPrice >= purchasePrice)
    const finalPurchasePrice = dto.purchasePrice !== undefined ? dto.purchasePrice : Number(product.purchasePrice);
    const finalSellingPrice = dto.sellingPrice !== undefined ? dto.sellingPrice : Number(product.sellingPrice);
    if (Number(finalSellingPrice) < Number(finalPurchasePrice)) {
      throw new BadRequestError('Selling price must be greater than or equal to purchase price');
    }

    // 4. Update fields
    return prisma.product.update({
      where: { id },
      data: dto
    });
  }

  public async deleteProduct(id: string): Promise<void> {
    // 1. Verify existence
    const product = await prisma.product.findFirst({
      where: { id, isDeleted: false }
    });
    if (!product) {
      throw new NotFoundError('Product profile not found');
    }

    // 2. Perform Soft Delete (Archiving)
    await prisma.product.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false
      }
    });
  }

  public async activateProduct(id: string): Promise<Product> {
    const product = await prisma.product.findFirst({
      where: { id, isDeleted: false }
    });
    if (!product) {
      throw new NotFoundError('Product profile not found');
    }

    return prisma.product.update({
      where: { id },
      data: { isActive: true }
    });
  }

  public async deactivateProduct(id: string): Promise<Product> {
    const product = await prisma.product.findFirst({
      where: { id, isDeleted: false }
    });
    if (!product) {
      throw new NotFoundError('Product profile not found');
    }

    return prisma.product.update({
      where: { id },
      data: { isActive: false }
    });
  }
}
