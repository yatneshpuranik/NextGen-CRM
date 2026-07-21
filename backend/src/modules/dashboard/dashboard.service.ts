import { prisma } from '../../config/db';
import { ChallanStatus } from '@prisma/client';

export class DashboardService {
  /**
   * Aggregates total customers, products, inventory value, monthly revenue, today's revenue, and challan status counts.
   */
  public async getSummary(): Promise<any> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [
      totalCustomers,
      totalProducts,
      challansCount,
      completedChallans,
      confirmedChallans,
      cancelledChallans,
      draftChallans,
      inventories,
      lowStockProducts,
      outOfStockProducts,
      todayChallans,
      monthChallans
    ] = await Promise.all([
      // Total Customers
      prisma.customer.count({ where: { isDeleted: false } }),
      // Total Products
      prisma.product.count({ where: { isDeleted: false } }),
      // Total Sales Challans
      prisma.salesChallan.count(),
      // Status Counts
      prisma.salesChallan.count({ where: { status: ChallanStatus.COMPLETED } }),
      prisma.salesChallan.count({ where: { status: ChallanStatus.CONFIRMED } }),
      prisma.salesChallan.count({ where: { status: ChallanStatus.CANCELLED } }),
      prisma.salesChallan.count({ where: { status: ChallanStatus.DRAFT } }),
      // Inventories for valuation
      prisma.inventory.findMany({
        select: {
          availableStock: true,
          product: {
            select: {
              purchasePrice: true
            }
          }
        }
      }),
      // Low Stock
      prisma.product.count({
        where: {
          isDeleted: false,
          isActive: true,
          currentStock: { lte: prisma.product.fields.minimumStock }
        }
      }),
      // Out of Stock
      prisma.product.count({
        where: {
          isDeleted: false,
          isActive: true,
          currentStock: 0
        }
      }),
      // Today's Challans (CONFIRMED or COMPLETED)
      prisma.salesChallan.findMany({
        where: {
          status: { in: [ChallanStatus.CONFIRMED, ChallanStatus.COMPLETED] },
          createdAt: { gte: todayStart }
        },
        select: { totalAmount: true }
      }),
      // Month's Challans (CONFIRMED or COMPLETED)
      prisma.salesChallan.findMany({
        where: {
          status: { in: [ChallanStatus.CONFIRMED, ChallanStatus.COMPLETED] },
          createdAt: { gte: monthStart }
        },
        select: { totalAmount: true }
      })
    ]);

    // Calculate total inventory asset value
    const totalInventoryValue = inventories.reduce((acc, inv) => {
      const price = inv.product ? Number(inv.product.purchasePrice) : 0;
      return acc + (inv.availableStock * price);
    }, 0);

    // Sum revenue totals
    const todayRevenue = todayChallans.reduce((acc, ch) => acc + Number(ch.totalAmount), 0);
    const monthlyRevenue = monthChallans.reduce((acc, ch) => acc + Number(ch.totalAmount), 0);

