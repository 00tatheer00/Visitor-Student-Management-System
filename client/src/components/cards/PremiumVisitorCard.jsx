import React from 'react';
import CardFront from './CardFront.jsx';
import CardBack from './CardBack.jsx';
import { useCardTheme } from '../../context/CardThemeContext.jsx';

export default function PremiumVisitorCard({ visitor, showBack = true, theme: themeProp }) {
  const { theme: ctxTheme } = useCardTheme();
  const theme = themeProp || ctxTheme;

  const data = {
    name: visitor.name,
    cnic: visitor.cnic,
    purpose: visitor.purpose,
    personToMeet: visitor.personToMeet,
    visitorType: visitor.visitorType,
    checkInTime: visitor.checkInTime,
    passId: visitor.passId,
    qrCodeValue: visitor.qrCodeValue
  };

  return (
    <div className="premium-card-container premium-visitor-card">
      <div className="premium-card-inner">
        <CardFront data={data} type="visitor" theme={theme} />
        {showBack && (theme?.enableBackSidePrint !== false) && (
          <CardBack data={data} type="visitor" theme={theme} />
        )}
      </div>
    </div>
  );
}
