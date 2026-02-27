import React from 'react';
import { useCardTheme } from '../../context/CardThemeContext.jsx';

export default function CardFront({ data, type = 'visitor' }) {
  const { theme } = useCardTheme();
  const isVisitor = type === 'visitor';
  const cardTitle = isVisitor ? 'Visitor Pass' : 'Student Entry Card';
  const instituteName = theme?.instituteName || 'Institute of Health Sciences';

  return (
    <div className="card-minimal card-front-minimal print-card">
      <div className="card-minimal-header">
        <div className="card-minimal-logo">🏥</div>
        <div className="card-minimal-institute">{instituteName}</div>
      </div>

      <div className="card-minimal-photo-wrap">
        <div className="card-minimal-photo">
          {theme?.enablePhotoOnCard && data?.photoUrl ? (
            <img src={data.photoUrl} alt="" />
          ) : (
            <span className="card-minimal-avatar">{data?.name?.charAt(0) || '?'}</span>
          )}
        </div>
      </div>

      <div className="card-minimal-name">{data?.name}</div>
      <div className="card-minimal-role">{cardTitle}</div>
    </div>
  );
}
