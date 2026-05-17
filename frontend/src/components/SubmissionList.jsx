import { useEffect, useState } from 'react';
import './SubmissionList.css';

export default function SubmissionList({ refreshKey }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    setLoading(true);
    fetch(`${apiUrl}/api/submissions`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to load submissions');
        return r.json();
      })
      .then(data => {
        setSubmissions(data.submissions || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [refreshKey]);

  return (
    <div className="list-card">
      <h2 className="list-title">Recent Submissions</h2>

      {loading && <p className="list-state">Loading…</p>}
      {error && <p className="list-state list-state--error">{error}</p>}

      {!loading && !error && submissions.length === 0 && (
        <p className="list-state">No submissions yet.</p>
      )}

      {!loading && !error && submissions.length > 0 && (
        <ul className="submission-list">
          {[...submissions].reverse().map(sub => (
            <li key={sub.id} className="submission-item">
              <div className="submission-header">
                <span className="submission-name">{sub.name}</span>
                <span className="submission-date">
                  {new Date(sub.submittedAt).toLocaleString()}
                </span>
              </div>
              <div className="submission-meta">
                <span className="meta-tag">{sub.department}</span>
                <span className="meta-tag meta-tag--alt">{sub.experience}</span>
              </div>
              <div className="submission-email">{sub.email}</div>
              {sub.skills?.length > 0 && (
                <div className="submission-skills">
                  {sub.skills.map(s => (
                    <span key={s} className="skill-badge">{s}</span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
