import { Router } from 'express';
import { PdfController } from './pdf.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

const router = Router();
const controller = new PdfController();

// Secure all PDF routes under JWT authentication
router.use(authenticateJWT);

/**
 * @openapi
 * /pdf/challan/{id}:
 *   get:
 *     summary: Download Delivery Sales Challan PDF
 *     description: Generates and streams A4 format PDF representing a specific Delivery Challan.
 *     tags:
 *       - Document & PDF Generation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF file binary stream returned.
 */
router.get('/challan/:id', controller.getChallanPDF);

/**
 * @openapi
 * /pdf/invoice/{id}:
 *   get:
 *     summary: Download Commercial Tax Invoice PDF
 *     description: Generates and streams A4 tax invoice PDF for a specific confirmed sales record.
 *     tags:
 *       - Document & PDF Generation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF invoice file binary stream returned.
 */
router.get('/invoice/:id', controller.getInvoicePDF);

/**
 * @openapi
 * /pdf/customer/{id}:
 *   get:
 *     summary: Download Customer details summary PDF
 *     description: Generates A4 customer details summary report with transaction counts ledger.
 *     tags:
 *       - Document & PDF Generation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF file binary stream returned.
 */
router.get('/customer/:id', controller.getCustomerPDF);

/**
 * @openapi
 * /pdf/report/inventory:
 *   get:
 *     summary: Download Global Inventory Asset Valuation PDF
 *     description: Streams consolidated catalog SKU inventory stocks report PDF.
 *     tags:
 *       - Document & PDF Generation
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PDF file binary stream returned.
 */
router.get('/report/inventory', controller.getInventoryPDF);

export default router;
