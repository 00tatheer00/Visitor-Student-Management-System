const mongoose = require('mongoose');

const FINE_TYPES = ['No Uniform', 'Late Entry', 'No ID Card', 'Misconduct'];

const fineSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    fineType: { type: String, required: true, enum: FINE_TYPES },
    amount: { type: Number, required: true, min: 1 },
    reason: { type: String, trim: true },
    date: { type: Date, default: Date.now },
    addedBy: { type: String, trim: true }
  },
  {
    timestamps: true
  }
);

fineSchema.index({ studentId: 1, date: -1 });
fineSchema.index({ department: 1 });
fineSchema.index({ date: -1 });

fineSchema.statics.FINE_TYPES = FINE_TYPES;
module.exports = mongoose.model('Fine', fineSchema);
