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
    <div className="card-minimal card-back-minimal print-card">
      <div className="card-back-content">
        <div className="card-back-name">{data?.name}</div>
        <div className="card-back-contact">
          <div>{idLabel}: {idValue}</div>
          <div>{instituteAddress}</div>
        </div>
        <div className="card-back-qr">
          <QRCodeSVG value={qrValue} size={90} level="M" />
        </div>
      </div>
    </div>
  );
}
