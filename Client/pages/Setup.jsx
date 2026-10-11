// Client/pages/Setup.jsx

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import '../styles/Setup.css';

function Setup() {
  const [form, setForm] = useState({
    setupKey: '',
    hospitalName: '',
    fullName: '',
    staffId: '',
    password: '',
    confirmPassword: '',
    contactEmail: '',
    contactPhone: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkStatus() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/setup/status`);
        const data = await response.json();

        if (!data.needsSetup) {
          navigate('/', { replace: true });
          return;
        }
      } catch (err) {
        setError('Could not reach the server. Please check that the backend is running.');
      } finally {
        setChecking(false);
      }
    }

    checkStatus();
  }, [navigate]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!form.contactEmail && !form.contactPhone) {
      setError('Please provide at least one contact method (email or phone).');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setupKey: form.setupKey,
          hospitalName: form.hospitalName,
          fullName: form.fullName,
          staffId: form.staffId,
          password: form.password,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Setup failed. Please try again.');
        return;
      }

      setSuccess('Hospital setup complete. Redirecting to sign in…');
      setTimeout(() => navigate('/'), 1800);
    } catch (err) {
      setError('Could not reach the server. Please check that the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="setup-page">
      <div className="setup-container">
        <div className="setup-brand-mini">
          <span className="setup-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" />
            </svg>
          </span>
          <span className="setup-brand-name">Health Passport</span>
        </div>

        <div className="setup-box">
          <div className="setup-header">
            <h2>Set up your hospital</h2>
            <p>
              Enter the one-time setup key and create the first IT Administrator account.
              This step can only be done once.
            </p>
          </div>

          {checking ? (
            <div className="setup-checking">
              <div className="setup-spinner"></div>
              <p>Checking system status…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="setup-form">
              <div className="setup-section">
                <h3 className="setup-section-title">Security</h3>
                <div className="setup-field">
                  <label htmlFor="setupKey">Setup key</label>
                  <input
                    id="setupKey"
                    name="setupKey"
                    type="password"
                    value={form.setupKey}
                    onChange={handleChange}
                    placeholder="Enter the secret setup key"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <div className="setup-section">
                <h3 className="setup-section-title">Hospital</h3>
                <div className="setup-field">
                  <label htmlFor="hospitalName">Hospital name</label>
                  <input
                    id="hospitalName"
                    name="hospitalName"
                    type="text"
                    value={form.hospitalName}
                    onChange={handleChange}
                    placeholder="e.g. Queen Elizabeth Central Hospital"
                    required
                  />
                </div>
                <div className="setup-row">
                  <div className="setup-field">
                    <label htmlFor="contactEmail">Contact email</label>
                    <input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      value={form.contactEmail}
                      onChange={handleChange}
                      placeholder="admin@qech.mw"
                    />
                  </div>
                  <div className="setup-field">
                    <label htmlFor="contactPhone">Contact phone</label>
                    <input
                      id="contactPhone"
                      name="contactPhone"
                      type="tel"
                      value={form.contactPhone}
                      onChange={handleChange}
                      placeholder="0999 123 456"
                    />
                  </div>
                </div>
              </div>

              <div className="setup-section">
                <h3 className="setup-section-title">First IT Administrator</h3>
                <div className="setup-row">
                  <div className="setup-field">
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
                  </div>
                  <div className="setup-field">
                    <label htmlFor="staffId">Staff ID</label>
                    <input
                      id="staffId"
                      name="staffId"
                      type="text"
                      value={form.staffId}
                      onChange={handleChange}
                      placeholder="e.g. ADM001"
                      required
                    />
                  </div>
                </div>
                <div className="setup-row">
                  <div className="setup-field">
                    <label htmlFor="password">Password</label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  <div className="setup-field">
                    <label htmlFor="confirmPassword">Confirm password</label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>
              </div>

              {error && <div className="setup-alert setup-alert-error">{error}</div>}
              {success && <div className="setup-alert setup-alert-success">{success}</div>}

              <button type="submit" className="setup-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="setup-btn-spinner"></span>
                    Setting up…
                  </>
                ) : (
                  'Complete setup'
                )}
              </button>
            </form>
          )}

          <p className="setup-footer">
            Already configured? <Link to="/">Go to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Setup;