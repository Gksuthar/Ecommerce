// Async Error Handler Wrapper - Eliminates try-catch repetition

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
