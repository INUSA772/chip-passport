import { useState } from 'react';
import { API_BASE_URL } from '../services/api';
import PageLayout from '../components/PageLayout.jsx';
import '../styles/GenerateCard.css';

function GenerateCard() {
  const [nationalId, setNationalId] = useState('');
  const [qrImage, setQrImage] = useState(null);
  const [healthRecord, setHealthRecord] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/patient/generate-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nationalId: nationalId.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to generate card.');
        return;
      }

      setQrImage(data.qrImage);
      setHealthRecord(data.healthRecord);
    } catch (err) {
      setError('Could not reach the server. Is it running?');
    } finally {
      setLoading(false);
    }
  }

  function handleGenerateAnother() {
    setQrImage(null);
    setHealthRecord(null);
    setNationalId('');
    setError('');
  }

  return (
    <PageLayout>
      <main className="gc-main">
        <div className="gc-header">
          <h1 className="gc-title">Re-issue Card</h1>
          <p className="gc-subtitle">
            Enter the patient’s National ID to create or update their Health Passport card.
          </p>
        </div>

        {/* ========== SUCCESS VIEW (QR only) ========== */}
        {qrImage ? (
          <div className="gc-success-view">
            <div className="gc-success-badge">Card generated successfully</div>

            {healthRecord && (
              <>
                <h2 className="gc-success-name">{healthRecord.fullName}</h2>
                <p className="gc-success-id">National ID: {healthRecord.nationalId}</p>
                <p className="gc-success-meta">
                  Blood Type: {healthRecord.bloodType || '—'} · 
                  Allergies: {healthRecord.allergies || 'None'}
                </p>
              </>
            )}

            <p className="gc-success-instruction">
              Show or print this card for the patient
            </p>

            <img
              src={qrImage}
              alt="Patient QR card"
              className="gc-qr-image"
            />

            <button className="gc-another-btn" onClick={handleGenerateAnother}>
              Generate another card
            </button>
          </div>
        ) : (
          /* ========== FORM VIEW ========== */
          <div className="gc-box">
            <form onSubmit={handleSubmit} className="gc-form">
              <div className="gc-field">
                <label htmlFor="nationalId">National ID</label>
                <input
                  id="nationalId"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="e.g. MW001"
                  required
                />
              </div>

              {error && <p className="gc-error">{error}</p>}

              <button type="submit" disabled={loading}>
                {loading ? 'Generating…' : 'Generate Card'}
              </button>
            </form>
          </div>
        )}
      </main>
    </PageLayout>
  );
}

export default GenerateCard;