const express = require('express');
const Student = require('../models/Student');
const StudentLog = require('../models/StudentLog');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public: scan student card (USB scanner or camera)
// Expects query ?code=... which can be studentId or qrCodeValue
// Double scan prevention: only one entry per student per day
router.get('/scan', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ message: 'Scan code is required' });
    }

    const student =
      (await Student.findOne({ studentId: code })) ||
      (await Student.findOne({ qrCodeValue: code }));

    if (!student) {
      return res.status(404).json({ message: 'Student not registered' });
    }

    // Double scan prevention: check if already has entry today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const existingLog = await StudentLog.findOne({
      student: student._id,
      entryTime: { $gte: startOfDay, $lt: endOfDay }
    });

    if (existingLog) {
      return res.status(400).json({
        message: 'Already scanned today',
        duplicate: true,
        student,
        existingLog: { entryTime: existingLog.entryTime }
      });
    }

    const log = await StudentLog.create({ student: student._id });

    return res.json({
      student,
      log
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to process scan' });
  }
});

// Public: get departments list (for dropdowns)
router.get('/departments', (req, res) => {
  return res.json({ departments: Student.schema.path('department').enumValues });
});

// Admin: manage students
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { q } = req.query;
    const filter = {};
    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [{ studentId: regex }, { name: regex }, { department: regex }];
    }
    const students = await Student.find(filter).sort({ studentId: 1 });
    return res.json(students);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load students' });
  }
});

// Department code for fixed departments: Radiology→RAD, Cardiology→CAR, etc.
const DEPT_CODE_MAP = {
  Radiology: 'RAD',
  Cardiology: 'CAR',
  MLT: 'MLT',
  Emergency: 'EMR',
  Dental: 'DNT',
  Surgical: 'SRG',
  Optometry: 'OPT'
};

function getDeptCode(department) {
  const d = (department || '').trim();
  return DEPT_CODE_MAP[d] || (d.substring(0, 3).toUpperCase() || 'GEN');
}

// Generate next IHS student ID: IHS-{DEPT}-{number}, e.g. IHS-NUR-001, IHS-NUR-002
async function getNextIhsId(department) {
  const deptCode = getDeptCode(department);
  const prefix = `IHS-${deptCode}-`;
  const regex = new RegExp(`^IHS-${deptCode}-(\\d+)$`);
  const docs = await Student.find({ studentId: regex }).select('studentId').lean();
  let maxNum = 0;
  for (const d of docs) {
    const m = d.studentId.match(regex);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > maxNum) maxNum = n;
    }
  }
  return prefix + String(maxNum + 1).padStart(3, '0');
}

router.post('/', requireAdmin, async (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const nameVal = String(body.name || '').trim();
    const deptVal = String(body.department || '').trim();

    if (!nameVal || !deptVal) {
      return res.status(400).json({ message: 'Name and department are required' });
    }

    const studentId = await getNextIhsId(deptVal);
    const student = await Student.create({
      studentId,
      name: nameVal,
      department: deptVal,
      qrCodeValue: studentId
    });
    return res.status(201).json(student);
  } catch (err) {
    const msg = err.name === 'ValidationError'
      ? 'Invalid data. Please ensure name and department are filled.'
      : (err.message || 'Failed to create student');
    return res.status(err.name === 'ValidationError' ? 400 : 500).json({ message: msg });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const student = await Student.findByIdAndUpdate(id, updates, { new: true });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    return res.json(student);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update student' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    return res.json({ message: 'Student deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete student' });
  }
});

// Admin: bulk import students from JSON array
router.post('/bulk', requireAdmin, async (req, res) => {
  try {
    const { students } = req.body || {};
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'Provide a students array with name and department (studentId is auto-generated if omitted)' });
    }

    const created = [];
    const skipped = [];
    for (const s of students) {
      let studentId = (s.studentId || s.StudentID || '').toString().trim();
      const name = (s.name || s.Name || '').toString().trim();
      const department = (s.department || s.Department || '').toString().trim();
      const qrCodeValue = (s.qrCodeValue || s.qr_code_value || studentId || '').toString().trim();

      if (!name || !department) {
        skipped.push({ ...s, reason: 'Missing name or department' });
        continue;
      }

      if (!studentId) {
        studentId = await getNextIhsId(department);
      }

      const existing = await Student.findOne({ studentId });
      if (existing) {
        skipped.push({ ...s, reason: 'Student ID already exists' });
        continue;
      }

      const student = await Student.create({ studentId, name, department, qrCodeValue: qrCodeValue || undefined });
      created.push(student);
    }

    return res.json({
      created: created.length,
      skipped: skipped.length,
      total: students.length,
      createdIds: created.map((s) => s.studentId),
      skippedDetails: skipped
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Bulk import failed' });
  }
});

// Admin: view student entry logs (with department filter)
router.get('/logs/all', requireAdmin, async (req, res) => {
  try {
    const { from, to, studentId, department } = req.query;
    const filter = {};

    if (from || to) {
      filter.entryTime = {};
      if (from) filter.entryTime.$gte = new Date(from);
      if (to) filter.entryTime.$lte = new Date(to);
    }

    if (studentId) {
      const student = await Student.findOne({ studentId });
      if (student) {
        filter.student = student._id;
      } else {
        return res.json([]); // no logs if student not found
      }
    }

    let logs = await StudentLog.find(filter)
      .populate('student')
      .sort({ entryTime: -1 });

    if (department) {
      logs = logs.filter((l) => l.student && l.student.department === department);
    }

    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load student logs' });
  }
});

module.exports = router;

