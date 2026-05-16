require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const candidateRoutes = require('./routes/candidates');
const jobRoutes = require('./routes/jobs');
const dashboardRoutes = require('./routes/dashboard');
const uploadRoutes = require('./routes/upload');

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_FOLDER)));

// Ensure upload directory exists
if (!fs.existsSync(process.env.UPLOAD_FOLDER)) {
  fs.mkdirSync(process.env.UPLOAD_FOLDER);
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URL, {
  dbName: process.env.DATABASE_NAME,
})
.then(() => {
  console.log('MongoDB connected');
  // Seed admin user if not exists
  const User = require('./models/User');
  const bcrypt = require('bcryptjs');
  User.findOne({ username: process.env.ADMIN_USERNAME }).then(user => {
    if (!user) {
      const hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
      User.create({
        username: process.env.ADMIN_USERNAME,
        password: hashedPassword,
        email: 'admin@resumeai.com',
        role: 'admin'
      }).then(() => console.log('Admin user created'));
    }
  });
})
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));