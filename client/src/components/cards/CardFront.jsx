import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useCardTheme } from '../../context/CardThemeContext.jsx';

export default function CardFront({ data, type = 'visitor', theme }) {
  const { theme: ctxTheme } = useCardTheme();
  const t = theme || ctxTheme;

  const isVisitor = type === 'visitor';
  const cardTitle = isVisitor ? 'Visitor Pass' : 'Student Entry Card';

  const cardStyle = {
    '--primary': t.primaryColor,
    '--secondary': t.secondaryColor,
    '--gradient': t.gradient,
    '--text': t.textColor,
    '--radius': `${t.borderRadius}px`,
    '--font': t.fontFamily
  };

  return (
    <div className="card-front print-card" style={cardStyle}>
      <div className="card-glass">
        <div className="card-header">
          <div className="card-logo">
            {t.logoUrl ? (
              <img src={t.logoUrl} alt="Logo" />
            ) : (
              <span className="card-logo-placeholder">🏥</span>
            )}
          </div>
          <div className="card-institute-name">{t.instituteName}</div>
        </div>
        <div className="card-title">{cardTitle}</div>

        <div className="card-body">
          <div className="card-photo">
            {t.enablePhotoOnCard && data.photoUrl ? (
              <img src={data.photoUrl} alt="" />
            ) : (
              <span className="card-avatar">{data.name?.charAt(0) || '?'}</span>
            )}
          </div>
          <div className="card-info">
            <div className="card-name">{data.name}</div>
            <div className="card-id">{isVisitor ? data.cnic : data.studentId}</div>
            <div className="card-dept">{isVisitor ? data.purpose : data.department}</div>
          </div>
        </div>

        <div className="card-footer">
          <div className="card-footer-row">
            <span>{data.checkInTime ? new Date(data.checkInTime).toLocaleDateString() : new Date().toLocaleDateString()}</span>
            <span>{data.checkInTime ? new Date(data.checkInTime).toLocaleTimeString() : new Date().toLocaleTimeString()}</span>
          </div>
          <div className="card-footer-row">
            <span>Pass ID: {data.passId || data.studentId || '—'}</span>
            <div className="card-qr-small">
              <QRCodeSVG value={data.qrCodeValue || data.studentId || data.passId || 'IHS'} size={48} level="L" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
