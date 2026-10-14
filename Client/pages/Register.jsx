import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import PageLayout from '../components/PageLayout.jsx';
import '../styles/Register.css';

function Register() {
  const [form, setForm] = useState({
    staffId: '',
    fullName: '',
    email: '',
    role: 'records_clerk',
    password: '',
    confirmPassword: '',
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

    // Frontend validation
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!form.staffId.trim() || !form.fullName.trim()) {
      setError('Staff ID and Full Name are required.');
      return;
    }
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          staffId: form.staffId.trim(),
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          role: form.role,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed.');
        return;
      }

      // Show a message that matches what actually happened with the email
      if (data.emailSent) {
        setSuccess(
          `Account created for ${form.fullName} (${form.staffId}). Credentials were sent to ${form.email.trim()}.`
        );
      } else if (form.email.trim()) {
        setSuccess(
          `Account created for ${form.fullName} (${form.staffId}), but the email could not be sent${
            data.emailError ? `: ${data.emailError}` : '.'
          } Please give the credentials to the staff member directly.`
        );
      } else {
        setSuccess(
          `Account created for ${form.fullName} (${form.staffId}). No email was provided, so give the credentials to the staff member directly.`
        );
      }

      setForm({
        staffId: '',
        fullName: '',
        email: '',
        role: 'records_clerk',
        password: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError('Could not reach the server. Is it running?');
    } finally {
      setLoading(false);
    }
  }

  // Not authorized view
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
              Only IT Admins can create new staff accounts. Please sign in with an IT Admin account.
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
    <PageLayout>
      <div className="register-content">
        <div className="register-header">
          <h1>Register Staff Account</h1>
          <p>
            Create a login account for a records clerk, nurse, clinician, dentist, or another IT
            administrator.
          </p>
        </div>

        <div className="register-card">
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-row">
              <div className="form-group">
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
              </div>

              <div className="form-group">
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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email (optional)</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="e.g. grace.banda@gmail.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select id="role" name="role" value={form.role} onChange={handleChange}>
                  <option value="records_clerk">Records Clerk</option>
                  <option value="nurse">Nurse</option>
                  <option value="clinician">Clinician</option>
                  <option value="dentist">Dentist</option>
                  <option value="it_admin">IT Admin</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Temporary Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  required
                />
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Staff Account'}
            </button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}

export default Register;