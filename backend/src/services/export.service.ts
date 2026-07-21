import * as XLSX from 'xlsx';
import { prisma } from '../config/db';
import { BadRequestError } from '../utils/errors';

export class ExportService {
  /**
   * Format double quotes and wrap in quotes for CSV cell safety
   */
  private escapeCSVCell(val: any): string {
    if (val === null || val === undefined) return '';
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    return `"${str.replace(/"/g, '""')}"`;
  }

  /**
   * Convert header array and rows matrix to CSV string
   */
  public generateCSVString(headers: string[], rows: string[][]): string {
    const lines = [
      headers.map(h => this.escapeCSVCell(h)).join(','),
      ...rows.map(row => row.map(r => this.escapeCSVCell(r)).join(','))
    ];
    return lines.join('\n');
  }

  /**
   * Convert header array and rows matrix to XLSX Buffer
   */
  public generateXLSXBuffer(headers: string[], rows: (string | number)[][], sheetName: string = 'ExportData'): Buffer {
    const data = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Fetch data and generate export file (CSV string or XLSX Buffer) for specified module
   */
  public async exportModuleData(module: string, format: 'csv' | 'xlsx', _filters: any = {}): Promise<{ data: string | Buffer; filename: string; mimeType: string }> {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    const dateStr = new Date().toISOString().split('T')[0];

    switch (module) {
      case 'customers': {
        const records = await prisma.customer.findMany({
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' }
        });
        headers = ['Customer Code', 'Company Name', 'Contact Person', 'Email', 'Phone', 'Address', 'City', 'State', 'Country', 'Pincode', 'GST Number', 'Customer Type', 'Status'];
        rows = records.map(c => [
          c.customerCode,
          c.companyName,
          c.contactPerson,
          c.email,
          c.phone,
          c.address,
          c.city,
          c.state,
          c.country || 'India',
          c.pincode,
          c.gstNumber || '',
          c.customerType,
          c.isActive ? 'Active' : 'Inactive'
        ]);
        break;
      }
      case 'products': {
        const records = await prisma.product.findMany({
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' }
        });
        headers = ['Product Code', 'Product Name', 'SKU', 'Barcode', 'Category', 'Brand', 'Unit', 'Purchase Price', 'Selling Price', 'GST %', 'Minimum Stock', 'Current Stock', 'Status'];
        rows = records.map(p => [
          p.productCode,
          p.productName,
          p.sku,
          p.barcode || '',
          p.category,
          p.brand,
          p.unit,
          Number(p.purchasePrice),
          Number(p.sellingPrice),
          Number(p.gstPercentage),
          p.minimumStock,
          p.currentStock,
          p.isActive ? 'Active' : 'Inactive'
        ]);
        break;
      }
      case 'inventory': {
        const records = await prisma.inventory.findMany({
          include: { product: true },
          orderBy: { updatedAt: 'desc' }
        });
        headers = ['Product Name', 'SKU', 'Available Stock', 'Reserved Stock', 'Damaged Stock', 'Minimum Stock', 'Maximum Stock', 'Warehouse Location'];
        rows = records.map(i => [
          i.product?.productName || '',
          i.product?.sku || '',
          i.availableStock,
          i.reservedStock,
          i.damagedStock,
          i.minimumStock,
          i.maximumStock,
          i.warehouseLocation || ''
        ]);
        break;
      }
      case 'warehouses': {
        const records = await prisma.warehouse.findMany({
          orderBy: { createdAt: 'desc' }
        });
        headers = ['Warehouse Code', 'Warehouse Name', 'Contact Person', 'Contact Number', 'Address', 'Status'];
        rows = records.map(w => [
          w.code,
          w.name,
          w.contactPerson || '',
          w.contactNumber || '',
          w.address || '',
          w.status || 'ACTIVE'
        ]);
        break;
      }
      case 'sales-challans': {
        const records = await prisma.salesChallan.findMany({
          include: { customer: true, createdByUser: true },
          orderBy: { createdAt: 'desc' }
        });
        headers = ['Challan Number', 'Challan Date', 'Status', 'Customer Code', 'Customer Name', 'Subtotal', 'GST Amount', 'Discount', 'Total Amount', 'Created By'];
        rows = records.map(sc => [
          sc.challanNumber,
          new Date(sc.challanDate).toLocaleDateString(),
          sc.status,
          sc.customer?.customerCode || '',
          sc.customer?.companyName || '',
          Number(sc.subtotal),
          Number(sc.gstAmount),
          Number(sc.discount),
          Number(sc.totalAmount),
          sc.createdByUser?.fullName || ''
        ]);
        break;
      }
      case 'reports': {
        const records = await prisma.salesChallan.findMany({
          include: { customer: true },
          orderBy: { createdAt: 'desc' }
        });
        headers = ['Challan Number', 'Customer', 'Date', 'Status', 'Total Revenue'];
        rows = records.map(r => [
          r.challanNumber,
          r.customer?.companyName || '',
          new Date(r.challanDate).toLocaleDateString(),
          r.status,
          Number(r.totalAmount)
        ]);
        break;
      }
      case 'analytics': {
        const records = await prisma.salesChallan.findMany({
          take: 100,
          orderBy: { createdAt: 'desc' },
          include: { customer: true }
        });
        headers = ['Challan Number', 'Customer Name', 'Date', 'Status', 'Amount (INR)'];
        rows = records.map(r => [
          r.challanNumber,
          r.customer?.companyName || '',
          new Date(r.challanDate).toLocaleDateString(),
          r.status,
          Number(r.totalAmount)
        ]);
        break;
      }
      case 'audit-logs': {
        const records = await prisma.auditLog.findMany({
          include: { user: true },
          orderBy: { createdAt: 'desc' },
          take: 500
        });
        headers = ['ID', 'User', 'Email', 'Module', 'Action', 'Timestamp', 'IP Address'];
        rows = records.map(al => [
          al.id,
          al.user?.fullName || '',
          al.user?.email || '',
          al.module,
          al.action,
          new Date(al.createdAt).toLocaleString(),
          al.ipAddress || ''
        ]);
        break;
      }
      case 'email-logs': {
        const records = await prisma.emailLog.findMany({
          orderBy: { sentTime: 'desc' },
          take: 500
        });
        headers = ['ID', 'Recipient', 'Subject', 'Status', 'Dispatched At'];
        rows = records.map(el => [
          el.id,
          el.recipient,
          el.subject,
          el.status,
          new Date(el.sentTime).toLocaleString()
        ]);
        break;
      }
      default:
        throw new BadRequestError(`Unsupported export module: ${module}`);
    }

    const filename = `${module}_export_${dateStr}.${format}`;
    if (format === 'csv') {
      const data = this.generateCSVString(headers, rows.map(r => r.map(String)));
      return { data, filename, mimeType: 'text/csv' };
    } else {
      const data = this.generateXLSXBuffer(headers, rows, module);
      return { data, filename, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
    }
  }

  /**
   * Generate downloadable sample template for bulk import
   */
  public generateSampleTemplate(module: string, format: 'csv' | 'xlsx'): { data: string | Buffer; filename: string; mimeType: string } {
    let headers: string[] = [];
    let sampleRows: (string | number)[][] = [];

    switch (module) {
      case 'customers':
        headers = ['Company Name', 'Contact Person', 'Email', 'Phone', 'Address', 'City', 'State', 'Country', 'Pincode', 'GST Number', 'Customer Type'];
        sampleRows = [
          ['Acme Logistics Ltd', 'Rajesh Sharma', 'rajesh@acmelogistics.com', '9876543210', 'Plot 45, GIDC Industrial Estate', 'Ahmedabad', 'Gujarat', 'India', '380015', '24AAAAA0000A1Z5', 'B2B'],
          ['Zenith Enterprises', 'Priya Patel', 'contact@zenithenterprises.in', '9123456789', '12 MG Road', 'Mumbai', 'Maharashtra', 'India', '400001', '27BBBBB1111B1Z2', 'DISTRIBUTOR']
        ];
        break;
      case 'products':
        headers = ['Product Name', 'SKU', 'Barcode', 'Category', 'Brand', 'Unit', 'Purchase Price', 'Selling Price', 'GST Percentage', 'Minimum Stock', 'Current Stock', 'Description'];
        sampleRows = [
          ['Steel Rod 12mm', 'STL-RD-12MM-001', '8901234567890', 'Construction', 'TATA Tiscon', 'TON', 54000, 58500, 18, 10, 50, 'High grade construction steel rod'],
          ['Cement Bag 50kg', 'CMT-BG-50KG-002', '8901234567891', 'Construction', 'UltraTech', 'BAG', 340, 385, 28, 50, 200, 'PPC grade cement bag']
        ];
        break;
      case 'inventory':
        headers = ['SKU', 'Quantity', 'Stock Action Type', 'Warehouse Location', 'Remarks'];
        sampleRows = [
          ['STL-RD-12MM-001', 25, 'STOCK_IN', 'Aisle 3, Shelf B', 'Monthly stock procurement intake'],
          ['CMT-BG-50KG-002', 10, 'STOCK_UPDATE', 'Section C, Bay 12', 'Physical audit correction']
        ];
        break;
      case 'warehouses':
        headers = ['Warehouse Code', 'Warehouse Name', 'Contact Person', 'Contact Number', 'Address'];
        sampleRows = [
          ['WH-AMD-01', 'Ahmedabad Central Warehouse', 'Rajesh Patel', '9876543210', 'Plot 101, Changodar Industrial Park, Ahmedabad'],
          ['WH-MUM-02', 'Bhiwandi Logistics Hub', 'Vikram Singh', '9123456789', 'Building B, Logistics Park, Bhiwandi, Mumbai']
        ];
        break;
      default:
        throw new BadRequestError(`No sample template available for module: ${module}`);
    }

    const filename = `${module}_sample_template.${format}`;
    if (format === 'csv') {
      const data = this.generateCSVString(headers, sampleRows.map(r => r.map(String)));
      return { data, filename, mimeType: 'text/csv' };
    } else {
      const data = this.generateXLSXBuffer(headers, sampleRows, 'Template');
      return { data, filename, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
    }
  }
}
