// Client/pages/Dashboard.jsx
//
// Landing page after login. Content is role-aware: IT admins see
// admin actions (staff management), clinicians/nurses see the
// clinical workflow cards — matches the access-control separation
// already enforced on the backend (only admins can register staff).

import { Link } from 'react-router-dom';
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

  return (
    <PageLayout>
      <div className="dash-page">
        <header className="dash-header">
          <p className="dash-eyebrow">Queen Elizabeth Central Hospital</p>
          <h1>Welcome back{fullName !== 'there' ? `, ${fullName}` : ''}</h1>
          {role && <p className="dash-role">Signed in as {role.replace('_', ' ')}</p>}
        </header>

        <div className="dash-grid">
          {actions.map((a) => (
            <Link to={a.to} key={a.to} className={`dash-card dash-card--${a.color}`}>
              <div className="dash-card-icon">{a.icon}</div>
              <h2>{a.title}</h2>
              <p>{a.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

export default Dashboard;