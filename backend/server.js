// Load env vars first (MONGODB_URI + PORT come from your manual .env file)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const cafeRoutes = require('./routes/cafeRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors()); // allow React dev server to call this API
app.use(express.json()); // parse JSON bodies

// Ensure MongoDB is connected before any route runs.
// Locally the connection opens once at startup; on Vercel (serverless)
// the cached promise is reused across warm invocations.
let dbPromise = null;
function ensureDB() {
  if (!dbPromise) dbPromise = connectDB();
  return dbPromise;
}
app.use(async (req, res, next) => {
  try {
    await ensureDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Cafe Experience Tracker API is running' });
});

// All cafe CRUD routes live under /api/cafes
app.use('/api/cafes', cafeRoutes);

// Auth routes (public: register/login, protected: me)
app.use('/api/auth', authRoutes);

// File uploads live in MongoDB Atlas (public: list/view, login: upload/delete)
app.use('/api/uploads', uploadRoutes);

// 404 for unknown API routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Central error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5002;

// Export the app for Vercel (serverless): Vercel requires the entrypoint
// file instead of app.listen(). Locally (`node server.js`) it still
// connects + listens exactly like before.
module.exports = app;

if (require.main === module && !process.env.VERCEL) {
  // Connect to MongoDB (Atlas URI from process.env.MONGODB_URI), then start server
  ensureDB()
    .then(() => {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB:', err.message);
      process.exit(1);
    });
}
