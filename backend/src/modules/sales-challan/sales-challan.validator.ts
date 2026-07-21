import { body } from 'express-validator';

export const createSalesChallanValidator = [
  body('customerId')
    .notEmpty()
    .withMessage('Customer ID is required')
    .isUUID()
    .withMessage('Customer ID must be a valid UUID'),
  body('deliveryDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Delivery date must be a valid ISO8601 date string'),
  body('remarks')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('discount')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Global discount must be a non-negative number')
    .toFloat(),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Challan must contain at least one item'),
  body('items.*.productId')
    .notEmpty()
    .withMessage('Product ID is required for each item')
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required for each item')
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer greater than 0')
    .toInt(),
  body('items.*.sellingPrice')
    .notEmpty()
    .withMessage('Selling price is required for each item')
    .isFloat({ min: 0.01 })
    .withMessage('Selling price must be greater than 0')
    .toFloat(),
  body('items.*.discount')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Item discount must be a non-negative number')
    .toFloat()
];

export const updateSalesChallanValidator = [
  body('deliveryDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Delivery date must be a valid ISO8601 date string'),
  body('remarks')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('discount')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Global discount must be a non-negative number')
    .toFloat(),
  body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Challan items list cannot be empty if provided'),
  body('items.*.productId')
    .notEmpty()
    .withMessage('Product ID is required for each item')
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required for each item')
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer greater than 0')
    .toInt(),
  body('items.*.sellingPrice')
    .notEmpty()
    .withMessage('Selling price is required for each item')
    .isFloat({ min: 0.01 })
    .withMessage('Selling price must be greater than 0')
    .toFloat(),
  body('items.*.discount')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Item discount must be a non-negative number')
    .toFloat()
];
