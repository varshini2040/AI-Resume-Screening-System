const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  skills: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JobDescription', jobSchema);