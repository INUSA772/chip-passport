// backend/Server/server.js
//
// The actual entry point — this is the file you run to start
// the whole backend. It loads environment variables, connects
// to the database, then starts listening for requests.

require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to the database FIRST, then only start listening for
// requests once that succeeds — avoids handling requests before
// the database is ready.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});