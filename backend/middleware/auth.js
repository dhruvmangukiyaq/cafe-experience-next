const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');

const httpError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// Protects routes: expects "Authorization: Bearer <token>".
// Attaches the logged-in user (without password hash) as req.user.
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw httpError(401, 'Not authorized — please log in');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
  } catch (e) {
    throw httpError(401, 'Session expired — please log in again');
  }

  const user = await User.findById(decoded.id).select('-passwordHash');
  if (!user) {
    throw httpError(401, 'User no longer exists');
  }

  req.user = user;
  next();
});

module.exports = protect;
