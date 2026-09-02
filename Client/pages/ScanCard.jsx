// Client/pages/ScanCard.jsx

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import PageLayout from '../components/PageLayout.jsx';
import '../styles/ScanCard.css';

function ScanCard() {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [healthRecord, setHealthRecord] = useState(null);
  const scannerRef = useRef(null);
  const isRunningRef = useRef(false);

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
    setScanning(true);
  }

  async function stopScan() {
    if (scannerRef.current && isRunningRef.current) {
      isRunningRef.current = false;
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        // Already stopped — safe to ignore.
      }
    }
    setScanning(false);
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
    } catch (err) {
      setError('Could not reach the server. Is it running?');
    }
  }

  return (
    <PageLayout>
      <main className="scan-main">
        <h1 className="scan-title">Scan patient card</h1>

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
            <p>Point the camera at a patient's QR/chip card to pull up their health record.</p>
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
            <h2>Patient record</h2>
            <p><strong>Allergies:</strong> {healthRecord.allergies || 'None recorded'}</p>
            <p><strong>Chronic conditions:</strong> {healthRecord.chronicConditions || 'None recorded'}</p>
            <p><strong>Current medications:</strong> {healthRecord.currentMedications || 'None recorded'}</p>
            <button className="scan-start-btn" onClick={startScan}>Scan another card</button>
            <Link to="/record-visit" className="scan-back-link">Record a visit for this patient</Link>
          </div>
        )}
      </main>
    </PageLayout>
  );
}

export default ScanCard;