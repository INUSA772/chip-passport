import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import PageLayout from '../components/PageLayout.jsx';
import '../styles/ScanCard.css';

const vitalsStyles = `
.sv-box {
  margin-top: 16px;
  padding: 16px 18px;
  background: #f5f8fa;
  border: 1px solid #dbe3ea;
  border-radius: 12px;
}
.sv-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}
.sv-head h3 { margin: 0; font-size: 1rem; }
.sv-time { margin: 0 0 12px; font-size: 0.8rem; color: #5b6b7a; }
.sv-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 10px;
}
.sv-item {
  background: #fff;
  border: 1px solid #dbe3ea;
  border-radius: 10px;
  padding: 10px 12px;
}
.sv-item strong { display: block; font-size: 1.1rem; }
.sv-item span {
  font-size: 0.72rem;
  font-weight: 700;
  color: #5b6b7a;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.sv-text { margin: 12px 0 0; font-size: 0.9rem; }
.sv-empty { margin: 0; font-size: 0.9rem; color: #5b6b7a; }
.sv-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
}
.sv-badge--emergency { background: #fdecec; color: #9b1c1c; }
.sv-badge--urgent { background: #fff3dc; color: #8a5a00; }
.sv-badge--routine { background: #e6f6f1; color: #0b6b58; }
`;

