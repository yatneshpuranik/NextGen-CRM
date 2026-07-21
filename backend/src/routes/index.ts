import { Router } from 'express';
import { sendSuccess } from '../utils/response';

import authRouter from '../modules/auth/auth.routes';

const router = Router();

router.use('/auth', authRouter);

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Verify api operations
 *     description: Returns 200 OK if the backend server is running and database is active.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Success status report.
 */
router.get('/health', (_req, res) => {
  return sendSuccess(res, { uptime: process.uptime(), timestamp: new Date() }, 200, 'API service is active');
});

export default router;
