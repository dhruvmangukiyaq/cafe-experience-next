// Simple MongoDB connection helper.
// IMPORTANT: No real URI is stored here.
// The user creates the Atlas cluster + .env file manually with:
//   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
const mongoose = require('mongoose');

const connectDB = async () => {
  // Read only from environment variable (placeholder, set by you in .env)
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined. Please set it in your .env file.');
  }

  // Connect using the env-provided URI — no hardcoded credentials
  await mongoose.connect(uri);
  console.log('MongoDB connected');
};

module.exports = connectDB;
