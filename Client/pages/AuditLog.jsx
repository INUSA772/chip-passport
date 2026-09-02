// Client/pages/AuditLog.jsx
//
// Admin-only: shows a system-wide visit audit trail — patient ID,
// which staff member recorded the visit, and when — with NO
// diagnosis or treatment notes shown. This gives accountability
// ("who touched this patient's record") without exposing clinical
// content to IT admin, preserving the access-control boundary.

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';
import PageLayout from '../components/PageLayout.jsx';
import '../styles/AuditLog.css';

function AuditLog() {
  const [visits, setVisits] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLog() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/visit/audit-log`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Failed to load audit log.');
          return;
        }

        setVisits(data.visits);
      } catch (err) {
        setError('Could not reach the server. Is it running?');
      } finally {
        setLoading(false);
      }
    }

    fetchLog();
  }, []);

  return (
    <PageLayout>
      <main className="al-main">
        <h1 className="al-title">Visit audit log</h1>
        <p className="al-subtitle">Who accessed or updated a patient record, and when — diagnosis and treatment notes are not shown here.</p>

        {loading && <p className="al-status">Loading…</p>}
        {error && <p className="al-error">{error}</p>}

        {!loading && !error && (
          <div className="al-table-wrap">
            <table className="al-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Staff ID</th>
                  <th>Facility</th>
                  <th>Date & time</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v._id}>
                    <td>{v.nationalId}</td>
                    <td>{v.staffId}</td>
                    <td>{v.facility}</td>
                    <td>{new Date(v.visitDate).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visits.length === 0 && <p className="al-empty">No visits recorded yet.</p>}
          </div>
        )}
      </main>
    </PageLayout>
  );
}

export default AuditLog;