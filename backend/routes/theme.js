const express = require('express');
const CardTheme = require('../models/CardTheme');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public: get current theme (for card rendering)
router.get('/', async (req, res) => {
  try {
    let theme = await CardTheme.findOne().sort({ updatedAt: -1 });
    if (!theme) {
      theme = await CardTheme.create({});
    }
    return res.json(theme);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load theme' });
  }
});

// Admin: update theme
router.put('/', requireAdmin, async (req, res) => {
  try {
    let theme = await CardTheme.findOne().sort({ updatedAt: -1 });
    if (!theme) {
      theme = await CardTheme.create(req.body || {});
    } else {
      const updates = req.body || {};
      Object.keys(updates).forEach((k) => {
        if (updates[k] !== undefined) theme[k] = updates[k];
      });
      await theme.save();
    }
    return res.json(theme);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update theme' });
  }
});

module.exports = router;
