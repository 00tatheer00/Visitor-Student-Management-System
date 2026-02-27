import React from 'react';

export const Loader = ({ size = 'md' }) => (
  <div className={`loader loader-${size}`} role="status" aria-label="Loading">
    <span className="loader-spinner" />
  </div>
);

export const LoaderInline = () => (
  <span className="loader-inline" />
);

export default Loader;
