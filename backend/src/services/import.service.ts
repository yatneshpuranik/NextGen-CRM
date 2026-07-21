import * as XLSX from 'xlsx';
import * as csv from 'fast-csv';
import { Readable } from 'stream';
import { prisma } from '../config/db';
import { BadRequestError } from '../utils/errors';

export interface ImportErrorDetail {
  rowNumber: number;
  identifier: string;
  reason: string;
  rawData?: Record<string, any>;
}

export interface ImportResult {
  totalRows: number;
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: ImportErrorDetail[];
  failedRowsCsv?: string;
}

export class ImportService {
  /**
   * Parse uploaded buffer into array of key-value row objects based on extension
   */
  public async parseFileRows(fileBuffer: Buffer, fileMimeOrExt: string): Promise<Record<string, any>[]> {
    const isCsv = fileMimeOrExt.includes('csv') || fileMimeOrExt.endsWith('.csv');
    const isXlsx = fileMimeOrExt.includes('spreadsheet') || fileMimeOrExt.includes('excel') || fileMimeOrExt.endsWith('.xlsx');

    if (!isCsv && !isXlsx) {
      throw new BadRequestError('Unsupported file format. Only .csv and .xlsx files are supported.');
    }

    if (isXlsx) {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) throw new BadRequestError('Excel file contains no worksheets.');
      const sheet = workbook.Sheets[sheetName];
      const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
      return jsonRows;
    } else {
      return new Promise((resolve, reject) => {
        const rows: Record<string, any>[] = [];
        const stream = Readable.from(fileBuffer);
        stream
          .pipe(csv.parse({ headers: true, ignoreEmpty: true, trim: true }))
          .on('error', (error) => reject(new BadRequestError(`CSV parsing error: ${error.message}`)))
          .on('data', (row) => rows.push(row))
          .on('end', () => resolve(rows));
      });
    }
  }

  /**
   * Clean key names (trim whitespace, convert case insensitive lookup)
   */
  private getVal(row: Record<string, any>, ...keys: string[]): string {
    for (const key of keys) {
      const foundKey = Object.keys(row).find(
        (k) => k.trim().toLowerCase() === key.trim().toLowerCase()
      );
      if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
        return String(row[foundKey]).trim();
      }
    }
    return '';
  }

  /**
   * Universal Bulk Import Handler
   */
  public async importModuleData(
    module: string,
    fileBuffer: Buffer,
    fileNameOrMime: string,
    userId: string
  ): Promise<ImportResult> {
    const rawRows = await this.parseFileRows(fileBuffer, fileNameOrMime);
    if (!rawRows || rawRows.length === 0) {
      throw new BadRequestError('Uploaded file contains no data rows.');
    }

    const result: ImportResult = {
      totalRows: rawRows.length,
      imported: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: []
    };

    const failedRawRows: Record<string, any>[] = [];

    switch (module) {
      case 'customers':
        await this.importCustomers(rawRows, result, failedRawRows, userId);
        break;
      case 'products':
        await this.importProducts(rawRows, result, failedRawRows, userId);
        break;
      case 'inventory':
        await this.importInventory(rawRows, result, failedRawRows, userId);
        break;
      case 'warehouses':
        await this.importWarehouses(rawRows, result, failedRawRows);
        break;
      default:
        throw new BadRequestError(`Import functionality is not supported for module: ${module}`);
    }

    if (failedRawRows.length > 0) {
      const headers = Object.keys(failedRawRows[0]);
      const lines = [
        headers.join(','),
        ...failedRawRows.map((r) => headers.map((h) => `"${String(r[h] || '').replace(/"/g, '""')}"`).join(','))
      ];
      result.failedRowsCsv = lines.join('\n');
    }

    return result;
  }

  /**
   * 1. Import Customers
   */
  private async importCustomers(
    rows: Record<string, any>[],
    res: ImportResult,
    failedRows: Record<string, any>[],
    userId: string
  ): Promise<void> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+()\s-]{8,15}$/;
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      const companyName = this.getVal(row, 'Company Name', 'companyName', 'Company');
      const contactPerson = this.getVal(row, 'Contact Person', 'contactPerson', 'Contact');
      const email = this.getVal(row, 'Email', 'email', 'Email Address');
      const phone = this.getVal(row, 'Phone', 'phone', 'Mobile', 'Mobile Number');
      const address = this.getVal(row, 'Address', 'address');
      const city = this.getVal(row, 'City', 'city');
      const state = this.getVal(row, 'State', 'state');
      const country = this.getVal(row, 'Country', 'country') || 'India';
      const pincode = this.getVal(row, 'Pincode', 'pincode', 'Zip');
      const gstNumber = this.getVal(row, 'GST Number', 'gstNumber', 'GST');
      const customerTypeRaw = this.getVal(row, 'Customer Type', 'customerType', 'Type') || 'B2B';

      const customerType = ['B2B', 'B2C', 'DISTRIBUTOR', 'RETAILER'].includes(customerTypeRaw.toUpperCase())
        ? customerTypeRaw.toUpperCase()
        : 'B2B';

      if (!companyName) {
        res.failed++;
        res.errors.push({ rowNumber: rowNum, identifier: companyName || `Row #${rowNum}`, reason: 'Company Name is required', rawData: row });
        failedRows.push(row);
        continue;
      }

      if (!email || !emailRegex.test(email)) {
        res.failed++;
        res.errors.push({ rowNumber: rowNum, identifier: companyName, reason: `Invalid email address: '${email}'`, rawData: row });
        failedRows.push(row);
        continue;
      }

      if (!phone || !phoneRegex.test(phone)) {
        res.failed++;
        res.errors.push({ rowNumber: rowNum, identifier: companyName, reason: `Invalid phone number: '${phone}'`, rawData: row });
        failedRows.push(row);
        continue;
      }

      if (gstNumber && !gstRegex.test(gstNumber.toUpperCase())) {
        res.failed++;
        res.errors.push({ rowNumber: rowNum, identifier: companyName, reason: `Invalid GSTIN format: '${gstNumber}'`, rawData: row });
        failedRows.push(row);
        continue;
      }

      try {
        const existing = await prisma.customer.findFirst({
          where: { OR: [{ email }, { companyName }] }
        });

        if (existing) {
          await prisma.customer.update({
            where: { id: existing.id },
            data: {
              companyName,
              contactPerson: contactPerson || existing.contactPerson,
              phone: phone || existing.phone,
              address: address || existing.address,
              city: city || existing.city,
              state: state || existing.state,
              country: country || existing.country || 'India',
              pincode: pincode || existing.pincode,
              gstNumber: gstNumber ? gstNumber.toUpperCase() : existing.gstNumber,
              customerType,
              isDeleted: false
            }
          });
          res.updated++;
        } else {
          const count = await prisma.customer.count();
          const customerCode = `CUST-${String(count + 1).padStart(4, '0')}`;

          await prisma.customer.create({
            data: {
              customerCode,
              companyName,
              contactPerson: contactPerson || companyName,
              email,
              phone,
              address: address || 'N/A',
              city: city || 'N/A',
              state: state || 'N/A',
              country: country || 'India',
              pincode: pincode || '000000',
              gstNumber: gstNumber ? gstNumber.toUpperCase() : null,
              customerType,
              createdBy: userId
            }
          });
          res.imported++;
        }
      } catch (err: any) {
        res.failed++;
        res.errors.push({ rowNumber: rowNum, identifier: companyName, reason: err.message || 'Database error', rawData: row });
        failedRows.push(row);
      }
    }
  }

  /**
   * 2. Import Products
   */
  private async importProducts(
    rows: Record<string, any>[],
    res: ImportResult,
    failedRows: Record<string, any>[],
    userId: string
  ): Promise<void> {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      const productName = this.getVal(row, 'Product Name', 'productName', 'Name');
      const sku = this.getVal(row, 'SKU', 'sku');
      const barcode = this.getVal(row, 'Barcode', 'barcode');
      const category = this.getVal(row, 'Category', 'category');
      const brand = this.getVal(row, 'Brand', 'brand');
      const unit = this.getVal(row, 'Unit', 'unit') || 'PCS';
      const purchasePriceNum = parseFloat(this.getVal(row, 'Purchase Price', 'purchasePrice')) || 0;
      const sellingPriceNum = parseFloat(this.getVal(row, 'Selling Price', 'sellingPrice')) || 0;
      const gstPercentageNum = parseFloat(this.getVal(row, 'GST Percentage', 'gstPercentage', 'GST %')) || 18;
      const minimumStockNum = parseInt(this.getVal(row, 'Minimum Stock', 'minimumStock'), 10) || 5;
      const currentStockNum = parseInt(this.getVal(row, 'Current Stock', 'currentStock'), 10) || 0;
      const description = this.getVal(row, 'Description', 'description');

      if (!productName) {
        res.failed++;
        res.errors.push({ rowNumber: rowNum, identifier: sku || `Row #${rowNum}`, reason: 'Product Name is required', rawData: row });
        failedRows.push(row);
        continue;
      }

      if (!sku) {
        res.failed++;
        res.errors.push({ rowNumber: rowNum, identifier: productName, reason: 'SKU is required', rawData: row });
        failedRows.push(row);
        continue;
      }

      if (purchasePriceNum < 0 || sellingPriceNum < 0) {
        res.failed++;
        res.errors.push({ rowNumber: rowNum, identifier: sku, reason: 'Prices cannot be negative', rawData: row });
        failedRows.push(row);
        continue;
      }

      if (sellingPriceNum < purchasePriceNum) {
        res.failed++;
        res.errors.push({ rowNumber: rowNum, identifier: sku, reason: `Selling price (₹${sellingPriceNum}) cannot be lower than purchase price (₹${purchasePriceNum})`, rawData: row });
        failedRows.push(row);
        continue;
      }

      try {
        const existing = await prisma.product.findUnique({ where: { sku } });

        if (existing) {
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              productName,
              barcode: barcode || existing.barcode,
              category: category || existing.category,
              brand: brand || existing.brand,
              unit: unit || existing.unit,
              purchasePrice: purchasePriceNum,
              sellingPrice: sellingPriceNum,
              gstPercentage: gstPercentageNum,
              minimumStock: minimumStockNum,
              currentStock: currentStockNum >= 0 ? currentStockNum : existing.currentStock,
              description: description || existing.description,
              isDeleted: false
            }
          });

          const existingInv = await prisma.inventory.findFirst({
            where: { productId: existing.id }
          });

          if (existingInv) {
            await prisma.inventory.update({
              where: { id: existingInv.id },
              data: {
                availableStock: currentStockNum >= 0 ? currentStockNum : existing.currentStock,
                minimumStock: minimumStockNum
              }
            });
          } else {
            await prisma.inventory.create({
              data: {
                productId: existing.id,
                availableStock: currentStockNum >= 0 ? currentStockNum : 0,
                minimumStock: minimumStockNum
              }
            });
          }

          res.updated++;
        } else {
          const count = await prisma.product.count();
          const productCode = `PROD-${String(count + 1).padStart(4, '0')}`;

          const newProd = await prisma.product.create({
            data: {
              productCode,
              productName,
              sku,
              barcode: barcode || null,
              category: category || 'General',
              brand: brand || 'Generic',
              unit,
              purchasePrice: purchasePriceNum,
              sellingPrice: sellingPriceNum,
              gstPercentage: gstPercentageNum,
              minimumStock: minimumStockNum,
              currentStock: Math.max(0, currentStockNum),
              description: description || null,
              createdBy: userId
            }
          });

          await prisma.inventory.create({
            data: {
              productId: newProd.id,
              availableStock: Math.max(0, currentStockNum),
              minimumStock: minimumStockNum
            }
          });

          res.imported++;
        }
      } catch (err: any) {
        res.failed++;
        res.errors.push({ rowNumber: rowNum, identifier: sku, reason: err.message || 'Database error', rawData: row });
        failedRows.push(row);
      }
    }
  }

  /**
   * 3. Import Inventory (Stock In / Stock Update)
   */
  private async importInventory(
    rows: Record<string, any>[],
    res: ImportResult,
    failedRows: Record<string, any>[],
    userId: string
  ): Promise<void> {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      const sku = this.getVal(row, 'SKU', 'sku');
      const qtyNum = parseInt(this.getVal(row, 'Quantity', 'quantity', 'Qty'), 10);
      const actionType = (this.getVal(row, 'Stock Action Type', 'actionType', 'Action') || 'STOCK_IN').toUpperCase();
      const location = this.getVal(row, 'Warehouse Location', 'location', 'WarehouseLocation');
      const remarks = this.getVal(row, 'Remarks', 'remarks') || 'Bulk Inventory Import';

      if (!sku) {
        res.failed++;
        res.errors.push({ rowNumber: rowNum, identifier: `Row #${rowNum}`, reason: 'SKU is required', rawData: row });
        failedRows.push(row);
        continue;
      }

      if (isNaN(qtyNum) || qtyNum < 0) {
        res.failed++;
        res.errors.push({ rowNumber: rowNum, identifier: sku, reason: `Invalid non-negative quantity: '${qtyNum}'`, rawData: row });
        failedRows.push(row);
        continue;
      }

      try {
        const product = await prisma.product.findUnique({ where: { sku } });
        if (!product) {
          res.failed++;
          res.errors.push({ rowNumber: rowNum, identifier: sku, reason: `Product with SKU '${sku}' does not exist`, rawData: row });
          failedRows.push(row);
          continue;
        }

        const inv = await prisma.inventory.findFirst({ where: { productId: product.id } });
        const currentAvail = inv ? inv.availableStock : 0;
        let newStock = currentAvail;

        let txType: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT' = 'STOCK_IN';

        if (actionType === 'STOCK_UPDATE' || actionType === 'SET') {
          newStock = qtyNum;
          txType = 'ADJUSTMENT';
        } else if (actionType === 'STOCK_OUT') {
          if (currentAvail < qtyNum) {
            res.failed++;
            res.errors.push({ rowNumber: rowNum, identifier: sku, reason: `Insufficient stock (${currentAvail}) for Stock-Out (${qtyNum})`, rawData: row });
            failedRows.push(row);
            continue;
          }
          newStock = currentAvail - qtyNum;
          txType = 'STOCK_OUT';
        } else {
          newStock = currentAvail + qtyNum;
          txType = 'STOCK_IN';
        }

        await prisma.$transaction(async (tx) => {
          let updatedInv;
          if (inv) {
            updatedInv = await tx.inventory.update({
              where: { id: inv.id },
              data: {
                availableStock: newStock,
                warehouseLocation: location || inv.warehouseLocation
              }
            });
          } else {
            updatedInv = await tx.inventory.create({
              data: {
                productId: product.id,
                availableStock: newStock,
                warehouseLocation: location || null
              }
            });
          }

          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: newStock }
          });

          await tx.stockTransaction.create({
            data: {
              productId: product.id,
              inventoryId: updatedInv.id,
              transactionType: txType,
              quantity: qtyNum,
              previousStock: currentAvail,
              newStock: newStock,
              reference: 'BULK_IMPORT',
              remarks,
              createdBy: userId
            }
          });
        });

        res.imported++;
      } catch (err: any) {
        res.failed++;
        res.errors.push({ rowNumber: rowNum, identifier: sku, reason: err.message || 'Database error', rawData: row });
        failedRows.push(row);
      }
    }
  }

  /**
   * 4. Import Warehouses
   */
  private async importWarehouses(
    rows: Record<string, any>[],
    res: ImportResult,
    failedRows: Record<string, any>[]
  ): Promise<void> {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      const code = this.getVal(row, 'Warehouse Code', 'warehouseCode', 'Code');
      const name = this.getVal(row, 'Warehouse Name', 'name', 'Warehouse');
      const contactPerson = this.getVal(row, 'Contact Person', 'contactPerson', 'Contact');
      const contactNumber = this.getVal(row, 'Contact Number', 'contactNumber', 'Phone');
      const address = this.getVal(row, 'Address', 'address');

      if (!code) {
        res.failed++;
        res.errors.push({ rowNumber: rowNum, identifier: `Row #${rowNum}`, reason: 'Warehouse Code is required', rawData: row });
        failedRows.push(row);
        continue;
      }

      if (!name) {
        res.failed++;
        res.errors.push({ rowNumber: rowNum, identifier: code, reason: 'Warehouse Name is required', rawData: row });
        failedRows.push(row);
        continue;
      }

      try {
        const existing = await prisma.warehouse.findFirst({
          where: { OR: [{ code }, { name }] }
        });

        if (existing) {
          await prisma.warehouse.update({
            where: { id: existing.id },
            data: {
              name,
              contactPerson: contactPerson || existing.contactPerson,
              contactNumber: contactNumber || existing.contactNumber,
              address: address || existing.address,
              status: 'ACTIVE'
            }
          });
          res.updated++;
        } else {
          await prisma.warehouse.create({
            data: {
              code,
              name,
              contactPerson: contactPerson || 'N/A',
              contactNumber: contactNumber || '0000000000',
              address: address || 'N/A',
              status: 'ACTIVE'
            }
          });
          res.imported++;
        }
      } catch (err: any) {
        res.failed++;
        res.errors.push({ rowNumber: rowNum, identifier: code, reason: err.message || 'Database error', rawData: row });
        failedRows.push(row);
      }
    }
  }
}
