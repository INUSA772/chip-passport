
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

module.exports = { buildHealthRecord };