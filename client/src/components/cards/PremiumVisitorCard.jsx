import React from 'react';
import CardFront from './CardFront.jsx';
import CardBack from './CardBack.jsx';
import { useCardTheme } from '../../context/CardThemeContext.jsx';

export default function PremiumVisitorCard({ visitor, showBack = true }) {
  const { theme } = useCardTheme();

  const data = {
    name: visitor.name,
    cnic: visitor.cnic,
    purpose: visitor.purpose,
    personToMeet: visitor.personToMeet,
    visitorType: visitor.visitorType,
    checkInTime: visitor.checkInTime,
    passId: visitor.passId,
    qrCodeValue: visitor.qrCodeValue,
    tokenNumber: visitor.tokenNumber
  };

  return (
    <div className="premium-card-container premium-visitor-card">
      <div className="premium-card-inner">
        <CardFront data={data} type="visitor" />
        {showBack && theme.enableBackSidePrint && (
          <CardBack data={data} type="visitor" />
        )}
      </div>
    </div>
  );
}
