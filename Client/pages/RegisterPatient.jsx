// Client/pages/RegisterPatient.jsx

import { useState } from 'react';
import { API_BASE_URL } from '../services/api';
import PageLayout from '../components/PageLayout.jsx';
import '../styles/RegisterPatient.css';

function RegisterPatient() {
  const [form, setForm] = useState({
    nationalId: '',
    fullName: '',
    dateOfBirth: '',
    bloodType: '',
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredPatient, setRegisteredPatient] = useState(null); // holds name + qr after success

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/patient/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed.');
        return;
      }

      // Switch to success view
      setRegisteredPatient({
        fullName: form.fullName,
        nationalId: form.nationalId,
        qrImage: data.qrImage,
      });

      // Reset form for next time
      setForm({
        nationalId: '',
        fullName: '',
        dateOfBirth: '',
        bloodType: '',
        allergies: '',
        chronicConditions: '',
        currentMedications: '',
      });
    } catch (err) {
      setError('Could not reach the server. Is it running?');
    } finally {
      setLoading(false);
    }
  }

  function handleRegisterAnother() {
    setRegisteredPatient(null);
    setError('');
  }

  return (
    <PageLayout>
      <main className="rp-main">
        <div className="rp-header">
          <h1 className="rp-title">Register Patient</h1>
          <p className="rp-subtitle">
            Create a new patient record and issue their first Health Passport card.
          </p>
        </div>

        {/* ========== SUCCESS VIEW (QR only) ========== */}
        {registeredPatient ? (
          <div className="rp-success-view">
            <div className="rp-success-badge">Registration successful</div>
            <h2 className="rp-success-name">{registeredPatient.fullName}</h2>
            <p className="rp-success-id">National ID: {registeredPatient.nationalId}</p>

            {registeredPatient.qrImage ? (
              <>
                <p className="rp-success-instruction">
                  First Health Passport Card — show or print this for the patient
                </p>
                <img
                  src={registeredPatient.qrImage}
                  alt="Patient QR card"
                  className="rp-qr-image"
                />
              </>
            ) : (
              <p className="rp-error">Card was registered but QR could not be generated.</p>
            )}

            <button className="rp-another-btn" onClick={handleRegisterAnother}>
              Register another patient
            </button>
          </div>
        ) : (
          /* ========== FORM VIEW ========== */
          <div className="rp-box">
            <form onSubmit={handleSubmit} className="rp-form">
              <div className="rp-row">
                <div className="rp-field">
                  <label htmlFor="nationalId">National ID</label>
                  <input
                    id="nationalId"
                    name="nationalId"
                    type="text"
                    value={form.nationalId}
                    onChange={handleChange}
                    placeholder="e.g. MW001"
                    required
                  />
                </div>

                <div className="rp-field">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Grace Banda"
                    required
                  />
                </div>
              </div>

              <div className="rp-row">
                <div className="rp-field">
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="rp-field">
                  <label htmlFor="bloodType">Blood Type</label>
                  <input
                    id="bloodType"
                    name="bloodType"
                    type="text"
                    value={form.bloodType}
                    onChange={handleChange}
                    placeholder="e.g. O+"
                  />
                </div>
              </div>

              <div className="rp-row">
                <div className="rp-field">
                  <label htmlFor="allergies">Allergies</label>
                  <input
                    id="allergies"
                    name="allergies"
                    type="text"
                    value={form.allergies}
                    onChange={handleChange}
                    placeholder="e.g. Penicillin"
                  />
                </div>

                <div className="rp-field">
                  <label htmlFor="chronicConditions">Chronic Conditions</label>
                  <input
                    id="chronicConditions"
                    name="chronicConditions"
                    type="text"
                    value={form.chronicConditions}
                    onChange={handleChange}
                    placeholder="e.g. Hypertension"
                  />
                </div>
              </div>

              <div className="rp-field">
                <label htmlFor="currentMedications">Current Medications</label>
                <input
                  id="currentMedications"
                  name="currentMedications"
                  type="text"
                  value={form.currentMedications}
                  onChange={handleChange}
                  placeholder="e.g. Amlodipine 5mg"
                />
              </div>

              {error && <p className="rp-error">{error}</p>}

              <button type="submit" disabled={loading}>
                {loading ? 'Registering…' : 'Register Patient & Issue Card'}
              </button>
            </form>
          </div>
        )}
      </main>
    </PageLayout>
  );
}

export default RegisterPatient;