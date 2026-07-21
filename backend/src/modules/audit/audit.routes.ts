import { Router } from 'express';
import { AuditController } from './audit.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const controller = new AuditController();

// Only ADMIN role can access audit logs
router.use(authenticateJWT, authorizeRoles('ADMIN'));

/**
 * @openapi
 * /audit:
 *   get:
 *     summary: Retrieve System Audit Logs
 *     description: Returns paginated and filtered audit trail records. Restricted to ADMIN.
 *     tags:
 *       - Enterprise Administration
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
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
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
 *         description: Audit logs list retrieved.
 */
router.get('/', controller.getLogs);

export default router;
