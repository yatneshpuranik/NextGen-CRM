import PDFDocument from 'pdfkit';
import { Response } from 'express';

export class PdfService {
  /**
   * Draw standard corporate brand header
   */
  private drawHeader(doc: PDFKit.PDFDocument, title: string): void {
    // Top primary color accent line
    doc.rect(0, 0, 595.28, 15).fill('#085041'); // Teal theme color

    // Brand Name
    doc.fillColor('#04342C')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text('NEXTGEN ERP SYSTEM', 50, 40);

    // Document Title
    doc.fillColor('#1a1a18')
       .fontSize(14)
       .font('Helvetica-Bold')
       .text(title.toUpperCase(), 50, 65);

    // Meta Info Column Right-aligned
    doc.fillColor('#5f5e5a')
       .fontSize(9)
       .font('Helvetica')
       .text('NextGen Enterprise solutions Ltd.', 380, 40, { align: 'right', width: 165 })
       .text('Industrial Zone Block B, Sector 63', 380, 52, { align: 'right', width: 165 })
       .text('Email: info@nextgenerp.com', 380, 64, { align: 'right', width: 165 })
       .text('Uptime Support Helpline: 1800-444-222', 380, 76, { align: 'right', width: 165 });

    // Decorative separator line
    doc.moveTo(50, 95)
       .lineTo(545, 95)
       .strokeColor('rgba(0,0,0,0.08)')
       .lineWidth(1)
       .stroke();
  }