    return {
      totalCustomers,
      totalProducts,
      totalInventoryValue,
      totalSalesChallans: challansCount,
      completedChallans,
      pendingChallans: confirmedChallans, // Confirmed denotes stock out but pending load closure
      cancelledChallans,
      draftChallans,
      lowStockProducts,
      outOfStockProducts,
      monthlyRevenue,
      todayRevenue
    };
  }

  /**
   * Generates Daily (last 7 days), Weekly (last 4 weeks), and Monthly (last 6 months) sales analytics.
   */
  public async getSalesOverview(): Promise<any> {
    const today = new Date();

    // 1. Daily sales (last 7 days)
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));

      const dayChallans = await prisma.salesChallan.findMany({
        where: {
          status: { in: [ChallanStatus.CONFIRMED, ChallanStatus.COMPLETED] },
          createdAt: { gte: startOfDay, lte: endOfDay }
        },
        select: { totalAmount: true }
      });

      const totalRevenue = dayChallans.reduce((acc, ch) => acc + Number(ch.totalAmount), 0);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      dailyData.push({
        label: dayName,
        revenue: totalRevenue,
        count: dayChallans.length
      });
    }

    // 2. Weekly sales (last 4 weeks)
    const weeklyData = [];
    for (let i = 3; i >= 0; i--) {
      const startOfW = new Date();
      startOfW.setDate(today.getDate() - (i * 7 + 7));
      startOfW.setHours(0, 0, 0, 0);

      const endOfW = new Date();
      endOfW.setDate(today.getDate() - (i * 7));
      endOfW.setHours(23, 59, 59, 999);

      const weekChallans = await prisma.salesChallan.findMany({
        where: {
          status: { in: [ChallanStatus.CONFIRMED, ChallanStatus.COMPLETED] },
          createdAt: { gte: startOfW, lte: endOfW }
        },
        select: { totalAmount: true }
      });

      const totalRevenue = weekChallans.reduce((acc, ch) => acc + Number(ch.totalAmount), 0);

      weeklyData.push({
        label: `Wk -${i}`,
        revenue: totalRevenue,
        count: weekChallans.length
      });
    }

    // 3. Monthly sales (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(today.getMonth() - i);
      const startOfM = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
      const endOfM = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const monthChallans = await prisma.salesChallan.findMany({
        where: {
          status: { in: [ChallanStatus.CONFIRMED, ChallanStatus.COMPLETED] },
          createdAt: { gte: startOfM, lte: endOfM }
        },
        select: { totalAmount: true }
      });

      const totalRevenue = monthChallans.reduce((acc, ch) => acc + Number(ch.totalAmount), 0);
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });

      monthlyData.push({
        label: monthName,
        revenue: totalRevenue,
        count: monthChallans.length
      });
    }

    return {
      daily: dailyData,
      weekly: weeklyData,
      monthly: monthlyData
    };
  }

  /**
   * Evaluates inventory totals, stock alert thresholds, and valuation by product category.
   */
  public async getInventoryOverview(): Promise<any> {
    const products = await prisma.product.findMany({
      where: { isDeleted: false },
      select: {
        category: true,
        currentStock: true,
        purchasePrice: true,
        sellingPrice: true,
        minimumStock: true
      }
    });

    const categoryMap: { [key: string]: { count: number; value: number; stockCount: number } } = {};
    let lowStockCount = 0;

    products.forEach(p => {
      const stock = p.currentStock;
      const price = Number(p.purchasePrice);
      const totalVal = stock * price;

      if (stock <= p.minimumStock) {
        lowStockCount++;
      }

      if (!categoryMap[p.category]) {
        categoryMap[p.category] = { count: 0, value: 0, stockCount: 0 };
      }

      categoryMap[p.category].count += 1;
      categoryMap[p.category].stockCount += stock;
      categoryMap[p.category].value += totalVal;
    });

    const distribution = Object.keys(categoryMap).map(category => ({
      category,
      productsCount: categoryMap[category].count,
      stockCount: categoryMap[category].stockCount,
      valuation: categoryMap[category].value
    }));

    return {
      lowStockCount,
      distribution
    };
  }

  /**
   * Evaluates customer counts, customer signup growth, and lists top spenders.
   */
  public async getCustomerOverview(): Promise<any> {
    const [topCustomers, signupGrowth] = await Promise.all([
      // Top customer spenders
      prisma.customer.findMany({
        where: { isDeleted: false },
        select: {
          id: true,
          companyName: true,
          customerCode: true,
          challans: {
            where: { status: { in: [ChallanStatus.CONFIRMED, ChallanStatus.COMPLETED] } },
            select: { totalAmount: true }
          }
        }
      }),
      // Customer registration logs (last 6 months)
      prisma.customer.findMany({
        where: { isDeleted: false },
        select: { createdAt: true }
      })
    ]);

    // Rank top customer spenders
    const spenders = topCustomers.map(cust => {
      const totalSpend = cust.challans.reduce((sum, ch) => sum + Number(ch.totalAmount), 0);
      return {
        id: cust.id,
        companyName: cust.companyName,
        customerCode: cust.customerCode,
        totalSpend
      };
    })
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 5);

    // Customer signup growth trend
    const growthTrend = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(today.getMonth() - i);
      const startOfM = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
      const endOfM = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const signups = signupGrowth.filter(c => c.createdAt >= startOfM && c.createdAt <= endOfM).length;
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });

      growthTrend.push({
        label: monthName,
        signups
      });
    }

    return {
      topSpenders: spenders,
      growthTrend
    };
  }

  /**
   * Compiles recent registrations, recent stock movements, recent challans, and product edits.
   */
  public async getRecentActivity(): Promise<any[]> {
    const [customers, transactions, challans, products] = await Promise.all([
      prisma.customer.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, companyName: true, createdAt: true }
      }),
      prisma.stockTransaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          product: { select: { productName: true } }
        }
      }),
      prisma.salesChallan.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          customer: { select: { companyName: true } }
        }
      }),
      prisma.product.findMany({
        where: { isDeleted: false },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: { id: true, productName: true, updatedAt: true }
      })
    ]);

    const timeline: any[] = [];

    customers.forEach(c => {
      timeline.push({
        type: 'CUSTOMER',
        description: `New customer profile registered: ${c.companyName}`,
        timestamp: c.createdAt
      });
    });

    transactions.forEach(t => {
      timeline.push({
        type: 'STOCK',
        description: `Stock transaction logged: ${t.transactionType} for product ${t.product?.productName} (Qty: ${t.quantity})`,
        timestamp: t.createdAt
      });
    });

    challans.forEach(ch => {
      timeline.push({
        type: 'CHALLAN',
        description: `Delivery challan raised for ${ch.customer?.companyName} (${ch.challanNumber}). Status: ${ch.status}`,
        timestamp: ch.createdAt
      });
    });

    products.forEach(p => {
      timeline.push({
        type: 'PRODUCT',
        description: `Product details updated: ${p.productName}`,
        timestamp: p.updatedAt
      });
    });

    return timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
  }

  /**
   * Compiles top selling products ranking.
   */
  public async getTopProducts(): Promise<any[]> {
    const items = await prisma.salesChallanItem.findMany({
      where: {
        salesChallan: {
          status: { in: [ChallanStatus.CONFIRMED, ChallanStatus.COMPLETED] }
        }
      },
      select: {
        productId: true,
        quantity: true,
        total: true,
        product: {
          select: {
            productName: true,
            sku: true
          }
        }
      }
    });

    const productMap: { [key: string]: { name: string; sku: string; quantity: number; revenue: number } } = {};

    items.forEach(item => {
      const pid = item.productId;
      if (!productMap[pid]) {
        productMap[pid] = {
          name: item.product?.productName || 'Unknown Product',
          sku: item.product?.sku || '',
          quantity: 0,
          revenue: 0
        };
      }
      productMap[pid].quantity += item.quantity;
      productMap[pid].revenue += Number(item.total);
    });

    return Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }

  /**
   * Compiles products with low stock levels.
   */
  public async getLowStockList(): Promise<any[]> {
    return prisma.product.findMany({
      where: {
        isDeleted: false,
        isActive: true,
        currentStock: { lte: prisma.product.fields.minimumStock }
      },
      select: {
        id: true,
        productName: true,
        sku: true,
        currentStock: true,
        minimumStock: true,
        brand: true,
        category: true
      },
      take: 10
    });
  }
}
