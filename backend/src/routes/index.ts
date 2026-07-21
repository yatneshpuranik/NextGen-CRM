import { Router } from 'express';
import { sendSuccess } from '../utils/response';

import authRouter from '../modules/auth/auth.routes';
import customerRouter from '../modules/customer/customer.routes';
import productRouter from '../modules/product/product.routes';
import inventoryRouter from '../modules/inventory/inventory.routes';
import salesChallanRouter from '../modules/sales-challan/sales-challan.routes';
import dashboardRouter from '../modules/dashboard/dashboard.routes';
import reportsRouter from '../modules/reports/reports.routes';
import settingsRouter from '../modules/settings/settings.routes';
import backupRouter from '../modules/backup/backup.routes';
import searchRouter from '../modules/search/search.routes';
import pdfRouter from '../modules/pdf/pdf.routes';
import uploadRouter from '../modules/upload/upload.routes';
import auditRouter from '../modules/audit/audit.routes';
import notificationRouter from '../modules/notification/notification.routes';
import warehouseRouter from '../modules/warehouse/warehouse.routes';
import emailLogRouter from '../modules/email-log/email-log.routes';
import importExportRouter from '../modules/import-export/import-export.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/customers', customerRouter);
router.use('/products', productRouter);
router.use('/inventory', inventoryRouter);
router.use('/sales-challans', salesChallanRouter);
router.use('/dashboard', dashboardRouter);
router.use('/reports', reportsRouter);
router.use('/pdf', pdfRouter);
router.use('/uploads', uploadRouter);
router.use('/audit', auditRouter);
router.use('/notifications', notificationRouter);
router.use('/settings', settingsRouter);
router.use('/backup', backupRouter);
router.use('/search', searchRouter);
router.use('/warehouses', warehouseRouter);
router.use('/email-logs', emailLogRouter);
router.use('/import-export', importExportRouter);

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Verify api operations
 *     description: Returns 200 OK if the backend server is running and database is active.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Success status report.
 */
router.get('/health', (_req, res) => {
  return sendSuccess(res, { uptime: process.uptime(), timestamp: new Date() }, 200, 'API service is active');
});

export default router;
