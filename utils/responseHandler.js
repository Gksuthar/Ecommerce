// Centralized Response Handler - Consistent API responses

export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    error: false,
    message,
    data,
  });
};

export const sendError = (res, message = 'Error occurred', statusCode = 400, error = null) => {
  return res.status(statusCode).json({
    success: false,
    error: true,
    message,
    ...(error && process.env.NODE_ENV === 'development' && { errorDetails: error }),
  });
};

export const sendCreated = (res, data = null, message = 'Created successfully') => {
  return sendSuccess(res, data, message, 201);
};

export const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(res, message, 404);
};

export const sendUnauthorized = (res, message = 'Unauthorized access') => {
  return sendError(res, message, 401);
};

export const sendServerError = (res, message = 'Internal server error', error = null) => {
  console.error('Server Error:', error);
  return sendError(res, message, 500, error);
};
