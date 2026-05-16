const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const Candidate = require('../models/Candidate');

router.get('/', authMiddleware, async (req, res) => {
  const candidates = await Candidate.find({ userId: req.user.id });
  const stats = {
    total: candidates.length,
    shortlisted: candidates.filter(c => c.status === 'shortlisted').length,
    pending: candidates.filter(c => c.status === 'pending').length,
    rejected: candidates.filter(c => c.status === 'rejected').length
  };
  const scoreDistribution = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
  candidates.forEach(c => {
    if (c.score <= 20) scoreDistribution['0-20']++;
    else if (c.score <= 40) scoreDistribution['21-40']++;
    else if (c.score <= 60) scoreDistribution['41-60']++;
    else if (c.score <= 80) scoreDistribution['61-80']++;
    else scoreDistribution['81-100']++;
  });
  res.json({ stats, scoreDistribution });
});

module.exports = router;