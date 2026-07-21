import { Router } from 'express';
import { EmailLogController } from './email-log.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';

const router = Router();
const controller = new EmailLogController();

router.use(authenticateJWT);

/**
 * @openapi
 * /email-logs:
 *   get:
 *     summary: Get Email Delivery Logs
 *     description: Returns paginated list of automated email dispatches (restricted to ADMIN).
 *     tags:
 *       - Enterprise Administration
 *     responses:
 *       200:
 *         description: Email delivery logs array.
 */
router.get('/', authorizeRoles('ADMIN'), controller.list);

export default router;
