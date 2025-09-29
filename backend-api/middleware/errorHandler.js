const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    success: false,
    message: 'Internal Server Error',
    status: 500
  };

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    error.status = 400;
    error.message = 'Validation Error';
    error.errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    error.status = 409;
    error.message = 'Resource already exists';
    error.errors = err.errors.map(e => ({
      field: e.path,
      message: 'This value already exists'
    }));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.status = 401;
    error.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    error.status = 401;
    error.message = 'Token expired';
  }

  // Rate limiting error
  if (err.status === 429) {
    error.status = 429;
    error.message = 'Too many requests, please try again later';
  }

  // Custom application errors
  if (err.status && err.message) {
    error.status = err.status;
    error.message = err.message;
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && error.status === 500) {
    error.message = 'Something went wrong';
    delete error.errors;
  }

  res.status(error.status).json({
    success: false,
    message: error.message,
    ...(error.errors && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

module.exports = { errorHandler, notFound };














