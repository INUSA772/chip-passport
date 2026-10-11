// Server/routes/hospital.js
//
// Lets a logged-in IT admin view and update their hospital's
// public contact details (shown on the login page).

const express = require('express');
const Hospital = require('../models/Hospital');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// GET current hospital info (admin only — the public version is /api/setup/status)
router.get('/', protect, restrictTo('it_admin'), async (req, res) => {
  try {
    const hospital = await Hospital.findOne();
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital record not found.' });
    }
    return res.status(200).json({
      name: hospital.name,
      contactEmail: hospital.contactEmail,
      contactPhone: hospital.contactPhone,
    });
  } catch (error) {
    console.error('Get hospital error:', error);
    return res.status(500).json({ message: 'Failed to fetch hospital info.' });
  }
});

// PATCH — update contact email/phone
router.patch('/contact', protect, restrictTo('it_admin'), async (req, res) => {
  try {
    const { contactEmail, contactPhone } = req.body;

    if (!contactEmail && !contactPhone) {
      return res.status(400).json({ message: 'Provide a contact email or phone number.' });
    }

    const hospital = await Hospital.findOneAndUpdate(
      {},
      {
        contactEmail: contactEmail || '',
        contactPhone: contactPhone || '',
      },
      { new: true }
    );

    if (!hospital) {
      return res.status(404).json({ message: 'Hospital record not found.' });
    }

    return res.status(200).json({
      message: 'Contact info updated.',
      contactEmail: hospital.contactEmail,
      contactPhone: hospital.contactPhone,
    });
  } catch (error) {
    console.error('Update contact error:', error);
    return res.status(500).json({ message: 'Failed to update contact info.' });
  }
});

module.exports = router;