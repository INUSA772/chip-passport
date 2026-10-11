const chipService = require('../services/chipService');
const Patient = require('../models/Patient');
const Visit = require('../models/Visit');
const { buildHealthRecord } = require('../services/healthRecordService');

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
    const {
      nationalId,
      fullName,
      dateOfBirth,
      bloodType,
      allergies,
      chronicConditions,
      currentMedications,
    } = req.body;

    if (!nationalId || !fullName || !dateOfBirth) {
      return res.status(400).json({
        message: 'National ID, full name and date of birth are required.',
      });
    }

    const existing = await Patient.findOne({ nationalId: nationalId.trim() });
    if (existing) {
      return res.status(409).json({ message: 'Patient with this National ID already exists.' });
    }

    const patient = await Patient.create({
      nationalId: nationalId.trim(),
      fullName: fullName.trim(),
      dateOfBirth,
      bloodType: bloodType || '',
      allergies: allergies || '',
      chronicConditions: chronicConditions || '',
      currentMedications: currentMedications || '',
    });

    // Automatically generate the first card
    const healthRecordData = buildHealthRecord(patient, null);
    const qrImage = await chipService.writeToChip(healthRecordData);

    return res.status(201).json({
      message: 'Patient registered and first card generated.',
      patient,
      qrImage,
    });
  } catch (error) {
    console.error('Patient registration error:', error);
    return res.status(500).json({
      message: 'Failed to register patient.',
      error: error.message,
    });
  }
}

async function generateCard(req, res) {
  try {
    const { nationalId } = req.body;

    if (!nationalId) {
      return res.status(400).json({ message: 'National ID is required.' });
    }

    const patient = await Patient.findOne({ nationalId: nationalId.trim() });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    // Get the most recent visit (if any)
    const latestVisit = await Visit.findOne({ nationalId: nationalId.trim() })
      .sort({ visitDate: -1 });

    const healthRecordData = buildHealthRecord(patient, latestVisit);
    const qrImage = await chipService.writeToChip(healthRecordData);

    return res.status(200).json({
      message: 'Card generated successfully.',
      healthRecord: healthRecordData,
      qrImage,
    });
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