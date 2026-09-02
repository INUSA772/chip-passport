// backend/Server/controllers/visitController.js
//
// Handles recording a new patient visit (Process 3.0) and, since a
// visit changes what should be on the card, automatically rewrites
// the card afterward (Process 4.0) — no separate manual step needed
// for routine visits. Generate Card (manual form) stays only for
// issuing a patient's very first card, before any visits exist.

const Visit = require('../models/Visit');
const Patient = require('../models/Patient');
const chipService = require('../services/chipService');

async function recordVisit(req, res) {
  try {
    const { nationalId, diagnosis, treatmentNotes } = req.body;

    const patient = await Patient.findOne({ nationalId });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    const visit = await Visit.create({
      nationalId,
      staffId: req.staff.staffId,
      diagnosis,
      treatmentNotes,
    });

    const healthRecordData = {
      bloodType: patient.bloodType,
      allergies: patient.allergies || '',
      chronicConditions: patient.chronicConditions || '',
      currentMedications: patient.currentMedications || '',
      mostRecentVisit: {
        date: visit.visitDate,
        diagnosis: visit.diagnosis,
        treatmentNotes: visit.treatmentNotes,
      },
    };

    const qrImage = await chipService.writeToChip(healthRecordData);

    return res.status(201).json({
      message: 'Visit recorded and card updated.',
      visit,
      qrImage,
    });
  } catch (error) {
    console.error('Record visit error:', error);
    return res.status(500).json({ message: 'Failed to record visit.', error: error.message });
  }
}

async function getVisitHistory(req, res) {
  try {
    const { nationalId } = req.params;
    const VISIT_CAP = 5;

    const visits = await Visit.find({ nationalId })
      .sort({ visitDate: -1 })
      .limit(VISIT_CAP);

    return res.status(200).json({ visits });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch visit history.', error: error.message });
  }
}

/**
 * GET /api/visit/audit-log
 * Admin-only: lists visits system-wide with WHO recorded them and
 * WHEN — but never the diagnosis or treatment notes. This is the
 * accountability record without exposing clinical content, keeping
 * IT admin's access limited to system oversight, not patient care data.
 */
async function getAuditLog(req, res) {
  try {
    const visits = await Visit.find()
      .select('nationalId staffId visitDate facility')
      .sort({ visitDate: -1 })
      .limit(200);

    return res.status(200).json({ visits });
  } catch (error) {
    console.error('Get audit log error:', error);
    return res.status(500).json({ message: 'Failed to fetch audit log.', error: error.message });
  }
}

module.exports = { recordVisit, getVisitHistory, getAuditLog };