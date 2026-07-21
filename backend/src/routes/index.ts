import { Router } from 'express';
import { sendSuccess } from '../utils/response';

import authRouter from '../modules/auth/auth.routes';
import customerRouter from '../modules/customer/customer.routes';
import productRouter from '../modules/product/product.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/customers', customerRouter);
router.use('/products', productRouter);

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
