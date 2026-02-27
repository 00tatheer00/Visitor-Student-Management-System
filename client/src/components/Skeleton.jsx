import React from 'react';

export const Skeleton = ({ width, height, className = '', style = {} }) => (
  <div
    className={`skeleton ${className}`}
    style={{ width: width || '100%', height: height || '1rem', ...style }}
  />
);

export const SkeletonTable = ({ rows = 5, cols = 6 }) => (
  <div className="table-wrapper skeleton-table">
    <table className="table-large">
      <thead>
        <tr>
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i}><Skeleton height={16} /></th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, row) => (
          <tr key={row}>
            {Array.from({ length: cols }).map((_, col) => (
              <td key={col}><Skeleton height={14} width="85%" /></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const SkeletonCards = ({ count = 3 }) => (
  <div className="report-cards">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="report-card skeleton-card">
        <Skeleton height={12} width="60%" />
        <Skeleton height={28} width="40%" style={{ marginTop: '0.5rem' }} />
      </div>
    ))}
  </div>
);

export const SkeletonCamera = () => (
  <div className="qr-scanner-wrapper skeleton-camera">
    <div className="skeleton-pulse" />
  </div>
);

export default Skeleton;
