import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { registerValidator, loginValidator, changePasswordValidator } from './auth.validator';

const router = Router();
const controller = new AuthController();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user account (Admin only)
 *     description: Registers a new user with a specific security role. Accessible only by accounts with ADMIN role privileges.
 *     tags:
 *       - Authentication & Authorization
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - confirmPassword
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jane Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jane@nextgenerp.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePassword123!"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: "SecurePassword123!"
 *               role:
 *                 type: string
 *                 enum: [ADMIN, SALES, WAREHOUSE, ACCOUNTS]
 *                 example: "SALES"
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User account registered successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "b3c4d5e6-f7a8-9b0c-1d2e-3f4a5b6c7d8e"
 *                     name:
 *                       type: string
 *                       example: "Jane Doe"
 *                     email:
 *                       type: string
 *                       example: "jane@nextgenerp.com"
 *                     role:
 *                       type: string
 *                       example: "SALES"
 *                     createdAt:
 *                       type: string
 *                       example: "2026-07-21T14:01:00.000Z"
 *       400:
 *         description: Payload validation errors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Input validation checks failed"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: "confirmPassword"
 *                       message:
 *                         type: string
 *                         example: "Confirm password must match password"
 *       401:
 *         description: Missing or invalid authentication token.
 *       403:
 *         description: Access forbidden. Requires ADMIN role.
 *       409:
 *         description: Conflict. User email is already registered.
 */


router.post(
  '/register',
  registerValidator,
  validateRequest,
  controller.register
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate credentials and login user
 *     description: Validates email and password, returning a 24-hour Access Token on success.
 *     tags:
 *       - Authentication & Authorization
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@nextgenerp.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "AdminPassword123!"
 *     responses:
 *       200:
 *         description: Authentication successful. Returns JWT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User authentication successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           example: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"
 *                         name:
 *                           type: string
 *                           example: "System Administrator"
 *                         email:
 *                           type: string
 *                           example: "admin@nextgenerp.com"
 *                         role:
 *                           type: string
 *                           example: "ADMIN"
 *       400:
 *         description: Validation check failures.
 *       401:
 *         description: Invalid credentials email/password match.
 */
router.post(
  '/login',
  loginValidator,
  validateRequest,
  controller.login
);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Fetch current user profile details
 *     description: Resolves and returns profile details from database of the authenticated token owner.
 *     tags:
 *       - Authentication & Authorization
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Details resolved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile details retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Invalid or expired access token.
 */
router.get(
  '/me',
  authenticateJWT,
  controller.getProfile
);

/**
 * @openapi
 * /auth/change-password:
 *   put:
 *     summary: Update password credentials
 *     description: Rotates password credentials, requiring confirmation matching and valid active secrets.
 *     tags:
 *       - Authentication & Authorization
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: "OldPassword123!"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "NewPassword123!"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: "NewPassword123!"
 *     responses:
 *       200:
 *         description: Password rotated successfully.
 *       400:
 *         description: Inputs validation checks failed.
 *       401:
 *         description: Incorrect current password credentials.
 */
router.put(
  '/change-password',
  authenticateJWT,
  changePasswordValidator,
  validateRequest,
  controller.changePassword
);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Stateless logout
 *     description: Returns success confirming JWT discardment commands.
 *     tags:
 *       - Authentication & Authorization
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Confirmed successfully.
 */
router.post(
  '/logout',
  authenticateJWT,
  controller.logout
);

export default router;
