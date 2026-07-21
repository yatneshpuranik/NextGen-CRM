import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const controller = new ReportsController();

// Require JWT authentication for all reports
router.use(authenticateJWT);

/**
 * @openapi
 * /reports/sales:
 *   get:
 *     summary: Retrieve Sales Report
 *     description: Returns paginated confirmed/completed sales challans. Restricted to ADMIN, SALES, and ACCOUNTS.
 *     tags:
 *       - Reports & Auditing
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Sales report retrieved.
 */
router.get(
  '/sales',
  authorizeRoles('ADMIN', 'SALES', 'ACCOUNTS'),
  controller.getSalesReport
);

/**
 * @openapi
 * /reports/inventory:
 *   get:
 *     summary: Retrieve Inventory Report
 *     description: Returns available stocks, valuations, and locations. Restricted to ADMIN, WAREHOUSE, and ACCOUNTS.
 *     tags:
 *       - Reports & Auditing
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [LOW_STOCK, OUT_OF_STOCK, OK]
 *     responses:
 *       200:
 *         description: Inventory report retrieved.
 */
router.get(
  '/inventory',
  authorizeRoles('ADMIN', 'WAREHOUSE', 'ACCOUNTS'),
  controller.getInventoryReport
);

/**
 * @openapi
 * /reports/products:
 *   get:
 *     summary: Retrieve Product Catalog Report
 *     description: Returns list of products. Restricted to ADMIN, WAREHOUSE, and SALES.
 *     tags:
 *       - Reports & Auditing
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Product report retrieved.
 */
router.get(
  '/products',
  authorizeRoles('ADMIN', 'WAREHOUSE', 'SALES'),
  controller.getProductReport
);

/**
 * @openapi
 * /reports/customers:
 *   get:
 *     summary: Retrieve Customer CRM Report
 *     description: Returns customer sales totals and dates. Restricted to ADMIN and SALES.
 *     tags:
 *       - Reports & Auditing
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Customer report retrieved.
 */
router.get(
  '/customers',
  authorizeRoles('ADMIN', 'SALES'),
  controller.getCustomerReport
);

/**
 * @openapi
 * /reports/stock-movements:
 *   get:
 *     summary: Retrieve Stock Movement Report
 *     description: Returns list of stock transactions. Restricted to ADMIN and WAREHOUSE.
 *     tags:
 *       - Reports & Auditing
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *       - in: query
 *         name: transactionType
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Stock movements report retrieved.
 */
router.get(
  '/stock-movements',
  authorizeRoles('ADMIN', 'WAREHOUSE'),
  controller.getStockMovementReport
);

/**
 * @openapi
 * /reports/challans:
 *   get:
 *     summary: Retrieve Challan Audit Report
 *     description: Returns global list of delivery challans. Accessible by all authenticated roles.
 *     tags:
 *       - Reports & Auditing
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Challans report retrieved.
 */
router.get(
  '/challans',
  authorizeRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  controller.getChallanReport
);

export default router;
