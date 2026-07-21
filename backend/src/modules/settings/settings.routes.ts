import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const controller = new SettingsController();

// Require JWT for all settings paths
router.use(authenticateJWT);

/**
 * @openapi
 * /settings:
 *   get:
 *     summary: Retrieve Company Settings
 *     description: Returns active company metadata configuration, prefixes, and currency definitions.
 *     tags:
 *       - Enterprise Administration
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company settings details returned.
 */
router.get('/', controller.get);

/**
 * @openapi
 * /settings:
 *   put:
 *     summary: Update Company Settings
 *     description: Updates prefix configurations, currency, logos, and address settings. Restricted to ADMIN.
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
 *             properties:
 *               companyName:
 *                 type: string
 *               companyLogo:
 *                 type: string
 *               gstNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               website:
 *                 type: string
 *               invoicePrefix:
 *                 type: string
 *               challanPrefix:
 *                 type: string
 *               currency:
 *                 type: string
 *               timezone:
 *                 type: string
 *               language:
 *                 type: string
 *               theme:
 *                 type: string
 *     responses:
 *       200:
 *         description: Company settings updated successfully.
 */
router.put('/', authorizeRoles('ADMIN'), controller.update);

export default router;
