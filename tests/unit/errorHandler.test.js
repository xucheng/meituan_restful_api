const { ApiError, notFound, errorHandler } = require('../../src/middlewares/errorHandler');

describe('Error Handler Middleware', () => {
  let mockRequest;
  let mockResponse;
  let nextFunction;

  beforeEach(() => {
    mockRequest = {
      originalUrl: '/test',
      method: 'GET',
      ip: '127.0.0.1'
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    nextFunction = jest.fn();
  });

  describe('ApiError', () => {
    it('should create a custom error with status code and details', () => {
      const error = new ApiError(400, 'Bad Request', ['Field is required']);
      
      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad Request');
      expect(error.details).toEqual(['Field is required']);
    });
  });

  describe('notFound', () => {
    it('should create a 404 ApiError and pass it to next()', () => {
      notFound(mockRequest, mockResponse, nextFunction);
      
      expect(nextFunction).toHaveBeenCalledTimes(1);
      expect(nextFunction.mock.calls[0][0]).toBeInstanceOf(ApiError);
      expect(nextFunction.mock.calls[0][0].statusCode).toBe(404);
      expect(nextFunction.mock.calls[0][0].message).toContain('Resource not found');
    });
  });

  describe('errorHandler', () => {
    it('should handle API errors with appropriate status code', () => {
      const error = new ApiError(400, 'Bad Request', ['Invalid field']);
      
      errorHandler(error, mockRequest, mockResponse, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Bad Request',
        details: ['Invalid field']
      });
    });

    it('should handle unexpected errors with 500 status code', () => {
      const error = new Error('Unexpected Error');
      
      errorHandler(error, mockRequest, mockResponse, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Unexpected Error',
        details: null
      });
    });

    it('should hide error details in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const error = new Error('Internal Server Error');
      
      errorHandler(error, mockRequest, mockResponse, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal Server Error',
        details: null
      });
      
      process.env.NODE_ENV = originalEnv;
    });
  });
});