import React from 'react';
import { useCardTheme } from '../../context/CardThemeContext.jsx';

export default function CardFront({ data, type = 'visitor' }) {
  const { theme } = useCardTheme();
  const isVisitor = type === 'visitor';
  const cardTitle = isVisitor ? 'Visitor Pass' : 'Student Entry Card';
  const instituteName = theme?.instituteName || 'Institute of Health Sciences';

  const idLabel = isVisitor ? 'Pass ID' : 'Student ID';
  const idValue = isVisitor ? (data?.passId || '—') : (data?.studentId || '—');

  const subLabel = isVisitor ? data?.purpose : data?.department;

  const validUntil = isVisitor
    ? 'Valid Today'
    : new Date(new Date().getFullYear() + 1, 5, 30).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="card-premium card-premium-front print-card">
      <div className="card-premium-bg" />
      <div className="card-premium-stars" />

      <div className="card-premium-content">
        <div className="card-premium-header">
          <div className="card-premium-logo">
            <span className="card-premium-logo-icon">🔐</span>
          </div>
          <div className="card-premium-header-text">
            <div className="card-premium-institute">{instituteName}</div>
            <div className="card-premium-type">{cardTitle}</div>
          </div>
        </div>

        <div className="card-premium-body">
          <div className="card-premium-photo-wrap">
            <div className="card-premium-photo">
              {theme?.enablePhotoOnCard && data?.photoUrl ? (
                <img src={data.photoUrl} alt="" />
              ) : (
                <span className="card-premium-avatar">{data?.name?.charAt(0) || '?'}</span>
              )}
            </div>
          </div>
          <div className="card-premium-name">{data?.name}</div>
          {subLabel && <div className="card-premium-dept">{subLabel}</div>}
        </div>

        <div className="card-premium-footer">
          <div className="card-premium-row">
            <span className="card-premium-label">{idLabel}:</span>
            <span className="card-premium-value">{idValue}</span>
          </div>
          <div className="card-premium-row">
            <span className="card-premium-label">Valid:</span>
            <span className="card-premium-value">{validUntil}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
