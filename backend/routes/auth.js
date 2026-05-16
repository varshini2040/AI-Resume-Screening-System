const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Login
router.post('/login', [
  body('username').notEmpty(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.SECRET_KEY,
    { expiresIn: `${process.env.ACCESS_TOKEN_EXPIRE_MINUTES}m`, algorithm: process.env.ALGORITHM }
  );
  res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
});

// Register (optional, admin only maybe)
router.post('/register', [
  body('username').isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, email, password } = req.body;
  const existing = await User.findOne({ $or: [{ username }, { email }] });
  if (existing) return res.status(400).json({ error: 'Username or email already exists' });

  const hashed = bcrypt.hashSync(password, 10);
  const user = await User.create({ username, email, password: hashed });
  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.SECRET_KEY,
    { expiresIn: `${process.env.ACCESS_TOKEN_EXPIRE_MINUTES}m`, algorithm: process.env.ALGORITHM }
  );
  res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
});

module.exports = router;