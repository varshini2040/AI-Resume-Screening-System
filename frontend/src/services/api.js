import axios from 'axios';

const API = axios.create({ 
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login
export const loginAdmin = (username, password) => {
  return API.post('/login', { username, password });
};

// Jobs
export const getJobs = () => API.get('/jobs');

export const createJob = (title, description, required_skills, required_experience, required_education) => {
  return API.post('/jobs', {
    title: title,
    description: description,
    required_skills: required_skills,
    required_experience: parseInt(required_experience) || 0,
    required_education: required_education
  });
};

// Upload Resumes
export const uploadResumes = (jobId, files) => {
  const fd = new FormData();
  fd.append('job_id', jobId);
  Array.from(files).forEach(f => fd.append('files', f));
  return API.post('/upload-resumes', fd, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
  });
};

// Rankings
export const getRankings = (jobId) => API.get(`/rankings/${jobId}`);