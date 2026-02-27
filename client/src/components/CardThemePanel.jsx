import React, { useState, useEffect } from 'react';
import { useCardTheme } from '../context/CardThemeContext.jsx';
import PremiumVisitorCard from './cards/PremiumVisitorCard.jsx';
import PremiumStudentCard from './cards/PremiumStudentCard.jsx';
import { useToast } from '../context/ToastContext.jsx';

const FONT_OPTIONS = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'system-ui, sans-serif', label: 'System UI' }
];

const TEMPLATE_OPTIONS = [
  { value: 'modern-glass', label: 'Modern Glass' },
  { value: 'minimal-clean', label: 'Minimal Clean' },
  { value: 'dark-professional', label: 'Dark Professional' },
  { value: 'hospital-blue', label: 'Hospital Blue' }
];

const DEMO_VISITOR = {
  name: 'Ahmed Khan',
  cnic: '17301-1234567-1',
  purpose: 'Meeting',
  personToMeet: 'Registrar',
  visitorType: 'Guest',
  checkInTime: new Date(),
  passId: 'VP-ABC123',
  qrCodeValue: 'QR-DEMO-001'
};

const DEMO_STUDENT = {
  name: 'Sara Ahmed',
  studentId: 'IHS-NUR-001',
  department: 'Nursing',
  qrCodeValue: 'IHS-NUR-001'
};

export default function CardThemePanel() {
  const { theme, updateTheme } = useCardTheme();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [local, setLocal] = useState(theme);

  useEffect(() => {
    setLocal((p) => ({ ...p, ...theme }));
  }, [theme]);

  const handleChange = (key, value) => {
    setLocal((p) => ({ ...p, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTheme(local);
      addToast({ message: 'Card theme saved', type: 'success', size: 'small' });
    } catch (e) {
      addToast({ message: 'Failed to save theme', type: 'error', size: 'small' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-section">
      <div className="panel-header">
        <div className="panel-icon">🎨</div>
        <h3>Card Theme Customization</h3>
      </div>
      <p className="section-hint">Customize the design of visitor and student ID cards. Changes apply to new cards.</p>

      <div className="card-theme-grid">
        <div className="card-theme-form">
          <h4>Colors</h4>
          <div className="form-group">
            <label>Primary Color</label>
            <input
              type="color"
              value={local.primaryColor || '#7c3aed'}
              onChange={(e) => handleChange('primaryColor', e.target.value)}
              style={{ width: 60, height: 36, padding: 2, cursor: 'pointer' }}
            />
            <input
              type="text"
              value={local.primaryColor || '#7c3aed'}
              onChange={(e) => handleChange('primaryColor', e.target.value)}
              className="input-large"
              style={{ width: 120, marginLeft: 8 }}
            />
          </div>
          <div className="form-group">
            <label>Secondary Color</label>
            <input
              type="color"
              value={local.secondaryColor || '#5b21b6'}
              onChange={(e) => handleChange('secondaryColor', e.target.value)}
              style={{ width: 60, height: 36, padding: 2, cursor: 'pointer' }}
            />
            <input
              type="text"
              value={local.secondaryColor || '#5b21b6'}
              onChange={(e) => handleChange('secondaryColor', e.target.value)}
              className="input-large"
              style={{ width: 120, marginLeft: 8 }}
            />
          </div>
          <div className="form-group">
            <label>Text Color</label>
            <input
              type="color"
              value={local.textColor || '#1e293b'}
              onChange={(e) => handleChange('textColor', e.target.value)}
              style={{ width: 60, height: 36, padding: 2, cursor: 'pointer' }}
            />
          </div>

          <h4>Layout</h4>
          <div className="form-group">
            <label>Border Radius (px)</label>
            <input
              type="number"
              min={8}
              max={32}
              value={local.borderRadius ?? 16}
              onChange={(e) => handleChange('borderRadius', parseInt(e.target.value) || 16)}
              className="input-large"
              style={{ width: 80 }}
            />
          </div>
          <div className="form-group">
            <label>Font Family</label>
            <select
              value={local.fontFamily || 'Inter'}
              onChange={(e) => handleChange('fontFamily', e.target.value)}
              className="input-large"
            >
              {FONT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Template Style</label>
            <select
              value={local.templateStyle || 'modern-glass'}
              onChange={(e) => handleChange('templateStyle', e.target.value)}
              className="input-large"
            >
              {TEMPLATE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <h4>Institute Info</h4>
          <div className="form-group">
            <label>Institute Name</label>
            <input
              type="text"
              value={local.instituteName || ''}
              onChange={(e) => handleChange('instituteName', e.target.value)}
              className="input-large"
              placeholder="Institute of Health Sciences"
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              value={local.instituteAddress || ''}
              onChange={(e) => handleChange('instituteAddress', e.target.value)}
              className="input-large"
              placeholder="Address line"
            />
          </div>
          <div className="form-group">
            <label>Emergency Contact</label>
            <input
              type="text"
              value={local.emergencyContact || ''}
              onChange={(e) => handleChange('emergencyContact', e.target.value)}
              className="input-large"
              placeholder="Emergency: 112"
            />
          </div>

          <h4>Print Options</h4>
          <div className="form-group">
            <label>Auto print on check-in</label>
            <input
              type="checkbox"
              checked={!!local.autoPrintOnCheckIn}
              onChange={(e) => handleChange('autoPrintOnCheckIn', e.target.checked)}
            />
          </div>
          <div className="form-group">
            <label>Play sound on print</label>
            <input
              type="checkbox"
              checked={!!local.playSoundOnPrint}
              onChange={(e) => handleChange('playSoundOnPrint', e.target.checked)}
            />
          </div>
          <div className="form-group">
            <label>Enable back side printing</label>
            <input
              type="checkbox"
              checked={!!local.enableBackSidePrint}
              onChange={(e) => handleChange('enableBackSidePrint', e.target.checked)}
            />
          </div>

          <button type="button" className="btn-primary-wide" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Theme'}
          </button>
        </div>

        <div className="card-theme-preview">
          <h4>Preview</h4>
          <div className="card-theme-preview-inner">
            <CardThemePreview theme={local} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CardThemePreview({ theme }) {
  return (
    <div style={{ '--primary': theme.primaryColor, '--secondary': theme.secondaryColor, '--gradient': theme.gradient, '--text': theme.textColor, '--radius': `${theme.borderRadius}px`, '--font': theme.fontFamily }}>
      <div className="premium-card-container">
        <div className="premium-card-inner">
          <PremiumVisitorCard visitor={DEMO_VISITOR} showBack={theme.enableBackSidePrint} theme={theme} />
        </div>
      </div>
    </div>
  );
}
