import React from 'react';
import CardFront from './CardFront.jsx';
import CardBack from './CardBack.jsx';
import { useCardTheme } from '../../context/CardThemeContext.jsx';

export default function PremiumStudentCard({ student, showBack = true }) {
  const { theme } = useCardTheme();

  const data = {
    name: student.name,
    studentId: student.studentId,
    department: student.department,
    qrCodeValue: student.qrCodeValue || student.studentId,
    checkInTime: new Date()
  };

  return (
    <div className="premium-card-container premium-student-card">
      <div className="premium-card-inner">
        <CardFront data={data} type="student" />
        {showBack && theme.enableBackSidePrint && (
          <CardBack data={data} type="student" />
        )}
      </div>
    </div>
  );
}
