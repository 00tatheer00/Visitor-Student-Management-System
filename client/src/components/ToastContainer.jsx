import React from 'react';
import { Check, X } from 'lucide-react';

const ToastContainer = ({ toasts }) => {
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast-${t.size} toast-${t.type}`}
          role="alert"
        >
          <span className="toast-icon">
            {t.type === 'success' ? <Check size={18} strokeWidth={2.5} /> : <X size={18} strokeWidth={2.5} />}
          </span>
          <div className="toast-content">
            {t.title && <span className="toast-title">{t.title}</span>}
            <span className="toast-message">{t.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
