// Client/components/Sidebar.jsx
//
// Persistent navigation for every page after login. The nav links
// shown depend on role: IT admins manage staff accounts (matches
// the access-control decision that only admins can register staff),
// while clinicians/nurses see the clinical workflow pages.

import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

const clinicalNavItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="8" height="8" rx="1.5" />
        <rect x="13" y="3" width="8" height="5" rx="1.5" />
        <rect x="13" y="10" width="8" height="11" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" />
      </svg>
    ),
  },
  {
    to: '/scan',
    label: 'Scan card',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1.2" />
        <rect x="14" y="3" width="7" height="7" rx="1.2" />
        <rect x="3" y="14" width="7" height="7" rx="1.2" />
        <path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z" />
      </svg>
    ),
  },
  {
    to: '/register-patient',
    label: 'Register patient',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="7" r="3.2" />
        <path d="M3.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
        <path d="M18 8v5M15.5 10.5h5" />
      </svg>
    ),
  },
  {
    to: '/generate-card',
    label: 'Generate card',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2.5" y="5" width="19" height="14" rx="2.2" />
        <path d="M2.5 9.5h19" />
        <path d="M6 14h4" />
      </svg>
    ),
  },
  {
    to: '/record-visit',
    label: 'Record visit',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M15 3v4h4" />
        <path d="M9 13h6M9 17h6" />
      </svg>
    ),
  },
];

const adminNavItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="8" height="8" rx="1.5" />
        <rect x="13" y="3" width="8" height="5" rx="1.5" />
        <rect x="13" y="10" width="8" height="11" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" />
      </svg>
    ),
  },
  {
    to: '/register',
    label: 'Register staff',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="7" r="3.2" />
        <path d="M3.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
        <path d="M17 8v5M14.5 10.5h5" />
      </svg>
    ),
  },
  {
    to: '/staff-list',
    label: 'Staff accounts',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
        <circle cx="9.5" cy="7" r="3.2" />
        <path d="M17 8v5M14.5 10.5h5" />
        <path d="M20 20c0-2.5-1.5-4.5-3.5-5.3" />
      </svg>
    ),
  },
    {
    to: '/audit-log',
    label: 'Audit log',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M15 3v4h4" />
        <path d="M9 13h6M9 17h6" />
      </svg>
    ),
  },
];

function Sidebar() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const navItems = role === 'it_admin' ? adminNavItems : clinicalNavItems;

  function handleSignOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('staffId');
    localStorage.removeItem('fullName');
    navigate('/');
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-chip" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
        <div>
          <p className="sidebar-brand-title">Health Passport</p>
          <p className="sidebar-brand-sub">QECH</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="sidebar-signout" onClick={handleSignOut}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
        <span>Sign out</span>
      </button>
    </aside>
  );
}

export default Sidebar;