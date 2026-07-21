import { Router } from 'express';
import { WarehouseController } from './warehouse.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const controller = new WarehouseController();

// Require JWT for all warehouse paths
router.use(authenticateJWT);

/**
 * @openapi
 * /warehouses/dashboard/summary:
 *   get:
 *     summary: Get Warehouse Summary Statistics
 *     description: Returns aggregated numbers of active warehouses and physical stock levels.
 *     tags:
 *       - Warehouse Management
 *     responses:
 *       200:
 *         description: Success dashboard summary payload.
 */
router.get('/dashboard/summary', controller.getDashboardSummary);

/**
 * @openapi
 * /warehouses/transfer:
 *   post:
 *     summary: Transfer Stock between Warehouses
 *     description: Moves inventory stock units from source to destination warehouse inside transaction lock.
 *     tags:
 *       - Warehouse Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sourceWarehouseId
 *               - destWarehouseId
 *               - productId
 *               - quantity
 *             properties:
 *               sourceWarehouseId:
 *                 type: string
 *               destWarehouseId:
 *                 type: string
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transfer logged successfully.
 */
router.post('/transfer', controller.transfer);

/**
 * @openapi
 * /warehouses:
 *   get:
 *     summary: List Warehouses
 *     description: Returns list of warehouses with search and pagination support.
 *     tags:
 *       - Warehouse Management
 *     responses:
 *       200:
 *         description: Array of warehouses records.
 *   post:
 *     summary: Create Warehouse
 *     description: Registers a new warehouse profile (restricted to ADMIN/MANAGER).
 *     tags:
 *       - Warehouse Management
 *     responses:
 *       201:
 *         description: Warehouse created.
 */
router.get('/', controller.list);
router.post('/', authorizeRoles('ADMIN', 'WAREHOUSE'), controller.create);

/**
 * @openapi
 * /warehouses/{id}:
 *   get:
 *     summary: Get Warehouse Details
 *     description: Retrieves details of a specific warehouse including active inventories.
 *     tags:
 *       - Warehouse Management
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Warehouse profile details.
 *   put:
 *     summary: Update Warehouse
 *     description: Updates profile details of a warehouse (restricted to ADMIN/WAREHOUSE).
 *     tags:
 *       - Warehouse Management
 *     responses:
 *       200:
 *         description: Warehouse updated.
 */
router.get('/:id', controller.getDetails);
router.put('/:id', authorizeRoles('ADMIN', 'WAREHOUSE'), controller.update);

/**
 * @openapi
 * /warehouses/{id}/stock:
 *   get:
 *     summary: Get Warehouse Stock levels
 *     description: Retrieves active inventory stock records in the warehouse.
 *     tags:
 *       - Warehouse Management
 *     responses:
 *       200:
 *         description: Stock levels array.
 */
router.get('/:id/stock', controller.getStock);

/**
 * @openapi
 * /warehouses/{id}/history:
 *   get:
 *     summary: Get Warehouse Transaction History
 *     description: Lists past stock transactions (STOCK_IN/STOCK_OUT) inside the warehouse.
 *     tags:
 *       - Warehouse Management
 *     responses:
 *       200:
 *         description: Paginated transaction logs.
 */
router.get('/:id/history', controller.getHistory);

export default router;
