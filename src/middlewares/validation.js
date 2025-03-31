/**
 * Request validation middleware
 */
const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * Validate request parameters against a Joi schema
 * @param {Object} schema - Joi validation schema
 * @param {String} property - Request property to validate (body, params, query)
 * @returns {Function} - Express middleware function
 */
function validate(schema, property = 'params') {
  return (req, res, next) => {
    const data = req[property];
    const { error } = schema.validate(data, { abortEarly: false });
    
    if (!error) {
      next();
    } else {
      const errorDetails = error.details.map(detail => detail.message).join(', ');
      logger.warn(`Validation error: ${errorDetails}`, { 
        path: req.path, 
        method: req.method,
        [property]: data
      });
      
      res.status(400).json({
        status: 'error',
        message: 'Invalid request data',
        details: errorDetails
      });
    }
  };
}

/**
 * Common validation schemas
 */
const schemas = {
  // Common parameters
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pagesize: Joi.number().integer().min(1).max(100).default(20)
  }),
  
  // City/Area validation
  location: Joi.object({
    city: Joi.string().trim().required(),
    area: Joi.string().trim().optional()
  }),
  
  // Date range validation
  dateRange: Joi.object({
    start: Joi.date().iso(),
    end: Joi.date().iso().min(Joi.ref('start'))
  }),
  
  // Price range validation
  priceRange: Joi.object({
    price: Joi.string().pattern(/^\d+-\d+$/).message('Price must be in format min-max')
  })
};

module.exports = {
  validate,
  schemas
};