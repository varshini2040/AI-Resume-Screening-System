// frontend/src/components/Rankings/RankingsTable.jsx
import React, { useState, useEffect } from 'react';
import { getRankings } from '../../services/api';
import './Rankings.css';

const RankingsTable = ({ jobId }) => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (jobId) {
      loadRankings();
    }
  }, [jobId]);

  const loadRankings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getRankings(jobId);
      setRankings(response.data.rankings);
    } catch (err) {
      setError('Error loading rankings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const exportToCSV = () => {
    let csv = 'Rank,Candidate,Overall Score,Skills,Experience,Education,Keyword\n';
    rankings.forEach(r => {
      csv += `${r.rank},${r.candidate_name},${r.overall_score}%,${r.skills_score}%,${r.experience_score}%,${r.education_score}%,${r.keyword_score}%\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rankings_job_${jobId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!jobId) {
    return (
      <div className="rankings-empty">
        <p>📋 Please select a job to view rankings</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rankings-loading">
        <p>⏳ Loading rankings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rankings-error">
        <p>❌ {error}</p>
        <button onClick={loadRankings}>Retry</button>
      </div>
    );
  }

  return (
    <div className="rankings-section">
      <div className="rankings-header">
        <h2>🏆 Resume Rankings</h2>
        {rankings.length > 0 && (
          <button onClick={exportToCSV} className="export-btn">
            📥 Export CSV
          </button>
        )}
      </div>

      {rankings.length === 0 ? (
        <div className="no-data">
          <p>📭 No resumes uploaded yet</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="rankings-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Candidate</th>
                <th>Overall</th>
                <th>Skills</th>
                <th>Experience</th>
                <th>Education</th>
                <th>Keyword Match</th>
                <th>Predicted Category</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((candidate) => (
                <tr key={candidate.rank} className={candidate.rank <= 3 ? 'top-row' : ''}>
                  <td className="rank-cell">
                    <span className="rank-badge">{getRankBadge(candidate.rank)}</span>
                  </td>
                  <td className="name-cell">{candidate.candidate_name}</td>
                  <td>
                    <div className="score-bar">
                      <div 
                        className={`score-fill ${getScoreColor(candidate.overall_score)}`}
                        style={{ width: `${candidate.overall_score}%` }}
                      />
                      <span className="score-text">{candidate.overall_score}%</span>
                    </div>
                  </td>
                  <td>{candidate.skills_score}%</td>
                  <td>{candidate.experience_score}%</td>
                  <td>{candidate.education_score}%</td>
                  <td>{candidate.keyword_score}%</td>
                  <td>
                    {candidate.category_prediction?.predicted_category ? (
                      <div className="category-cell">
                        <span className="category-badge">
                          {candidate.category_prediction.predicted_category}
                        </span>
                        {candidate.category_prediction.top_3_candidates && candidate.category_prediction.top_3_candidates.length > 0 && (
                          <div className="top-3-info">
                            <small>Alternatives:</small>
                            <ul>
                              {candidate.category_prediction.top_3_candidates.slice(1).map((pred, idx) => (
                                <li key={idx}>
                                  {pred.category}: {pred.percentage}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="category-na">N/A</span>
                    )}
                  </td>
                  <td>
                    {candidate.category_prediction?.confidence ? (
                      <span className="confidence-badge">
                        {candidate.category_prediction.confidence}
                      </span>
                    ) : (
                      <span className="confidence-na">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RankingsTable;