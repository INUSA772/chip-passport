import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';
import PageLayout from '../components/PageLayout.jsx';

const styles = `
.wq-wrap {
  max-width: 1040px;
  margin: 0 auto;
  padding: 28px 28px 48px;
  box-sizing: border-box;
}
.wq-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.wq-head h1 { margin: 0; font-size: 1.6rem; }
.wq-sub { margin: 3px 0 0; color: #5b6b7a; font-size: 0.92rem; }
.wq-refresh {
  padding: 8px 16px;
  font-size: 0.88rem;
  font-weight: 600;
  color: #0b6b58;
  background: #e6f6f1;
  border: 1px solid #b9e3d8;
  border-radius: 8px;
  cursor: pointer;
}
.wq-counts {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 22px;
}
.wq-count {
  background: #fff;
  border: 1px solid #dbe3ea;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}
.wq-count strong { display: block; font-size: 1.8rem; line-height: 1.1; }
.wq-count span {
  display: block;
  margin-top: 5px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #5b6b7a;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.wq-count--total { background: #0f2a47; border-color: #0f2a47; }
.wq-count--total strong, .wq-count--total span { color: #fff; }
.wq-count--emergency { border-top: 3px solid #c0392b; }
.wq-count--emergency strong { color: #9b1c1c; }
.wq-count--urgent { border-top: 3px solid #e0952b; }
.wq-count--urgent strong { color: #8a5a00; }
.wq-count--routine { border-top: 3px solid #1aa58a; }
.wq-count--routine strong { color: #0b6b58; }

.wq-card {
  background: #fff;
  border: 1px solid #dbe3ea;
  border-radius: 14px;
  overflow: hidden;
}
.wq-row {
  display: grid;
  grid-template-columns: 50px 1.5fr 1fr 2fr 100px 110px;
  gap: 10px;
  align-items: center;
  padding: 13px 18px;
  border-bottom: 1px solid #eef2f6;
  border-left: 4px solid transparent;
  font-size: 0.92rem;
}
.wq-row:last-child { border-bottom: none; }
.wq-row--emergency { border-left-color: #c0392b; background: #fffafa; }
.wq-row--urgent { border-left-color: #e0952b; }
.wq-row--routine { border-left-color: #1aa58a; }
.wq-row--head {
  background: #f5f8fa;
  border-left-color: transparent;
  font-size: 0.74rem;
  font-weight: 700;
  color: #5b6b7a;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.wq-pos { font-weight: 700; color: #5b6b7a; }
.wq-name { font-weight: 600; }
.wq-wait { color: #5b6b7a; }
.wq-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: capitalize;
  text-align: center;
}
.wq-badge--emergency { background: #fdecec; color: #9b1c1c; }
.wq-badge--urgent { background: #fff3dc; color: #8a5a00; }
.wq-badge--routine { background: #e6f6f1; color: #0b6b58; }
.wq-empty {
  padding: 40px 16px;
  text-align: center;
  color: #5b6b7a;
  font-size: 0.95rem;
}
.wq-error {
  margin-bottom: 12px;
  padding: 9px 14px;
  border-radius: 8px;
  background: #fdecec;
  color: #9b1c1c;
  font-size: 0.88rem;
}
.wq-note { margin-top: 12px; font-size: 0.8rem; color: #5b6b7a; }

@media (max-width: 760px) {
  .wq-counts { grid-template-columns: repeat(2, 1fr); }
  .wq-row { grid-template-columns: 40px 1fr 95px; }
  .wq-hide-sm { display: none; }
}
`;

// How long the patient has been waiting, in simple words
function formatWait(value) {
  const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours}h ${rest}m`;
}

function WaitingQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadQueue() {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/vitals/waiting-queue`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to load the waiting queue.');
        return;
      }

      setQueue(data.queue || []);
    } catch (err) {
      setError('Could not reach the server. Is it running?');
    } finally {
      setLoading(false);
    }
  }

  // Load once when the page opens, then again every 30 seconds
  useEffect(() => {
    loadQueue();
    const timer = setInterval(loadQueue, 30000);
    return () => clearInterval(timer);
  }, []);

  const emergencyCount = queue.filter((q) => q.triageLevel === 'emergency').length;
  const urgentCount = queue.filter((q) => q.triageLevel === 'urgent').length;
  const routineCount = queue.filter((q) => q.triageLevel === 'routine').length;

  return (
    <PageLayout>
      <style>{styles}</style>
      <div className="wq-wrap">
        <div className="wq-head">
          <div>
            <h1>Waiting Queue</h1>
            <p className="wq-sub">
              Patients checked by a nurse today who have not been seen yet. Most urgent first.
            </p>
          </div>
          <button type="button" className="wq-refresh" onClick={loadQueue} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        <div className="wq-counts">
          <div className="wq-count wq-count--total">
            <strong>{queue.length}</strong>
            <span>Waiting</span>
          </div>
          <div className="wq-count wq-count--emergency">
            <strong>{emergencyCount}</strong>
            <span>Emergency</span>
          </div>
          <div className="wq-count wq-count--urgent">
            <strong>{urgentCount}</strong>
            <span>Urgent</span>
          </div>
          <div className="wq-count wq-count--routine">
            <strong>{routineCount}</strong>
            <span>Routine</span>
          </div>
        </div>

        {error && <div className="wq-error">{error}</div>}

        <div className="wq-card">
          <div className="wq-row wq-row--head">
            <span>#</span>
            <span>Patient</span>
            <span className="wq-hide-sm">National ID</span>
            <span className="wq-hide-sm">Reason for visit</span>
            <span>Waiting</span>
            <span>Priority</span>
          </div>

          {!loading && queue.length === 0 && !error && (
            <div className="wq-empty">No patients are waiting right now.</div>
          )}

          {queue.map((q, index) => (
            <div className={`wq-row wq-row--${q.triageLevel}`} key={q.id}>
              <span className="wq-pos">{index + 1}</span>
              <span className="wq-name">{q.patientName}</span>
              <span className="wq-hide-sm">{q.nationalId}</span>
              <span className="wq-hide-sm">{q.complaint || '—'}</span>
              <span className="wq-wait">{formatWait(q.time)}</span>
              <span className={`wq-badge wq-badge--${q.triageLevel}`}>{q.triageLevel}</span>
            </div>
          ))}
        </div>

        <p className="wq-note">This list refreshes by itself every 30 seconds.</p>
      </div>
    </PageLayout>
  );
}

export default WaitingQueue;