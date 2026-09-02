// Client/pages/Register.jsx

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import '../styles/Register.css';

function Register() {
  const [form, setForm] = useState({
    staffId: '',
    fullName: '',
    role: 'clinician',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'it_admin') {
      setAuthorized(false);
    } else {
      setAuthorized(true);
    }
  }, []);

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

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
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

      setSuccess(`Account created for ${form.staffId}.`);
      setForm({ staffId: '', fullName: '', role: 'clinician', password: '' });
    } catch (err) {
      setError('Could not reach the server. Is it running?');
    } finally {
      setLoading(false);
    }
  }

  if (!authorized) {
    return (
      <div className="register-page">
        <div className="register-hero">
          <div className="id-card">
            <div className="id-card-chip" aria-hidden="true">
              <span></span><span></span><span></span>
            </div>
            <p className="id-card-country">Republic of Malawi</p>
            <h1 className="id-card-title">Health Passport</h1>
            <p className="id-card-sub">Staff registration — Queen Elizabeth Central Hospital</p>
          </div>
        </div>
        <div className="register-panel">
          <div className="register-box">
            <h2 className="register-heading">Admin access required</h2>
            <p className="register-subheading">
              Only IT admins can create new staff accounts. Please sign in with an IT admin account to continue.
            </p>
            <Link to="/">
              <button type="button">Go to sign in</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-hero">
        <div className="id-card">
          <div className="id-card-chip" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
          <p className="id-card-country">Republic of Malawi</p>
          <h1 className="id-card-title">Health Passport</h1>
          <p className="id-card-sub">Staff registration — Queen Elizabeth Central Hospital</p>
        </div>
      </div>

      <div className="register-panel">
        <div className="register-box">
          <h2 className="register-heading">Create staff account</h2>
          <p className="register-subheading">
            Add a new clinician, nurse, or IT admin.
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="staffId">Staff ID</label>
            <input
              id="staffId"
              name="staffId"
              type="text"
              value={form.staffId}
              onChange={handleChange}
              placeholder="e.g. STF001"
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

            <label htmlFor="role">Role</label>
            <select id="role" name="role" value={form.role} onChange={handleChange}>
              <option value="clinician">Clinician</option>
              <option value="nurse">Nurse</option>
              <option value="it_admin">IT Admin</option>
            </select>

            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

            {error && <p className="register-error">{error}</p>}
            {success && <p className="register-success">{success}</p>}

            <button type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="register-footer">
            <Link to="/">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;