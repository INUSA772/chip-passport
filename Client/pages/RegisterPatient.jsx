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
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
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

      setSuccess(`Patient ${form.nationalId} registered.`);
      setForm({
        nationalId: '', fullName: '', dateOfBirth: '', bloodType: '',
        allergies: '', chronicConditions: '', currentMedications: '',
      });
    } catch (err) {
      setError('Could not reach the server. Is it running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout>
      <main className="rp-main">
        <h1 className="rp-title">Register patient</h1>
        <div className="rp-box">
          <form onSubmit={handleSubmit}>
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

            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={handleChange}
              placeholder="e.g. Grace Banda"
              required
            />

            <label htmlFor="dateOfBirth">Date of birth</label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={handleChange}
              required
            />

            <label htmlFor="bloodType">Blood type</label>
            <input
              id="bloodType"
              name="bloodType"
              type="text"
              value={form.bloodType}
              onChange={handleChange}
              placeholder="e.g. O+"
            />

            <label htmlFor="allergies">Allergies</label>
            <input
              id="allergies"
              name="allergies"
              type="text"
              value={form.allergies}
              onChange={handleChange}
              placeholder="e.g. Penicillin"
            />

            <label htmlFor="chronicConditions">Chronic conditions</label>
            <input
              id="chronicConditions"
              name="chronicConditions"
              type="text"
              value={form.chronicConditions}
              onChange={handleChange}
              placeholder="e.g. Hypertension"
            />

            <label htmlFor="currentMedications">Current medications</label>
            <input
              id="currentMedications"
              name="currentMedications"
              type="text"
              value={form.currentMedications}
              onChange={handleChange}
              placeholder="e.g. Amlodipine 5mg"
            />

            {error && <p className="rp-error">{error}</p>}
            {success && <p className="rp-success">{success}</p>}

            <button type="submit" disabled={loading}>
              {loading ? 'Registering…' : 'Register patient'}
            </button>
          </form>
        </div>
      </main>
    </PageLayout>
  );
}

export default RegisterPatient;