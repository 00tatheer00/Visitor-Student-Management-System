const express = require('express');
const bcrypt = require('bcryptjs');
const AdminUser = require('../models/AdminUser');

const router = express.Router();

// Ensure a default admin user exists
async function ensureDefaultAdmin() {
  const existing = await AdminUser.findOne({ username: 'admin' });
  if (existing) return;

  const passwordHash = await bcrypt.hash('admin123', 10);
  await AdminUser.create({ username: 'admin', passwordHash });
}

ensureDefaultAdmin().catch(() => {});

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const user = await AdminUser.findOne({ username });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  req.session.adminUser = {
    id: user._id.toString(),
    username: user.username,
    role: user.role || 'admin'
  };
  return res.json({ username: user.username, role: user.role || 'admin' });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out' });
  });
});

router.get('/me', (req, res) => {
  if (req.session && req.session.adminUser) {
    return res.json({ user: req.session.adminUser });
  }
  return res.status(401).json({ message: 'Not logged in' });
});

module.exports = router;

