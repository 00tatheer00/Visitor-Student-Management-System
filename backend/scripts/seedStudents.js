/**
 * Seed 50 dummy students per department directly into MongoDB.
 * Run: node scripts/seedStudents.js
 */
const mongoose = require('mongoose');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ihs-visitor-management';

const DEPARTMENTS = ['Radiology', 'Cardiology', 'MLT', 'Emergency', 'Dental', 'Surgical', 'Optometry'];
const DEPT_CODE_MAP = {
  Radiology: 'RAD',
  Cardiology: 'CAR',
  MLT: 'MLT',
  Emergency: 'EMR',
  Dental: 'DNT',
  Surgical: 'SRG',
  Optometry: 'OPT'
};

const PAKISTANI_NAMES = [
  'Ahmed Khan', 'Fatima Ali', 'Muhammad Hassan', 'Ayesha Siddiqui', 'Ali Raza',
  'Sana Malik', 'Usman Ahmed', 'Zainab Hussain', 'Omar Farooq', 'Hira Shah',
  'Bilal Khan', 'Maryam Khan', 'Hamza Ali', 'Amina Sheikh', 'Hassan Raza',
  'Sara Ahmed', 'Ibrahim Malik', 'Zara Khan', 'Yusuf Hussain', 'Layla Ali',
  'Abdullah Khan', 'Aisha Malik', 'Tariq Ahmed', 'Noor Fatima', 'Khalid Hassan',
  'Mariam Siddiqui', 'Imran Khan', 'Hina Raza', 'Rashid Ali', 'Saima Khan',
  'Waqas Ahmed', 'Rabia Hussain', 'Faisal Malik', 'Nadia Sheikh', 'Junaid Khan',
  'Sadia Ali', 'Kamran Ahmed', 'Amina Khan', 'Salman Hussain', 'Bushra Malik',
  'Adnan Raza', 'Sana Khan', 'Naveed Ahmed', 'Zahra Ali', 'Shahid Hassan',
  'Farah Malik', 'Asad Khan', 'Huma Siddiqui', 'Rizwan Ahmed', 'Samina Khan',
  'Tahir Ali', 'Noreen Malik', 'Shoaib Khan', 'Khadija Hussain', 'Noman Ahmed'
];

function getName(index) {
  return PAKISTANI_NAMES[index % PAKISTANI_NAMES.length];
}

async function seed() {
  const Student = require(path.join(__dirname, '../models/Student'));

  await mongoose.connect(MONGO_URI, { dbName: 'ihs-visitor-management' });
  console.log('MongoDB connected');

  const countPerDept = 50;
  let created = 0;
  let skipped = 0;

  for (const dept of DEPARTMENTS) {
    const deptCode = DEPT_CODE_MAP[dept] || dept.substring(0, 3).toUpperCase();
    const prefix = `IHS-${deptCode}-`;
    const regex = new RegExp(`^IHS-${deptCode}-(\\d+)$`);

    const existingDocs = await Student.find({ studentId: regex }).select('studentId').lean();
    let maxNum = 0;
    for (const d of existingDocs) {
      const m = d.studentId.match(regex);
      if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
    }

    let deptCreated = 0;
    for (let i = 1; i <= countPerDept; i++) {
      const num = String(maxNum + i).padStart(3, '0');
      const studentId = `${prefix}${num}`;

      const existing = await Student.findOne({ studentId });
      if (existing) {
        skipped++;
        continue;
      }

      await Student.create({
        studentId,
        name: getName((dept.charCodeAt(0) * 7 + i) % PAKISTANI_NAMES.length),
        department: dept,
        qrCodeValue: studentId
      });
      created++;
      deptCreated++;
    }
    console.log(`  ${dept}: ${deptCreated} students (IHS-${deptCode}-${String(maxNum + 1).padStart(3, '0')} to IHS-${deptCode}-${String(maxNum + deptCreated).padStart(3, '0')})`);
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
