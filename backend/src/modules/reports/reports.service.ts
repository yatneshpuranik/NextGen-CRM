import { prisma } from '../../config/db';
import { ChallanStatus, TransactionType } from '@prisma/client';

export interface ReportQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  customerId?: string;
  productId?: string;
  category?: string;
  brand?: string;
  startDate?: string;
  endDate?: string;
  transactionType?: string;
}

export class ReportsService {
  /**
   * Generates a Sales Report listing confirmed/completed sales challans with pagination and filters.
   */
  public async getSalesReport(query: ReportQueryParams): Promise<any> {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const whereClause: any = {
      status: { in: [ChallanStatus.CONFIRMED, ChallanStatus.COMPLETED] },
      ...(query.customerId && { customerId: query.customerId }),
      ...((query.startDate || query.endDate) && {
        challanDate: {
          ...(query.startDate && { gte: new Date(query.startDate) }),
          ...(query.endDate && { lte: new Date(query.endDate) })
        }
      }),
      ...(query.search && {
        OR: [
          { challanNumber: { contains: query.search, mode: 'insensitive' } },
          { customer: { companyName: { contains: query.search, mode: 'insensitive' } } }
        ]
      })
    };

    // If filter by specific product is set, filter challans containing that product
    if (query.productId) {
      whereClause.items = {
        some: { productId: query.productId }
      };
    }

    const [totalRecords, challans] = await Promise.all([
      prisma.salesChallan.count({ where: whereClause }),
      prisma.salesChallan.findMany({
        where: whereClause,
        include: {
          customer: { select: { companyName: true, customerCode: true } },
          createdByUser: { select: { fullName: true } }
        },
        orderBy: { challanDate: 'desc' },
        skip,
        take: limit
      })
    ]);

    // Calculate report overall totals
    const grandTotals = await prisma.salesChallan.aggregate({
      where: whereClause,
      _sum: {
        subtotal: true,
        gstAmount: true,
        discount: true,
        totalAmount: true
      }
    });

    return {
      records: challans,
      summary: {
        totalRevenue: Number(grandTotals._sum.totalAmount || 0),
        totalGST: Number(grandTotals._sum.gstAmount || 0),
        totalDiscount: Number(grandTotals._sum.discount || 0),
        totalOrdersCount: totalRecords
      },
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalRecords / limit) || 1,
        totalRecords
      }
    };
  }

  /**
   * Generates an Inventory Report detailing available stocks, reorder alert levels, and valuation assets.
   */
  public async getInventoryReport(query: ReportQueryParams): Promise<any> {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const whereClause: any = {
      isDeleted: false,
      ...(query.category && { category: query.category }),
      ...(query.brand && { brand: query.brand }),
      ...(query.status === 'LOW_STOCK' && {
        currentStock: { lte: prisma.product.fields.minimumStock }
      }),
      ...(query.status === 'OUT_OF_STOCK' && {
        currentStock: 0
      }),
      ...(query.search && {
        OR: [
          { productName: { contains: query.search, mode: 'insensitive' } },
          { sku: { contains: query.search, mode: 'insensitive' } }
        ]
      })
    };

    const [totalRecords, products] = await Promise.all([
      prisma.product.count({ where: whereClause }),
      prisma.product.findMany({
        where: whereClause,
        include: {
          inventories: true
        },
        orderBy: { currentStock: 'asc' },
        skip,
        take: limit
      })
    ]);

    // Format records and compute valuation asset totals
    const formattedRecords = products.map(p => {
      const stock = p.currentStock;
      const purchasePrice = Number(p.purchasePrice);
      const sellingPrice = Number(p.sellingPrice);
      const costValue = stock * purchasePrice;
      const retailValue = stock * sellingPrice;

      return {
        id: p.id,
        productName: p.productName,
        sku: p.sku,
        category: p.category,
        brand: p.brand,
        currentStock: stock,
        minimumStock: p.minimumStock,
        reorderLevel: p.inventories?.[0]?.reorderLevel || 10,
        purchasePrice,
        sellingPrice,
        costValue,
        retailValue,
        warehouseLocation: p.inventories?.[0]?.warehouseLocation || 'Warehouse A',
        status: stock === 0 ? 'Out of Stock' : stock <= p.minimumStock ? 'Low Stock' : 'In Stock'
      };
    });

    // Generate grand asset aggregates
    const allProductsInReport = await prisma.product.findMany({
      where: whereClause,
      select: {
        currentStock: true,
        purchasePrice: true
      }
    });

    const totalValuation = allProductsInReport.reduce((acc, p) => {
      return acc + (p.currentStock * Number(p.purchasePrice));
    }, 0);
    const totalItemsCount = allProductsInReport.reduce((acc, p) => acc + p.currentStock, 0);

    return {
      records: formattedRecords,
      summary: {
        totalAssetValuation: totalValuation,
        totalItemsInStock: totalItemsCount,
        totalDistinctSKUs: totalRecords
      },
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalRecords / limit) || 1,
        totalRecords
      }
    };
  }

  /**
   * Generates a Product Catalog Report.
   */
  public async getProductReport(query: ReportQueryParams): Promise<any> {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const whereClause: any = {
      isDeleted: false,
      ...(query.category && { category: query.category }),
      ...(query.brand && { brand: query.brand }),
      ...(query.status && { isActive: query.status === 'ACTIVE' }),
      ...(query.search && {
        OR: [
          { productName: { contains: query.search, mode: 'insensitive' } },
          { sku: { contains: query.search, mode: 'insensitive' } },
          { productCode: { contains: query.search, mode: 'insensitive' } }
        ]
      })
    };

    const [totalRecords, products] = await Promise.all([
      prisma.product.count({ where: whereClause }),
      prisma.product.findMany({
        where: whereClause,
        orderBy: { productName: 'asc' },
        skip,
        take: limit
      })
    ]);

    return {
      records: products,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalRecords / limit) || 1,
        totalRecords
      }
    };
  }

  /**
   * Generates a Customer CRM Growth and Details Report.
   */
  public async getCustomerReport(query: ReportQueryParams): Promise<any> {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const whereClause: any = {
      isDeleted: false,
      ...(query.status && { isActive: query.status === 'ACTIVE' }),
      ...(query.search && {
        OR: [
          { companyName: { contains: query.search, mode: 'insensitive' } },
          { customerCode: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search, mode: 'insensitive' } }
        ]
      })
    };

    const [totalRecords, customers] = await Promise.all([
      prisma.customer.count({ where: whereClause }),
      prisma.customer.findMany({
        where: whereClause,
        include: {
          challans: {
            where: { status: { in: [ChallanStatus.CONFIRMED, ChallanStatus.COMPLETED] } },
            select: { totalAmount: true }
          }
        },
        orderBy: { companyName: 'asc' },
        skip,
        take: limit
      })
    ]);

    const formattedRecords = customers.map(c => {
      const ordersCount = c.challans.length;
      const totalVolume = c.challans.reduce((sum, ch) => sum + Number(ch.totalAmount), 0);
      return {
        id: c.id,
        companyName: c.companyName,
        customerCode: c.customerCode,
        contactPerson: c.contactPerson,
        email: c.email,
        phone: c.phone,
        city: c.city,
        state: c.state,
        isActive: c.isActive,
        ordersCount,
        totalVolume,
        createdAt: c.createdAt
      };
    });

    return {
      records: formattedRecords,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalRecords / limit) || 1,
        totalRecords
      }
    };
  }

  /**
   * Generates a Stock Movement Audit ledger Report.
   */
  public async getStockMovementReport(query: ReportQueryParams): Promise<any> {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const whereClause: any = {
      ...(query.productId && { productId: query.productId }),
      ...(query.transactionType && { transactionType: query.transactionType as TransactionType }),
      ...((query.startDate || query.endDate) && {
        createdAt: {
          ...(query.startDate && { gte: new Date(query.startDate) }),
          ...(query.endDate && { lte: new Date(query.endDate) })
        }
      }),
      ...(query.search && {
        OR: [
          { reference: { contains: query.search, mode: 'insensitive' } },
          { remarks: { contains: query.search, mode: 'insensitive' } }
        ]
      })
    };

    const [totalRecords, logs] = await Promise.all([
      prisma.stockTransaction.count({ where: whereClause }),
      prisma.stockTransaction.findMany({
        where: whereClause,
        include: {
          product: { select: { productName: true, sku: true } },
          createdByUser: { select: { fullName: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })
    ]);

    return {
      records: logs,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalRecords / limit) || 1,
        totalRecords
      }
    };
  }

  /**
   * Generates a global Challan Report.
   */
  public async getChallanReport(query: ReportQueryParams): Promise<any> {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const whereClause: any = {
      ...(query.status && { status: query.status as ChallanStatus }),
      ...(query.customerId && { customerId: query.customerId }),
      ...((query.startDate || query.endDate) && {
        challanDate: {
          ...(query.startDate && { gte: new Date(query.startDate) }),
          ...(query.endDate && { lte: new Date(query.endDate) })
        }
      }),
      ...(query.search && {
        OR: [
          { challanNumber: { contains: query.search, mode: 'insensitive' } },
          { customer: { companyName: { contains: query.search, mode: 'insensitive' } } }
        ]
      })
    };

    const [totalRecords, challans] = await Promise.all([
      prisma.salesChallan.count({ where: whereClause }),
      prisma.salesChallan.findMany({
        where: whereClause,
        include: {
          customer: { select: { companyName: true, customerCode: true } },
          createdByUser: { select: { fullName: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })
    ]);

    return {
      records: challans,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalRecords / limit) || 1,
        totalRecords
      }
    };
  }
}
