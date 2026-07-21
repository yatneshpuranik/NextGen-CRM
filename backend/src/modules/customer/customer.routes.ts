import { Router } from 'express';
import { CustomerController } from './customer.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { createCustomerValidator, updateCustomerValidator } from './customer.validator';

const router = Router();
const controller = new CustomerController();

/**
 * @openapi
 * /customers:
 *   post:
 *     summary: Create a new customer profile
 *     description: Creates a new customer with a sequential customer code. Restricted to ADMIN and SALES.
 *     tags:
 *       - Customer Relationship Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - contactPerson
 *               - email
 *               - phone
 *               - address
 *               - city
 *               - state
 *               - country
 *               - pincode
 *               - customerType
 *             properties:
 *               companyName:
 *                 type: string
 *                 example: "Acme Corporation"
 *               contactPerson:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@acme.com"
 *               phone:
 *                 type: string
 *                 example: "+919876543210"
 *               alternatePhone:
 *                 type: string
 *                 example: "+919876543211"
 *               gstNumber:
 *                 type: string
 *                 example: "27AAAAA1111A1Z1"
 *               address:
 *                 type: string
 *                 example: "123 Industrial Area, Phase 1"
 *               city:
 *                 type: string
 *                 example: "Mumbai"
 *               state:
 *                 type: string
 *                 example: "Maharashtra"
 *               country:
 *                 type: string
 *                 example: "India"
 *               pincode:
 *                 type: string
 *                 example: "400001"
 *               customerType:
 *                 type: string
 *                 enum: [RETAIL, WHOLESALE, DISTRIBUTOR]
 *                 example: "DISTRIBUTOR"
 *               notes:
 *                 type: string
 *                 example: "Preferred partner distributor."
 *     responses:
 *       201:
 *         description: Customer profile created successfully.
 *       400:
 *         description: Invalid input format.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Permissions restricted.
 *       409:
 *         description: Duplicate email or phone.
 *
 *   get:
 *     summary: Retrieve paginated customer list
 *     description: Returns a paginated list of customers. Supports search, filtering, and sorting. Accessible by all roles.
 *     tags:
 *       - Customer Relationship Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: Page record limit
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query matching company name, contact person, email, or phone
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Filter by status
 *       - in: query
 *         name: customerType
 *         schema:
 *           type: string
 *           enum: [RETAIL, WHOLESALE, DISTRIBUTOR]
 *         description: Filter by customer type
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [companyName, createdAt]
 *         description: Sort records by field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order direction
 *     responses:
 *       200:
 *         description: List of customers retrieved successfully.
 *       401:
 *         description: Authentication required.
 */
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('ADMIN', 'SALES'),
  createCustomerValidator,
  validateRequest,
  controller.create
);

router.get(
  '/',
  authenticateJWT,
  authorizeRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  controller.getAll
);

/**
 * @openapi
 * /customers/{id}:
 *   get:
 *     summary: Retrieve customer details by ID
 *     description: Returns details of a single customer. Accessible by all roles.
 *     tags:
 *       - Customer Relationship Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique ID of the customer profile
 *     responses:
 *       200:
 *         description: Customer profile retrieved successfully.
 *       404:
 *         description: Customer profile not found.
 *
 *   put:
 *     summary: Update customer details by ID
 *     description: Updates fields of a customer profile. Restricted to ADMIN and SALES.
 *     tags:
 *       - Customer Relationship Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique ID of the customer profile
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               alternatePhone:
 *                 type: string
 *               gstNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               pincode:
 *                 type: string
 *               customerType:
 *                 type: string
 *                 enum: [RETAIL, WHOLESALE, DISTRIBUTOR]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer profile updated successfully.
 *       400:
 *         description: Input validation failed.
 *       404:
 *         description: Customer profile not found.
 *       409:
 *         description: Duplicate email or phone.
 *
 *   delete:
 *     summary: Soft delete a customer profile
 *     description: Archives the customer profile (sets isDeleted=true). Fails if the customer has active delivery challans. Restricted to ADMIN only.
 *     tags:
 *       - Customer Relationship Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique ID of the customer profile to delete
 *     responses:
 *       200:
 *         description: Customer profile archived successfully.
 *       400:
 *         description: Deletion rejected because customer has active challans.
 *       403:
 *         description: Only administrators can delete customer profiles.
 *       404:
 *         description: Customer profile not found.
 */
router.get(
  '/:id',
  authenticateJWT,
  authorizeRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  controller.getById
);

router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('ADMIN', 'SALES'),
  updateCustomerValidator,
  validateRequest,
  controller.update
);

router.delete(
  '/:id',
  authenticateJWT,
  authorizeRoles('ADMIN'),
  controller.delete
);

/**
 * @openapi
 * /customers/{id}/activate:
 *   patch:
 *     summary: Activate customer profile
 *     description: Sets the status of the customer to active. Restricted to ADMIN and SALES.
 *     tags:
 *       - Customer Relationship Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Customer profile activated successfully.
 *       404:
 *         description: Customer profile not found.
 */
router.patch(
  '/:id/activate',
  authenticateJWT,
  authorizeRoles('ADMIN', 'SALES'),
  controller.activate
);

/**
 * @openapi
 * /customers/{id}/deactivate:
 *   patch:
 *     summary: Deactivate customer profile
 *     description: Sets the status of the customer to inactive. Restricted to ADMIN and SALES.
 *     tags:
 *       - Customer Relationship Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Customer profile deactivated successfully.
 *       404:
 *         description: Customer profile not found.
 */
router.patch(
  '/:id/deactivate',
  authenticateJWT,
  authorizeRoles('ADMIN', 'SALES'),
  controller.deactivate
);

export default router;
