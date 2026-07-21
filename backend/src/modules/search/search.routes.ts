import { Router } from 'express';
import { SearchController } from './search.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

const router = Router();
const controller = new SearchController();

// Require JWT for all search routes
router.use(authenticateJWT);

/**
 * @openapi
 * /search:
 *   get:
 *     summary: Global System Search
 *     description: Searches across Customers, Products, Inventory, and Delivery Challans.
 *     tags:
 *       - Navigation & Search
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results maps returned.
 */
router.get('/', controller.search);

export default router;
