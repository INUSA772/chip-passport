// backend/Server/controllers/statsController.js
//
// Admin-only: returns summary counts for the Dashboard analytics
// cards — total patients, staff, visits, and visits recorded today.
// Inspired by the Vitira Health system (Nigeria), which gave admins
// data analytics on system activity rather than just raw records.

const Patient = require('../models/Patient');
const StaffUser = require('../models/StaffUser');
const Visit = require('../models/Visit');

async function getStats(req, res) {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalPatients, totalStaff, totalVisits, visitsToday] = await Promise.all([
      Patient.countDocuments(),
      StaffUser.countDocuments(),
      Visit.countDocuments(),
      Visit.countDocuments({ visitDate: { $gte: startOfToday } }),
    ]);

    return res.status(200).json({
      totalPatients,
      totalStaff,
      totalVisits,
      visitsToday,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ message: 'Failed to fetch stats.', error: error.message });
  }
}

module.exports = { getStats };