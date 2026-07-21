import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const controller = new DashboardController();

// All dashboard endpoints require JWT authentication
router.use(authenticateJWT);

/**
 * @openapi
 * /dashboard/summary:
 *   get:
 *     summary: Retrieve aggregate counters and values
 *     description: Returns totals for customers, products, stock values, monthly/daily revenue, and challans split by status. Accessible by all authenticated roles.
 *     tags:
 *       - Dashboard & Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary aggregates computed successfully.
 */
router.get('/summary', authorizeRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), controller.getSummary);
router.get('/sales-overview', authorizeRoles('ADMIN', 'SALES', 'ACCOUNTS'), controller.getSalesOverview);
router.get('/inventory-overview', authorizeRoles('ADMIN', 'WAREHOUSE'), controller.getInventoryOverview);
router.get('/customer-overview', authorizeRoles('ADMIN', 'SALES', 'ACCOUNTS'), controller.getCustomerOverview);
router.get('/recent-activity', authorizeRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), controller.getRecentActivity);
router.get('/top-products', authorizeRoles('ADMIN', 'SALES', 'ACCOUNTS'), controller.getTopProducts);
router.get('/low-stock', authorizeRoles('ADMIN', 'WAREHOUSE'), controller.getLowStock);

export default router;
