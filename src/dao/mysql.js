/**
 * MySQL Database Access Layer
 */
const mysql = require('mysql2/promise');
const config = require('../config/database');
const logger = require('../utils/logger');

// Create a connection pool
const pool = mysql.createPool(config.mysql);

// Test the database connection
(async function testConnection() {
  try {
    const connection = await pool.getConnection();
    logger.info('MySQL database connection successful');
    connection.release();
  } catch (error) {
    logger.error('MySQL database connection failed:', error);
  }
})();

/**
 * Execute a query with parameters
 * @param {string} sql - SQL query
 * @param {Array} params - Parameters for prepared statement
 * @returns {Promise} - Query results
 */
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    logger.error(`Database query error: ${error.message}`, { sql, params });
    throw error;
  }
}

/**
 * Execute a query with named parameters (legacy support)
 * @param {string} sql - SQL query with named parameters
 * @param {Object} params - Named parameters
 * @returns {Promise} - Query results
 */
async function namedQuery(sql, params = {}) {
  // Replace named parameters with ? and build params array
  const paramNames = Object.keys(params);
  const paramValues = [];
  
  let preparedSql = sql;
  
  paramNames.forEach(name => {
    const regex = new RegExp(':' + name, 'g');
    preparedSql = preparedSql.replace(regex, '?');
    paramValues.push(params[name]);
  });
  
  return query(preparedSql, paramValues);
}

module.exports = {
  query,
  namedQuery,
  pool
};