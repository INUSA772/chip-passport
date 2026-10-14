import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import PageLayout from '../components/PageLayout.jsx';
import '../styles/Dashboard.css';

// Small icon set. Each name maps to the SVG shapes drawn inside the circle.
const ICONS = {
  scan: (
    <>
      <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
      <path d="M4 12h16" />
    </>
  ),
  vitals: <path d="M3 12h4l2-6 4 12 2-6h6" />,
  list: (
    <>
      <path d="M9 4h6v3H9zM7 5H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-1" />
      <path d="M9 12h6M9 16h6" />
    </>
  ),
  queue: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  userPlus: (
    <>
      <circle cx="10" cy="8" r="4" />
      <path d="M3 20c0-3.5 3-6 7-6s7 2.5 7 6M19 8v6M16 11h6" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M7 15h4" />
    </>
  ),
  visit: (
    <>
      <path d="M7 3h8l4 4v14H7z" />
      <path d="M15 3v4h4M10 12h6M10 16h6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 20c0-3.3 3-5.5 7-5.5s7 2.2 7 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c2.2.6 4 2.2 4 5.2" />
    </>
  ),
  shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />,
};

function Icon({ name }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

const scanAction = {
  to: '/scan',
  title: 'Scan Card',
  desc: 'Read a patient QR card and view their critical health summary.',
  icon: 'scan',
};

const registerPatientAction = {
  to: '/register-patient',
  title: 'Register Patient',
  desc: 'Add a new patient and issue their first Health Passport card.',
  icon: 'userPlus',
};

const generateCardAction = {
  to: '/generate-card',
  title: 'Re-issue Card',
  desc: 'Generate or replace a patient card using National ID.',
  icon: 'card',
};

const recordVisitAction = {
  to: '/record-visit',
  title: 'Record Visit',
  desc: 'Log diagnosis and treatment. The card updates automatically.',
  icon: 'visit',
};

const recordVitalsAction = {
  to: '/record-vitals',
  title: 'Record Vitals',
  desc: 'Take temperature, blood pressure, pulse and more, then set the priority level.',
  icon: 'vitals',
};

const myTriageAction = {
  to: '/my-triage-today',
  title: 'Patients I Checked Today',
  desc: 'See who you have taken vitals for today and their priority levels.',
  icon: 'list',
};

const waitingQueueAction = {
  to: '/waiting-queue',
  title: 'Waiting Queue',
  desc: 'See patients checked by a nurse who are waiting to be seen, most urgent first.',
  icon: 'queue',
};

const adminActions = [
  {
    to: '/register',
    title: 'Register Staff',
    desc: 'Create accounts for records clerks, nurses, clinicians, dentists, or IT admins.',
    icon: 'userPlus',
  },
  {
    to: '/staff-list',
    title: 'Staff Accounts',
    desc: 'View all registered staff members in the system.',
    icon: 'users',
  },
  {
    to: '/audit-log',
    title: 'Audit Log',
    desc: 'See who recorded visits and when. System oversight only.',
    icon: 'shield',
  },
];

// Dashboard cards for each role
const actionsByRole = {
  records_clerk: [scanAction, registerPatientAction, generateCardAction],
  nurse: [scanAction, recordVitalsAction, myTriageAction],
  clinician: [waitingQueueAction, scanAction, recordVisitAction],
  dentist: [waitingQueueAction, scanAction, recordVisitAction],
  it_admin: adminActions,
};

// Section title and subtitle for each role
const headingByRole = {
  records_clerk: {
    title: 'Registration desk',
    desc: 'Register patients, issue Health Passport cards, and scan cards.',
  },
  nurse: {
    title: 'Nursing station',
    desc: 'Scan patient cards, record vitals, set the priority level, and review your list.',
  },
  clinician: {
    title: 'Clinical workspace',
    desc: 'See who is waiting, scan cards, and record visits with diagnosis and treatment.',
  },
  dentist: {
    title: 'Dental workspace',
    desc: 'See who is waiting, scan cards, and record dental visits and treatment.',
  },
  it_admin: {
    title: 'Administration',
    desc: 'Manage staff accounts and system oversight.',
  },
};

const roleLabels = {
  records_clerk: 'Records Clerk',
  nurse: 'Nurse',
  clinician: 'Clinician',
  dentist: 'Dentist',
  it_admin: 'IT Admin',
};

function Dashboard() {
  const fullName = localStorage.getItem('fullName') || 'Staff';
  const role = localStorage.getItem('role') || '';
  const isAdmin = role === 'it_admin';
  const isNurse = role === 'nurse';
  const actions = actionsByRole[role] || [];
  const heading = headingByRole[role] || {
    title: 'Workspace',
    desc: 'Your tools will appear here.',
  };
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState('');
  const [triaged, setTriaged] = useState(null);
  const [triageError, setTriageError] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  // Admin: system numbers
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

  // Nurse: today's summary (same endpoint the Patients I Checked Today page uses)
  useEffect(() => {
    if (!isNurse) return;

    async function fetchTriage() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/vitals/my-triage-today`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) {
          setTriageError(data.message || 'Failed to load today\'s summary.');
          return;
        }
        setTriaged(data.triaged || []);
      } catch (err) {
        setTriageError('Could not reach the server.');
      }
    }

    fetchTriage();
  }, [isNurse]);

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

  const roleLabel = roleLabels[role] || role.replace('_', ' ');
  const firstName = fullName.split(' ')[0];

  const countLevel = (level) =>
    triaged ? triaged.filter((t) => t.triageLevel === level).length : 0;

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

        {/* Stats: admin only */}
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

        {/* Today summary: nurse only */}
        {isNurse && (
          <section className="dash-stats" aria-label="Today's summary">
            {triageError && <p className="dash-error">{triageError}</p>}
            {triaged && (
              <>
                <div className="stat stat--accent">
                  <span className="stat-value">{triaged.length}</span>
                  <span className="stat-label">Checked today</span>
                </div>
                <div className="stat stat--emergency">
                  <span className="stat-value">{countLevel('emergency')}</span>
                  <span className="stat-label">Emergency</span>
                </div>
                <div className="stat stat--urgent">
                  <span className="stat-value">{countLevel('urgent')}</span>
                  <span className="stat-label">Urgent</span>
                </div>
                <div className="stat stat--routine">
                  <span className="stat-value">{countLevel('routine')}</span>
                  <span className="stat-label">Routine</span>
                </div>
              </>
            )}
          </section>
        )}

        {/* Section title */}
        <div className="dash-section-head">
          <h2>{heading.title}</h2>
          <p>{heading.desc}</p>
        </div>

        {/* Action cards */}
        <div className="dash-actions">
          {actions.map((a) => (
            <Link to={a.to} key={a.to} className="action-card">
              <span className="action-icon">
                <Icon name={a.icon} />
              </span>
              <span className="action-title">{a.title}</span>
              <span className="action-desc">{a.desc}</span>
              <span className="action-open">
                Open <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>

        {/* Demo reset: admin only, discreet */}
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