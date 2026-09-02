// Client/pages/RecordVisit.jsx

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import PageLayout from '../components/PageLayout.jsx';
import '../styles/RecordVisit.css';

function RecordVisit() {
  const [searchParams] = useSearchParams();
  const [nationalId, setNationalId] = useState(searchParams.get('nationalId') || '');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [qrImage, setQrImage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setQrImage(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/visit/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nationalId, diagnosis, treatmentNotes }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to record visit.');
        return;
      }

      setSuccess('Visit recorded. Card updated below — show this to the patient.');
      setQrImage(data.qrImage);
      setDiagnosis('');
      setTreatmentNotes('');
    } catch (err) {
      setError('Could not reach the server. Is it running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout>
      <main className="rv-main">
        <h1 className="rv-title">Record visit</h1>
        <div className="rv-box">
          <form onSubmit={handleSubmit}>
            <label htmlFor="nationalId">National ID</label>
            <input
              id="nationalId"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder="e.g. MW001"
              required
            />

            <label htmlFor="diagnosis">Diagnosis</label>
            <input
              id="diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Malaria"
              required
            />

            <label htmlFor="treatmentNotes">Treatment notes</label>
            <textarea
              id="treatmentNotes"
              value={treatmentNotes}
              onChange={(e) => setTreatmentNotes(e.target.value)}
              placeholder="e.g. Prescribed Coartem, review in 3 days"
              rows="4"
            />

            {error && <p className="rv-error">{error}</p>}
            {success && <p className="rv-success">{success}</p>}

            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save visit'}
            </button>
          </form>

          {qrImage && (
            <div className="rv-result">
              <p>Updated card — scan to verify:</p>
              <img src={qrImage} alt="Updated patient QR card" />
            </div>
          )}
        </div>
      </main>
    </PageLayout>
  );
}

export default RecordVisit;