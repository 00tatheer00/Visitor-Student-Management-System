import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useCardTheme } from '../../context/CardThemeContext.jsx';

export default function CardBack({ data, type = 'visitor', theme }) {
  const { theme: ctxTheme } = useCardTheme();
  const t = theme || ctxTheme;

  const cardStyle = {
    '--primary': t.primaryColor,
    '--secondary': t.secondaryColor,
    '--gradient': t.gradient,
    '--text': t.textColor,
    '--radius': `${t.borderRadius}px`,
    '--font': t.fontFamily
  };

  const qrValue = data?.qrCodeValue || data?.studentId || data?.passId || 'IHS';

  return (
    <div className="card-back print-card" style={cardStyle}>
      <div className="card-glass">
        <div className="card-back-qr">
          <QRCodeSVG value={qrValue} size={120} level="M" />
        </div>
        <div className="card-back-validity">Valid for Today Only</div>
        <div className="card-back-address">{t.instituteAddress}</div>
        <div className="card-back-emergency">{t.emergencyContact}</div>
        <ul className="card-back-rules">
          <li>Keep this card visible at all times</li>
          <li>Return to reception on exit</li>
          <li>Do not transfer to another person</li>
        </ul>
        <div className="card-back-signature">Authorized Signature</div>
      </div>
    </div>
  );
}
