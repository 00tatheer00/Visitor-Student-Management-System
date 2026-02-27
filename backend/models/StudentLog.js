const mongoose = require('mongoose');

const studentLogSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    entryTime: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

studentLogSchema.index({ entryTime: 1 });

module.exports = mongoose.model('StudentLog', studentLogSchema);

