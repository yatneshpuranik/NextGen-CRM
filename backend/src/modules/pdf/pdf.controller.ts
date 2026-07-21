import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db';
import { PdfService } from './pdf.service';
import { NotFoundError } from '../../utils/errors';

export class PdfController {
  private pdfService: PdfService;

  constructor() {
    this.pdfService = new PdfService();
  }

  /**
   * Stream Sales Challan PDF
   */
  public getChallanPDF = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const challan = await prisma.salesChallan.findUnique({
        where: { id },
        include: {
          customer: true,
          createdByUser: {
            select: { fullName: true }
          },
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

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="challan-${challan.challanNumber}.pdf"`);
      
      this.pdfService.generateChallanPDF(challan, res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Stream Invoice PDF
   */
  public getInvoicePDF = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const challan = await prisma.salesChallan.findUnique({
        where: { id },
        include: {
          customer: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (!challan) {
        throw new NotFoundError('Invoice matching this sales record not found');
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="invoice-INV-${challan.challanNumber.substring(4)}.pdf"`);
      
      this.pdfService.generateInvoicePDF(challan, res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Stream Customer Profile Details PDF
   */
  public getCustomerPDF = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          challans: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });

      if (!customer) {
        throw new NotFoundError('Customer record not found');
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="customer-${customer.customerCode}.pdf"`);
      
      this.pdfService.generateCustomerPDF(customer, res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Stream Inventory Report PDF
   */
  public getInventoryPDF = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const inventoryRecords = await prisma.inventory.findMany({
        where: {
          product: { isDeleted: false }
        },
        include: {
          product: true
        },
        orderBy: { availableStock: 'asc' }
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="inventory-report.pdf"`);
      
      this.pdfService.generateInventoryPDF(inventoryRecords, res);
    } catch (error) {
      next(error);
    }
  };
}
