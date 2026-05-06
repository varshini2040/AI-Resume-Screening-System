import React, { useState, useEffect } from 'react';
import { getJobs, getRankings, uploadResumes, createJob } from '../../services/api';

const Dashboard = ({ token, onLogout }) => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [rankings, setRankings] = useState([]);
  const [activeTab, setActiveTab] = useState('jobs');
  const [uploadMsg, setUploadMsg] = useState('');
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobSkills, setJobSkills] = useState('');
  const [jobExp, setJobExp] = useState(0);
  const [jobEdu, setJobEdu] = useState('');

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    try { const res = await getJobs(); setJobs(res.data); } catch (err) {}
  };

  const loadRankings = async () => {
    if (!selectedJob) return;
    try { const res = await getRankings(selectedJob); setRankings(res.data.rankings || []); } catch (err) {}
  };

  const handleCreateJob = async () => {
    try {
      await createJob(jobTitle, jobDesc, jobSkills, jobExp, jobEdu);
      alert('✅ Job Created!');
      setShowJobForm(false);
      loadJobs();
    } catch (err) { alert('Error creating job'); }
  };

  const handleFileUpload = async (e) => {
    if (!selectedJob) { alert('Select a job first!'); return; }
    const files = e.target.files;
    if (files.length === 0) return;
    setUploadMsg('⏳ Processing...');
    try {
      const res = await uploadResumes(selectedJob, files);
      setUploadMsg('✅ ' + res.data.message);
      loadRankings();
    } catch (err) { setUploadMsg('❌ Error uploading'); }
  };

  return (
    <div>
      <header style={{ background: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2>🤖 AI Resume Screening System</h2>
        <button onClick={onLogout} style={{ padding: '10px 20px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
      </header>
      <div style={{ display: 'flex', padding: '20px', gap: '20px' }}>
        <div style={{ width: '280px', background: 'white', padding: '20px', borderRadius: '10px' }}>
          <h3>Select Job</h3>
          <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '10px' }}>
            <option value="">-- Select Job --</option>
            {jobs.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}
          </select>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' }}>
            <button onClick={() => setActiveTab('jobs')} style={tabStyle(activeTab === 'jobs')}>📋 Manage Jobs</button>
            <button onClick={() => { setActiveTab('upload'); loadRankings(); }} style={tabStyle(activeTab === 'upload')}>📤 Upload Resumes</button>
            <button onClick={() => { setActiveTab('rankings'); loadRankings(); }} style={tabStyle(activeTab === 'rankings')}>🏆 Rankings</button>
          </div>
        </div>
        <div style={{ flex: 1, background: 'white', padding: '30px', borderRadius: '10px' }}>
          {activeTab === 'jobs' && (
            <div>
              <button onClick={() => setShowJobForm(!showJobForm)} style={{ padding: '10px 20px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px' }}>+ Create New Job</button>
              {showJobForm && (
                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
                  <input placeholder="Job Title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} style={inputStyle} />
                  <textarea placeholder="Job Description" value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} style={inputStyle} rows="4" />
                  <input placeholder="Skills (comma separated)" value={jobSkills} onChange={(e) => setJobSkills(e.target.value)} style={inputStyle} />
                  <input type="number" placeholder="Experience (years)" value={jobExp} onChange={(e) => setJobExp(e.target.value)} style={inputStyle} />
                  <input placeholder="Education" value={jobEdu} onChange={(e) => setJobEdu(e.target.value)} style={inputStyle} />
                  <button onClick={handleCreateJob} style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}>Save Job</button>
                </div>
              )}
              {jobs.map(job => (
                <div key={job.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '10px' }}>
                  <h4>{job.title}</h4>
                  <p style={{ color: '#666' }}>{job.description}</p>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'upload' && (
            <div>
              <h3>📤 Upload Resumes</h3>
              <input type="file" multiple accept=".pdf,.docx" onChange={handleFileUpload} style={{ marginTop: '20px' }} />
              {uploadMsg && <p style={{ marginTop: '15px' }}>{uploadMsg}</p>}
            </div>
          )}
          {activeTab === 'rankings' && (
            <div>
              <h3>🏆 Rankings</h3>
              {rankings.length === 0 ? <p>No resumes uploaded yet.</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                  <thead><tr style={{ background: '#2c3e50', color: 'white' }}><th style={{ padding: '10px' }}>Rank</th><th style={{ padding: '10px' }}>Candidate</th><th style={{ padding: '10px' }}>Score</th><th style={{ padding: '10px' }}>Skills</th></tr></thead>
                  <tbody>{rankings.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '10px' }}>{r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : '#'+r.rank}</td>
                      <td style={{ padding: '10px' }}>{r.candidate_name}</td>
                      <td style={{ padding: '10px' }}><b>{r.overall_score}%</b></td>
                      <td style={{ padding: '10px' }}>{r.skills_score}%</td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const tabStyle = (active) => ({
  padding: '12px 15px', background: active ? '#667eea' : '#f8f9fa',
  color: active ? 'white' : '#333', border: '1px solid #ddd',
  borderRadius: '5px', cursor: 'pointer', textAlign: 'left', fontSize: '14px'
});

const inputStyle = {
  width: '100%', padding: '10px', margin: '8px 0',
  border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px', display: 'block'
};

export default Dashboard;