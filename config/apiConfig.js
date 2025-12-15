// API Configuration - Centralized constants and configs

export const API_CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
    maxAge: 24 * 60 * 60 * 1000,
  },
  // OTP settings
  OTP: {
    EXPIRY_TIME: 600000, 
    LENGTH: 6,
  },

  TOKEN: {
    ACCESS_TOKEN_EXPIRY: '5h',
    REFRESH_TOKEN_EXPIRY: '7d',
  },

  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  },

  STATUS: {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
  },
};

export const getPaginationParams = (query) => {
  const page = parseInt(query.page) || API_CONFIG.PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(
    parseInt(query.perPage) || API_CONFIG.PAGINATION.DEFAULT_LIMIT,
    API_CONFIG.PAGINATION.MAX_LIMIT
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const getSortParams = (query) => {
  const sortBy = query.sortBy || 'createdAt';
  const order = query.order === 'asc' ? 1 : -1;
  return { [sortBy]: order };
};
