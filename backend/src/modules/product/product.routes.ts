import { Router } from 'express';
import { ProductController } from './product.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { uploadImage } from '../../middleware/upload.middleware';
import { createProductValidator, updateProductValidator } from './product.validator';

const router = Router();
const controller = new ProductController();

/**
 * @openapi
 * /products:
 *   post:
 *     summary: Create a new product profile
 *     description: Creates a new catalog product with a sequential code. Supports image upload. Restricted to ADMIN and WAREHOUSE.
 *     tags:
 *       - Product Catalog Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - productName
 *               - sku
 *               - category
 *               - brand
 *               - unit
 *               - purchasePrice
 *               - sellingPrice
 *               - gstPercentage
 *             properties:
 *               productName:
 *                 type: string
 *                 example: "Steel Rod 12mm"
 *               sku:
 *                 type: string
 *                 example: "STL-RD-12MM-001"
 *               barcode:
 *                 type: string
 *                 example: "8901234567890"
 *               description:
 *                 type: string
 *                 example: "High grade construction steel rod."
 *               category:
 *                 type: string
 *                 example: "Construction"
 *               brand:
 *                 type: string
 *                 example: "TATA Tiscon"
 *               unit:
 *                 type: string
 *                 example: "TON"
 *               purchasePrice:
 *                 type: number
 *                 example: 54000.00
 *               sellingPrice:
 *                 type: number
 *                 example: 58500.00
 *               gstPercentage:
 *                 type: number
 *                 example: 18.00
 *               minimumStock:
 *                 type: number
 *                 example: 5
 *               currentStock:
 *                 type: number
 *                 example: 20
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product created successfully.
 *       400:
 *         description: Invalid inputs or price conditions violated.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Permission restricted.
 *       409:
 *         description: Duplicate SKU value.
 *
 *   get:
 *     summary: Retrieve paginated product list
 *     description: Returns a paginated list of catalog products. Supports search, filtering, and sorting. Accessible by all roles.
 *     tags:
 *       - Product Catalog Management
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Matches name, sku, code, brand
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [productName, sellingPrice, createdAt]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Products retrieved successfully.
 */
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('ADMIN', 'WAREHOUSE'),
  uploadImage.single('image'),
  createProductValidator,
  validateRequest,
  controller.create
);

router.get(
  '/',
  authenticateJWT,
  authorizeRoles('ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'),
  controller.getAll
);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     summary: Retrieve product details by ID
 *     description: Returns details of a single product. Accessible by all roles.
 *     tags:
 *       - Product Catalog Management
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
 *         description: Product profile retrieved successfully.
 *       404:
 *         description: Product not found.
 *
 *   put:
 *     summary: Update product details by ID
 *     description: Updates fields of a product catalog record. Restricted to ADMIN and WAREHOUSE.
 *     tags:
 *       - Product Catalog Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *               sku:
 *                 type: string
 *               barcode:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               brand:
 *                 type: string
 *               unit:
 *                 type: string
 *               purchasePrice:
 *                 type: number
 *               sellingPrice:
 *                 type: number
 *               gstPercentage:
 *                 type: number
 *               minimumStock:
 *                 type: number
 *               currentStock:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product details updated successfully.
 *       404:
 *         description: Product profile not found.
 *
 *   delete:
 *     summary: Soft delete a product profile
 *     description: Archives the product record (sets isDeleted=true). Restricted to ADMIN only.
 *     tags:
 *       - Product Catalog Management
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
 *         description: Product archived successfully.
 *       403:
 *         description: Only ADMIN can delete product profiles.
 */
router.get(
  '/:id',
  authenticateJWT,
  authorizeRoles('ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'),
  controller.getById
);

router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('ADMIN', 'WAREHOUSE'),
  uploadImage.single('image'),
  updateProductValidator,
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
 * /products/{id}/activate:
 *   patch:
 *     summary: Activate product profile
 *     description: Activates a catalog product record. Restricted to ADMIN and WAREHOUSE.
 *     tags:
 *       - Product Catalog Management
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
 *         description: Product activated successfully.
 */
router.patch(
  '/:id/activate',
  authenticateJWT,
  authorizeRoles('ADMIN', 'WAREHOUSE'),
  controller.activate
);

/**
 * @openapi
 * /products/{id}/deactivate:
 *   patch:
 *     summary: Deactivate product profile
 *     description: Deactivates a catalog product record. Restricted to ADMIN and WAREHOUSE.
 *     tags:
 *       - Product Catalog Management
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
 *         description: Product deactivated successfully.
 */
router.patch(
  '/:id/deactivate',
  authenticateJWT,
  authorizeRoles('ADMIN', 'WAREHOUSE'),
  controller.deactivate
);

export default router;
