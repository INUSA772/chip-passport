// backend/Server/controllers/patientController.js

const chipService = require('../services/chipService');
const Patient = require('../models/Patient');


async function scanCard(req, res) {
  try {
    const { scannedData } = req.body;

    if (!scannedData) {
      return res.status(400).json({ message: 'No scanned data provided.' });
    }

    const healthRecord = chipService.readFromChip(scannedData);

    return res.status(200).json({ healthRecord });
  } catch (error) {
    return res.status(422).json({
      message: 'Could not read card. It may be corrupted or tampered with.',
      error: error.message,
    });
  }
}

async function registerPatient(req, res) {
  try {
    const { nationalId, fullName, dateOfBirth, bloodType, allergies, chronicConditions, currentMedications } = req.body;

    const existing = await Patient.findOne({ nationalId });
    if (existing) {
      return res.status(409).json({ message: 'Patient with this National ID already exists.' });
    }

    const patient = await Patient.create({
      nationalId,
      fullName,
      dateOfBirth,
      bloodType,
      allergies,
      chronicConditions,
      currentMedications,
    });

    return res.status(201).json({ message: 'Patient registered.', patient });
  } catch (error) {
    console.error('Patient registration error:', error);
    return res.status(500).json({ message: 'Failed to register patient.', error: error.message });
  }
}

async function generateCard(req, res) {
  try {
    const { nationalId, healthRecordData } = req.body;

    const patient = await Patient.findOne({ nationalId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    const qrImage = await chipService.writeToChip(healthRecordData);

    return res.status(200).json({ qrImage });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to generate card.',
      error: error.message,
    });
  }
}

module.exports = {
  scanCard,
  generateCard,
  registerPatient,
};