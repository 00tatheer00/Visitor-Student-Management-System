import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PremiumVisitorCard from './PremiumVisitorCard.jsx';
import PremiumStudentCard from './PremiumStudentCard.jsx';
import { playPrintSuccessSound } from '../../utils/printSound.js';
import { useCardTheme } from '../../context/CardThemeContext.jsx';

export default function CardPreviewModal({ type, data, onClose, autoPrint = true, playSound = true }) {
  const printRef = useRef(null);
  const { theme } = useCardTheme();

  useEffect(() => {
    if (!data) return;

    const doPrint = () => {
      if (playSound && theme.playSoundOnPrint) {
        playPrintSuccessSound();
      }
      if (autoPrint && theme.autoPrintOnCheckIn) {
        setTimeout(() => {
          window.print();
        }, 500);
      }
    };

    doPrint();
  }, [data, autoPrint, playSound, theme.autoPrintOnCheckIn, theme.playSoundOnPrint]);

  if (!data) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const modalContent = (
    <div className="card-preview-modal-overlay" id="card-print-root" onClick={handleOverlayClick}>
      <div className="card-preview-modal" onClick={(e) => e.stopPropagation()} ref={printRef}>
        <div className="card-preview-header">
          <h3>ID Card Preview</h3>
          <button type="button" className="card-preview-close" onClick={onClose}>×</button>
        </div>
        <div className="card-preview-content print-area">
          {type === 'visitor' && <PremiumVisitorCard visitor={data} showBack={theme.enableBackSidePrint} />}
          {type === 'student' && <PremiumStudentCard student={data} showBack={theme.enableBackSidePrint} />}
        </div>
        <div className="card-preview-actions no-print">
          <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
          <button
            type="button"
            className="btn-primary-wide"
            onClick={() => {
              playPrintSuccessSound();
              window.print();
            }}
          >
            🖨️ Print Card
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
