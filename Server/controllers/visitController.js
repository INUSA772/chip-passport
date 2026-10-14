const Visit = require('../models/Visit');
const Patient = require('../models/Patient');
const chipService = require('../services/chipService');
const { buildHealthRecord } = require('../services/healthRecordService');

async function recordVisit(req, res) {
  try {
    const { nationalId, diagnosis, treatmentNotes } = req.body;

    if (!nationalId || !diagnosis) {
      return res.status(400).json({ message: 'National ID and diagnosis are required.' });
    }

    const patient = await Patient.findOne({ nationalId: nationalId.trim() });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found. Register the patient first.' });
    }

    // 1. Save the visit
    const visit = await Visit.create({
      nationalId: nationalId.trim(),
      staffId: req.staff.staffId,
      diagnosis: diagnosis.trim(),
      treatmentNotes: treatmentNotes ? treatmentNotes.trim() : '',
    });

    // 2. Build full health summary and write to "chip" (QR)
    const healthRecordData = buildHealthRecord(patient, visit);
    const qrImage = await chipService.writeToChip(healthRecordData);

    return res.status(201).json({
      message: 'Visit recorded and card updated successfully.',
      visit,
      healthRecord: healthRecordData,
      qrImage,
    });
  } catch (error) {
    console.error('Record visit error:', error);
    return res.status(500).json({
      message: 'Failed to record visit.',
      error: error.message,
    });
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
    return res.status(500).json({
      message: 'Failed to fetch visit history.',
      error: error.message,
    });
  }
}

async function getAuditLog(req, res) {
  try {
    const visits = await Visit.find()
      .select('nationalId staffId visitDate facility')
      .sort({ visitDate: -1 })
      .limit(200);

    return res.status(200).json({ visits });
  } catch (error) {
    console.error('Get audit log error:', error);
    return res.status(500).json({
      message: 'Failed to fetch audit log.',
      error: error.message,
    });
  }
}

module.exports = { recordVisit, getVisitHistory, getAuditLog };