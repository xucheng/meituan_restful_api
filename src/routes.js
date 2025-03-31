/**
 * Application routes
 */
const express = require('express');
const controllers = require('./controllers');
const { notFound } = require('./middlewares/errorHandler');

const router = express.Router();

// Direct path routes
router.get('/data/meituan.:type?/city/:city/area/:area', controllers.meituan.meituan);
router.get('/data/meituan.:type?/city/:city', controllers.meituan.meituan);
router.get('/data/meituan.:type?', controllers.meituan.meituan);

// Routes with query parameters
router.get('/data/meituan.:type?/city/:city/category/:category', controllers.meituan.meituan);
router.get('/data/meituan.:type?/city/:city/category/:category/k/:k', controllers.meituan.meituan);
router.get('/data/meituan.:type?/city/:city/k/:k', controllers.meituan.meituan);

// Add other routes here...

// 404 handler - add at the end
router.use(notFound);

module.exports = router;