const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

const httpError = (statusCode, message, errors) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  if (errors) err.errors = errors;
  return err;
};

const EMAIL_RE = /^\S+@\S+\.\S+$/;

// Shared validation for register (login only checks presence + format)
function validateRegister({ name, email, password }) {
  const errors = {};
  if (!name || !name.trim()) errors.name = 'Name is required';
  else if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!email || !email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_RE.test(email.trim())) errors.email = 'Please provide a valid email address';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
  return errors;
}

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'dev-secret-change-me', {
    expiresIn: '7d',
  });
}

function toPublicUser(user) {
  return { _id: user._id, name: user.name, email: user.email, createdAt: user.createdAt };
}

// POST /api/auth/register — { name, email, password } -> { user, token }
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const errors = validateRegister({ name, email, password });
  if (Object.keys(errors).length) {
    throw httpError(400, 'Validation failed', errors);
  }

  const existing = await User.findOne({ email: email.trim().toLowerCase() });
  if (existing) {
    throw httpError(400, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
  });

  res.status(201).json({
    success: true,
    data: { user: toPublicUser(user), token: signToken(user._id) },
  });
});

// POST /api/auth/login — { email, password } -> { user, token }
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !EMAIL_RE.test(String(email).trim())) {
    throw httpError(400, 'Please provide a valid email address');
  }
  if (!password) {
    throw httpError(400, 'Password is required');
  }

  const user = await User.findOne({ email: String(email).trim().toLowerCase() });
  if (!user) {
    throw httpError(401, 'Invalid email or password');
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw httpError(401, 'Invalid email or password');
  }

  res.json({
    success: true,
    data: { user: toPublicUser(user), token: signToken(user._id) },
  });
});

// GET /api/auth/me — needs Bearer token -> current user
exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});
