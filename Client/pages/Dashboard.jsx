// Client/pages/Dashboard.jsx

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import PageLayout from '../components/PageLayout.jsx';
import '../styles/Dashboard.css';

const clinicalActions = [
  {
    to: '/scan',
    title: 'Scan patient card',
    desc: 'Read a patient\'s QR/chip card and view their health record.',
    color: 'teal',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="3" y="3" width="7" height="7" rx="1.2" />
        <rect x="14" y="3" width="7" height="7" rx="1.2" />
        <rect x="3" y="14" width="7" height="7" rx="1.2" />
        <path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z" />
      </svg>
    ),
  },
  {
    to: '/register-patient',
    title: 'Register patient',
    desc: 'Add a new patient and their baseline medical information.',
    color: 'blue',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="9" cy="7" r="3.2" />
        <path d="M3.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
        <path d="M18 8v5M15.5 10.5h5" />
      </svg>
    ),
  },
  {
    to: '/generate-card',
    title: 'Generate card',
    desc: 'Issue a patient\'s first QR/chip card.',
    color: 'gold',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="2.5" y="5" width="19" height="14" rx="2.2" />
        <path d="M2.5 9.5h19" />
        <path d="M6 14h4" />
      </svg>
    ),
  },
  {
    to: '/record-visit',
    title: 'Record visit',
    desc: 'Log a diagnosis and notes — the card updates automatically.',
    color: 'coral',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M15 3v4h4" />
        <path d="M9 13h6M9 17h6" />
      </svg>
    ),
  },
];

const adminActions = [
  {
    to: '/register',
    title: 'Register staff account',
    desc: 'Create a login for a new clinician, nurse, or IT admin.',
    color: 'blue',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="9" cy="7" r="3.2" />
        <path d="M3.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
        <path d="M17 8v5M14.5 10.5h5" />
      </svg>
    ),
  },
  {
    to: '/staff-list',
    title: 'View staff accounts',
    desc: 'See all registered clinicians, nurses, and IT admins.',
    color: 'teal',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M4 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
        <circle cx="9.5" cy="7" r="3.2" />
        <path d="M17 8v5M14.5 10.5h5" />
        <path d="M20 20c0-2.5-1.5-4.5-3.5-5.3" />
      </svg>
    ),
  },
  {
    to: '/audit-log',
    title: 'Visit audit log',
    desc: 'See who accessed or updated a patient record, and when.',
    color: 'gold',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M15 3v4h4" />
        <path d="M9 13h6M9 17h6" />
      </svg>
    ),
  },
];

function Dashboard() {
  const fullName = localStorage.getItem('fullName') || 'there';
  const role = localStorage.getItem('role') || '';
  const isAdmin = role === 'it_admin';
  const actions = isAdmin ? adminActions : clinicalActions;
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  useEffect(() => {
    if (!isAdmin) return;

    async function fetchStats() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) {
          setStatsError(data.message || 'Failed to load stats.');
          return;
        }
        setStats(data);
      } catch (err) {
        setStatsError('Could not reach the server.');
      }
    }

    fetchStats();
  }, [isAdmin]);

  async function handleResetDemo() {
    const confirmed = window.confirm(
      'This will DELETE all staff, patients and visits.\n\nThe system will return to the Setup page.\n\nAre you sure you want to continue?'
    );

    if (!confirmed) return;

    const typed = window.prompt('Type RESET (in capital letters) to confirm:');
    if (typed !== 'RESET') {
      alert('Reset cancelled. You must type RESET exactly.');
      return;
    }

    setResetting(true);
    setResetMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/setup/reset-demo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ confirm: 'RESET' }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResetMessage(data.message || 'Reset failed.');
        return;
      }

      // Clear local storage and go to setup
      localStorage.clear();
      setResetMessage('System reset successfully. Redirecting to Setup…');
      setTimeout(() => {
        navigate('/setup');
      }, 1500);
    } catch (err) {
      setResetMessage('Could not reach the server.');
    } finally {
      setResetting(false);
    }
  }

  return (
    <PageLayout>
      <div className="dash-page">
        <header className="dash-header">
          <p className="dash-eyebrow">Queen Elizabeth Central Hospital</p>
          <h1>Welcome back{fullName !== 'there' ? `, ${fullName}` : ''}</h1>
          {role && <p className="dash-role">Signed in as {role.replace('_', ' ')}</p>}
        </header>

        {isAdmin && (
          <div className="dash-stats">
            {statsError && <p className="dash-stats-error">{statsError}</p>}
            {stats && (
              <>
                <div className="dash-stat-card">
                  <p className="dash-stat-number">{stats.totalPatients}</p>
                  <p className="dash-stat-label">Total patients</p>
                </div>
                <div className="dash-stat-card">
                  <p className="dash-stat-number">{stats.totalStaff}</p>
                  <p className="dash-stat-label">Total staff</p>
                </div>
                <div className="dash-stat-card">
                  <p className="dash-stat-number">{stats.totalVisits}</p>
                  <p className="dash-stat-label">Total visits</p>
                </div>
                <div className="dash-stat-card dash-stat-card--highlight">
                  <p className="dash-stat-number">{stats.visitsToday}</p>
                  <p className="dash-stat-label">Visits today</p>
                </div>
              </>
            )}
          </div>
        )}

        <div className="dash-grid">
          {actions.map((a) => (
            <Link to={a.to} key={a.to} className={`dash-card dash-card--${a.color}`}>
              <div className="dash-card-icon">{a.icon}</div>
              <h2>{a.title}</h2>
              <p>{a.desc}</p>
            </Link>
          ))}
        </div>

        {/* ========== RESET FOR DEMO (only IT Admin) ========== */}
        {isAdmin && (
          <div style={{
            marginTop: '40px',
            padding: '20px',
            border: '1px dashed #E85D4C',
            borderRadius: '12px',
            background: '#FDF6F5'
          }}>
            <h3 style={{ margin: '0 0 8px', color: '#B42318' }}>Presentation / Demo Tools</h3>
            <p style={{ margin: '0 0 14px', fontSize: '14px', color: '#5C7080' }}>
              Use this only when you want to show the Setup page again during your presentation.
              It will delete all data.
            </p>

            <button
              onClick={handleResetDemo}
              disabled={resetting}
              style={{
                background: '#E85D4C',
                color: 'white',
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {resetting ? 'Resetting…' : 'Reset System for Demo'}
            </button>

            {resetMessage && (
              <p style={{ marginTop: '12px', fontSize: '14px', color: '#B42318' }}>
                {resetMessage}
              </p>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default Dashboard;