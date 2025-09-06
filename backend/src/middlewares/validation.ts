import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler';

// Validation error handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined,
    }));
    
    throw createError('Validation failed', 400, errorMessages);
  }
  
  next();
};

// User validation rules
export const validateUserProfile = [
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .trim()
    .escape(),
  
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .trim()
    .escape(),
  
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL')
    .trim(),
  
  handleValidationErrors,
];

// Campaign validation rules
export const validateCampaign = [
  body('title')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters')
    .trim()
    .escape(),
  
  body('description')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters')
    .trim()
    .escape(),
  
  body('goal')
    .isFloat({ min: 1, max: 1000000 })
    .withMessage('Goal must be between 1 and 1,000,000')
    .toFloat(),
  
  body('deadline')
    .isISO8601()
    .withMessage('Deadline must be a valid date')
    .custom((value) => {
      const deadline = new Date(value);
      const now = new Date();
      const maxDeadline = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
      
      if (deadline <= now) {
        throw new Error('Deadline must be in the future');
      }
      
      if (deadline > maxDeadline) {
        throw new Error('Deadline cannot be more than 1 year in the future');
      }
      
      return true;
    }),
  
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
  
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL')
    .trim(),
  
  handleValidationErrors,
];

// Campaign update validation rules
export const validateCampaignUpdate = [
  body('title')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters')
    .trim()
    .escape(),
  
  body('description')
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters')
    .trim()
    .escape(),
  
  body('goal')
    .optional()
    .isFloat({ min: 1, max: 1000000 })
    .withMessage('Goal must be between 1 and 1,000,000')
    .toFloat(),
  
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Deadline must be a valid date')
    .custom((value) => {
      if (value) {
        const deadline = new Date(value);
        const now = new Date();
        const maxDeadline = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
        
        if (deadline <= now) {
          throw new Error('Deadline must be in the future');
        }
        
        if (deadline > maxDeadline) {
          throw new Error('Deadline cannot be more than 1 year in the future');
        }
      }
      
      return true;
    }),
  
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
  
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL')
    .trim(),
  
  handleValidationErrors,
];

// Support validation rules
export const validateSupport = [
  body('amount')
    .isFloat({ min: 1, max: 10000 })
    .withMessage('Amount must be between 1 and 10,000')
    .toFloat(),
  
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Message must be less than 500 characters')
    .trim()
    .escape(),
  
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean'),
  
  handleValidationErrors,
];

// Comment validation rules
export const validateComment = [
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Content must be between 1 and 1000 characters')
    .trim()
    .escape(),
  
  handleValidationErrors,
];

// Payment validation rules
export const validatePayment = [
  body('amount')
    .isFloat({ min: 1, max: 10000 })
    .withMessage('Amount must be between 1 and 10,000')
    .toFloat(),
  
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description must be less than 200 characters')
    .trim()
    .escape(),
  
  handleValidationErrors,
];

// Mercado Pago payment validation rules
export const validateMercadoPagoPayment = [
  body('amount')
    .isFloat({ min: 1, max: 10000 })
    .withMessage('Amount must be between 1 and 10,000')
    .toFloat(),
  
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description must be less than 200 characters')
    .trim()
    .escape(),
  
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'pix', 'boleto', 'bank_transfer'])
    .withMessage('Payment method must be one of: credit_card, debit_card, pix, boleto, bank_transfer'),
  
  body('installments')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Installments must be between 1 and 12')
    .toInt(),
  
  body('payerEmail')
    .isEmail()
    .withMessage('Payer email must be a valid email address')
    .normalizeEmail(),
  
  body('payerName')
    .isLength({ min: 2, max: 100 })
    .withMessage('Payer name must be between 2 and 100 characters')
    .trim()
    .escape(),
  
  body('payerDocument')
    .isLength({ min: 11, max: 14 })
    .withMessage('Payer document must be between 11 and 14 characters')
    .matches(/^[0-9]+$/)
    .withMessage('Payer document must contain only numbers')
    .trim(),
  
  handleValidationErrors,
];

// ID parameter validation
export const validateId = [
  param('id')
    .isUUID()
    .withMessage('ID must be a valid UUID'),
  
  handleValidationErrors,
];

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be between 1 and 1000')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  query('sort')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'title', 'goal', 'current'])
    .withMessage('Sort must be one of: createdAt, updatedAt, title, goal, current'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
  
  handleValidationErrors,
];

// Search validation
export const validateSearch = [
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters')
    .trim()
    .escape(),
  
  handleValidationErrors,
];

// Category validation rules
export const validateCategory = [
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim()
    .escape(),
  
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description must be less than 200 characters')
    .trim()
    .escape(),
  
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a valid hex color code'),
  
  body('icon')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Icon must be less than 50 characters')
    .trim()
    .escape(),
  
  handleValidationErrors,
];
