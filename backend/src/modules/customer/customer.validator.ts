import { body } from 'express-validator';

export const createCustomerValidator = [
  body('companyName')
    .notEmpty()
    .withMessage('Company Name is required')
    .trim(),
  body('contactPerson')
    .notEmpty()
    .withMessage('Contact Person is required')
    .trim(),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim(),
  body('alternatePhone')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('gstNumber')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Invalid GSTIN format (e.g. 27AAAAA1111A1Z1)'),
  body('address')
    .notEmpty()
    .withMessage('Address is required')
    .trim(),
  body('city')
    .notEmpty()
    .withMessage('City is required')
    .trim(),
  body('state')
    .notEmpty()
    .withMessage('State is required')
    .trim(),
  body('country')
    .notEmpty()
    .withMessage('Country is required')
    .trim(),
  body('pincode')
    .notEmpty()
    .withMessage('Pincode is required')
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be exactly 6 digits'),
  body('customerType')
    .notEmpty()
    .withMessage('Customer Type is required')
    .isIn(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR'])
    .withMessage('Invalid Customer Type. Must be RETAIL, WHOLESALE, or DISTRIBUTOR'),
  body('notes')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
];

export const updateCustomerValidator = [
  body('companyName')
    .optional()
    .notEmpty()
    .withMessage('Company Name cannot be empty')
    .trim(),
  body('contactPerson')
    .optional()
    .notEmpty()
    .withMessage('Contact Person cannot be empty')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .notEmpty()
    .withMessage('Phone number cannot be empty')
    .trim(),
  body('alternatePhone')
    .optional({ nullable: true, checkFalsy: true })
    .trim(),
  body('gstNumber')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Invalid GSTIN format (e.g. 27AAAAA1111A1Z1)'),
  body('address')
    .optional()
    .notEmpty()
    .withMessage('Address cannot be empty')
    .trim(),
  body('city')
    .optional()
    .notEmpty()
    .withMessage('City cannot be empty')
    .trim(),
  body('state')
    .optional()
    .notEmpty()
    .withMessage('State cannot be empty')
    .trim(),
  body('country')
    .optional()
    .notEmpty()
    .withMessage('Country cannot be empty')
    .trim(),
  body('pincode')
    .optional()
    .trim()
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be exactly 6 digits'),
  body('customerType')
    .optional()
    .isIn(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR'])
    .withMessage('Invalid Customer Type. Must be RETAIL, WHOLESALE, or DISTRIBUTOR'),
  body('notes')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
];
