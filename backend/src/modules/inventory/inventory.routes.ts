import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validate.middleware';

import { 
  updateInventorySettingsValidator, 
  stockInValidator, 
  stockOutValidator, 
  stockAdjustmentValidator, 
  markDamageValidator, 
  stockReturnValidator 
} from './inventory.validator';

const router = Router();
const controller = new InventoryController();

// All routes are protected by JWT authentication
router.use(authenticateJWT);

/**
 * @openapi
 * /inventory:
 *   get:
 *     summary: Retrieve paginated inventory list
 *     description: Returns a paginated list of product inventories with available, reserved, and damaged stock levels. Accessible by all roles.
 *     tags:
 *       - Inventory & Stock Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *           default: "1"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *           default: "10"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by product name, SKU, product code, or warehouse location.
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by product category.
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by product brand.
 *       - in: query
 *         name: warehouse
 *         schema:
 *           type: string
 *         description: Filter by warehouse location.
 *       - in: query
 *         name: lowStock
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Show only low stock items.
 *       - in: query
 *         name: outOfStock
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Show only out of stock items.
 *       - in: query
 *         name: damaged
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Show only items with damaged stock.
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: ["productName", "currentStock", "updatedAt"]
 *           default: "productName"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: ["asc", "desc"]
 *           default: "asc"
 *     responses:
 *       200:
 *         description: Inventory list retrieved successfully.
 *       401:
 *         description: Unauthorized.
 */
router.get(
  '/', 
  authorizeRoles('ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'), 
  controller.getInventory
);

/**
 * @openapi
 * /inventory/summary:
 *   get:
 *     summary: Retrieve inventory summary statistics
 *     description: Returns aggregated metrics including total stock value, out of stock counts, and recent stock movements. Accessible by all roles.
 *     tags:
 *       - Inventory & Stock Management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary stats retrieved successfully.
 *       401:
 *         description: Unauthorized.
 */
router.get(
  '/summary', 
  authorizeRoles('ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'), 
  controller.getSummary
);

/**
 * @openapi
 * /inventory/low-stock:
 *   get:
 *     summary: Retrieve low stock product list
 *     description: Returns product inventory items where available stock is below or equal to the minimum stock level. Accessible by all roles.
 *     tags:
 *       - Inventory & Stock Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *           default: "1"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *           default: "10"
 *     responses:
 *       200:
 *         description: Low stock products retrieved successfully.
 */
router.get(
  '/low-stock', 
  authorizeRoles('ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'), 
  controller.getLowStock
);

/**
 * @openapi
 * /inventory/out-of-stock:
 *   get:
 *     summary: Retrieve out of stock product list
 *     description: Returns product inventory items where available stock is exactly zero. Accessible by all roles.
 *     tags:
 *       - Inventory & Stock Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *           default: "1"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *           default: "10"
 *     responses:
 *       200:
 *         description: Out of stock products retrieved successfully.
 */
router.get(
  '/out-of-stock', 
  authorizeRoles('ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'), 
  controller.getOutOfStock
);

/**
 * @openapi
 * /inventory/history:
 *   get:
 *     summary: Retrieve stock transaction history
 *     description: Returns a paginated log of all stock movements (In, Out, Adjust, Damage, Return). Accessible by all roles.
 *     tags:
 *       - Inventory & Stock Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *           default: "1"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *           default: "10"
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *         description: Filter by a specific product ID.
 *       - in: query
 *         name: transactionType
 *         schema:
 *           type: string
 *           enum: ["STOCK_IN", "STOCK_OUT", "ADJUSTMENT", "DAMAGE", "RETURN"]
 *         description: Filter by a transaction type.
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Lower boundary of transaction date.
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Upper boundary of transaction date.
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully.
 */
router.get(
  '/history', 
  authorizeRoles('ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'), 
  controller.getTransactionHistory
);

/**
 * @openapi
 * /inventory/product/{productId}:
 *   get:
 *     summary: Retrieve inventory settings and levels for a specific product
 *     description: Returns inventory settings and levels for a single product. Accessible by all roles.
 *     tags:
 *       - Inventory & Stock Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Single product inventory retrieved successfully.
 *       404:
 *         description: Product or inventory not found.
 */
router.get(
  '/product/:productId', 
  authorizeRoles('ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'), 
  controller.getInventoryByProductId
);

