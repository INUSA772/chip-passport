
// Sets up the Express app: middleware, routes, everything except
// actually starting the server (that's server.js's job).
// Keeping app.js and server.js separate makes testing easier later —
// tests can import app.js without starting a real server.

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const visitRoutes = require('./routes/visitRoutes');

const app = express();

// Allows the frontend (running on a different port) to talk to this server.
app.use(cors());

// Lets Express understand JSON request bodies (req.body).
app.use(express.json());

// Every route file gets mounted under a clear base path,
// matching the URLs used throughout our controllers.
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/visit', visitRoutes);

// Simple route to confirm the server is alive — useful for quick testing.
app.get('/', (req, res) => {
  res.send('Electronic Health Passport API is running.');
});

module.exports = app;