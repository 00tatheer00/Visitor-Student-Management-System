const mongoose = require('mongoose');

const VISITOR_TYPES = ['Guest', 'Parent', 'Vendor', 'Student', 'Staff', 'Contractor', 'Other'];

const visitorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    cnic: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    purpose: { type: String, required: true, trim: true },
    personToMeet: { type: String, trim: true },
    visitorType: { type: String, enum: VISITOR_TYPES, default: 'Guest' },
    checkInTime: { type: Date, default: Date.now },
    checkOutTime: { type: Date, default: null },
    passId: { type: String, trim: true },
    qrCodeValue: { type: String, trim: true },
    cardPrinted: { type: Boolean, default: false },
    tokenNumber: { type: String, trim: true },
    visitDate: { type: Date }
  },
  {
    timestamps: true
  }
);

// For quickly checking active visitor by CNIC (checkOutTime null)
visitorSchema.index({ cnic: 1, checkOutTime: 1 });

visitorSchema.statics.VISITOR_TYPES = VISITOR_TYPES;
module.exports = mongoose.model('Visitor', visitorSchema);

