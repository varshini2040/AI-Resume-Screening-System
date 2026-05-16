const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const JobDescription = require('../models/JobDescription');

router.get('/', authMiddleware, async (req, res) => {
  const jobs = await JobDescription.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(jobs);
});

router.post('/', authMiddleware, async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) return res.status(400).json({ error: 'Title and description required' });
  // Extract skills from description (simple keyword extraction)
  const skills = [];
  const skillSet = new Set(['python', 'java', 'javascript', 'react', 'angular', 'node', 'sql', 'mongodb', 'aws', 'docker', 'kubernetes', 'tensorflow', 'pytorch', 'machine learning', 'data science', 'nlp', 'cybersecurity', 'linux', 'networking']);
  const words = description.toLowerCase().split(/\W+/);
  for (const word of words) {
    if (skillSet.has(word)) skills.push(word);
  }
  const job = await JobDescription.create({ userId: req.user.id, title, description, skills });
  res.status(201).json(job);
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const result = await JobDescription.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!result) return res.status(404).json({ error: 'Job not found' });
  res.status(204).send();
});

module.exports = router;