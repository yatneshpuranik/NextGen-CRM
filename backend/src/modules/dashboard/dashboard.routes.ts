import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

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
router.get('/summary', controller.getSummary);

/**
 * @openapi
 * /dashboard/sales-overview:
 *   get:
 *     summary: Retrieve daily, weekly, and monthly sales vectors
 *     description: Returns daily, weekly, and monthly revenue and count vectors for charts. Accessible by all authenticated roles.
 *     tags:
 *       - Dashboard & Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sales trends retrieved.
 */
router.get('/sales-overview', controller.getSalesOverview);

/**
 * @openapi
 * /dashboard/inventory-overview:
 *   get:
 *     summary: Retrieve inventory valuation and category distribution
 *     description: Returns categories, item valuations, and low stock counts. Accessible by all authenticated roles.
 *     tags:
 *       - Dashboard & Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory stats retrieved.
 */
router.get('/inventory-overview', controller.getInventoryOverview);

/**
 * @openapi
 * /dashboard/customer-overview:
 *   get:
 *     summary: Retrieve customer registrations growth and top spenders list
 *     description: Returns top customer spenders and growth curves for charts. Accessible by all authenticated roles.
 *     tags:
 *       - Dashboard & Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer metrics retrieved.
 */
router.get('/customer-overview', controller.getCustomerOverview);

/**
 * @openapi
 * /dashboard/recent-activity:
 *   get:
 *     summary: Retrieve recent activities timeline feed
 *     description: Compiles unified chronological list of new signups, product edits, challans, and stock logs. Accessible by all authenticated roles.
 *     tags:
 *       - Dashboard & Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activity timeline logs retrieved.
 */
router.get('/recent-activity', controller.getRecentActivity);

/**
 * @openapi
 * /dashboard/top-products:
 *   get:
 *     summary: Retrieve top 5 selling products list
 *     description: Returns list of products sorted by units sold. Accessible by all authenticated roles.
 *     tags:
 *       - Dashboard & Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top products ranked successfully.
 */
router.get('/top-products', controller.getTopProducts);

/**
 * @openapi
 * /dashboard/low-stock:
 *   get:
 *     summary: Retrieve products with stock levels warning warning thresholds
 *     description: Returns list of low stock products warning alert checks. Accessible by all authenticated roles.
 *     tags:
 *       - Dashboard & Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Low stock warning list retrieved.
 */
router.get('/low-stock', controller.getLowStock);

export default router;
