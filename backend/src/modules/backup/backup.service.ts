import { prisma } from '../../config/db';
import { BadRequestError } from '../../utils/errors';

export class BackupService {
  /**
   * Export all database tables into a single JSON envelope
   */
  public async exportDatabase(): Promise<any> {
    const [
      users,
      customers,
      products,
      inventory,
      stockTransactions,
      salesChallans,
      salesChallanItems,
      settings,
      notifications,
      auditLogs
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.customer.findMany(),
      prisma.product.findMany(),
      prisma.inventory.findMany(),
      prisma.stockTransaction.findMany(),
      prisma.salesChallan.findMany(),
      prisma.salesChallanItem.findMany(),
      prisma.companySettings.findMany(),
      prisma.notification.findMany(),
      prisma.auditLog.findMany()
    ]);

    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      tables: {
        users,
        customers,
        products,
        inventory,
        stockTransactions,
        salesChallans,
        salesChallanItems,
        settings,
        notifications,
        auditLogs
      }
    };
  }

  /**
   * Destructively restore database from JSON backup file
   */
  public async importDatabase(data: any): Promise<void> {
    if (!data || !data.tables || !data.version) {
      throw new BadRequestError('Invalid backup file schema structure');
    }

    const {
      users = [],
      customers = [],
      products = [],
      inventory = [],
      stockTransactions = [],
      salesChallans = [],
      salesChallanItems = [],
      settings = [],
      notifications = [],
      auditLogs = []
    } = data.tables;

    // Execute atomic db truncate and bulk load
    await prisma.$transaction(async (tx) => {
      // 1. Truncate dependent child records first to satisfy DB constraints
      await tx.salesChallanItem.deleteMany();
      await tx.salesChallan.deleteMany();
      await tx.stockTransaction.deleteMany();
      await tx.inventory.deleteMany();
      await tx.product.deleteMany();
      await tx.customer.deleteMany();
      await tx.user.deleteMany();
      await tx.companySettings.deleteMany();
      await tx.notification.deleteMany();
      await tx.auditLog.deleteMany();

      // 2. Ingest records in correct parent-to-child order
      if (users.length > 0) await tx.user.createMany({ data: users });
      if (customers.length > 0) await tx.customer.createMany({ data: customers });
      if (products.length > 0) await tx.product.createMany({ data: products });
      if (inventory.length > 0) await tx.inventory.createMany({ data: inventory });
      if (stockTransactions.length > 0) await tx.stockTransaction.createMany({ data: stockTransactions });
      if (salesChallans.length > 0) await tx.salesChallan.createMany({ data: salesChallans });
      if (salesChallanItems.length > 0) await tx.salesChallanItem.createMany({ data: salesChallanItems });
      if (settings.length > 0) await tx.companySettings.createMany({ data: settings });
      if (notifications.length > 0) await tx.notification.createMany({ data: notifications });
      if (auditLogs.length > 0) await tx.auditLog.createMany({ data: auditLogs });
    });
  }

  /**
   * Helper to format double quotes inside CSV cells
   */
  private escapeCSV(val: any): string {
    if (val === null || val === undefined) return '';
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    return `"${str.replace(/"/g, '""')}"`;
  }

  /**
   * Export database tables as CSV file streams
   */
  public async exportCSV(type: string): Promise<string> {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (type === 'customers') {
      const records = await prisma.customer.findMany({ where: { isDeleted: false } });
      headers = ['ID', 'Customer Code', 'Company Name', 'Contact Person', 'Email', 'Phone', 'Address', 'City', 'State', 'Pincode'];
      rows = records.map((r) => [
        r.id, r.customerCode, r.companyName, r.contactPerson, r.email, r.phone, r.address, r.city, r.state, r.pincode
      ]);
    } else if (type === 'products') {
      const records = await prisma.product.findMany({ where: { isDeleted: false } });
      headers = ['ID', 'Product Code', 'Product Name', 'SKU', 'Category', 'Brand', 'Purchase Price', 'Selling Price', 'Active'];
      rows = records.map((r) => [
        r.id, r.productCode, r.productName, r.sku, r.category, r.brand, Number(r.purchasePrice).toFixed(2), Number(r.sellingPrice).toFixed(2), r.isActive ? 'Yes' : 'No'
      ]);
    } else if (type === 'inventory') {
      const records = await prisma.inventory.findMany({ include: { product: true } });
      headers = ['Product Name', 'SKU', 'Available Stock', 'Reserved Stock', 'Damaged Stock', 'Minimum Stock', 'Maximum Stock', 'Warehouse Location'];
      rows = records.map((r) => [
        r.product.productName, r.product.sku, r.availableStock.toString(), r.reservedStock.toString(), r.damagedStock.toString(), r.minimumStock.toString(), r.maximumStock.toString(), r.warehouseLocation || ''
      ]);
    } else if (type === 'sales') {
      const records = await prisma.salesChallan.findMany({ include: { customer: true } });
      headers = ['Challan Number', 'Challan Date', 'Status', 'Subtotal', 'GST Amount', 'Discount', 'Total Amount', 'Customer Name'];
      rows = records.map((r) => [
        r.challanNumber, new Date(r.challanDate).toLocaleDateString(), r.status, Number(r.subtotal).toFixed(2), Number(r.gstAmount).toFixed(2), Number(r.discount).toFixed(2), Number(r.totalAmount).toFixed(2), r.customer.companyName
      ]);
    } else {
      throw new BadRequestError(`Unsupported export type: ${type}`);
    }

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map(this.escapeCSV).join(','))
    ].join('\n');

    return csvContent;
  }
}
