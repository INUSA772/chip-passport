const Vitals = require('../models/Vitals');
const Visit = require('../models/Visit');
const Patient = require('../models/Patient');

// Turn an optional form value into a number, or undefined if empty
function toNumber(value) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return undefined;
  }
  const n = Number(value);
  return Number.isNaN(n) ? NaN : n;
}

// Check a reading is inside a believable range
function outOfRange(value, min, max) {
  return value !== undefined && (Number.isNaN(value) || value < min || value > max);
}

// Nurse records vitals and triage level for a patient
async function recordVitals(req, res) {
  try {
    const {
      nationalId,
      complaint,
      temperature,
      systolic,
      diastolic,
      pulse,
      respiratoryRate,
      oxygenSaturation,
      weight,
      triageLevel,
      notes,
    } = req.body;

    if (!nationalId || !String(nationalId).trim()) {
      return res.status(400).json({ message: 'National ID is required.' });
    }

    const allowedLevels = ['emergency', 'urgent', 'routine'];
    if (!allowedLevels.includes(triageLevel)) {
      return res.status(400).json({ message: 'Choose a triage level: emergency, urgent or routine.' });
    }

    const patient = await Patient.findOne({ nationalId: String(nationalId).trim() });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found. Register the patient first.' });
    }

    const readings = {
      temperature: toNumber(temperature),
      systolic: toNumber(systolic),
      diastolic: toNumber(diastolic),
      pulse: toNumber(pulse),
      respiratoryRate: toNumber(respiratoryRate),
      oxygenSaturation: toNumber(oxygenSaturation),
      weight: toNumber(weight),
    };

    // At least one reading is needed
    const hasReading = Object.values(readings).some((v) => v !== undefined);
    if (!hasReading) {
      return res.status(400).json({ message: 'Enter at least one vital sign.' });
    }

    // Guard against typing mistakes
    if (
      outOfRange(readings.temperature, 30, 45) ||
      outOfRange(readings.systolic, 50, 260) ||
      outOfRange(readings.diastolic, 30, 160) ||
      outOfRange(readings.pulse, 20, 250) ||
      outOfRange(readings.respiratoryRate, 4, 80) ||
      outOfRange(readings.oxygenSaturation, 50, 100) ||
      outOfRange(readings.weight, 0.5, 400)
    ) {
      return res.status(400).json({ message: 'One of the readings looks wrong. Please check the values.' });
    }

    const vitals = await Vitals.create({
      nationalId: String(nationalId).trim(),
      staffId: req.staff.staffId,
      complaint: complaint ? String(complaint).trim() : '',
      ...readings,
      triageLevel,
      notes: notes ? String(notes).trim() : '',
    });

    return res.status(201).json({
      message: 'Vitals recorded successfully.',
      vitals,
      patientName: patient.fullName,
    });
  } catch (error) {
    console.error('Record vitals error:', error);
    return res.status(500).json({ message: 'Failed to record vitals.', error: error.message });
  }
}

// Last 5 vitals records for one patient
async function getVitalsHistory(req, res) {
  try {
    const { nationalId } = req.params;

    const vitals = await Vitals.find({ nationalId })
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({ vitals });
  } catch (error) {
    console.error('Get vitals history error:', error);
    return res.status(500).json({ message: 'Failed to fetch vitals history.', error: error.message });
  }
}

// Patients this nurse triaged today
async function getMyTriageToday(req, res) {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const records = await Vitals.find({
      staffId: req.staff.staffId,
      createdAt: { $gte: startOfDay },
    }).sort({ createdAt: -1 });

    // Add each patient's name
    const nationalIds = [...new Set(records.map((r) => r.nationalId))];
    const patients = await Patient.find({ nationalId: { $in: nationalIds } }).select('nationalId fullName');
    const nameById = {};
    patients.forEach((p) => {
      nameById[p.nationalId] = p.fullName;
    });

    const triaged = records.map((r) => ({
      id: r._id,
      nationalId: r.nationalId,
      patientName: nameById[r.nationalId] || 'Unknown',
      triageLevel: r.triageLevel,
      complaint: r.complaint,
      time: r.createdAt,
    }));

    return res.status(200).json({ triaged });
  } catch (error) {
    console.error('Get triage today error:', error);
    return res.status(500).json({ message: 'Failed to fetch triage list.', error: error.message });
  }
}

// Waiting queue for clinicians and dentists:
// today's patients who have had vitals taken but have not been seen yet
async function getWaitingQueue(req, res) {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // 1. All vitals taken today, newest first
    const records = await Vitals.find({ createdAt: { $gte: startOfDay } }).sort({ createdAt: -1 });

    // 2. Keep only the latest vitals record for each patient
    const latestByPatient = new Map();
    records.forEach((r) => {
      if (!latestByPatient.has(r.nationalId)) {
        latestByPatient.set(r.nationalId, r);
      }
    });

    const nationalIds = [...latestByPatient.keys()];

    // 3. Find visits recorded today for those patients
    const visits = await Visit.find({
      nationalId: { $in: nationalIds },
      visitDate: { $gte: startOfDay },
    }).select('nationalId visitDate');

    const lastVisitById = new Map();
    visits.forEach((v) => {
      const current = lastVisitById.get(v.nationalId);
      if (!current || v.visitDate > current) {
        lastVisitById.set(v.nationalId, v.visitDate);
      }
    });

    // 4. Waiting = no visit recorded after the vitals were taken
    const waitingRecords = [...latestByPatient.values()].filter((r) => {
      const lastVisit = lastVisitById.get(r.nationalId);
      return !lastVisit || lastVisit < r.createdAt;
    });

    // 5. Add patient names
    const patients = await Patient.find({ nationalId: { $in: nationalIds } }).select('nationalId fullName');
    const nameById = {};
    patients.forEach((p) => {
      nameById[p.nationalId] = p.fullName;
    });

    // 6. Sort: emergency first, then urgent, then routine. Longest wait first inside each group.
    const rank = { emergency: 0, urgent: 1, routine: 2 };
    waitingRecords.sort((a, b) => {
      if (rank[a.triageLevel] !== rank[b.triageLevel]) {
        return rank[a.triageLevel] - rank[b.triageLevel];
      }
      return a.createdAt - b.createdAt;
    });

    const queue = waitingRecords.map((r) => ({
      id: r._id,
      nationalId: r.nationalId,
      patientName: nameById[r.nationalId] || 'Unknown',
      triageLevel: r.triageLevel,
      complaint: r.complaint,
      time: r.createdAt,
    }));

    return res.status(200).json({ queue });
  } catch (error) {
    console.error('Get waiting queue error:', error);
    return res.status(500).json({ message: 'Failed to fetch waiting queue.', error: error.message });
  }
}

module.exports = { recordVitals, getVitalsHistory, getMyTriageToday, getWaitingQueue };