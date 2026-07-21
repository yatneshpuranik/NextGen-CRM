import { body } from 'express-validator';

export const createProductValidator = [
  body('productName')
    .notEmpty()
    .withMessage('Product Name is required')
    .trim(),
  body('sku')
    .notEmpty()
    .withMessage('SKU is required')
    .trim(),
  body('barcode')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .trim(),
  body('brand')
    .notEmpty()
    .withMessage('Brand is required')
    .trim(),
  body('unit')
    .notEmpty()
    .withMessage('Unit is required')
    .trim(),
  body('purchasePrice')
    .notEmpty()
    .withMessage('Purchase Price is required')
    .isFloat({ min: 0.01 })
    .withMessage('Purchase Price must be a positive number')
    .toFloat(),
  body('sellingPrice')
    .notEmpty()
    .withMessage('Selling Price is required')
    .isFloat({ min: 0.01 })
    .withMessage('Selling Price must be a positive number')
    .toFloat()
    .custom((value, { req }) => {
      const purchasePrice = parseFloat(req.body.purchasePrice);
      const sellingPrice = parseFloat(value);
      if (!isNaN(purchasePrice) && !isNaN(sellingPrice) && sellingPrice < purchasePrice) {
        throw new Error('Selling price must be greater than or equal to purchase price');
      }
      return true;
    }),
  body('gstPercentage')
    .notEmpty()
    .withMessage('GST percentage is required')
    .isFloat({ min: 0, max: 100 })
    .withMessage('GST percentage must be between 0 and 100')
    .toFloat(),
  body('minimumStock')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('Minimum stock must be a non-negative integer')
    .toInt(),
  body('currentStock')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('Current stock must be a non-negative integer')
    .toInt(),
  body('notes')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
];

export const updateProductValidator = [
  body('productName')
    .optional()
    .notEmpty()
    .withMessage('Product Name cannot be empty')
    .trim(),
  body('sku')
    .optional()
    .notEmpty()
    .withMessage('SKU cannot be empty')
    .trim(),
  body('barcode')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('category')
    .optional()
    .notEmpty()
    .withMessage('Category cannot be empty')
    .trim(),
  body('brand')
    .optional()
    .notEmpty()
    .withMessage('Brand cannot be empty')
    .trim(),
  body('unit')
    .optional()
    .notEmpty()
    .withMessage('Unit cannot be empty')
    .trim(),
  body('purchasePrice')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Purchase Price must be a positive number')
    .toFloat(),
  body('sellingPrice')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Selling Price must be a positive number')
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.purchasePrice) {
        const purchasePrice = parseFloat(req.body.purchasePrice);
        const sellingPrice = parseFloat(value);
        if (!isNaN(purchasePrice) && !isNaN(sellingPrice) && sellingPrice < purchasePrice) {
          throw new Error('Selling price must be greater than or equal to purchase price');
        }
      }
      return true;
    }),
  body('gstPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('GST percentage must be between 0 and 100')
    .toFloat(),
  body('minimumStock')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('Minimum stock must be a non-negative integer')
    .toInt(),
  body('currentStock')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('Current stock must be a non-negative integer')
    .toInt()
];
