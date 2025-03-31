/**
 * Meituan API Controller
 */
const Joi = require('joi');
const { query } = require('../../dao/mysql');
const logger = require('../../utils/logger');
const { ApiError } = require('../../middlewares/errorHandler');
const { validate, schemas } = require('../../middlewares/validation');

// Validation schema for meituan endpoint
const meituanSchema = Joi.object({
  type: Joi.string().valid('json', 'xml').default('json'),
  city: Joi.string().trim(),
  area: Joi.string().trim(),
  price: Joi.string().pattern(/^\d+-\d+$/),
  category: Joi.string().trim(),
  order: Joi.string().valid('time-desc', 'time-asc', 'price-desc', 'price-asc', 'value-desc', 'value-asc'),
  k: Joi.string().trim(),
  pagesize: Joi.number().integer().min(1).max(100).default(20),
  page: Joi.number().integer().min(1).default(1)
});

/**
 * Get Meituan deals with filters
 */
async function getMeituanDeals(req, res, next) {
  try {
    const params = {
      type: req.params[0] || 'json',
      city: req.params[1],
      area: req.params[2],
      price: req.params[3],
      category: req.params[4],
      order: req.params[5],
      k: req.params[6],
      pagesize: parseInt(req.params[7] || 20, 10),
      page: parseInt(req.params[8] || 1, 10)
    };

    // Validate parameters
    const { error, value } = meituanSchema.validate(params);
    if (error) {
      throw new ApiError(400, 'Invalid request parameters', error.details);
    }

    const validated = value;
    
    // Build SQL query with parameterized query
    let sqlQuery = 'SELECT * FROM meituan_deals WHERE 1=1';
    let queryParams = [];
    
    // Add filters
    if (validated.city) {
      sqlQuery += ' AND city = ?';
      queryParams.push(validated.city);
    }
    
    if (validated.area) {
      sqlQuery += ' AND area = ?';
      queryParams.push(validated.area);
    }
    
    if (validated.price) {
      const [min, max] = validated.price.split('-');
      sqlQuery += ' AND price BETWEEN ? AND ?';
      queryParams.push(parseFloat(min), parseFloat(max));
    }
    
    if (validated.category) {
      sqlQuery += ' AND category = ?';
      queryParams.push(validated.category);
    }
    
    if (validated.k) {
      sqlQuery += ' AND (title LIKE ? OR description LIKE ?)';
      const searchTerm = `%${validated.k}%`;
      queryParams.push(searchTerm, searchTerm);
    }
    
    // Add ordering
    if (validated.order) {
      const [field, direction] = validated.order.split('-');
      
      // Validate sort fields for security
      const allowedFields = ['time', 'price', 'value'];
      const allowedDirections = ['asc', 'desc'];
      
      if (allowedFields.includes(field) && allowedDirections.includes(direction)) {
        sqlQuery += ` ORDER BY ${field} ${direction.toUpperCase()}`;
      }
    } else {
      sqlQuery += ' ORDER BY time DESC';
    }
    
    // Add pagination
    const offset = (validated.page - 1) * validated.pagesize;
    sqlQuery += ' LIMIT ? OFFSET ?';
    queryParams.push(validated.pagesize, offset);
    
    // Count total records for pagination
    const countQuery = sqlQuery.replace('SELECT *', 'SELECT COUNT(*) as total').split('ORDER BY')[0];
    const countParams = queryParams.slice(0, -2); // Remove LIMIT and OFFSET params
    
    // Execute queries
    const [deals, countResult] = await Promise.all([
      query(sqlQuery, queryParams),
      query(countQuery, countParams)
    ]);
    
    const total = countResult[0]?.total || 0;
    
    // Format response based on requested type
    if (validated.type === 'xml') {
      res.set('Content-Type', 'application/xml');
      let xmlResponse = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xmlResponse += '<response>\n';
      xmlResponse += `  <meta>\n    <total>${total}</total>\n    <page>${validated.page}</page>\n    <pagesize>${validated.pagesize}</pagesize>\n  </meta>\n`;
      xmlResponse += '  <deals>\n';
      
      deals.forEach(deal => {
        xmlResponse += '    <deal>\n';
        for (const [key, value] of Object.entries(deal)) {
          if (value !== null && value !== undefined) {
            // Escape XML entities
            const escapedValue = String(value)
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&apos;');
            
            xmlResponse += `      <${key}>${escapedValue}</${key}>\n`;
          }
        }
        xmlResponse += '    </deal>\n';
      });
      
      xmlResponse += '  </deals>\n';
      xmlResponse += '</response>';
      
      return res.send(xmlResponse);
    }
    
    // JSON response
    return res.json({
      meta: {
        total,
        page: validated.page,
        pagesize: validated.pagesize
      },
      deals
    });
  } catch (error) {
    logger.error('Error fetching Meituan deals:', error);
    next(error);
  }
}

module.exports = {
  meituan: [validate(meituanSchema), getMeituanDeals]
};