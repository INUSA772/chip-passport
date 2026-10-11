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
        setStaffList(data.staffList || []);
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
        <header className="sl-header">
          <h1>Staff accounts</h1>
          <p>All registered clinicians, nurses, and IT admins.</p>
        </header>

        {loading && <p className="sl-status">Loading…</p>}
        {error && <p className="sl-error">{error}</p>}

        {!loading && !error && staffList.length === 0 && (
          <p className="sl-empty">No staff accounts yet.</p>
        )}

        {!loading && !error && staffList.length > 0 && (
          <>
            {/* Desktop table */}
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
                    <tr key={s._id || s.staffId}>
                      <td>{s.staffId}</td>
                      <td>{s.fullName}</td>
                      <td>
                        <span className={`sl-badge sl-badge--${s.role}`}>
                          {s.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{s.facility}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sl-cards">
              {staffList.map((s) => (
                <article key={s._id || s.staffId} className="sl-card">
                  <div className="sl-card-top">
                    <strong>{s.fullName}</strong>
                    <span className={`sl-badge sl-badge--${s.role}`}>
                      {s.role.replace('_', ' ')}
                    </span>
                  </div>
                  <p><span>Staff ID</span> {s.staffId}</p>
                  <p><span>Facility</span> {s.facility}</p>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
    </PageLayout>
  );
}

export default StaffList;