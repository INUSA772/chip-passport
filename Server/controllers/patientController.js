const chipService = require('../services/chipService');
const Patient = require('../models/Patient');
const Visit = require('../models/Visit');

// Builds the health summary that goes on the card
function buildHealthRecord(patient, latestVisit = null) {
  return {
    nationalId: patient.nationalId,
    fullName: patient.fullName,
    dateOfBirth: patient.dateOfBirth
      ? new Date(patient.dateOfBirth).toISOString().split('T')[0]
      : null,
    bloodType: patient.bloodType || '',
    allergies: patient.allergies || '',
    chronicConditions: patient.chronicConditions || '',
    currentMedications: patient.currentMedications || '',
    mostRecentVisit: latestVisit
      ? {
          date: latestVisit.visitDate
            ? new Date(latestVisit.visitDate).toISOString().split('T')[0]
            : null,
          diagnosis: latestVisit.diagnosis || '',
          treatmentNotes: latestVisit.treatmentNotes || '',
        }
      : null,
    issuedAt: new Date().toISOString(),
  };
}

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

// Register a new patient and issue their first card
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

    // Issue the first card. A new patient has no visits yet.
    let qrImage = null;
    let healthRecord = null;
    try {
      healthRecord = buildHealthRecord(patient, null);
      qrImage = await chipService.writeToChip(healthRecord);
    } catch (cardError) {
      console.error('First card error:', cardError);
    }

    return res.status(201).json({ message: 'Patient registered.', patient, qrImage, healthRecord });
  } catch (error) {
    console.error('Patient registration error:', error);
    return res.status(500).json({ message: 'Failed to register patient.', error: error.message });
  }
}

// Create or replace a patient's card (built from the database)
async function generateCard(req, res) {
  try {
    const { nationalId } = req.body;

    if (!nationalId || !String(nationalId).trim()) {
      return res.status(400).json({ message: 'National ID is required.' });
    }

    const patient = await Patient.findOne({ nationalId: String(nationalId).trim() });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found. Register the patient first.' });
    }

    const latestVisit = await Visit.findOne({ nationalId: patient.nationalId })
      .sort({ visitDate: -1 });

    const healthRecord = buildHealthRecord(patient, latestVisit);
    const qrImage = await chipService.writeToChip(healthRecord);

    return res.status(200).json({ qrImage, healthRecord });
  } catch (error) {
    console.error('Generate card error:', error);
    return res.status(500).json({
      message: 'Failed to generate card.',
      error: error.message,
    });
  }
}

// Link an RFID / MIFARE card UID to an existing patient
async function linkRfid(req, res) {
  try {
    const { nationalId, rfidUid } = req.body;

    if (!nationalId || !rfidUid) {
      return res.status(400).json({ message: 'National ID and RFID UID are required.' });
    }

    const uid = String(rfidUid).trim().toUpperCase();

    const taken = await Patient.findOne({ rfidUid: uid });
    if (taken && taken.nationalId !== nationalId.trim()) {
      return res.status(409).json({
        message: 'This card is already linked to another patient.',
      });
    }

    const patient = await Patient.findOneAndUpdate(
      { nationalId: nationalId.trim() },
      { rfidUid: uid },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    return res.status(200).json({
      message: 'RFID card linked successfully.',
      patient: {
        nationalId: patient.nationalId,
        fullName: patient.fullName,
        rfidUid: patient.rfidUid,
      },
    });
  } catch (error) {
    console.error('Link RFID error:', error);
    return res.status(500).json({ message: 'Failed to link RFID card.' });
  }
}

// Look up patient by RFID UID after tapping the physical card
async function lookupByRfid(req, res) {
  try {
    const { rfidUid } = req.body;

    if (!rfidUid) {
      return res.status(400).json({ message: 'RFID UID is required.' });
    }

    const uid = String(rfidUid).trim().toUpperCase();
    const patient = await Patient.findOne({ rfidUid: uid });

    if (!patient) {
      return res.status(404).json({
        message: 'No patient linked to this card. Link the card first.',
      });
    }

    const latestVisit = await Visit.findOne({ nationalId: patient.nationalId })
      .sort({ visitDate: -1 })
      .lean();

    const healthRecord = {
      nationalId: patient.nationalId,
      fullName: patient.fullName,
      dateOfBirth: patient.dateOfBirth,
      bloodType: patient.bloodType || '',
      allergies: patient.allergies || '',
      chronicConditions: patient.chronicConditions || '',
      currentMedications: patient.currentMedications || '',
      mostRecentVisit: latestVisit
        ? {
            visitDate: latestVisit.visitDate,
            diagnosis: latestVisit.diagnosis,
            treatmentNotes: latestVisit.treatmentNotes || '',
            facility: latestVisit.facility || '',
          }
        : null,
      source: 'rfid',
    };

    return res.status(200).json({
      message: 'Patient found from RFID card.',
      healthRecord,
      patient: {
        nationalId: patient.nationalId,
        fullName: patient.fullName,
        rfidUid: patient.rfidUid,
      },
    });
  } catch (error) {
    console.error('RFID lookup error:', error);
    return res.status(500).json({ message: 'RFID lookup failed.' });
  }
}

module.exports = {
  scanCard,
  generateCard,
  registerPatient,
  linkRfid,
  lookupByRfid,
};