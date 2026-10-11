// Client/pages/StaffList.jsx
//
// Admin-only: shows all registered staff accounts (staff ID, name,
// role) — no patient data, no passwords. This gives the admin
// oversight of who has system access, matching the accountability
// need discussed without breaking the clinical-data access boundary.

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';
import PageLayout from '../components/PageLayout.jsx';
import '../styles/StaffList.css';

function StaffList() {
  const [staffList, setStaffList] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStaff() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/auth/staff`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Failed to load staff list.');
          return;
        }

        setStaffList(data.staffList);
      } catch (err) {
        setError('Could not reach the server. Is it running?');
      } finally {
        setLoading(false);
      }
    }

    fetchStaff();
  }, []);

  return (
    <PageLayout>
      <main className="sl-main">
        <h1 className="sl-title">Staff accounts</h1>

        {loading && <p className="sl-status">Loading…</p>}
        {error && <p className="sl-error">{error}</p>}

        {!loading && !error && (
          <div className="sl-table-wrap">
            <table className="sl-table">
              <thead>
                <tr>
                  <th>Staff ID</th>
                  <th>Full name</th>
                  <th>Role</th>
                  <th>Facility</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((s) => (
                  <tr key={s._id}>
                    <td>{s.staffId}</td>
                    <td>{s.fullName}</td>
                    <td><span className={`sl-badge sl-badge--${s.role}`}>{s.role.replace('_', ' ')}</span></td>
                    <td>{s.facility}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </PageLayout>
  );
}

export default StaffList;