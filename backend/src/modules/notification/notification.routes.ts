import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

const router = Router();
const controller = new NotificationController();

// Require JWT for all notifications
router.use(authenticateJWT);

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: Retrieve User Alerts
 *     description: Returns last 50 in-app alerts for authenticated user.
 *     tags:
 *       - Alerts & Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications list retrieved.
 */
router.get('/', controller.getAll);

/**
 * @openapi
 * /notifications/read-all:
 *   put:
 *     summary: Mark All Alerts Read
 *     description: Sets status of all user notifications to read.
 *     tags:
 *       - Alerts & Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read.
 */
router.put('/read-all', controller.markAllRead);

/**
 * @openapi
 * /notifications/{id}/read:
 *   put:
 *     summary: Mark Single Alert Read
 *     description: Sets status of specific notification to read.
 *     tags:
 *       - Alerts & Notifications
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
 *         description: Notification marked as read.
 */
router.put('/:id/read', controller.markRead);

/**
 * @openapi
 * /notifications/{id}:
 *   delete:
 *     summary: Delete Alert
 *     description: Removes single notification log.
 *     tags:
 *       - Alerts & Notifications
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
 *         description: Notification deleted.
 */
router.delete('/:id', controller.delete);

export default router;
