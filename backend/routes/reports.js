const express = require('express');
const Visitor = require('../models/Visitor');
const StudentLog = require('../models/StudentLog');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public: today's stats (for reception dashboard)
router.get('/today', async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [visitorCount, studentEntryCount] = await Promise.all([
      Visitor.countDocuments({ checkInTime: { $gte: startOfDay, $lte: endOfDay } }),
      StudentLog.countDocuments({ entryTime: { $gte: startOfDay, $lte: endOfDay } })
    ]);

    const activeCount = await Visitor.countDocuments({ checkOutTime: null });

    return res.json({
      date: startOfDay.toISOString().slice(0, 10),
      visitorCount,
      studentEntryCount,
      activeVisitors: activeCount
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load stats' });
  }
});

// Public: chart data - last 7 days (for reception dashboard)
router.get('/chart', async (req, res) => {
  try {
    const days = 7;
    const result = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);

      const [visitorCount, studentCount] = await Promise.all([
        Visitor.countDocuments({ checkInTime: { $gte: d, $lt: next } }),
        StudentLog.countDocuments({ entryTime: { $gte: d, $lt: next } })
      ]);

      result.push({
        date: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        visitors: visitorCount,
        students: studentCount
      });
    }
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load chart data' });
  }
});

// Admin: simple daily report (today's visitors and student entries count)
router.get('/daily', requireAdmin, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const visitorCount = await Visitor.countDocuments({
      checkInTime: { $gte: startOfDay, $lte: endOfDay }
    });

    const studentEntryCount = await StudentLog.countDocuments({
      entryTime: { $gte: startOfDay, $lte: endOfDay }
    });

    return res.json({
      date: startOfDay.toISOString().slice(0, 10),
      visitorCount,
      studentEntryCount
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load daily report' });
  }
});

module.exports = router;

