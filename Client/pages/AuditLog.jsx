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
        setVisits(data.visits || []);
      } catch (err) {
        setError('Could not reach the server. Is it running?');
      } finally {
        setLoading(false);
      }
    }
    fetchLog();
  }, []);

  function formatDate(d) {
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d;
    }
  }

  return (
    <PageLayout>
      <main className="al-main">
        <header className="al-header">
          <h1>Visit audit log</h1>
          <p>
            Who recorded a visit and when. Diagnosis and treatment notes are not shown.
          </p>
        </header>

        {loading && <p className="al-status">Loading…</p>}
        {error && <p className="al-error">{error}</p>}

        {!loading && !error && visits.length === 0 && (
          <p className="al-empty">No visits recorded yet.</p>
        )}

        {!loading && !error && visits.length > 0 && (
          <>
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
                      <td>{v.facility || '—'}</td>
                      <td>{formatDate(v.visitDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="al-cards">
              {visits.map((v) => (
                <article key={v._id} className="al-card">
                  <div className="al-card-row">
                    <span>Patient</span>
                    <strong>{v.nationalId}</strong>
                  </div>
                  <div className="al-card-row">
                    <span>Staff</span>
                    <strong>{v.staffId}</strong>
                  </div>
                  <div className="al-card-row">
                    <span>Facility</span>
                    <strong>{v.facility || '—'}</strong>
                  </div>
                  <div className="al-card-row">
                    <span>When</span>
                    <strong>{formatDate(v.visitDate)}</strong>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
    </PageLayout>
  );
}

export default AuditLog;