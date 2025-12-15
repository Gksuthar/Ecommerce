// Common Validation Utilities

import mongoose from 'mongoose';

export const validateRequiredFields = (fields, data) => {
  const missing = [];
  fields.forEach((field) => {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      missing.push(field);
    }
  });
  return missing.length > 0 ? missing : null;
};

export const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateNumber = (value) => {
  return !isNaN(value) && Number(value) > 0;
};

export const sanitizeData = (data, allowedFields) => {
  const sanitized = {};
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      sanitized[field] = data[field];
    }
  });
  return sanitized;
};
