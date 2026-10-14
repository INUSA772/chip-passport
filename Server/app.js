
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const visitRoutes = require('./routes/visitRoutes');
const vitalsRoutes = require('./routes/vitalsRoutes');
const setupRoutes = require('./routes/setup');
const hospitalRoutes = require('./routes/hospital');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

app.set('trust proxy', 1);

app.use(cors());

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/visit', visitRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/stats', statsRoutes);

app.get('/', (req, res) => {
  res.send('Electronic Health Passport API is running.');
});

module.exports = app;