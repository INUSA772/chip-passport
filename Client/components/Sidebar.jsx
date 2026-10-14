import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

const dashboardItem = { to: '/dashboard', label: 'Dashboard' };
const scanItem = { to: '/scan', label: 'Scan card' };
const registerPatientItem = { to: '/register-patient', label: 'Register patient' };
const generateCardItem = { to: '/generate-card', label: 'Generate card' };
const recordVisitItem = { to: '/record-visit', label: 'Record visit' };
const recordVitalsItem = { to: '/record-vitals', label: 'Record vitals' };
const myTriageItem = { to: '/my-triage-today', label: 'Patients I checked today' };
const waitingQueueItem = { to: '/waiting-queue', label: 'Waiting queue' };

// Tabs for each role
const navByRole = {
  records_clerk: [dashboardItem, scanItem, registerPatientItem, generateCardItem],
  nurse: [dashboardItem, scanItem, recordVitalsItem, myTriageItem],
  clinician: [dashboardItem, waitingQueueItem, scanItem, recordVisitItem],
  dentist: [dashboardItem, waitingQueueItem, scanItem, recordVisitItem],
  it_admin: [
    dashboardItem,
    { to: '/register', label: 'Register staff' },
    { to: '/staff-list', label: 'Staff accounts' },
    { to: '/audit-log', label: 'Audit log' },
  ],
};

function Sidebar() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || '';
  const navItems = navByRole[role] || [dashboardItem];
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSignOut() {
    localStorage.clear();
    navigate('/');
  }

  function handleNavClick() {
    setMenuOpen(false); 
  }

  return (
    <aside className={`sidebar ${menuOpen ? 'sidebar--open' : ''}`}>
      {/* Brand + hamburger */}
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <div className="sidebar-chip" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
          <div>
            <p className="sidebar-brand-title">Health Passport</p>
            <p className="sidebar-brand-sub">QECH</p>
          </div>
        </div>

        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Nav links */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
            onClick={handleNavClick}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button type="button" className="sidebar-signout" onClick={handleSignOut}>
        Sign out
      </button>
    </aside>
  );
}

export default Sidebar;