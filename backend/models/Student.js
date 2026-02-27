const mongoose = require('mongoose');

const DEPARTMENTS = ['Radiology', 'Cardiology', 'MLT', 'Emergency', 'Dental', 'Surgical', 'Optometry'];

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true, enum: DEPARTMENTS },
    qrCodeValue: { type: String, trim: true, unique: true, sparse: true }
  },
  {
    timestamps: true
  }
);

studentSchema.statics.DEPARTMENTS = DEPARTMENTS;
module.exports = mongoose.model('Student', studentSchema);

