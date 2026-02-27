/**
 * Assign qrCodeValue = studentId to all students missing it.
 * Ensures every student's QR code encodes their student ID for scanning.
 * Run: node scripts/assignQrCodes.js
 */
const mongoose = require('mongoose');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ihs-visitor-management';

async function assignQrCodes() {
  const Student = require(path.join(__dirname, '../models/Student'));

  await mongoose.connect(MONGO_URI, { dbName: 'ihs-visitor-management' });
  console.log('MongoDB connected');

  const students = await Student.find({}).lean();
  let updated = 0;

  for (const s of students) {
    const needsUpdate = !s.qrCodeValue || s.qrCodeValue !== s.studentId;
    if (needsUpdate) {
      await Student.findByIdAndUpdate(s._id, { qrCodeValue: s.studentId });
      updated++;
      console.log(`  ${s.studentId}: assigned qrCodeValue = ${s.studentId}`);
    }
  }

  console.log(`\nDone. Updated ${updated} of ${students.length} students with qrCodeValue = studentId`);
  await mongoose.disconnect();
  process.exit(0);
}

assignQrCodes().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
