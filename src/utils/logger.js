/**
 * Logger utility for application logging
 */
const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'meituan-api' },
  transports: [
    // Write to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message}`
        )
      )
    }),
    // Write to all logs with level 'info' and below to combined.log
    new winston.transports.File({ 
      filename: path.join('logs', 'combined.log'),
      level: 'info'
    }),
    // Write all logs error (and below) to error.log
    new winston.transports.File({ 
      filename: path.join('logs', 'error.log'), 
      level: 'error' 
    })
  ]
});

// Add stream for Morgan middleware
logger.stream = {
  write: message => {
    logger.info(message.trim());
  }
};

module.exports = logger;