/**
 * @openapi
 * /inventory/product/{productId}/settings:
 *   put:
 *     summary: Update inventory configuration levels for a product
 *     description: Configures minimum, maximum, and reorder stock levels as well as warehouse locations. Restricted to ADMIN and WAREHOUSE.
 *     tags:
 *       - Inventory & Stock Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               minimumStock:
 *                 type: integer
 *                 example: 5
 *               maximumStock:
 *                 type: integer
 *                 example: 1000
 *               reorderLevel:
 *                 type: integer
 *                 example: 10
 *               warehouseLocation:
 *                 type: string
 *                 example: "Aisle 3, Shelf B"
 *     responses:
 *       200:
 *         description: Settings updated successfully.
 *       400:
 *         description: Invalid input parameters.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Product or inventory not found.
 */
router.put(
  '/product/:productId/settings', 
  authorizeRoles('ADMIN', 'WAREHOUSE'), 
  updateInventorySettingsValidator, 
  validateRequest, 
  controller.updateSettings
);

/**
 * @openapi
 * /inventory/stock-in:
 *   post:
 *     summary: Increase inventory stock level
 *     description: Ingests new stock into the available pool. Creates a STOCK_IN ledger entry. Restricted to ADMIN and WAREHOUSE.
 *     tags:
 *       - Inventory & Stock Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 50
 *               reference:
 *                 type: string
 *                 example: "PO-2026-0034"
 *               remarks:
 *                 type: string
 *                 example: "Monthly warehouse procurement intake."
 *     responses:
 *       200:
 *         description: Stock-in transaction completed.
 */
router.post(
  '/stock-in', 
  authorizeRoles('ADMIN', 'WAREHOUSE'), 
  stockInValidator, 
  validateRequest, 
  controller.stockIn
);

/**
 * @openapi
 * /inventory/stock-out:
 *   post:
 *     summary: Decrease inventory stock level
 *     description: Dispatches stock from the available pool. Creates a STOCK_OUT ledger entry. Restricted to ADMIN and WAREHOUSE.
 *     tags:
 *       - Inventory & Stock Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 10
 *               reference:
 *                 type: string
 *                 example: "CHALLAN-903"
 *               remarks:
 *                 type: string
 *                 example: "Dispatched under sales challan."
 *     responses:
 *       200:
 *         description: Stock-out transaction completed.
 */
router.post(
  '/stock-out', 
  authorizeRoles('ADMIN', 'WAREHOUSE'), 
  stockOutValidator, 
  validateRequest, 
  controller.stockOut
);

/**
 * @openapi
 * /inventory/adjust:
 *   post:
 *     summary: Adjust inventory stock level manually
 *     description: Sets the available stock level directly. Creates an ADJUSTMENT ledger entry reflecting the change. Restricted to ADMIN and WAREHOUSE.
 *     tags:
 *       - Inventory & Stock Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *                 example: 35
 *               remarks:
 *                 type: string
 *                 example: "Inventory audit correction."
 *     responses:
 *       200:
 *         description: Stock adjustment transaction completed.
 */
router.post(
  '/adjust', 
  authorizeRoles('ADMIN', 'WAREHOUSE'), 
  stockAdjustmentValidator, 
  validateRequest, 
  controller.adjustStock
);

/**
 * @openapi
 * /inventory/damage:
 *   post:
 *     summary: Mark stock as damaged
 *     description: Deducts stock from the available pool and moves it into the damaged pool. Creates a DAMAGE ledger entry. Restricted to ADMIN and WAREHOUSE.
 *     tags:
 *       - Inventory & Stock Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 5
 *               reference:
 *                 type: string
 *                 example: "AUDIT-2026-Q3"
 *               remarks:
 *                 type: string
 *                 example: "Damaged during warehouse transit."
 *     responses:
 *       200:
 *         description: Damage transaction completed.
 */
router.post(
  '/damage', 
  authorizeRoles('ADMIN', 'WAREHOUSE'), 
  markDamageValidator, 
  validateRequest, 
  controller.markDamage
);

/**
 * @openapi
 * /inventory/return:
 *   post:
 *     summary: Record returned stock
 *     description: Returns stock and deposits it in either the available or damaged pool. Creates a RETURN ledger entry. Restricted to ADMIN and WAREHOUSE.
 *     tags:
 *       - Inventory & Stock Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *               - returnToType
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *               returnToType:
 *                 type: string
 *                 enum: ["AVAILABLE", "DAMAGED"]
 *                 example: "AVAILABLE"
 *               reference:
 *                 type: string
 *                 example: "RET-2026-0005"
 *               remarks:
 *                 type: string
 *                 example: "Customer return - unused product."
 *     responses:
 *       200:
 *         description: Return transaction completed.
 */
router.post(
  '/return', 
  authorizeRoles('ADMIN', 'WAREHOUSE'), 
  stockReturnValidator, 
  validateRequest, 
  controller.returnStock
);

export default router;
