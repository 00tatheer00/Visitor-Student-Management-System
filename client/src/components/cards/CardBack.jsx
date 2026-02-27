import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useCardTheme } from '../../context/CardThemeContext.jsx';

export default function CardBack({ data, type = 'visitor' }) {
  const { theme } = useCardTheme();
  const qrValue = data?.qrCodeValue || data?.studentId || data?.passId || 'IHS';
  const instituteAddress = theme?.instituteAddress || 'University of Peshawar';

  const idLabel = type === 'visitor' ? 'Pass ID' : 'Student ID';
  const idValue = type === 'visitor' ? (data?.passId || '—') : (data?.studentId || '—');

  return (
    <div className="card-premium card-premium-back print-card">
      <div className="card-premium-bg" />
      <div className="card-premium-stars" />

      <div className="card-premium-content">
        <div className="card-premium-header">
          <div className="card-premium-logo">
            <span className="card-premium-logo-icon">🔐</span>
          </div>
          <div className="card-premium-header-text">
            <div className="card-premium-institute">{theme?.instituteName || 'Institute of Health Sciences'}</div>
            <div className="card-premium-type">{type === 'visitor' ? 'Visitor Pass' : 'Student Entry Card'}</div>
          </div>
        </div>

        <div className="card-back-body">
          <div className="card-back-qr-wrap">
            <QRCodeSVG value={qrValue} size={100} level="M" />
          </div>
          <div className="card-back-info">
            <div className="card-back-name">{data?.name}</div>
            <div className="card-back-id">{idLabel}: {idValue}</div>
            <div className="card-back-address">{instituteAddress}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
