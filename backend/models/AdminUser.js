const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AdminUser', adminUserSchema);

