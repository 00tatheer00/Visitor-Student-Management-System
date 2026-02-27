const express = require('express');
const { createObjectCsvStringifier } = require('csv-writer');
const Visitor = require('../models/Visitor');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Admin: export visitors as CSV
router.get('/visitors', requireAdmin, async (req, res) => {
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

    const visitors = await Visitor.find(filter).sort({ checkInTime: -1 }).lean();

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: '_id', title: 'ID' },
        { id: 'name', title: 'Name' },
        { id: 'cnic', title: 'CNIC' },
        { id: 'phone', title: 'Phone' },
        { id: 'purpose', title: 'Purpose' },
        { id: 'personToMeet', title: 'PersonToMeet' },
        { id: 'visitorType', title: 'VisitorType' },
        { id: 'checkInTime', title: 'CheckInTime' },
        { id: 'checkOutTime', title: 'CheckOutTime' }
      ]
    });

    const records = visitors.map((v) => ({
      ...v,
      checkInTime: v.checkInTime ? new Date(v.checkInTime).toISOString() : '',
      checkOutTime: v.checkOutTime ? new Date(v.checkOutTime).toISOString() : ''
    }));

    const header = csvStringifier.getHeaderString();
    const body = csvStringifier.stringifyRecords(records);
    const csv = header + body;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="visitors-${new Date().toISOString().slice(0, 10)}.csv"`
    );

    return res.send(csv);
  } catch (err) {
    return res.status(500).send('Failed to export visitors');
  }
});

module.exports = router;

