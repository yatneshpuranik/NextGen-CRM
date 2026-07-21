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
router.get('/dashboard/summary', authorizeRoles('ADMIN', 'WAREHOUSE'), controller.getDashboardSummary);
router.post('/transfer', authorizeRoles('ADMIN', 'WAREHOUSE'), controller.transfer);
router.get('/', authorizeRoles('ADMIN', 'WAREHOUSE'), controller.list);
router.post('/', authorizeRoles('ADMIN', 'WAREHOUSE'), controller.create);
router.get('/:id', authorizeRoles('ADMIN', 'WAREHOUSE'), controller.getDetails);
router.put('/:id', authorizeRoles('ADMIN', 'WAREHOUSE'), controller.update);
router.get('/:id/stock', authorizeRoles('ADMIN', 'WAREHOUSE'), controller.getStock);
router.get('/:id/history', authorizeRoles('ADMIN', 'WAREHOUSE'), controller.getHistory);

export default router;
