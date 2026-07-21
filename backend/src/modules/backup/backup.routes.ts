import { Router } from 'express';
import { BackupController } from './backup.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const controller = new BackupController();

// Only ADMIN can perform backup/restore operations
router.use(authenticateJWT, authorizeRoles('ADMIN'));

/**
 * @openapi
 * /backup/export:
 *   get:
 *     summary: Export Database JSON Backup
 *     description: Returns a complete JSON file representation of the PostgreSQL tables. Restricted to ADMIN.
 *     tags:
 *       - Enterprise Administration
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Database JSON payload file returned.
 */
router.get('/export', controller.exportJson);

/**
 * @openapi
 * /backup/restore:
 *   post:
 *     summary: Restore Database from JSON Backup
 *     description: Destructively truncates current database and ingests a JSON backup payload. Restricted to ADMIN.
 *     tags:
 *       - Enterprise Administration
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Database restored successfully.
 */
router.post('/restore', controller.restoreJson);

/**
 * @openapi
 * /backup/csv/{type}:
 *   get:
 *     summary: Export Table Data to CSV
 *     description: Generates a downloadable CSV representation of specific tables (customers, products, inventory, sales). Restricted to ADMIN.
 *     tags:
 *       - Enterprise Administration
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [customers, products, inventory, sales]
 *     responses:
 *       200:
 *         description: CSV file returned.
 */
router.get('/csv/:type', controller.exportCsv);

export default router;
