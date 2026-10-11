import { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../services/api';
import PageLayout from '../components/PageLayout.jsx';
import '../styles/AuditLog.css';

function AuditLog() {
  const [visits, setVisits] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

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
        setError('Could not reach the server.');
      } finally {
        setLoading(false);
      }
    }

    fetchLog();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visits;
    return visits.filter(
      (v) =>
        (v.nationalId || '').toLowerCase().includes(q) ||
        (v.staffId || '').toLowerCase().includes(q) ||
        (v.facility || '').toLowerCase().includes(q)
    );
  }, [visits, query]);

  const stats = useMemo(() => {
    const patients = new Set(visits.map((v) => v.nationalId).filter(Boolean));
    const staff = new Set(visits.map((v) => v.staffId).filter(Boolean));
    return {
      total: visits.length,
      patients: patients.size,
      staff: staff.size,
    };
  }, [visits]);

  function formatDate(value) {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(value);
    }
  }

  return (
    <PageLayout>
      <main className="al">
        <header className="al-header">
          <div>
            <h1>Visit audit log</h1>
            <p>
              System oversight of who recorded a visit and when.
              Diagnosis and treatment notes are never shown here.
            </p>
          </div>
        </header>

        <div className="al-privacy">
          <strong>Privacy boundary</strong>
          <span>
            IT administrators see accountability data only (patient ID, staff ID, facility, date).
            Clinical content remains restricted to clinical staff.
          </span>
        </div>

        {!loading && !error && visits.length > 0 && (
          <div className="al-stats">
            <div className="al-stat">
              <span className="al-stat-value">{stats.total}</span>
              <span className="al-stat-label">Log entries</span>
            </div>
            <div className="al-stat">
              <span className="al-stat-value">{stats.patients}</span>
              <span className="al-stat-label">Patients touched</span>
            </div>
            <div className="al-stat">
              <span className="al-stat-value">{stats.staff}</span>
              <span className="al-stat-label">Staff involved</span>
            </div>
          </div>
        )}

        {!loading && !error && visits.length > 0 && (
          <div className="al-toolbar">
            <input
              type="search"
              className="al-search"
              placeholder="Filter by patient ID, staff ID or facility…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Filter audit log"
            />
            <span className="al-count">
              Showing {filtered.length} of {visits.length}
            </span>
          </div>
        )}

        {loading && <p className="al-status">Loading audit log…</p>}
        {error && <p className="al-error">{error}</p>}

        {!loading && !error && visits.length === 0 && (
          <div className="al-empty">
            <p>No visits have been recorded yet.</p>
            <span>Entries appear here after clinical staff record patient visits.</span>
          </div>
        )}

        {!loading && !error && visits.length > 0 && filtered.length === 0 && (
          <div className="al-empty">
            <p>No entries match your filter.</p>
            <span>Try a different patient ID or staff ID.</span>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="al-table-wrap">
              <table className="al-table">
                <thead>
                  <tr>
                    <th className="al-col-num">#</th>
                    <th>Patient ID</th>
                    <th>Staff ID</th>
                    <th>Facility</th>
                    <th>Date &amp; time</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v, index) => (
                    <tr key={v._id || `${v.nationalId}-${v.visitDate}-${index}`}>
                      <td className="al-col-num">{index + 1}</td>
                      <td>
                        <code className="al-code">{v.nationalId || '—'}</code>
                      </td>
                      <td>
                        <code className="al-code">{v.staffId || '—'}</code>
                      </td>
                      <td>{v.facility || 'Queen Elizabeth Central Hospital'}</td>
                      <td className="al-date">{formatDate(v.visitDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="al-cards">
              {filtered.map((v, index) => (
                <article
                  key={v._id || `${v.nationalId}-${v.visitDate}-${index}`}
                  className="al-card"
                >
                  <div className="al-card-head">
                    <span className="al-card-num">#{index + 1}</span>
                    <span className="al-date">{formatDate(v.visitDate)}</span>
                  </div>
                  <div className="al-card-row">
                    <span>Patient ID</span>
                    <code className="al-code">{v.nationalId || '—'}</code>
                  </div>
                  <div className="al-card-row">
                    <span>Staff ID</span>
                    <code className="al-code">{v.staffId || '—'}</code>
                  </div>
                  <div className="al-card-row">
                    <span>Facility</span>
                    <strong>{v.facility || 'QECH'}</strong>
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