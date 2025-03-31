# Meituan RESTful API

This project provides a RESTful API for accessing Meituan and other group buying platform data. Originally created as a personal study project, it has been completely modernized with current best practices.

## Features

- RESTful API for Meituan and other group buying platforms
- Support for both JSON and XML response formats
- Filtering by city, area, price, category, and more
- Sorting and pagination
- High-performance with cluster mode for multiple workers

## Improvements

This repository has been completely modernized with the following improvements:

### Architecture & Code Quality
- Reorganized into a modern directory structure
- Separation of concerns (controllers, data access, middleware)
- Environment-based configuration with dotenv
- Proper error handling with custom error classes
- Async/await pattern instead of callbacks
- Input validation and sanitization with Joi
- Consistent code style and documentation

### Security
- Parameterized SQL queries to prevent SQL injection
- Request validation middleware
- Security headers with Helmet
- CORS protection
- No hardcoded credentials

### Performance
- Database connection pooling
- Auto-scaling cluster workers based on CPU cores
- Optimized route handling
- Improved middleware configuration

### Maintainability
- Structured logging with Winston
- Comprehensive error handling
- Improved documentation
- Environment-specific configuration

### DevOps
- Docker and docker-compose for containerization
- Production-ready deployment configuration
- Health monitoring

## Technologies

- Node.js (18+) with Express framework
- MySQL for relational data storage
- MongoDB for document data storage
- Docker for containerization
- Modern architecture with proper error handling and validation

## Prerequisites

- Node.js 18+
- MySQL database
- MongoDB database

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/meituan_restful_api.git
   cd meituan_restful_api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your database credentials and other settings.

4. Start the application:
   ```bash
   npm start
   ```

   For development mode with auto-reload:
   ```bash
   npm run dev
   ```

## Docker Setup

You can run the application using Docker:

```bash
docker-compose up -d
```

This will start the API along with MySQL and MongoDB containers.

## Project Structure

```
meituan_restful_api/
├── src/                    # Application source code
│   ├── config/             # Configuration files
│   ├── controllers/        # API endpoints and logic
│   ├── dao/                # Data Access Objects
│   ├── middlewares/        # Express middlewares
│   ├── models/             # Data models
│   └── utils/              # Utility functions
├── logs/                   # Application logs
├── .env                    # Environment variables
├── .env.example            # Example environment file
├── app.js                  # Application entry point
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose configuration
└── package.json            # Dependencies and scripts
```

## API Endpoints

### Meituan Deals

```
GET /data/meituan.[format]
GET /data/meituan.[format]/city/:city
GET /data/meituan.[format]/city/:city/area/:area
```

Parameters:
- `format`: Response format (json or xml, default: json)
- `city`: Filter by city name
- `area`: Filter by area name
- `price`: Filter by price range (format: min-max)
- `category`: Filter by category
- `order`: Sort order (time-desc, time-asc, price-desc, price-asc, value-desc, value-asc)
- `k`: Search keyword
- `pagesize`: Number of items per page (default: 20)
- `page`: Page number (default: 1)

Example:
```
GET /data/meituan.json/city/beijing/category/food/order/price-asc/page/2
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

Error response format:
```json
{
  "status": "error",
  "message": "Error message",
  "details": ["Validation error details"]
}
```

## Logging

The application uses Winston for structured logging:

- Console logs for development
- File logs for production (combined.log and error.log)
- Log rotation to prevent large log files

## License

This project is licensed under the MIT License.

## Original Author

Created by helloworldjerry@gmail.com