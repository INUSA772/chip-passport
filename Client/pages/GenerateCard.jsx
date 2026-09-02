// Client/pages/GenerateCard.jsx

import { useState } from 'react';
import { API_BASE_URL } from '../services/api';
import PageLayout from '../components/PageLayout.jsx';
import '../styles/GenerateCard.css';

function GenerateCard() {
  const [nationalId, setNationalId] = useState('');
  const [allergies, setAllergies] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');
  const [currentMedications, setCurrentMedications] = useState('');
  const [qrImage, setQrImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setQrImage(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/patient/generate-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nationalId,
          healthRecordData: { allergies, chronicConditions, currentMedications },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to generate card.');
        return;
      }

      setQrImage(data.qrImage);
    } catch (err) {
      setError('Could not reach the server. Is it running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout>
      <main className="gc-main">
        <h1 className="gc-title">Generate card</h1>
        <div className="gc-box">
          <form onSubmit={handleSubmit}>
            <label htmlFor="nationalId">National ID</label>
            <input
              id="nationalId"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder="e.g. MW001"
              required
            />

            <label htmlFor="allergies">Allergies</label>
            <input
              id="allergies"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g. Penicillin"
            />

            <label htmlFor="chronicConditions">Chronic conditions</label>
            <input
              id="chronicConditions"
              value={chronicConditions}
              onChange={(e) => setChronicConditions(e.target.value)}
              placeholder="e.g. Hypertension"
            />

            <label htmlFor="currentMedications">Current medications</label>
            <input
              id="currentMedications"
              value={currentMedications}
              onChange={(e) => setCurrentMedications(e.target.value)}
              placeholder="e.g. Amlodipine 5mg"
            />

            {error && <p className="gc-error">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? 'Generating…' : 'Generate card'}
            </button>
          </form>

          {qrImage && (
            <div className="gc-result">
              <p>Scan this with the Scan Card page to test:</p>
              <img src={qrImage} alt="Generated patient QR card" />
            </div>
          )}
        </div>
      </main>
    </PageLayout>
  );
}

export default GenerateCard;