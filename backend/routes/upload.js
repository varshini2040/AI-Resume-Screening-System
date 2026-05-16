const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const axios = require('axios');
const authMiddleware = require('../middleware/auth');
const Candidate = require('../models/Candidate');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.UPLOAD_FOLDER),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: parseInt(process.env.MAX_UPLOAD_SIZE) } });

// Support multiple files
router.post('/', authMiddleware, upload.array('resumes', 100), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    const { jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    const results = [];

    for (const file of req.files) {
      // Extract text from resume
      let text = '';
      const filePath = file.path;
      const ext = path.extname(file.originalname).toLowerCase();
      if (ext === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        text = data.text;
      } else if (ext === '.docx') {
        const result = await mammoth.extractRawText({ path: filePath });
        text = result.value;
      } else {
        fs.unlinkSync(filePath);
        results.push({ fileName: file.originalname, error: 'Unsupported file type' });
        continue;
      }

      // Call Flask AI service
      let aiResult;
      try {
        const response = await axios.post(process.env.FLASK_AI_URL, {
          resume: text,
          job_description: jobDescription
        });
        aiResult = response.data;
      } catch (err) {
        console.error('Flask AI error:', err.message);
        aiResult = { match_score: 50, skills: [], missing_skills: [], recommendation: 'AI service unavailable' };
      }

      // Extract name and email
      const nameMatch = text.match(/^[\w\s\.\-]+/m) || text.match(/Name[:\s]*([^\n]+)/i);
      const name = nameMatch ? nameMatch[1].trim() : 'Unknown';
      const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
      const email = emailMatch ? emailMatch[0] : '';

      // Save candidate
      const candidate = new Candidate({
        userId: req.user.id,
        name,
        email,
        skills: aiResult.skills || [],
        score: aiResult.match_score,
        status: aiResult.match_score >= 80 ? 'shortlisted' : aiResult.match_score >= 60 ? 'pending' : 'rejected',
        resumeUrl: `/uploads/${file.filename}`
      });
      await candidate.save();

      results.push({
        fileName: file.originalname,
        name,
        email,
        score: aiResult.match_score,
        skills: aiResult.skills,
        missing_skills: aiResult.missing_skills,
        recommendation: aiResult.recommendation,
        status: candidate.status,
        candidateId: candidate._id
      });
    }

    res.json({ success: true, total: req.files.length, processed: results.length, results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload processing failed' });
  }
});

module.exports = router;