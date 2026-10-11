// Client/components/PageLayout.jsx
//
// Shared shell for every page after login: sidebar + content area.
// Also handles the "must be logged in" check in ONE place, instead
// of every page repeating its own useEffect/navigate('/') guard.

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import '../styles/PageLayout.css';

function PageLayout({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/');
  }, [navigate]);

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content">{children}</div>
    </div>
  );
}

export default PageLayout;