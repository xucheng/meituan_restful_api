/**
 * Application routes
 */
const express = require('express');
const controllers = require('./controllers');
const { notFound } = require('./middlewares/errorHandler');

const router = express.Router();

// Meituan routes
router.get('/data/meituan.:type?/city/:city', controllers.meituan.meituan);
router.get('/data/meituan.:type?/city/:city/area/:area', controllers.meituan.meituan);
router.get('/data/meituan.:type?', controllers.meituan.meituan);

// Complex route with regex pattern (modernized version of the original)
const meituanPattern = /^\/data\/meituan(?:\.(\w+))?(?:\/city(?:(?:\/([^\/]+))?(?:\/area(?:\/([^\/]+))?)?)?)?(?:\/price(?:\/(\w+)?)?)?(?:\/category(?:\/(\w+)?)?)?(?:\/order(?:\/([^-]+(?:-[^\/]+)?)?)?)?(?:\/k(?:\/([^\/]+)?)?)?(?:\/pagesize(?:\/(\d+)?)?)?(?:\/page(?:\/(\d+)?)?)?\/?$/;
router.get(meituanPattern, controllers.meituan.meituan);

// Add other routes here...

// 404 handler - add at the end
router.use(notFound);

module.exports = router;