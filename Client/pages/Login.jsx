// Client/pages/Login.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import '../styles/Login.css';

function Login() {
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedInStaff, setLoggedInStaff] = useState(null);
  const navigate = useNavigate();

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

      // Save the token so future requests can prove who's logged in.
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
      {/* Left panel — the card metaphor, the signature visual of the whole app */}
      <div className="login-hero">
        <div className="id-card">
          <div className="id-card-chip" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
          <p className="id-card-country">Republic of Malawi</p>
          <h1 className="id-card-title">Health Passport</h1>
          <p className="id-card-sub">Chip-based patient record — Queen Elizabeth Central Hospital</p>
        </div>
      </div>

      {/* Right panel — the actual login form */}
      <div className="login-panel">
        <div className="login-box">
          <h2 className="login-heading">Staff sign in</h2>
          <p className="login-subheading">Enter your staff ID and password to continue.</p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="staffId">Staff ID</label>
            <input
              id="staffId"
              type="text"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              placeholder="e.g. STF001"
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && <p className="login-error">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="login-footer">
              Need an account? <a href="/register">Register here</a>
          </p>

          {loggedInStaff && (
            <p className="login-success">
              Signed in as {loggedInStaff.staffId} ({loggedInStaff.role}).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;