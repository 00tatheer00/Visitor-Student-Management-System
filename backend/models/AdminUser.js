const mongoose = require('mongoose');

const ROLES = ['admin', 'security'];

const adminUserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, default: 'admin' }
  },
  {
    timestamps: true
  }
);

adminUserSchema.statics.ROLES = ROLES;
module.exports = mongoose.model('AdminUser', adminUserSchema);