function ScanCard() {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [healthRecord, setHealthRecord] = useState(null);
  const [latestVitals, setLatestVitals] = useState(null);
  const scannerRef = useRef(null);
  const isRunningRef = useRef(false);

  const role = localStorage.getItem('role') || '';
  const canSeeVitals = ['nurse', 'clinician', 'dentist'].includes(role);
  const canRecordVisit = ['clinician', 'dentist'].includes(role);

  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    async function launchCamera() {
      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: 250 },
          (decodedText) => handleScanSuccess(decodedText),
          () => {}
        );
        isRunningRef.current = true;
      } catch (envError) {
        try {
          const cameras = await Html5Qrcode.getCameras();
          if (cameras.length === 0) {
            setError('No camera found on this device.');
            setScanning(false);
            return;
          }
          await scanner.start(
            cameras[0].id,
            { fps: 10, qrbox: 250 },
            (decodedText) => handleScanSuccess(decodedText),
            () => {}
          );
          isRunningRef.current = true;
        } catch (fallbackError) {
          setError('Could not access camera. Check permissions and try again.');
          setScanning(false);
        }
      }
    }

    launchCamera();

    return () => {
      if (scannerRef.current && isRunningRef.current) {
        isRunningRef.current = false;
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [scanning]);

  function startScan() {
    setError('');
    setHealthRecord(null);
    setLatestVitals(null);
    setScanning(true);
  }

  async function stopScan() {
    if (scannerRef.current && isRunningRef.current) {
      isRunningRef.current = false;
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        // ignore
      }
    }
    setScanning(false);
  }

  // Get the most recent vitals the nurse recorded for this patient
  async function loadLatestVitals(nationalId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/api/vitals/history/${encodeURIComponent(nationalId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (response.ok && data.vitals && data.vitals.length > 0) {
        setLatestVitals(data.vitals[0]); // newest first
      }
    } catch (err) {
      // Vitals are an extra. If they fail, the health summary still shows.
    }
  }

  async function handleScanSuccess(scannedText) {
    isRunningRef.current = false;
    await stopScan();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/patient/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scannedData: scannedText }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Could not read card.');
        return;
      }

      setHealthRecord(data.healthRecord);

      if (canSeeVitals && data.healthRecord && data.healthRecord.nationalId) {
        loadLatestVitals(data.healthRecord.nationalId);
      }
    } catch (err) {
      setError('Could not reach the server. Is it running?');
    }
  }

  // Build the list of readings the nurse actually filled in
  const readings = [];
  if (latestVitals) {
    const v = latestVitals;
    if (v.temperature != null) readings.push({ label: 'Temperature', value: `${v.temperature} °C` });
    if (v.systolic != null && v.diastolic != null) {
      readings.push({ label: 'Blood pressure', value: `${v.systolic}/${v.diastolic}` });
    }
    if (v.pulse != null) readings.push({ label: 'Pulse', value: `${v.pulse} bpm` });
    if (v.respiratoryRate != null) readings.push({ label: 'Breathing rate', value: `${v.respiratoryRate} /min` });
    if (v.oxygenSaturation != null) readings.push({ label: 'Oxygen', value: `${v.oxygenSaturation}%` });
    if (v.weight != null) readings.push({ label: 'Weight', value: `${v.weight} kg` });
  }

  return (
    <PageLayout>
      <style>{vitalsStyles}</style>
      <main className="scan-main">
        <h1 className="scan-title">Scan Patient Card</h1>

        {!scanning && !healthRecord && (
          <div className="scan-idle-card">
            <div className="scan-icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                <path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z"/>
              </svg>
            </div>
            <h2>Ready to scan</h2>
            <p>Point the camera at the patient’s QR card to view their critical health summary.</p>
            <button className="scan-start-btn" onClick={startScan}>
              Start scanning
            </button>
          </div>
        )}

        {scanning && (
          <div className="scan-camera-wrap">
            <div id="qr-reader"></div>
            <button className="scan-cancel-btn" onClick={stopScan}>Cancel</button>
          </div>
        )}

        {error && <p className="scan-error">{error}</p>}

        {healthRecord && (
          <div className="scan-result">
            <h2>Patient Health Summary</h2>

            <div className="scan-section">
              <p><strong>Full Name:</strong> {healthRecord.fullName || '—'}</p>
              <p><strong>National ID:</strong> {healthRecord.nationalId || '—'}</p>
              <p><strong>Date of Birth:</strong> {healthRecord.dateOfBirth || '—'}</p>
              <p><strong>Blood Type:</strong> {healthRecord.bloodType || '—'}</p>
            </div>

            <div className="scan-section">
              <p><strong>Allergies:</strong> {healthRecord.allergies || 'None recorded'}</p>
              <p><strong>Chronic Conditions:</strong> {healthRecord.chronicConditions || 'None recorded'}</p>
              <p><strong>Current Medications:</strong> {healthRecord.currentMedications || 'None recorded'}</p>
            </div>

            {healthRecord.mostRecentVisit && (
              <div className="scan-section">
                <h3>Most Recent Visit</h3>
                <p><strong>Date:</strong> {healthRecord.mostRecentVisit.date || '—'}</p>
                <p><strong>Diagnosis:</strong> {healthRecord.mostRecentVisit.diagnosis || '—'}</p>
                <p><strong>Notes:</strong> {healthRecord.mostRecentVisit.treatmentNotes || '—'}</p>
              </div>
            )}

            {/* Latest vitals from the nurse: nurse, clinician and dentist only */}
            {canSeeVitals && (
              <div className="sv-box">
                <div className="sv-head">
                  <h3>Latest vitals</h3>
                  {latestVitals && (
                    <span className={`sv-badge sv-badge--${latestVitals.triageLevel}`}>
                      {latestVitals.triageLevel}
                    </span>
                  )}
                </div>

                {latestVitals ? (
                  <>
                    <p className="sv-time">
                      Taken {new Date(latestVitals.createdAt).toLocaleString()}
                    </p>
                    <div className="sv-grid">
                      {readings.map((r) => (
                        <div className="sv-item" key={r.label}>
                          <strong>{r.value}</strong>
                          <span>{r.label}</span>
                        </div>
                      ))}
                    </div>
                    {latestVitals.complaint && (
                      <p className="sv-text"><strong>Reason for visit:</strong> {latestVitals.complaint}</p>
                    )}
                    {latestVitals.notes && (
                      <p className="sv-text"><strong>Nurse notes:</strong> {latestVitals.notes}</p>
                    )}
                  </>
                ) : (
                  <p className="sv-empty">No vitals recorded for this patient yet.</p>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
              <button className="scan-start-btn" onClick={startScan}>
                Scan another card
              </button>

              {canRecordVisit && healthRecord.nationalId && (
                <Link
                  to={`/record-visit?nationalId=${encodeURIComponent(healthRecord.nationalId)}`}
                  className="scan-back-link"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '10px 16px',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Record Visit for this patient
                </Link>
              )}
            </div>
          </div>
        )}
      </main>
    </PageLayout>
  );
}

export default ScanCard;