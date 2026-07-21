import { prisma } from '../../config/db';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { SalesChallan, ChallanStatus, TransactionType } from '@prisma/client';
import { CreateSalesChallanDTO, UpdateSalesChallanDTO, GetSalesChallanQuery } from './sales-challan.types';
import { sendChallanEmail, sendLowInventoryAlert } from '../../services/email.service';
import { PdfService } from '../pdf/pdf.service';
import { logger } from '../../config/logger';

export class SalesChallanService {
  /**
   * Generates a unique sequential challan number: CH-YYYY-000001
   */
  private async generateChallanNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CH-${year}-`;
    
    // Find the latest challan number for the current year
    const count = await prisma.salesChallan.count({
      where: {
        challanNumber: {
          startsWith: prefix
        }
      }
    });

    let index = count + 1;
    let challanNumber = `${prefix}${index.toString().padStart(6, '0')}`;
    let exists = true;

    while (exists) {
      const existing = await prisma.salesChallan.findUnique({
        where: { challanNumber }
      });
      if (!existing) {
        exists = false;
      } else {
        index++;
        challanNumber = `${prefix}${index.toString().padStart(6, '0')}`;
      }
    }

    return challanNumber;
  }

  /**
   * Creates a draft Sales Challan.
   */
  public async createChallan(dto: CreateSalesChallanDTO, userId: string): Promise<SalesChallan> {
    // 1. Verify customer exists and is active
    const customer = await prisma.customer.findFirst({
      where: { id: dto.customerId, isDeleted: false }
    });
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }
    if (!customer.isActive) {
      throw new BadRequestError('Cannot raise challan for an inactive customer');
    }

    // 2. Process items, validate products, calculate totals
    const itemsData: any[] = [];
    let subtotal = 0;
    let totalDiscount = dto.discount || 0;
    let gstAmount = 0;

    for (const item of dto.items) {
      const product = await prisma.product.findFirst({
        where: { id: item.productId, isDeleted: false }
      });
      if (!product) {
        throw new NotFoundError(`Product with ID ${item.productId} not found`);
      }
      if (!product.isActive) {
        throw new BadRequestError(`Product ${product.productName} is inactive`);
      }

      const itemQty = Number(item.quantity);
      const itemPrice = Number(item.sellingPrice);
      const itemDiscount = Number(item.discount || 0);

      const itemSubtotal = itemPrice * itemQty;
      const itemNet = itemSubtotal - itemDiscount;

      if (itemNet < 0) {
        throw new BadRequestError(`Discount exceeds line subtotal for product ${product.productName}`);
      }

      const itemTax = itemNet * (Number(product.gstPercentage) / 100);
      const itemTotal = itemNet + itemTax;

      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;
      gstAmount += itemTax;

      itemsData.push({
        productId: item.productId,
        quantity: itemQty,
        sellingPrice: itemPrice,
        gstPercentage: product.gstPercentage,
        discount: itemDiscount,
        total: itemTotal
      });
    }

    const totalAmount = (subtotal - totalDiscount) + gstAmount;

    if (totalAmount < 0) {
      throw new BadRequestError('Grand total cannot be negative');
    }

    const challanNumber = await this.generateChallanNumber();

    const result = await prisma.salesChallan.create({
      data: {
        challanNumber,
        customerId: dto.customerId,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
        status: ChallanStatus.DRAFT,
        remarks: dto.remarks,
        subtotal,
        gstAmount,
        discount: dto.discount || 0,
        totalAmount,
        createdBy: userId,
        items: {
          create: itemsData
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true
      }
    });

    // In-app notification
    try {
      await prisma.notification.create({
        data: {
          userId: null,
          title: 'New Challan Created',
          message: `Draft Challan ${result.challanNumber} has been raised for customer ${result.customer.companyName}.`,
          type: 'NEW_CHALLAN'
        }
      });
    } catch (e) {}

    return result;
  }

  /**
   * Updates a draft Sales Challan.
   */
  public async updateChallan(id: string, dto: UpdateSalesChallanDTO): Promise<SalesChallan> {
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!challan) {
      throw new NotFoundError('Sales Challan not found');
    }
    if (challan.status !== ChallanStatus.DRAFT) {
      throw new BadRequestError('Only DRAFT challans can be updated');
    }

    // Prepare fields
    const deliveryDate = dto.deliveryDate !== undefined ? (dto.deliveryDate ? new Date(dto.deliveryDate) : null) : challan.deliveryDate;
    const remarks = dto.remarks !== undefined ? dto.remarks : challan.remarks;

    // Recalculate if items or discount is provided
    if (dto.items || dto.discount !== undefined) {
      let subtotal = 0;
      const globalDiscount = dto.discount !== undefined ? dto.discount : Number(challan.discount);
      let totalDiscount = globalDiscount;
      let gstAmount = 0;

      const itemsData: any[] = [];
      const inputItems = dto.items || challan.items;

      for (const item of inputItems) {
        const product = await prisma.product.findFirst({
          where: { id: item.productId, isDeleted: false }
        });
        if (!product) {
          throw new NotFoundError(`Product with ID ${item.productId} not found`);
        }

        const itemQty = Number(item.quantity);
        const itemPrice = Number(item.sellingPrice);
        const itemDiscount = Number(item.discount || 0);

        const itemSubtotal = itemPrice * itemQty;
        const itemNet = itemSubtotal - itemDiscount;

        if (itemNet < 0) {
          throw new BadRequestError(`Discount exceeds line subtotal for product ${product.productName}`);
        }

        const itemTax = itemNet * (Number(product.gstPercentage) / 100);
        const itemTotal = itemNet + itemTax;

        subtotal += itemSubtotal;
        totalDiscount += itemDiscount;
        gstAmount += itemTax;

        itemsData.push({
          productId: item.productId,
          quantity: itemQty,
          sellingPrice: itemPrice,
          gstPercentage: product.gstPercentage,
          discount: itemDiscount,
          total: itemTotal
        });
      }

      const totalAmount = (subtotal - totalDiscount) + gstAmount;

      if (totalAmount < 0) {
        throw new BadRequestError('Grand total cannot be negative');
      }

      return prisma.$transaction(async (tx) => {
        // Delete existing items
        await tx.salesChallanItem.deleteMany({
          where: { salesChallanId: id }
        });

        // Update Challan
        return tx.salesChallan.update({
          where: { id },
          data: {
            deliveryDate,
            remarks,
            subtotal,
            gstAmount,
            discount: globalDiscount,
            totalAmount,
            items: {
              create: itemsData
            }
          },
          include: {
            items: {
              include: {
                product: true
              }
            },
            customer: true
          }
        });
      });
    } else {
      // Just update basic fields
      return prisma.salesChallan.update({
        where: { id },
        data: {
          deliveryDate,
          remarks
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          customer: true
        }
      });
    }
  }

  /**
   * Deletes a draft Sales Challan.
   */
  public async deleteChallan(id: string): Promise<void> {
    const challan = await prisma.salesChallan.findUnique({
      where: { id }
    });

    if (!challan) {
      throw new NotFoundError('Sales Challan not found');
    }
    if (challan.status !== ChallanStatus.DRAFT) {
      throw new BadRequestError('Only DRAFT challans can be deleted');
    }

    await prisma.salesChallan.delete({
      where: { id }
    });
  }

  /**
   * Confirms a Sales Challan.
   * Checks inventory and reduces stock atomically.
   */
  public async confirmChallan(id: string, userId: string): Promise<SalesChallan> {
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!challan) {
      throw new NotFoundError('Sales Challan not found');
    }
    if (challan.status !== ChallanStatus.DRAFT) {
      throw new BadRequestError('Only DRAFT challans can be confirmed');
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Lock and validate inventory levels
      for (const item of challan.items) {
        // Find inventory record and lock the row using SELECT FOR UPDATE
        const lockedInvs = await tx.$queryRawUnsafe<any[]>(
          `SELECT id, "availableStock", "minimumStock" FROM "Inventory" WHERE "productId" = CAST($1 AS uuid) LIMIT 1 FOR UPDATE`,
          item.productId
        );
        const inventory = lockedInvs?.[0];

        if (!inventory) {
          throw new NotFoundError(`Inventory record not found for product ${item.product.productName}`);
        }

        if (inventory.availableStock < item.quantity) {
          throw new BadRequestError(
            `Insufficient stock for product ${item.product.productName}. Available: ${inventory.availableStock}, Required: ${item.quantity}`
          );
        }

        const previousStock = inventory.availableStock;
        const newStock = previousStock - item.quantity;

        // 2. Reduce inventory availableStock
        await tx.inventory.update({
          where: { productId: item.productId },
          data: { availableStock: newStock }
        });

        // 3. Update Product currentStock to maintain synchronization
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: newStock }
        });

        // 4. Log StockTransaction history
        await tx.stockTransaction.create({
          data: {
            productId: item.productId,
            inventoryId: inventory.id,
            transactionType: TransactionType.STOCK_OUT,
            quantity: item.quantity,
            previousStock,
            newStock,
            reference: challan.challanNumber,
            remarks: `Dispatched under Sales Challan: ${challan.challanNumber}`,
            createdBy: userId
          }
        });
      }

      // 5. Update Challan status to CONFIRMED
      return tx.salesChallan.update({
        where: { id },
        data: {
          status: ChallanStatus.CONFIRMED
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          customer: true
        }
      });
    });

    // Dispatch background email notifications with attached tax invoice PDF
    (async () => {
      try {
        const pdfService = new PdfService();
        const pdfBuffer = await pdfService.generateInvoicePDFBuffer(result);

        await sendChallanEmail(
          result.customer.email,
          result.customer.contactPerson,
          result.challanNumber,
          Number(result.totalAmount),
          pdfBuffer
        );

        // Create Challan Confirmed in-app notification
        await prisma.notification.create({
          data: {
            userId: null,
            title: 'Challan Confirmed',
            message: `Challan ${result.challanNumber} has been confirmed and inventory items have been dispatched.`,
            type: 'CHALLAN_CONFIRMED'
          }
        });

        // Check for low-stock alarms
        for (const item of result.items) {
          const inv = await prisma.inventory.findUnique({
            where: { productId: item.productId }
          });
          if (inv && inv.availableStock <= inv.minimumStock) {
            const systemEmail = process.env.SYSTEM_ALERT_EMAIL || 'yatneshpuranik@gmail.com';
            await sendLowInventoryAlert(
              systemEmail,
              item.product.productName,
              item.product.sku,
              inv.availableStock,
              inv.minimumStock
            );

            // Create Low Stock in-app notification
            await prisma.notification.create({
              data: {
                userId: null,
                title: 'Low Stock Alert',
                message: `Product ${item.product.productName} (${item.product.sku}) has crossed safety limit. Available: ${inv.availableStock}, Safety Limit: ${inv.minimumStock}`,
                type: 'LOW_STOCK'
              }
            });
          }
        }
      } catch (err: any) {
        logger.error(`Dispatch notification triggers failed: ${err.message}`);
      }
    })();

    return result;
  }

  /**
   * Cancels a confirmed Sales Challan.
   * Restores stock levels and logs reverse transactions atomically.
   */
  public async cancelChallan(id: string, userId: string): Promise<SalesChallan> {
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!challan) {
      throw new NotFoundError('Sales Challan not found');
    }
    if (challan.status !== ChallanStatus.CONFIRMED) {
      throw new BadRequestError('Only CONFIRMED challans can be cancelled');
    }

    return prisma.$transaction(async (tx) => {
      // Restore stock for all items
      for (const item of challan.items) {
        const inventory = await tx.inventory.findUnique({
          where: { productId: item.productId }
        });

        if (!inventory) {
          throw new NotFoundError(`Inventory record not found for product ${item.product.productName}`);
        }

        const previousStock = inventory.availableStock;
        const newStock = previousStock + item.quantity;

        // 1. Add back to availableStock
        await tx.inventory.update({
          where: { productId: item.productId },
          data: { availableStock: newStock }
        });

        // 2. Synchronize Product currentStock
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: newStock }
        });

        // 3. Log RETURN transaction history
        await tx.stockTransaction.create({
          data: {
            productId: item.productId,
            inventoryId: inventory.id,
            transactionType: TransactionType.RETURN,
            quantity: item.quantity,
            previousStock,
            newStock,
            reference: challan.challanNumber,
            remarks: `Stock restored from cancelled Sales Challan: ${challan.challanNumber}`,
            createdBy: userId
          }
        });
      }

      // Update status to CANCELLED
      return tx.salesChallan.update({
        where: { id },
        data: {
          status: ChallanStatus.CANCELLED
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          customer: true
        }
      });
    });
  }

  /**
   * Completes a Sales Challan.
   */
  public async completeChallan(id: string): Promise<SalesChallan> {
    const challan = await prisma.salesChallan.findUnique({
      where: { id }
    });

    if (!challan) {
      throw new NotFoundError('Sales Challan not found');
    }
    if (challan.status !== ChallanStatus.CONFIRMED) {
      throw new BadRequestError('Only CONFIRMED challans can be completed');
    }

    return prisma.salesChallan.update({
      where: { id },
      data: {
        status: ChallanStatus.COMPLETED
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true
      }
    });
  }

  /**
   * Get single Sales Challan details.
   */
  public async getChallanById(id: string): Promise<any> {
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true,
        createdByUser: {
          select: {
            fullName: true,
            role: true
          }
        }
      }
    });

    if (!challan) {
      throw new NotFoundError('Sales Challan not found');
    }

    return challan;
  }

  /**
   * Search and filter Sales Challans.
   */
  public async getChallans(query: GetSalesChallanQuery): Promise<{
    challans: SalesChallan[];
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

    const { search, status, customerId, startDate, endDate, sortBy, sortOrder } = query;

    // Build filter clauses
    const whereClause: any = {
      ...(status && { status: status as ChallanStatus }),
      ...(customerId && { customerId }),
      ...((startDate || endDate) && {
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) })
        }
      }),
      ...(search && {
        OR: [
          { challanNumber: { contains: search, mode: 'insensitive' } },
          {
            customer: {
              companyName: { contains: search, mode: 'insensitive' }
            }
          }
        ]
      })
    };

    const sortField = sortBy === 'totalAmount' ? 'totalAmount' : sortBy === 'status' ? 'status' : 'challanDate';
    const sortDir = sortOrder === 'asc' ? 'asc' : 'desc';

    const [totalRecords, challans] = await Promise.all([
      prisma.salesChallan.count({ where: whereClause }),
      prisma.salesChallan.findMany({
        where: whereClause,
        include: {
          customer: {
            select: {
              companyName: true,
              customerCode: true
            }
          },
          createdByUser: {
            select: {
              fullName: true
            }
          }
        },
        orderBy: { [sortField]: sortDir },
        skip,
        take: limit
      })
    ]);

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return {
      challans,
      pagination: {
        page,
        limit,
        totalPages,
        totalRecords
      }
    };
  }

  /**
   * Get Sales Challan History of a specific customer.
   */
  public async getCustomerChallans(customerId: string): Promise<SalesChallan[]> {
    return prisma.salesChallan.findMany({
      where: { customerId },
      include: {
        createdByUser: {
          select: {
            fullName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
