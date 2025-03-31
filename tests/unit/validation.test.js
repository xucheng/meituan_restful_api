const { validate, schemas } = require('../../src/middlewares/validation');
const { ApiError } = require('../../src/middlewares/errorHandler');

describe('Validation Middleware', () => {
  let mockRequest;
  let mockResponse;
  let nextFunction;

  beforeEach(() => {
    mockRequest = {
      params: {},
      query: {},
      path: '/test',
      method: 'GET'
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    nextFunction = jest.fn();
  });

  describe('validate', () => {
    it('should call next() when validation passes', () => {
      mockRequest.params = { page: 1, pagesize: 20 };
      const middleware = validate(schemas.pagination);
      
      middleware(mockRequest, mockResponse, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 400 when validation fails', () => {
      mockRequest.params = { page: -1, pagesize: 1000 };
      const middleware = validate(schemas.pagination);
      
      middleware(mockRequest, mockResponse, nextFunction);
      
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Invalid request data'
        })
      );
    });
  });

  describe('schemas', () => {
    it('should validate pagination parameters correctly', () => {
      const validData = { page: 5, pagesize: 50 };
      const { error: validError } = schemas.pagination.validate(validData);
      expect(validError).toBeUndefined();

      const invalidData = { page: 0, pagesize: 500 };
      const { error: invalidError } = schemas.pagination.validate(invalidData);
      expect(invalidError).toBeDefined();
    });

    it('should validate location parameters correctly', () => {
      const validData = { city: 'beijing', area: 'chaoyang' };
      const { error: validError } = schemas.location.validate(validData);
      expect(validError).toBeUndefined();

      const invalidData = { area: 'chaoyang' }; // missing required city
      const { error: invalidError } = schemas.location.validate(invalidData);
      expect(invalidError).toBeDefined();
    });

    it('should validate price range correctly', () => {
      const validData = { price: '10-100' };
      const { error: validError } = schemas.priceRange.validate(validData);
      expect(validError).toBeUndefined();

      const invalidData = { price: '100' }; // incorrect format
      const { error: invalidError } = schemas.priceRange.validate(invalidData);
      expect(invalidError).toBeDefined();
    });
  });
});