// frontend/src/components/Upload/ResumeUpload.jsx
import React, { useState } from 'react';
import { uploadResumes } from '../../services/api';
import './Upload.css';

const ResumeUpload = ({ jobId }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [results, setResults] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setMessage('');
    setResults(null);
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!jobId) {
      alert('Please select a job description first!');
      return;
    }

    if (files.length === 0) {
      alert('Please select files to upload!');
      return;
    }

    setUploading(true);
    setMessage('Processing resumes...');

    try {
      const response = await uploadResumes(jobId, files);
      setResults(response.data.results);
      setMessage(`✅ Successfully processed ${response.data.results.length} resumes!`);
      setFiles([]);
    } catch (error) {
      setMessage('❌ Error uploading resumes. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-section">
      <h2>📤 Upload Resumes</h2>
      <p className="subtitle">Upload PDF or DOCX files for screening</p>

      <div className="upload-area">
        <input
          type="file"
          multiple
          accept=".pdf,.docx,.doc"
          onChange={handleFileSelect}
          className="file-input"
          id="resume-upload"
        />
        <label htmlFor="resume-upload" className="file-label">
          <div className="upload-icon">📁</div>
          <p>Click to select resume files</p>
          <p className="file-types">Supported: PDF, DOCX</p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="selected-files">
          <h3>Selected Files ({files.length})</h3>
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                <span>📄 {file.name}</span>
                <button 
                  className="remove-btn"
                  onClick={() => handleRemoveFile(index)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || files.length === 0 || !jobId}
        className="upload-btn"
      >
        {uploading ? '⏳ Processing...' : '🚀 Upload & Process'}
      </button>

      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'info'}`}>
          {message}
        </div>
      )}

      {results && (
        <div className="results">
          <h3>🎯 Processing Results (Real-time ML Predictions)</h3>
          <table>
            <thead>
              <tr>
                <th>File</th>
                <th>Candidate</th>
                <th>Overall Score</th>
                <th>Predicted Category</th>
                <th>Confidence</th>
                <th>Model Used</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index} className={result.is_resume ? '' : 'invalid-resume'}>
                  <td>{result.filename}</td>
                  <td>{result.candidate_name}</td>
                  <td>
                    <span className={`score-badge ${result.overall_score >= 80 ? 'high' : result.overall_score >= 60 ? 'medium' : 'low'}`}>
                      {result.overall_score}%
                    </span>
                  </td>
                  <td>
                    {result.category_prediction?.predicted_category ? (
                      <div className="category-info">
                        <span className="category-badge">
                          {result.category_prediction.predicted_category}
                        </span>
                        {result.category_prediction.top_3_candidates && result.category_prediction.top_3_candidates.length > 0 && (
                          <div className="top-3-tooltip">
                            <small>Top Predictions:</small>
                            <ul>
                              {result.category_prediction.top_3_candidates.map((pred, idx) => (
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
                    {result.category_prediction?.confidence ? (
                      <span className="confidence-badge">
                        {result.category_prediction.confidence}
                      </span>
                    ) : (
                      <span className="confidence-na">-</span>
                    )}
                  </td>
                  <td>
                    <span className={`model-badge ${result.model_used === 'trained_ensemble' ? 'ai-trained' : 'fallback'}`}>
                      {result.model_used === 'trained_ensemble' ? '🤖 AI' : '⚙️ Fallback'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Score Breakdown */}
          <div className="score-breakdown">
            <h4>📊 Detailed Score Breakdown</h4>
            <table className="breakdown-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Skills</th>
                  <th>Experience</th>
                  <th>Education</th>
                  <th>Keyword Match</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index}>
                    <td>{result.candidate_name}</td>
                    <td>{result.breakdown?.skills_score}%</td>
                    <td>{result.breakdown?.experience_score}%</td>
                    <td>{result.breakdown?.education_score}%</td>
                    <td>{result.breakdown?.keyword_score}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;