  /**
   * Draw standard bottom A4 page footer
   */
  private drawFooter(doc: PDFKit.PDFDocument): void {
    const pageCount = doc.bufferedPageRange().count;
    
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      
      doc.moveTo(50, 790)
         .lineTo(545, 790)
         .strokeColor('rgba(0,0,0,0.08)')
         .lineWidth(1)
         .stroke();

      doc.fillColor('#888780')
         .fontSize(8)
         .font('Helvetica')
         .text('This is a system generated secure document. Signature not required.', 50, 800, { align: 'left' })
         .text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} - Page ${i + 1} of ${pageCount}`, 300, 800, { align: 'right', width: 245 });
    }
  }

  /**
   * Draw table grid onto PDFKit document
   */
  private drawTable(
    doc: PDFKit.PDFDocument,
    startY: number,
    headers: string[],
    widths: number[],
    rows: string[][],
    aligns?: ('left' | 'center' | 'right')[]
  ): number {
    let y = startY;
    
    // Draw header background
    doc.rect(50, y, 495, 20).fill('#E1F5EE');
    
    // Draw header text
    doc.fillColor('#085041').font('Helvetica-Bold').fontSize(9);
    let currentX = 50;
    for (let i = 0; i < headers.length; i++) {
      const align = aligns ? aligns[i] : 'left';
      doc.text(headers[i], currentX + 5, y + 6, { width: widths[i] - 10, align });
      currentX += widths[i];
    }
    
    y += 20;
    
    // Draw row items
    doc.font('Helvetica').fontSize(8).fillColor('#1a1a18');
    
    rows.forEach((row, rowIndex) => {
      // Row page-split safety buffer
      if (y > 730) {
        doc.addPage();
        this.drawHeader(doc, 'Report Appendix');
        y = 120;
        
        // Redraw table headers on new page
        doc.rect(50, y, 495, 20).fill('#E1F5EE');
        doc.fillColor('#085041').font('Helvetica-Bold').fontSize(9);
        let nX = 50;
        for (let i = 0; i < headers.length; i++) {
          const align = aligns ? aligns[i] : 'left';
          doc.text(headers[i], nX + 5, y + 6, { width: widths[i] - 10, align });
          nX += widths[i];
        }
        y += 20;
        doc.font('Helvetica').fontSize(8).fillColor('#1a1a18');
      }
      
      // Zebra shading background
      if (rowIndex % 2 === 1) {
        doc.rect(50, y, 495, 18).fill('#f5f4ef');
        doc.fillColor('#1a1a18');
      }
      
      let rX = 50;
      row.forEach((cell, cellIndex) => {
        const align = aligns ? aligns[cellIndex] : 'left';
        doc.text(cell, rX + 5, y + 5, { width: widths[cellIndex] - 10, align });
        rX += widths[cellIndex];
      });
      
      y += 18;
    });

    return y;
  }

  /**
   * Generates a Sales Challan PDF
   */
  public generateChallanPDF(challan: any, res: Response): void {
    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
    doc.pipe(res);

    this.drawHeader(doc, 'Delivery Sales Challan');

    // Customer & Metadata Grid
    doc.fillColor('#5f5e5a').font('Helvetica-Bold').fontSize(10).text('CHALLAN METADATA', 50, 115);
    doc.font('Helvetica').fontSize(9).fillColor('#1a1a18')
       .text(`Challan Number: ${challan.challanNumber}`, 50, 130)
       .text(`Challan Date: ${new Date(challan.challanDate).toLocaleDateString()}`, 50, 142)
       .text(`Status: ${challan.status}`, 50, 154)
       .text(`Created By: ${challan.createdByUser?.fullName || 'N/A'}`, 50, 166);

    doc.font('Helvetica-Bold').fontSize(10).fillColor('#5f5e5a').text('CUSTOMER BILL TO / SHIP TO', 300, 115);
    doc.font('Helvetica').fontSize(9).fillColor('#1a1a18')
       .text(`Company Name: ${challan.customer.companyName}`, 300, 130)
       .text(`Contact Person: ${challan.customer.contactPerson}`, 300, 142)
       .text(`GSTIN ID: ${challan.customer.gstNumber || 'N/A'}`, 300, 154)
       .text(`Address: ${challan.customer.address}, ${challan.customer.city}, ${challan.customer.state}`, 300, 166);

    // Products table grid
    const headers = ['SKU / Item Details', 'Qty', 'Unit Price', 'GST %', 'GST Value', 'Total Value'];
    const widths = [185, 45, 65, 50, 65, 85];
    const rows = (challan.items || []).map((item: any) => [
      `${item.product.productName}\n(${item.product.sku})`,
      item.quantity.toString(),
      `₹${Number(item.price).toFixed(2)}`,
      `${Number(item.gstPercentage)}%`,
      `₹${Number(item.gstAmount).toFixed(2)}`,
      `₹${Number(item.totalAmount).toFixed(2)}`
    ]);

    const endY = this.drawTable(doc, 200, headers, widths, rows, ['left', 'center', 'right', 'center', 'right', 'right']);

    // Summary calculation card
    let summaryY = endY + 20;
    if (summaryY > 650) {
      doc.addPage();
      this.drawHeader(doc, 'Sales Challan Summary');
      summaryY = 120;
    }

    doc.rect(320, summaryY, 225, 100).fill('rgba(0,0,0,0.02)');
    doc.strokeColor('rgba(0,0,0,0.08)').lineWidth(1).rect(320, summaryY, 225, 100).stroke();

    doc.font('Helvetica').fontSize(9).fillColor('#5f5e5a');
    doc.text('Subtotal:', 330, summaryY + 12);
    doc.text('GST Amount:', 330, summaryY + 27);
    doc.text('Discount Allowance:', 330, summaryY + 42);

    doc.font('Helvetica-Bold').fillColor('#1a1a18');
    doc.text(`₹${Number(challan.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 430, summaryY + 12, { align: 'right', width: 105 });
    doc.text(`₹${Number(challan.gstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 430, summaryY + 27, { align: 'right', width: 105 });
    doc.text(`- ₹${Number(challan.discount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 430, summaryY + 42, { align: 'right', width: 105 });

    doc.moveTo(330, summaryY + 60).lineTo(535, summaryY + 60).strokeColor('rgba(0,0,0,0.08)').stroke();

    doc.fontSize(11).fillColor('#04342C');
    doc.text('Total Amount:', 330, summaryY + 70);
    doc.text(`₹${Number(challan.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 430, summaryY + 70, { align: 'right', width: 105 });

    // Remarks
    if (challan.remarks) {
      doc.fontSize(8).fillColor('#888780').font('Helvetica-Oblique').text(`Remarks: ${challan.remarks}`, 50, summaryY + 10);
    }

    this.drawFooter(doc);
    doc.end();
  }

  /**
   * Generates a tax invoice PDF based on Challan details
   */
  public generateInvoicePDF(challan: any, res: Response): void {
    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
    doc.pipe(res);

    this.drawHeader(doc, 'Commercial Tax Invoice');

    // Customer & Metadata Grid
    doc.fillColor('#5f5e5a').font('Helvetica-Bold').fontSize(10).text('INVOICE META DATA', 50, 115);
    doc.font('Helvetica').fontSize(9).fillColor('#1a1a18')
       .text(`Invoice Number: INV-${challan.challanNumber.substring(4)}`, 50, 130)
       .text(`Linked Challan: ${challan.challanNumber}`, 50, 142)
       .text(`Invoice Date: ${new Date(challan.challanDate).toLocaleDateString()}`, 50, 154)
       .text(`Reference Po: ERP-AUTO-${challan.id.substring(0,6).toUpperCase()}`, 50, 166);

    doc.font('Helvetica-Bold').fontSize(10).fillColor('#5f5e5a').text('BILLING CUSTOMER DETAILS', 300, 115);
    doc.font('Helvetica').fontSize(9).fillColor('#1a1a18')
       .text(`Company Name: ${challan.customer.companyName}`, 300, 130)
       .text(`Contact Person: ${challan.customer.contactPerson}`, 300, 142)
       .text(`GSTIN ID: ${challan.customer.gstNumber || 'N/A'}`, 300, 154)
       .text(`Address: ${challan.customer.address}, ${challan.customer.city}, ${challan.customer.state}`, 300, 166);

    // Products table grid
    const headers = ['SKU / Description', 'Qty', 'Unit Cost', 'Taxable Amt', 'GST rate', 'GST Total', 'Net Total'];
    const widths = [135, 35, 60, 70, 50, 60, 85];
    const rows = (challan.items || []).map((item: any) => {
      const taxable = Number(item.price) * item.quantity;
      return [
        `${item.product.productName}\n(${item.product.sku})`,
        item.quantity.toString(),
        `₹${Number(item.price).toFixed(2)}`,
        `₹${taxable.toFixed(2)}`,
        `${Number(item.gstPercentage)}%`,
        `₹${Number(item.gstAmount).toFixed(2)}`,
        `₹${Number(item.totalAmount).toFixed(2)}`
      ];
    });

    const endY = this.drawTable(doc, 200, headers, widths, rows, ['left', 'center', 'right', 'right', 'center', 'right', 'right']);

    // Summary calculation card
    let summaryY = endY + 20;
    if (summaryY > 650) {
      doc.addPage();
      this.drawHeader(doc, 'Invoice Summary');
      summaryY = 120;
    }

    doc.rect(320, summaryY, 225, 100).fill('rgba(0,0,0,0.02)');
    doc.strokeColor('rgba(0,0,0,0.08)').lineWidth(1).rect(320, summaryY, 225, 100).stroke();

    doc.font('Helvetica').fontSize(9).fillColor('#5f5e5a');
    doc.text('Taxable Subtotal:', 330, summaryY + 12);
    doc.text('Calculated Tax (GST):', 330, summaryY + 27);
    doc.text('Promo / Discount Deductions:', 330, summaryY + 42);

    doc.font('Helvetica-Bold').fillColor('#1a1a18');
    doc.text(`₹${Number(challan.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 430, summaryY + 12, { align: 'right', width: 105 });
    doc.text(`₹${Number(challan.gstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 430, summaryY + 27, { align: 'right', width: 105 });
    doc.text(`- ₹${Number(challan.discount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 430, summaryY + 42, { align: 'right', width: 105 });

    doc.moveTo(330, summaryY + 60).lineTo(535, summaryY + 60).strokeColor('rgba(0,0,0,0.08)').stroke();

    doc.fontSize(11).fillColor('#04342C');
    doc.text('Net Grand Total:', 330, summaryY + 70);
    doc.text(`₹${Number(challan.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 430, summaryY + 70, { align: 'right', width: 105 });

    this.drawFooter(doc);
    doc.end();
  }

  /**
   * Generates a tax invoice PDF based on Challan details as a Buffer for emailing
   */
  public generateInvoicePDFBuffer(challan: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
        const chunks: Buffer[] = [];
        
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));

        this.drawHeader(doc, 'Commercial Tax Invoice');

        // Customer & Metadata Grid
        doc.fillColor('#5f5e5a').font('Helvetica-Bold').fontSize(10).text('INVOICE META DATA', 50, 115);
        doc.font('Helvetica').fontSize(9).fillColor('#1a1a18')
           .text(`Invoice Number: INV-${challan.challanNumber.substring(4)}`, 50, 130)
           .text(`Linked Challan: ${challan.challanNumber}`, 50, 142)
           .text(`Invoice Date: ${new Date(challan.challanDate).toLocaleDateString()}`, 50, 154)
           .text(`Reference Po: ERP-AUTO-${challan.id.substring(0,6).toUpperCase()}`, 50, 166);

        doc.font('Helvetica-Bold').fontSize(10).fillColor('#5f5e5a').text('BILLING CUSTOMER DETAILS', 300, 115);
        doc.font('Helvetica').fontSize(9).fillColor('#1a1a18')
           .text(`Company Name: ${challan.customer.companyName}`, 300, 130)
           .text(`Contact Person: ${challan.customer.contactPerson}`, 300, 142)
           .text(`GSTIN ID: ${challan.customer.gstNumber || 'N/A'}`, 300, 154)
           .text(`Address: ${challan.customer.address}, ${challan.customer.city}, ${challan.customer.state}`, 300, 166);

        // Products table grid
        const headers = ['SKU / Description', 'Qty', 'Unit Cost', 'Taxable Amt', 'GST rate', 'GST Total', 'Net Total'];
        const widths = [135, 35, 60, 70, 50, 60, 85];
        const rows = (challan.items || []).map((item: any) => {
          const taxable = Number(item.price) * item.quantity;
          return [
            `${item.product.productName}\n(${item.product.sku})`,
            item.quantity.toString(),
            `₹${Number(item.price).toFixed(2)}`,
            `₹${taxable.toFixed(2)}`,
            `${Number(item.gstPercentage)}%`,
            `₹${Number(item.gstAmount).toFixed(2)}`,
            `₹${Number(item.totalAmount).toFixed(2)}`
          ];
        });

        const endY = this.drawTable(doc, 200, headers, widths, rows, ['left', 'center', 'right', 'right', 'center', 'right', 'right']);

        // Summary calculation card
        let summaryY = endY + 20;
        if (summaryY > 650) {
          doc.addPage();
          this.drawHeader(doc, 'Invoice Summary');
          summaryY = 120;
        }

        doc.rect(320, summaryY, 225, 100).fill('rgba(0,0,0,0.02)');
        doc.strokeColor('rgba(0,0,0,0.08)').lineWidth(1).rect(320, summaryY, 225, 100).stroke();

        doc.font('Helvetica').fontSize(9).fillColor('#5f5e5a');
        doc.text('Taxable Subtotal:', 330, summaryY + 12);
        doc.text('Calculated Tax (GST):', 330, summaryY + 27);
        doc.text('Promo / Discount Deductions:', 330, summaryY + 42);

        doc.font('Helvetica-Bold').fillColor('#1a1a18');
        doc.text(`₹${Number(challan.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 430, summaryY + 12, { align: 'right', width: 105 });
        doc.text(`₹${Number(challan.gstAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 430, summaryY + 27, { align: 'right', width: 105 });
        doc.text(`- ₹${Number(challan.discount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 430, summaryY + 42, { align: 'right', width: 105 });

        doc.moveTo(330, summaryY + 60).lineTo(535, summaryY + 60).strokeColor('rgba(0,0,0,0.08)').stroke();

        doc.fontSize(11).fillColor('#04342C');
        doc.text('Net Grand Total:', 330, summaryY + 70);
        doc.text(`₹${Number(challan.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 430, summaryY + 70, { align: 'right', width: 105 });

        this.drawFooter(doc);
        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Generates Customer details document PDF
   */
  public generateCustomerPDF(customer: any, res: Response): void {
    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
    doc.pipe(res);

    this.drawHeader(doc, 'Customer Account details');

    // Customer details overview card
    doc.rect(50, 110, 495, 140).fill('#f5f4ef');
    doc.strokeColor('rgba(0,0,0,0.08)').lineWidth(1).rect(50, 110, 495, 140).stroke();

    doc.fillColor('#04342C').font('Helvetica-Bold').fontSize(12).text(customer.companyName, 65, 125);
    doc.fillColor('#5f5e5a').font('Helvetica').fontSize(9)
       .text(`Client Code: ${customer.customerCode}`, 65, 145)
       .text(`Contact Person: ${customer.contactPerson}`, 65, 157)
       .text(`Email Address: ${customer.email}`, 65, 169)
       .text(`Phone: ${customer.phone}`, 65, 181)
       .text(`GSTIN ID: ${customer.gstNumber || 'N/A'}`, 65, 193);

    doc.font('Helvetica-Bold').fontSize(9).fillColor('#085041')
       .text('Primary Billing Location Address:', 300, 145);
    doc.font('Helvetica').fontSize(9).fillColor('#1a1a18')
       .text(customer.address, 300, 157, { width: 220 })
       .text(`${customer.city}, ${customer.state}, ${customer.pincode}`, 300, 181)
       .text(customer.country, 300, 193);

    // Sales ledger activity header
    doc.fillColor('#5f5e5a').font('Helvetica-Bold').fontSize(11).text('Recent Sales Ledger Activity', 50, 275);

    const headers = ['Challan #', 'Challan Date', 'Status', 'Tax (₹)', 'Total Amount (₹)'];
    const widths = [105, 95, 85, 90, 120];
    const rows = (customer.challans || []).map((ch: any) => [
      ch.challanNumber,
      new Date(ch.challanDate).toLocaleDateString(),
      ch.status,
      `₹${Number(ch.gstAmount).toFixed(2)}`,
      `₹${Number(ch.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
    ]);

    this.drawTable(doc, 295, headers, widths, rows, ['left', 'center', 'center', 'right', 'right']);

    this.drawFooter(doc);
    doc.end();
  }

  /**
   * Generates global Inventory Report spreadsheet PDF
   */
  public generateInventoryPDF(inventoryRecords: any[], res: Response): void {
    const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
    doc.pipe(res);

    this.drawHeader(doc, 'Inventory Stock Valuation Report');

    // Overview Metadata calculations
    const totalAssetValuation = inventoryRecords.reduce((sum, item) => sum + (Number(item.product.purchasePrice) * item.availableStock), 0);
    const totalPhysicalItems = inventoryRecords.reduce((sum, item) => sum + item.availableStock, 0);

    doc.rect(50, 115, 495, 45).fill('#EEEDFE');
    doc.strokeColor('rgba(0,0,0,0.08)').lineWidth(1).rect(50, 115, 495, 45).stroke();

    doc.fillColor('#3C3489').font('Helvetica-Bold').fontSize(10)
       .text(`Total Physical Stock: ${totalPhysicalItems} units`, 65, 125)
       .text(`Total Asset Book Valuation: ₹${totalAssetValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 65, 137);

    doc.fillColor('#5f5e5a').font('Helvetica').fontSize(8)
       .text(`Unique SKU entries: ${inventoryRecords.length} catalog items`, 360, 130, { align: 'right', width: 165 });

    // Table rows
    const headers = ['Product / Brand', 'SKU Code', 'Category', 'Avail Stock', 'Min Stock', 'Unit Cost', 'Cost Value (₹)'];
    const widths = [135, 55, 65, 50, 45, 55, 90];
    const rows = inventoryRecords.map((item) => {
      const costValue = Number(item.product.purchasePrice) * item.availableStock;
      return [
        `${item.product.productName}\n(${item.product.brand})`,
        item.product.sku,
        item.product.category,
        item.availableStock.toString(),
        item.minimumStock.toString(),
        `₹${Number(item.product.purchasePrice).toFixed(2)}`,
        `₹${costValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
      ];
    });

    this.drawTable(doc, 175, headers, widths, rows, ['left', 'left', 'left', 'center', 'center', 'right', 'right']);

    this.drawFooter(doc);
    doc.end();
  }
}
