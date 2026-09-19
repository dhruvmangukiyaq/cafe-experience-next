// Central error handler — always returns { success: false, message, errors? }
// Must be registered LAST in server.js (after all routes).
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Mongoose validation error -> 400
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  // Mongoose bad ObjectId -> 400
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: `Invalid id: ${err.value}` });
  }

  // Multer upload errors (too large, too many files) -> 400
  if (err.name === 'MulterError') {
    const msg =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File too large — max 10MB per file'
        : err.code === 'LIMIT_FILE_COUNT'
          ? 'Too many files — max 10 at a time'
          : 'Upload failed';
    return res.status(400).json({ success: false, message: msg });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server error',
    ...(err.errors ? { errors: err.errors } : {}),
  });
};

module.exports = errorHandler;
