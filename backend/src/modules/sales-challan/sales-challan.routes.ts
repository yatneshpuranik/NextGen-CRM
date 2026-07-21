import { Router } from 'express';
import { SalesChallanController } from './sales-challan.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { createSalesChallanValidator, updateSalesChallanValidator } from './sales-challan.validator';

const router = Router();
const controller = new SalesChallanController();

// Protect all routes by JWT authentication
router.use(authenticateJWT);

/**
 * @openapi
 * /sales-challans:
 *   post:
 *     summary: Create a new draft Sales Challan
 *     description: Creates a delivery challan in DRAFT status. Restricted to ADMIN and SALES.
 *     tags:
 *       - Sales Challan & Order Processing
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - items
 *             properties:
 *               customerId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               deliveryDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-01T12:00:00Z"
 *               remarks:
 *                 type: string
 *                 example: "Customer request for urgent courier delivery."
 *               discount:
 *                 type: number
 *                 example: 200.00
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                     - sellingPrice
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                       example: 10
 *                     sellingPrice:
 *                       type: number
 *                       example: 1500.00
 *                     discount:
 *                       type: number
 *                       example: 50.00
 *     responses:
 *       201:
 *         description: Draft challan created successfully.
 *       400:
 *         description: Validation failed.
 */
router.post(
  '/',
  authorizeRoles('ADMIN', 'SALES'),
  createSalesChallanValidator,
  validateRequest,
  controller.create
);

/**
 * @openapi
 * /sales-challans:
 *   get:
 *     summary: Retrieve paginated sales challans list
 *     description: Returns a paginated list of challans. Supports search, status, and date range filters. Accessible by all roles.
 *     tags:
 *       - Sales Challan & Order Processing
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
 *         description: Search by Challan number or Customer name.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, CONFIRMED, CANCELLED, COMPLETED]
 *       - in: query
 *         name: customerId
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [challanDate, totalAmount, status]
 *           default: "challanDate"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *     responses:
 *       200:
 *         description: Challans list retrieved successfully.
 */
router.get(
  '/',
  authorizeRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  controller.getAll
);

/**
 * @openapi
 * /sales-challans/{id}:
 *   get:
 *     summary: Retrieve a single Sales Challan
 *     description: Returns full details, item line lists, and operators. Accessible by all roles.
 *     tags:
 *       - Sales Challan & Order Processing
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Challan retrieved successfully.
 *       404:
 *         description: Challan not found.
 */
router.get(
  '/:id',
  authorizeRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  controller.getById
);

/**
 * @openapi
 * /sales-challans/{id}:
 *   put:
 *     summary: Update a draft Sales Challan
 *     description: Updates draft properties and recalculates billing totals. Restricted to ADMIN and SALES.
 *     tags:
 *       - Sales Challan & Order Processing
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               deliveryDate:
 *                 type: string
 *                 format: date-time
 *               remarks:
 *                 type: string
 *               discount:
 *                 type: number
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                     sellingPrice:
 *                       type: number
 *                     discount:
 *                       type: number
 *     responses:
 *       200:
 *         description: Challan updated successfully.
 *       400:
 *         description: Validation failed or status not DRAFT.
 */
router.put(
  '/:id',
  authorizeRoles('ADMIN', 'SALES'),
  updateSalesChallanValidator,
  validateRequest,
  controller.update
);

/**
 * @openapi
 * /sales-challans/{id}:
 *   delete:
 *     summary: Delete a draft Sales Challan
 *     description: Deletes a challan in DRAFT status. Restricted to ADMIN and SALES.
 *     tags:
 *       - Sales Challan & Order Processing
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Draft deleted successfully.
 *       400:
 *         description: Status not DRAFT.
 */
router.delete(
  '/:id',
  authorizeRoles('ADMIN', 'SALES'),
  controller.delete
);

/**
 * @openapi
 * /sales-challans/{id}/confirm:
 *   post:
 *     summary: Confirm a Sales Challan
 *     description: Locks stock levels, updates inventory available count, and logs STOCK_OUT transaction. Restricted to ADMIN and SALES.
 *     tags:
 *       - Sales Challan & Order Processing
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Challan confirmed and stock reduced.
 *       400:
 *         description: Stock levels insufficient or not DRAFT status.
 */
router.post(
  '/:id/confirm',
  authorizeRoles('ADMIN', 'SALES'),
  controller.confirm
);

/**
 * @openapi
 * /sales-challans/{id}/cancel:
 *   post:
 *     summary: Cancel a confirmed Sales Challan
 *     description: Restores stock levels and logs a reverse RETURN transaction. Restricted to ADMIN and SALES.
 *     tags:
 *       - Sales Challan & Order Processing
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Challan cancelled and stock restored.
 *       400:
 *         description: Status not CONFIRMED.
 */
router.post(
  '/:id/cancel',
  authorizeRoles('ADMIN', 'SALES'),
  controller.cancel
);

/**
 * @openapi
 * /sales-challans/{id}/complete:
 *   post:
 *     summary: Mark a confirmed Challan as completed
 *     description: Sets status to COMPLETED. Restricts further updates or cancellation. Restricted to ADMIN and SALES.
 *     tags:
 *       - Sales Challan & Order Processing
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status set to COMPLETED.
 */
router.post(
  '/:id/complete',
  authorizeRoles('ADMIN', 'SALES'),
  controller.complete
);

/**
 * @openapi
 * /sales-challans/customer/{customerId}:
 *   get:
 *     summary: Retrieve history list for a customer
 *     description: Returns all challans associated with a customer. Accessible by all roles.
 *     tags:
 *       - Sales Challan & Order Processing
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: History retrieved.
 */
router.get(
  '/customer/:customerId',
  authorizeRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  controller.getCustomerHistory
);

export default router;
