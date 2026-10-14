import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';
import PageLayout from '../components/PageLayout.jsx';

const styles = `
.tt-wrap {
  max-width: 980px;
  margin: 0 auto;
  padding: 20px 24px;
  box-sizing: border-box;
}
.tt-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 14px;
}
.tt-head h1 { margin: 0; font-size: 1.5rem; }
.tt-sub { margin: 2px 0 0; color: #5b6b7a; font-size: 0.9rem; }
.tt-refresh {
  padding: 7px 14px;
  font-size: 0.88rem;
  font-weight: 600;
  color: #0b6b58;
  background: #e6f6f1;
  border: 1px solid #b9e3d8;
  border-radius: 8px;
  cursor: pointer;
}
.tt-counts {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.tt-count {
  background: #fff;
  border: 1px solid #dbe3ea;
  border-radius: 10px;
  padding: 8px 14px;
  min-width: 90px;
}
.tt-count strong { display: block; font-size: 1.3rem; }
.tt-count span { font-size: 0.78rem; color: #5b6b7a; }
.tt-card {
  background: #fff;
  border: 1px solid #dbe3ea;
  border-radius: 12px;
  overflow: hidden;
}
.tt-row {
  display: grid;
  grid-template-columns: 70px 1.4fr 1fr 2fr 100px;
  gap: 10px;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #eef2f6;
  font-size: 0.9rem;
}
.tt-row:last-child { border-bottom: none; }
.tt-row--head {
  background: #f5f8fa;
  font-size: 0.75rem;
  font-weight: 700;
  color: #5b6b7a;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.tt-name { font-weight: 600; }
.tt-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
  text-align: center;
}
.tt-badge--emergency { background: #fdecec; color: #9b1c1c; }
.tt-badge--urgent { background: #fff3dc; color: #8a5a00; }
.tt-badge--routine { background: #e6f6f1; color: #0b6b58; }
.tt-empty {
  padding: 28px 16px;
  text-align: center;
  color: #5b6b7a;
  font-size: 0.92rem;
}
.tt-error {
  margin-bottom: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #fdecec;
  color: #9b1c1c;
  font-size: 0.88rem;
}

@media (max-width: 760px) {
  .tt-row { grid-template-columns: 60px 1fr 90px; }
  .tt-hide-sm { display: none; }
}
`;

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function MyTriageToday() {
  const [triaged, setTriaged] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadTriage() {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/vitals/my-triage-today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to load your list.');
        return;
      }

      setTriaged(data.triaged || []);
    } catch (err) {
      setError('Could not reach the server. Is it running?');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTriage();
  }, []);

  const emergencyCount = triaged.filter((t) => t.triageLevel === 'emergency').length;
  const urgentCount = triaged.filter((t) => t.triageLevel === 'urgent').length;
  const routineCount = triaged.filter((t) => t.triageLevel === 'routine').length;

  return (
    <PageLayout>
      <style>{styles}</style>
      <div className="tt-wrap">
        <div className="tt-head">
          <div>
            <h1>Patients I Checked Today</h1>
            <p className="tt-sub">Patients you have taken vitals for today, with their priority.</p>
          </div>
          <button type="button" className="tt-refresh" onClick={loadTriage} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        <div className="tt-counts">
          <div className="tt-count">
            <strong>{triaged.length}</strong>
            <span>Total</span>
          </div>
          <div className="tt-count">
            <strong>{emergencyCount}</strong>
            <span>Emergency</span>
          </div>
          <div className="tt-count">
            <strong>{urgentCount}</strong>
            <span>Urgent</span>
          </div>
          <div className="tt-count">
            <strong>{routineCount}</strong>
            <span>Routine</span>
          </div>
        </div>

        {error && <div className="tt-error">{error}</div>}

        <div className="tt-card">
          <div className="tt-row tt-row--head">
            <span>Time</span>
            <span>Patient</span>
            <span className="tt-hide-sm">National ID</span>
            <span className="tt-hide-sm">Reason for visit</span>
            <span>Priority</span>
          </div>

          {!loading && triaged.length === 0 && !error && (
            <div className="tt-empty">You have not checked any patients yet today.</div>
          )}

          {triaged.map((t) => (
            <div className="tt-row" key={t.id}>
              <span>{formatTime(t.time)}</span>
              <span className="tt-name">{t.patientName}</span>
              <span className="tt-hide-sm">{t.nationalId}</span>
              <span className="tt-hide-sm">{t.complaint || '—'}</span>
              <span className={`tt-badge tt-badge--${t.triageLevel}`}>{t.triageLevel}</span>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

export default MyTriageToday;