import React from 'react';
import { useCardTheme } from '../../context/CardThemeContext.jsx';

export default function CardFront({ data, type = 'visitor' }) {
  const { theme } = useCardTheme();
  const isVisitor = type === 'visitor';
  const roleLabel = isVisitor ? 'Visitor' : 'Student';
  const instituteName = theme?.instituteName || 'Institute of Health Sciences';
  const tagline = theme?.instituteAddress || 'University of Peshawar';

  const idLabel = isVisitor ? 'Pass ID' : 'ID';
  const idValue = isVisitor ? (data?.passId || '—') : (data?.studentId || '—');

  return (
    <div className="card-school card-school-front print-card">
      <div className="card-school-wavy" />
      <div className="card-school-accent-tl" />

      <div className="card-school-logo">
        <img src="/ihs-logo.png" alt="IHS" className="card-school-logo-img" />
      </div>

      <div className="card-school-institute">
        <div className="card-school-name">{instituteName}</div>
        <div className="card-school-tagline">{tagline}</div>
      </div>

      <div className="card-school-photo-wrap">
        <div className="card-school-photo">
          {theme?.enablePhotoOnCard && data?.photoUrl ? (
            <img src={data.photoUrl} alt="" />
          ) : (
            <span className="card-school-avatar">{data?.name?.charAt(0) || '?'}</span>
          )}
        </div>
      </div>

      <div className="card-school-student-name">{data?.name?.toUpperCase()}</div>
      <div className="card-school-role">{roleLabel.toUpperCase()}</div>

      <div className="card-school-contact">
        <div>{idLabel}: {idValue}</div>
      </div>

      <div className="card-school-wave-bottom" />
    </div>
  );
}
