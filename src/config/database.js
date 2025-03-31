/**
 * Database configuration module
 */
require('dotenv').config();
const logger = require('../utils/logger');

// MySQL configuration
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'meituan',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// MongoDB configuration
const mongodbConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/meituan_api',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
};

// Import configurations from existing files to maintain compatibility
try {
  const mtConfig = require('../../config/hao123v2');
  const t800Config = require('../../config/tuan800');
  
  // Export these configs to maintain backward compatibility
  module.exports = {
    mysql: mysqlConfig,
    mongodb: mongodbConfig,
    hao123v2: mtConfig,
    tuan800: t800Config
  };
} catch (error) {
  logger.warn('Could not load legacy configuration files. Using default settings.');
  
  module.exports = {
    mysql: mysqlConfig,
    mongodb: mongodbConfig
  };
}