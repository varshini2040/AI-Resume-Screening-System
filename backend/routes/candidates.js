const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const Candidate = require('../models/Candidate');

router.get('/', authMiddleware, async (req, res) => {
  const candidates = await Candidate.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(candidates);
});

router.patch('/:id/status', authMiddleware, async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'shortlisted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const candidate = await Candidate.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { status },
    { new: true }
  );
  if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
  res.json(candidate);
});

module.exports = router;