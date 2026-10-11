// Client/pages/Login.jsx

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import '../styles/Login.css';

// Small helper so every icon shares the same stroke settings
function Icon({ children }) {
  return (
    <svg
      className="login-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function Login() {
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedInStaff, setLoggedInStaff] = useState(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [contact, setContact] = useState({ email: '', phone: '' });
  const navigate = useNavigate();

  useEffect(() => {
    async function checkSetup() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/setup/status`);
        const data = await response.json();
        setNeedsSetup(Boolean(data.needsSetup));
        setContact({
          email: data.contactEmail || '',
          phone: data.contactPhone || '',
        });
      } catch (err) {
        // If the check fails, just don't show the link
      }
    }

    checkSetup();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('staffId', data.staffId);
      localStorage.setItem('fullName', data.fullName);
      setLoggedInStaff(data);
      navigate('/dashboard');
    } catch (err) {
      setError('Could not reach the server. Is it running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* LEFT: brand panel */}
      <section className="login-hero">
        <div className="login-brand">
          <span className="login-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" />
            </svg>
          </span>
          <span className="login-brand-name">Health Passport</span>
        </div>

        {/* The ID card: the one memorable element */}
        <div className="card-stage" aria-hidden="true">
          <div className="card-float">
            <div className="id-card id-card-back"></div>

            <div className="id-card id-card-front">
              <div className="id-card-top">
                <div className="id-card-title">
                  <span className="id-card-mark">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" />
                    </svg>
                  </span>
                  <span>Health Passport</span>
                </div>
                <svg className="id-chip" viewBox="0 0 48 36">
                  <rect x="1" y="1" width="46" height="34" rx="7" fill="#E4A13D" />
                  <path
                    d="M1 13h14M1 23h14M33 13h14M33 23h14M15 1v34M33 1v34M15 13h18M15 23h18"
                    stroke="#9A6A1C"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              </div>

              <div className="id-card-body">
                <svg className="id-photo" viewBox="0 0 64 64">
                  <rect width="64" height="64" rx="12" fill="rgba(255,255,255,0.18)" />
                  <circle cx="32" cy="25" r="10" fill="rgba(255,255,255,0.6)" />
                  <path d="M12 58c0-11 9-18 20-18s20 7 20 18z" fill="rgba(255,255,255,0.6)" />
                </svg>

                <div className="id-card-lines">
                  <span className="line line-long"></span>
                  <span className="line line-mid"></span>
                  <span className="line line-short"></span>
                </div>

                <svg className="id-qr" viewBox="0 0 9 9" shapeRendering="crispEdges">
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M0 0h3v3H0z M1 1v1h1V1z M6 0h3v3H6z M7 1v1h1V1z M0 6h3v3H0z M1 7v1h1V7z M4 0h1v1H4z M4 2h1v1H4z M3 4h1v1H3z M5 4h2v1H5z M4 5h1v1H4z M6 6h1v1H6z M8 6h1v1H8z M5 7h1v1H5z M7 7h1v2H7z M4 8h1v1H4z"
                  />
                </svg>
              </div>

              {/* Malawi flag colours along the bottom edge */}
              <div className="id-card-flag">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>

            <div className="card-badge">
              <span className="card-badge-dot"></span>
              Record saved to card
            </div>
          </div>
        </div>

        <div className="login-hero-text">
          <h1>Every patient's record, on their own ID card.</h1>
          <ul className="login-points">
            <li>
              <span className="point-icon">
                <Icon>
                  <path d="M5 12l5 5L20 7" />
                </Icon>
              </span>
              Works without internet
            </li>
            <li>
              <span className="point-icon">
                <Icon>
                  <path d="M5 12l5 5L20 7" />
                </Icon>
              </span>
              The record stays with the patient
            </li>
            <li>
              <span className="point-icon">
                <Icon>
                  <path d="M5 12l5 5L20 7" />
                </Icon>
              </span>
              Every access is logged
            </li>
          </ul>
        </div>
      </section>

      {/* RIGHT: sign-in form */}
      <section className="login-panel">
        <div className="login-box">
          <h2 className="login-heading">Staff sign in</h2>
          <p className="login-subheading">
            Enter your staff ID and password to continue.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="staffId">Staff ID</label>
            <div className="login-field">
              <Icon>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </Icon>
              <input
                id="staffId"
                type="text"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder="e.g. STF001"
                autoComplete="username"
                required
              />
            </div>

            <label htmlFor="password">Password</label>
            <div className="login-field">
              <Icon>
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </Icon>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="login-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon>
                  {showPassword ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </Icon>
              </button>
            </div>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading && <span className="login-spinner" aria-hidden="true"></span>}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {needsSetup && (
            <p className="login-footer">
              First time here? <Link to="/setup">Set up this hospital</Link>
            </p>
          )}

          {(contact.email || contact.phone) && (
            <p className="login-footer">
              Forgot your password?{' '}
              <a href={contact.email ? `mailto:${contact.email}` : `tel:${contact.phone}`}>
                Contact your IT admin
              </a>
            </p>
          )}

          {loggedInStaff && (
            <p className="login-success">
              Signed in as {loggedInStaff.staffId} ({loggedInStaff.role}).
            </p>
          )}

          <p className="login-notice">
            For authorised staff only. Every sign-in and record access is logged.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Login;