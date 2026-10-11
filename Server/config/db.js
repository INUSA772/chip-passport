
// Handles connecting to MongoDB. Kept in its own file so nothing
// else in the app needs to know connection details — they just
// import and call connectDB().

const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1); // stop the app — it can't run without a database
  }
}

module.exports = connectDB;