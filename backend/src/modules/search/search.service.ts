import { prisma } from '../../config/db';

export class SearchService {
  /**
   * Search across all main ledger tables
   */
  public async searchAll(query: string): Promise<any> {
    const q = query.trim();
    if (!q) {
      return {
        customers: [],
        products: [],
        inventory: [],
        challans: []
      };
    }

    const [customers, products, inventory, challans] = await Promise.all([
      // Search Customers
      prisma.customer.findMany({
        where: {
          isDeleted: false,
          OR: [
            { companyName: { contains: q, mode: 'insensitive' } },
            { contactPerson: { contains: q, mode: 'insensitive' } },
            { customerCode: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } }
          ]
        },
        take: 5
      }),

      // Search Products
      prisma.product.findMany({
        where: {
          isDeleted: false,
          OR: [
            { productName: { contains: q, mode: 'insensitive' } },
            { sku: { contains: q, mode: 'insensitive' } },
            { productCode: { contains: q, mode: 'insensitive' } },
            { category: { contains: q, mode: 'insensitive' } },
            { brand: { contains: q, mode: 'insensitive' } }
          ]
        },
        take: 5
      }),

      // Search Inventory
      prisma.inventory.findMany({
        where: {
          product: { isDeleted: false },
          OR: [
            { product: { productName: { contains: q, mode: 'insensitive' } } },
            { product: { sku: { contains: q, mode: 'insensitive' } } },
            { product: { productCode: { contains: q, mode: 'insensitive' } } },
            { warehouseLocation: { contains: q, mode: 'insensitive' } }
          ]
        },
        include: {
          product: true
        },
        take: 5
      }),

      // Search Sales Challans
      prisma.salesChallan.findMany({
        where: {
          OR: [
            { challanNumber: { contains: q, mode: 'insensitive' } },
            { customer: { companyName: { contains: q, mode: 'insensitive' } } }
          ]
        },
        include: {
          customer: true
        },
        take: 5
      })
    ]);

    return {
      customers,
      products,
      inventory,
      challans
    };
  }
}
