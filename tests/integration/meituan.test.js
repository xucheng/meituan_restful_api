const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('../../src/routes');
const { errorHandler } = require('../../src/middlewares/errorHandler');

// Create a test app with just what we need
function createTestApp() {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use('/', routes);
  app.use(errorHandler);
  return app;
}

describe('Meituan API Integration Tests', () => {
  let app;
  
  beforeAll(() => {
    // Ensure the DB connection is skipped for tests
    process.env.SKIP_DB_CONNECTION = 'true';
    app = createTestApp();
  });

  describe('GET /data/meituan.json', () => {
    it('should return deals in JSON format', async () => {
      const response = await request(app)
        .get('/data/meituan.json')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('meta');
      expect(response.body).toHaveProperty('deals');
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('pagesize');
      expect(Array.isArray(response.body.deals)).toBe(true);
    });

    it('should filter deals by city', async () => {
      const response = await request(app)
        .get('/data/meituan.json/city/shanghai')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.deals.length).toBeGreaterThan(0);
      response.body.deals.forEach(deal => {
        expect(deal.city).toBe('shanghai');
      });
    });

    it('should filter deals by category', async () => {
      const response = await request(app)
        .get('/data/meituan.json/city/beijing/category/food')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.deals.length).toBeGreaterThan(0);
      response.body.deals.forEach(deal => {
        expect(deal.city).toBe('beijing');
        expect(deal.category).toBe('food');
      });
    });

    it('should filter deals by keyword', async () => {
      const response = await request(app)
        .get('/data/meituan.json/city/beijing/k/discount')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.deals.length).toBeGreaterThan(0);
      response.body.deals.forEach(deal => {
        expect(deal.title).toContain('discount');
      });
    });

    it('should handle pagination correctly', async () => {
      const pageSize = 5;
      const page = 2;
      
      const response = await request(app)
        .get(`/data/meituan.json?pagesize=${pageSize}&page=${page}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.meta.page).toBe(page);
      expect(response.body.meta.pagesize).toBe(pageSize);
      expect(response.body.deals.length).toBeLessThanOrEqual(pageSize);
      
      // Check that we get different results on different pages
      const firstPageResponse = await request(app)
        .get(`/data/meituan.json?pagesize=${pageSize}&page=1`)
        .expect(200);
      
      expect(firstPageResponse.body.deals[0].id).not.toBe(response.body.deals[0].id);
    });
  });

  describe('GET /data/meituan.xml', () => {
    it('should return deals in XML format', async () => {
      const response = await request(app)
        .get('/data/meituan.xml')
        .expect('Content-Type', /xml/)
        .expect(200);
      
      expect(response.text).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(response.text).toContain('<response>');
      expect(response.text).toContain('<meta>');
      expect(response.text).toContain('<deals>');
      expect(response.text).toContain('<deal>');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      await request(app)
        .get('/data/invalid-route')
        .expect(404)
        .expect('Content-Type', /json/);
    });
  });
});