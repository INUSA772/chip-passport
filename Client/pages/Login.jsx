import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import '../styles/Login.css';

function Login() {
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'reset'
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function checkSetup() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/setup/status`);
        const data = await response.json();
        setNeedsSetup(Boolean(data.needsSetup));
      } catch (err) {
        // ignore
      }
    }
    checkSetup();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Invalid staff ID or password.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('staffId', data.staffId);
      localStorage.setItem('fullName', data.fullName);
      navigate('/dashboard');
    } catch (err) {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: staffId.trim(),
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Could not reset password.');
        return;
      }

      setSuccess('Password updated. You can sign in now.');
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMode('login');
    } catch (err) {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function switchToReset() {
    setMode('reset');
    setError('');
    setSuccess('');
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  function switchToLogin() {
    setMode('login');
    setError('');
    setSuccess('');
    setNewPassword('');
    setConfirmPassword('');
  }

  return (
    <div className="lp">
      <section className="lp-visual">
        <img
          className="lp-photo"
          src="https://images.pexels.com/photos/6097805/pexels-photo-6097805.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Healthcare professional reviewing patient information"
        />
        <div className="lp-visual-overlay">
          <div className="lp-visual-top">
            <p className="lp-brand">Health Passport</p>
            <p className="lp-brand-sub">Queen Elizabeth Central Hospital</p>
          </div>
          <div className="lp-visual-bottom">
            <h1>Patient records that stay with the patient</h1>
            <p>
              Critical health information is stored on the patient’s card.
              Staff scan the card at the point of care to read and update it.
            </p>
            <ul>
              <li>Read allergies, conditions and last visit from the card</li>
              <li>Record a visit and issue an updated card</li>
              <li>For authorised QECH staff only</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="lp-form-side">
        <div className="lp-form-box">
          <p className="lp-form-kicker">QECH Staff Portal</p>
          <h2>{mode === 'login' ? 'Sign in' : 'Reset password'}</h2>
          <p className="lp-form-lead">
            {mode === 'login'
              ? 'Use your staff ID and password to continue.'
              : 'Enter your staff ID and choose a new password.'}
          </p>

          {mode === 'login' ? (
            <form onSubmit={handleLogin}>
              <label htmlFor="staffId">Staff ID</label>
              <input
                id="staffId"
                type="text"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder="e.g. STF001"
                autoComplete="username"
                required
              />

              <label htmlFor="password">Password</label>
              <div className="lp-pass">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="lp-eye"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {error && <p className="lp-error">{error}</p>}
              {success && <p className="lp-success">{success}</p>}

              <button type="submit" className="lp-btn" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset}>
              <label htmlFor="resetStaffId">Staff ID</label>
              <input
                id="resetStaffId"
                type="text"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder="e.g. STF001"
                required
              />

              <label htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
              />

              <label htmlFor="confirmPassword">Confirm new password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
              />

              {error && <p className="lp-error">{error}</p>}
              {success && <p className="lp-success">{success}</p>}

              <button type="submit" className="lp-btn" disabled={loading}>
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          )}

          <p className="lp-foot">
            {mode === 'login' ? (
              <button type="button" className="lp-link-btn" onClick={switchToReset}>
                Forgot password?
              </button>
            ) : (
              <button type="button" className="lp-link-btn" onClick={switchToLogin}>
                Back to sign in
              </button>
            )}
          </p>

          {needsSetup && (
            <p className="lp-foot">
              First installation? <Link to="/setup">Set up the hospital</Link>
            </p>
          )}

          <p className="lp-note">
            Authorised hospital staff only. Access is logged.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Login;