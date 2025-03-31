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
    // Extract parameters from path parameters, query strings, or defaults
    const params = {
      type: req.params.type || 'json',
      city: req.params.city || req.query.city,
      area: req.params.area || req.query.area,
      price: req.params.price || req.query.price,
      category: req.params.category || req.query.category,
      order: req.params.order || req.query.order,
      k: req.params.k || req.query.k,
      pagesize: parseInt(req.params.pagesize || req.query.pagesize || 20, 10),
      page: parseInt(req.params.page || req.query.page || 1, 10)
    };

    // Validate parameters
    const { error, value } = meituanSchema.validate(params);
    if (error) {
      throw new ApiError(400, 'Invalid request parameters', error.details);
    }

    const validated = value;
    
    // For testing purposes, return mock data if database connection is skipped
    if (process.env.SKIP_DB_CONNECTION === 'true') {
      // Generate mock deals
      const deals = [];
      const total = 100;
      
      // Create sample data
      for (let i = 0; i < validated.pagesize; i++) {
        const index = (validated.page - 1) * validated.pagesize + i;
        if (index < total) {
          deals.push({
            id: index + 1,
            title: `Sample Deal ${index + 1}${validated.k ? ` with ${validated.k}` : ''}`,
            description: 'This is a sample deal description for testing purposes',
            price: Math.floor(Math.random() * 100) + 50,
            original_price: Math.floor(Math.random() * 200) + 100,
            discount: Math.floor(Math.random() * 50) + 30,
            city: validated.city || 'Beijing',
            area: validated.area || 'Chaoyang',
            category: validated.category || 'Food',
            image_url: 'https://example.com/image.jpg',
            deal_url: 'https://example.com/deal',
            time: new Date().toISOString()
          });
        }
      }
      
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
    }
    
    // If not skipping DB connection, use real database
    // Build SQL query with parameterized query
    let sqlQuery = 'SELECT * FROM meituan_deals WHERE 1=1';
    let queryParams = [];
    
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