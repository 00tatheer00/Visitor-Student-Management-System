import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useReactToPrint } from 'react-to-print';
import PremiumVisitorCard from './PremiumVisitorCard.jsx';
import PremiumStudentCard from './PremiumStudentCard.jsx';
import { playPrintSuccessSound } from '../../utils/printSound.js';
import { useCardTheme } from '../../context/CardThemeContext.jsx';

export default function CardPreviewModal({ type, data, onClose, autoPrint = true, playSound = true }) {
  const printContainerRef = useRef(null);
  const { theme } = useCardTheme();

  const handlePrint = useReactToPrint({
    content: () => printContainerRef.current,
    documentTitle: 'ID Card',
    onBeforeGetContent: () => {
      if (playSound && theme.playSoundOnPrint) {
        playPrintSuccessSound();
      }
    },
    pageStyle: `
      @page { margin: 0.5in; size: auto; }
      body { margin: 0; padding: 0.5in; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fff; }
      .print-container, .print-container * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    `,
  });

  const onPrintClick = () => {
    playPrintSuccessSound();
    handlePrint();
  };

  useEffect(() => {
    if (!data) return;

    if (playSound && theme.playSoundOnPrint) {
      playPrintSuccessSound();
    }
    if (autoPrint && theme.autoPrintOnCheckIn) {
      const timer = setTimeout(() => handlePrint(), 600);
      return () => clearTimeout(timer);
    }
  }, [data, autoPrint, playSound, theme.autoPrintOnCheckIn, theme.playSoundOnPrint]);

  if (!data) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const cardContent = (
    <>
      {type === 'visitor' && <PremiumVisitorCard visitor={data} showBack={theme.enableBackSidePrint} />}
      {type === 'student' && <PremiumStudentCard student={data} showBack={theme.enableBackSidePrint} />}
    </>
  );

  const modalContent = (
    <div className="card-preview-modal-overlay" id="card-print-root" onClick={handleOverlayClick}>
      <div className="card-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="card-preview-header no-print">
          <h3>ID Card Preview</h3>
          <button type="button" className="card-preview-close" onClick={onClose}>×</button>
        </div>
        <div className="card-preview-content">
          <div className="print-container" ref={printContainerRef}>
            {cardContent}
          </div>
        </div>
        <div className="card-preview-actions no-print">
          <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
          <button type="button" className="btn-primary-wide" onClick={onPrintClick}>
            🖨️ Print Card
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
