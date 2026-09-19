// Wraps async route handlers so we don't need try/catch in every route.
// Any thrown error is passed to the error-handling middleware.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
