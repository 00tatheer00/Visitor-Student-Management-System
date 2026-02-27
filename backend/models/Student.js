const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    qrCodeValue: { type: String, trim: true, unique: true, sparse: true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Student', studentSchema);

