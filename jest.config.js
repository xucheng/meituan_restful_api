module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/utils/logger.js' // Skip logger to avoid console output during tests
  ],
  setupFiles: ['<rootDir>/tests/setup.js']
};