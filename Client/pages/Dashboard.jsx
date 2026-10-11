import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import PageLayout from '../components/PageLayout.jsx';
import '../styles/Dashboard.css';

const clinicalActions = [
  {
    to: '/scan',
    title: 'Scan Card',
    desc: 'Read a patient QR card and view their critical health summary.',
    tag: 'Primary',
  },
  {
    to: '/register-patient',
    title: 'Register Patient',
    desc: 'Add a new patient and issue their first Health Passport card.',
    tag: 'Intake',
  },
  {
    to: '/record-visit',
    title: 'Record Visit',
    desc: 'Log diagnosis and treatment. The card updates automatically.',
    tag: 'Clinical',
  },
  {
    to: '/generate-card',
    title: 'Re-issue Card',
    desc: 'Generate or replace a patient card using National ID.',
    tag: 'Card',
  },
];

const adminActions = [
  {
    to: '/register',
    title: 'Register Staff',
    desc: 'Create accounts for clinicians, nurses, or IT admins.',
    tag: 'Admin',
  },
  {
    to: '/staff-list',
    title: 'Staff Accounts',
    desc: 'View all registered staff members in the system.',
    tag: 'Admin',
  },
  {
    to: '/audit-log',
    title: 'Audit Log',
    desc: 'See who recorded visits and when — system oversight only.',
    tag: 'Oversight',
  },
];

function Dashboard() {
  const fullName = localStorage.getItem('fullName') || 'Staff';
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
      'This will DELETE all staff, patients and visits.\n\nThe system will return to the Setup page.\n\nContinue?'
    );
    if (!confirmed) return;

    const typed = window.prompt('Type RESET (in capital letters) to confirm:');
    if (typed !== 'RESET') {
      alert('Reset cancelled.');
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

      localStorage.clear();
      setResetMessage('System reset. Redirecting…');
      setTimeout(() => navigate('/setup'), 1200);
    } catch (err) {
      setResetMessage('Could not reach the server.');
    } finally {
      setResetting(false);
    }
  }

  const roleLabel = role.replace('_', ' ');
  const firstName = fullName.split(' ')[0];

  return (
    <PageLayout>
      <div className="dash">
        {/* Top bar */}
        <header className="dash-top">
          <div>
            <p className="dash-facility">Queen Elizabeth Central Hospital</p>
            <h1 className="dash-greeting">Good day, {firstName}</h1>
          </div>
          <div className="dash-user-chip">
            <span className="dash-user-name">{fullName}</span>
            <span className="dash-user-role">{roleLabel}</span>
          </div>
        </header>

        {/* Stats — admin only */}
        {isAdmin && (
          <section className="dash-stats" aria-label="System overview">
            {statsError && <p className="dash-error">{statsError}</p>}
            {stats && (
              <>
                <div className="stat">
                  <span className="stat-value">{stats.totalPatients}</span>
                  <span className="stat-label">Patients</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{stats.totalStaff}</span>
                  <span className="stat-label">Staff</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{stats.totalVisits}</span>
                  <span className="stat-label">Total visits</span>
                </div>
                <div className="stat stat--accent">
                  <span className="stat-value">{stats.visitsToday}</span>
                  <span className="stat-label">Today</span>
                </div>
              </>
            )}
          </section>
        )}

        {/* Section title */}
        <div className="dash-section-head">
          <h2>{isAdmin ? 'Administration' : 'Clinical workspace'}</h2>
          <p>
            {isAdmin
              ? 'Manage staff accounts and system oversight.'
              : 'Scan cards, register patients, and record visits.'}
          </p>
        </div>

        {/* Action list — clean rows, not flashy cards */}
        <div className="dash-actions">
          {actions.map((a) => (
            <Link to={a.to} key={a.to} className="action-row">
              <div className="action-text">
                <div className="action-title-row">
                  <span className="action-title">{a.title}</span>
                  <span className="action-tag">{a.tag}</span>
                </div>
                <span className="action-desc">{a.desc}</span>
              </div>
              <span className="action-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>

        {/* Demo reset — admin only, discreet */}
        {isAdmin && (
          <div className="dash-demo">
            <p>Reset the system to first-time setup.</p>
            <button onClick={handleResetDemo} disabled={resetting}>
              {resetting ? 'Resetting…' : 'Reset'}
            </button>
            {resetMessage && <span className="dash-demo-msg">{resetMessage}</span>}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default Dashboard;