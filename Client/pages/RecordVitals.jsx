import { useState } from 'react';
import { API_BASE_URL } from '../services/api';
import PageLayout from '../components/PageLayout.jsx';

const emptyForm = {
  nationalId: '',
  complaint: '',
  temperature: '',
  systolic: '',
  diastolic: '',
  pulse: '',
  respiratoryRate: '',
  oxygenSaturation: '',
  weight: '',
  triageLevel: 'routine',
  notes: '',
};

const styles = `
.rv-wrap {
  max-width: 980px;
  margin: 0 auto;
  padding: 20px 24px;
  box-sizing: border-box;
}
.rv-wrap h1 {
  margin: 0;
  font-size: 1.5rem;
}
.rv-wrap .rv-sub {
  margin: 2px 0 14px;
  color: #5b6b7a;
  font-size: 0.9rem;
}
.rv-card {
  background: #fff;
  border: 1px solid #dbe3ea;
  border-radius: 12px;
  padding: 16px;
}
.rv-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px 14px;
}
.rv-span2 { grid-column: span 2; }
.rv-span3 { grid-column: span 3; }
.rv-field label {
  display: block;
  margin-bottom: 3px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #33475b;
}
.rv-field input,
.rv-field select,
.rv-field textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 7px 9px;
  font-size: 0.9rem;
  font-family: inherit;
  border: 1px solid #c8d3dd;
  border-radius: 8px;
  background: #fff;
}
.rv-field textarea {
  resize: none;
  height: 36px;
}
.rv-field input:focus,
.rv-field select:focus,
.rv-field textarea:focus {
  outline: 2px solid #12a58c;
  outline-offset: 0;
  border-color: #12a58c;
}
.rv-save {
  align-self: end;
  padding: 9px 14px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  background: #12a58c;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.rv-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.rv-msg {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.88rem;
}
.rv-msg--error { background: #fdecec; color: #9b1c1c; }
.rv-msg--ok { background: #e6f6f1; color: #0b6b58; }

@media (max-width: 760px) {
  .rv-grid { grid-template-columns: repeat(2, 1fr); }
  .rv-span3 { grid-column: span 2; }
}
`;

function RecordVitals() {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.nationalId.trim()) {
      setError('Patient National ID is required.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/api/vitals/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          nationalId: form.nationalId.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to record vitals.');
        return;
      }

      setSuccess(
        `Vitals recorded for ${data.patientName} (${form.nationalId.trim()}). Triage level: ${form.triageLevel}.`
      );
      setForm(emptyForm);
    } catch (err) {
      setError('Could not reach the server. Is it running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout>
      <style>{styles}</style>
      <div className="rv-wrap">
        <h1>Record Vitals</h1>
        <p className="rv-sub">Take the patient's vital signs and decide how urgent the case is.</p>

        <div className="rv-card">
          <form onSubmit={handleSubmit}>
            <div className="rv-grid">
              {/* Row 1 */}
              <div className="rv-field">
                <label htmlFor="nationalId">Patient National ID</label>
                <input
                  id="nationalId"
                  name="nationalId"
                  type="text"
                  value={form.nationalId}
                  onChange={handleChange}
                  placeholder="National ID"
                  required
                />
              </div>

              <div className="rv-field rv-span2">
                <label htmlFor="complaint">Reason for visit</label>
                <input
                  id="complaint"
                  name="complaint"
                  type="text"
                  value={form.complaint}
                  onChange={handleChange}
                  placeholder="e.g. Fever and headache"
                />
              </div>

              <div className="rv-field">
                <label htmlFor="triageLevel">Triage level</label>
                <select
                  id="triageLevel"
                  name="triageLevel"
                  value={form.triageLevel}
                  onChange={handleChange}
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              {/* Row 2 */}
              <div className="rv-field">
                <label htmlFor="temperature">Temperature (°C)</label>
                <input
                  id="temperature"
                  name="temperature"
                  type="number"
                  step="0.1"
                  value={form.temperature}
                  onChange={handleChange}
                  placeholder="36.8"
                />
              </div>

              <div className="rv-field">
                <label htmlFor="pulse">Pulse (bpm)</label>
                <input
                  id="pulse"
                  name="pulse"
                  type="number"
                  value={form.pulse}
                  onChange={handleChange}
                  placeholder="78"
                />
              </div>

              <div className="rv-field">
                <label htmlFor="systolic">BP top (systolic)</label>
                <input
                  id="systolic"
                  name="systolic"
                  type="number"
                  value={form.systolic}
                  onChange={handleChange}
                  placeholder="120"
                />
              </div>

              <div className="rv-field">
                <label htmlFor="diastolic">BP bottom (diastolic)</label>
                <input
                  id="diastolic"
                  name="diastolic"
                  type="number"
                  value={form.diastolic}
                  onChange={handleChange}
                  placeholder="80"
                />
              </div>

              {/* Row 3 */}
              <div className="rv-field">
                <label htmlFor="respiratoryRate">Breathing (per min)</label>
                <input
                  id="respiratoryRate"
                  name="respiratoryRate"
                  type="number"
                  value={form.respiratoryRate}
                  onChange={handleChange}
                  placeholder="16"
                />
              </div>

              <div className="rv-field">
                <label htmlFor="oxygenSaturation">Oxygen (SpO2 %)</label>
                <input
                  id="oxygenSaturation"
                  name="oxygenSaturation"
                  type="number"
                  value={form.oxygenSaturation}
                  onChange={handleChange}
                  placeholder="98"
                />
              </div>

              <div className="rv-field">
                <label htmlFor="weight">Weight (kg)</label>
                <input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.1"
                  value={form.weight}
                  onChange={handleChange}
                  placeholder="65"
                />
              </div>

              <div className="rv-field">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="For the clinician"
                />
              </div>
            </div>

            {error && <div className="rv-msg rv-msg--error">{error}</div>}
            {success && <div className="rv-msg rv-msg--ok">{success}</div>}

            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="rv-save" disabled={loading}>
                {loading ? 'Saving…' : 'Save Vitals'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}

export default RecordVitals;