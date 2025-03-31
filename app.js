/**
 * Meituan RESTful API Application
 * @author helloworldjerry@gmail.com
 */
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const cluster = require('cluster');
const os = require('os');
const logger = require('./src/utils/logger');
const routes = require('./src/routes');
const { errorHandler } = require('./src/middlewares/errorHandler');
const mongoDb = require('./src/dao/mongodb');

// Set default environment variables
const PORT = process.env.PORT || 3000;
const WORKERS = process.env.WORKERS || os.cpus().length;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create Express application
const app = express();

// Application middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS handling
app.use(bodyParser.json()); // Parse JSON
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded
app.use(express.json()); // Parse JSON bodies

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// API routes
app.use('/', routes);

// Error handler middleware (must be after routes)
app.use(errorHandler);

// Connect to MongoDB if not skipped
if (!process.env.SKIP_DB_CONNECTION) {
  mongoDb.connect().catch(err => {
    logger.error('Failed to connect to MongoDB:', err);
  });
} else {
  logger.info('Skipping database connections for testing');
}

// Start server
if (cluster.isPrimary && NODE_ENV === 'production') {
  // Master process - fork workers
  logger.info(`Master ${process.pid} is running`);
  
  // Fork workers based on configuration
  for (let i = 0; i < WORKERS; i++) {
    cluster.fork();
  }
  
  // Listen for worker events
  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
    logger.info('Starting a new worker');
    cluster.fork();
  });
} else {
  // Worker process - start Express server
  app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT} in ${NODE_ENV} mode`);
    logger.info(`Worker ${process.pid} started`);
  });
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Graceful shutdown
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Continue running
});