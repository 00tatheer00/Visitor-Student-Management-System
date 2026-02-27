const express = require('express');
const Fine = require('../models/Fine');
const Student = require('../models/Student');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Admin: add fine manually
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { studentId, name, department, fineType, amount, reason, date } = req.body || {};
    const addedBy = req.session?.adminUser?.username || 'admin';

    if (!studentId || !name || !department || !fineType || !amount) {
      return res.status(400).json({
        message: 'studentId, name, department, fineType, and amount are required'
      });
    }

    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    const fine = await Fine.create({
      studentId: String(studentId).trim(),
      name: String(name).trim(),
      department: String(department).trim(),
      fineType,
      amount: amt,
      reason: reason ? String(reason).trim() : '',
      date: date ? new Date(date) : new Date(),
      addedBy
    });

    return res.status(201).json(fine);
  } catch (err) {
    const msg = err.name === 'ValidationError'
      ? (err.errors?.amount?.message || 'Invalid data')
      : (err.message || 'Failed to add fine');
    return res.status(err.name === 'ValidationError' ? 400 : 500).json({ message: msg });
  }
});

// Admin: list fines with filters
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { from, to, department, studentId } = req.query;
    const filter = {};

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    if (department) filter.department = department;
    if (studentId) filter.studentId = new RegExp(studentId, 'i');

    const fines = await Fine.find(filter).sort({ date: -1 });
    return res.json(fines);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load fines' });
  }
});

// Public: add fine during scan (when addFine=true, called by scan flow)
router.post('/scan', async (req, res) => {
  try {
    const { studentId, fineType, amount, reason } = req.body || {};
    const addedBy = req.session?.adminUser?.username || 'reception';

    if (!studentId || !fineType || !amount) {
      return res.status(400).json({
        message: 'studentId, fineType, and amount are required'
      });
    }

    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    const fine = await Fine.create({
      studentId: student.studentId,
      name: student.name,
      department: student.department,
      fineType,
      amount: amt,
      reason: reason ? String(reason).trim() : '',
      date: new Date(),
      addedBy
    });

    return res.status(201).json(fine);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to add fine' });
  }
});

module.exports = router;
