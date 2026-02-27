import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useCardTheme } from '../../context/CardThemeContext.jsx';

export default function CardBack({ data, type = 'visitor' }) {
  const { theme } = useCardTheme();
  const qrValue = data?.qrCodeValue || data?.studentId || data?.passId || 'IHS';
  const instituteName = theme?.instituteName || 'Institute of Health Sciences';

  return (
    <div className="card-school card-school-back print-card">
      <div className="card-school-wavy" />
      <div className="card-school-accent-tl" />

      <div className="card-school-back-qr">
        <QRCodeSVG
          value={qrValue}
          size={100}
          level="M"
          bgColor="#FFFFFF"
          fgColor="#000000"
        />
      </div>

      <div className="card-school-back-institute">{instituteName.toUpperCase()}</div>

      <div className="card-school-back-terms">
        <div className="card-school-back-terms-title">Term & Conditions</div>
        <p className="card-school-back-terms-text">
          This card must be presented for entry, library access and events. If lost, report immediately to the administration office.
        </p>
      </div>

      <div className="card-school-wave-bottom" />
    </div>
  );
}
