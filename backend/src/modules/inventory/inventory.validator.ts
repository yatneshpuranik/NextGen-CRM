import { body } from 'express-validator';

export const updateInventorySettingsValidator = [
  body('minimumStock')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('Minimum stock must be a non-negative integer')
    .toInt(),
  body('maximumStock')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('Maximum stock must be a non-negative integer')
    .toInt()
    .custom((value, { req }) => {
      const minStock = req.body.minimumStock !== undefined ? parseInt(req.body.minimumStock, 10) : undefined;
      const maxStock = parseInt(value, 10);
      if (minStock !== undefined && !isNaN(minStock) && maxStock < minStock) {
        throw new Error('Maximum stock must be greater than or equal to minimum stock');
      }
      return true;
    }),
  body('reorderLevel')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('Reorder level must be a non-negative integer')
    .toInt(),
  body('warehouseLocation')
    .optional({ nullable: true })
    .trim()
];

export const stockInValidator = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer greater than 0')
    .toInt(),
  body('reference')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('remarks')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
];

export const stockOutValidator = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer greater than 0')
    .toInt(),
  body('reference')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('remarks')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
];

export const stockAdjustmentValidator = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer')
    .toInt(),
  body('remarks')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
];

export const markDamageValidator = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer greater than 0')
    .toInt(),
  body('reference')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('remarks')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
];

export const stockReturnValidator = [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer greater than 0')
    .toInt(),
  body('returnToType')
    .notEmpty()
    .withMessage('Return destination type (returnToType) is required')
    .isIn(['AVAILABLE', 'DAMAGED'])
    .withMessage('returnToType must be either AVAILABLE or DAMAGED'),
  body('reference')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('remarks')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
];
