const mongoose = require('mongoose');

const cardThemeSchema = new mongoose.Schema(
  {
    primaryColor: { type: String, default: '#7c3aed' },
    secondaryColor: { type: String, default: '#5b21b6' },
    gradient: { type: String, default: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)' },
    textColor: { type: String, default: '#1e293b' },
    borderRadius: { type: Number, default: 16 },
    fontFamily: { type: String, default: 'Inter, sans-serif' },
    logoUrl: { type: String, default: '' },
    templateStyle: { type: String, enum: ['modern-glass', 'minimal-clean', 'dark-professional', 'hospital-blue'], default: 'modern-glass' },
    autoPrintOnCheckIn: { type: Boolean, default: true },
    playSoundOnPrint: { type: Boolean, default: true },
    enablePhotoOnCard: { type: Boolean, default: false },
    enableBackSidePrint: { type: Boolean, default: true },
    instituteName: { type: String, default: 'Institute of Health Sciences' },
    instituteAddress: { type: String, default: 'Address line here' },
    emergencyContact: { type: String, default: 'Emergency: 112' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CardTheme', cardThemeSchema);
