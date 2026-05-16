const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: String,
  phone: String,
  skills: [String],
  score: { type: Number, min: 0, max: 100 },
  status: { type: String, enum: ['pending', 'shortlisted', 'rejected'], default: 'pending' },
  resumeUrl: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Candidate', candidateSchema);