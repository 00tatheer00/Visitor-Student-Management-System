const express = require('express');
const Visitor = require('../models/Visitor');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

function generatePassId() {
  return 'VP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
}

function generateQRCodeValue() {
  return 'QR-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
}

// Daily incremental token: V-001, V-002, ... resets each day
async function getNextTokenNumber() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const count = await Visitor.countDocuments({
    visitDate: { $gte: today, $lt: tomorrow }
  });
  return 'V-' + String(count + 1).padStart(3, '0');
}

// Public: receptionist check-in
router.post('/check-in', async (req, res) => {
  try {
    const { name, cnic, phone, purpose, personToMeet, visitorType } = req.body || {};

    if (!name || !cnic || !purpose) {
      return res.status(400).json({ message: 'Name, CNIC, and purpose are required' });
    }

    // Prevent duplicate active CNIC
    const active = await Visitor.findOne({ cnic, checkOutTime: null });
    if (active) {
      return res.status(400).json({ message: 'Visitor with this CNIC is already checked in' });
    }

    const passId = generatePassId();
    const qrCodeValue = generateQRCodeValue();
    const tokenNumber = await getNextTokenNumber();
    const visitDate = new Date();
    visitDate.setHours(0, 0, 0, 0);

    const visitor = await Visitor.create({
      name,
      cnic,
      phone: phone || '',
      purpose,
      personToMeet: personToMeet || '',
      visitorType: visitorType || 'Guest',
      passId,
      qrCodeValue,
      tokenNumber,
      visitDate
    });

    return res.status(201).json(visitor);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to check in visitor' });
  }
});

// Public: list currently checked-in visitors
router.get('/active', async (req, res) => {
  try {
    const visitors = await Visitor.find({ checkOutTime: null }).sort({ checkInTime: -1 });
    return res.json(visitors);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load active visitors' });
  }
});

// Public: check-out by ID
router.post('/:id/check-out', async (req, res) => {
  try {
    const { id } = req.params;
    const visitor = await Visitor.findById(id);
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }
    if (visitor.checkOutTime) {
      return res.status(400).json({ message: 'Visitor already checked out' });
    }
    visitor.checkOutTime = new Date();
    await visitor.save();
    return res.json(visitor);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to check out visitor' });
  }
});

// Admin: list visitors with filters (date range + search)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { from, to, q } = req.query;
    const filter = {};

    if (from || to) {
      filter.checkInTime = {};
      if (from) filter.checkInTime.$gte = new Date(from);
      if (to) filter.checkInTime.$lte = new Date(to);
    }

    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [{ name: regex }, { cnic: regex }];
    }

    const visitors = await Visitor.find(filter).sort({ checkInTime: -1 });
    return res.json(visitors);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load visitors' });
  }
});

// Admin: update visitor
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const visitor = await Visitor.findByIdAndUpdate(id, updates, { new: true });
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }
    return res.json(visitor);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update visitor' });
  }
});

// Admin: delete visitor
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const visitor = await Visitor.findByIdAndDelete(id);
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }
    return res.json({ message: 'Visitor deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete visitor' });
  }
});

module.exports = router;

