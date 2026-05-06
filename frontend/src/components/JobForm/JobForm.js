// frontend/src/components/JobForm/JobForm.jsx
import React, { useState, useEffect } from 'react';
import { getJobs, createJob } from '../../services/api';
import './JobForm.css';

const JobForm = ({ onJobCreated }) => {
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    required_skills: '',
    required_experience: 0,
    required_education: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await getJobs();
      setJobs(response.data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    const jobData = {
      title: formData.title,
      description: formData.description,
      required_skills: formData.required_skills.split(',').map(s => s.trim()).filter(s => s),
      required_experience: parseInt(formData.required_experience) || 0,
      required_education: formData.required_education
    };

    try {
      await createJob(jobData);
      setMessage('✅ Job created successfully!');
      setFormData({
        title: '',
        description: '',
        required_skills: '',
        required_experience: 0,
        required_education: ''
      });
      setShowForm(false);
      loadJobs();
      if (onJobCreated) onJobCreated();
    } catch (error) {
      setMessage('❌ Error creating job');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="job-form-section">
      <div className="section-header">
        <h2>📋 Job Descriptions</h2>
        <button 
          className="add-job-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ Add New Job'}
        </button>
      </div>

      {message && (
        <div className={`job-message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {showForm && (
        <div className="job-form-container">
          <h3>Create New Job Description</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Job Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Python Developer"
                required
              />
            </div>

            <div className="form-group">
              <label>Job Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the job role, responsibilities..."
                rows="5"
                required
              />
            </div>

            <div className="form-group">
              <label>Required Skills (comma separated)</label>
              <input
                type="text"
                name="required_skills"
                value={formData.required_skills}
                onChange={handleChange}
                placeholder="e.g., Python, Django, MongoDB, React"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Required Experience (years)</label>
                <input
                  type="number"
                  name="required_experience"
                  value={formData.required_experience}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Required Education</label>
                <input
                  type="text"
                  name="required_education"
                  value={formData.required_education}
                  onChange={handleChange}
                  placeholder="e.g., Bachelor's in CS"
                />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="submit-btn">
              {submitting ? 'Creating...' : '💾 Create Job Description'}
            </button>
          </form>
        </div>
      )}

      <div className="jobs-list">
        <h3>Existing Jobs ({jobs.length})</h3>
        {jobs.length === 0 ? (
          <p className="no-jobs">No jobs created yet. Click "Add New Job" to create one.</p>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div key={job.id} className="job-card">
                <h4>{job.title}</h4>
                <p className="job-desc">{job.description.substring(0, 150)}...</p>
                <div className="job-skills">
                  {job.required_skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
                <div className="job-meta">
                  <span>📅 {job.required_experience} years exp</span>
                  <span>🎓 {job.required_education || 'Any'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobForm;