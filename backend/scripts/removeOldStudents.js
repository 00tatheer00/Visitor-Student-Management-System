/**
 * Remove old students (IHS-*-001 to IHS-*-050) from all departments.
 * Run: node scripts/removeOldStudents.js
 */
const mongoose = require('mongoose');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ihs-visitor-management';

const DEPT_CODES = ['RAD', 'CAR', 'MLT', 'EMR', 'DNT', 'SRG', 'OPT'];

async function removeOld() {
  const Student = require(path.join(__dirname, '../models/Student'));

  await mongoose.connect(MONGO_URI, { dbName: 'ihs-visitor-management' });
  console.log('MongoDB connected');

  const idsToDelete = [];
  for (const code of DEPT_CODES) {
    for (let i = 1; i <= 50; i++) {
      const num = String(i).padStart(3, '0');
      idsToDelete.push(`IHS-${code}-${num}`);
    }
  }

  const result = await Student.deleteMany({ studentId: { $in: idsToDelete } });
  console.log(`Removed ${result.deletedCount} students (IHS-*-001 to IHS-*-050)`);
  await mongoose.disconnect();
  process.exit(0);
}

removeOld().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
