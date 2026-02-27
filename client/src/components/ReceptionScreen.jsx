import React from 'react';
import VisitorCheckIn from './VisitorCheckIn.jsx';
import ActiveVisitors from './ActiveVisitors.jsx';
import StudentScanner from './StudentScanner.jsx';
import DashboardMetrics from './DashboardMetrics.jsx';
import StatsCharts from './StatsCharts.jsx';

const ReceptionScreen = () => {
  return (
    <div className="reception-screen">
      <div className="page-header">
        <h2>Dashboard</h2>
        <span className="page-subtitle">Overview</span>
      </div>
      <DashboardMetrics />
      <StatsCharts />
      <div className="reception-layout">
      <section className="panel panel-scanner">
        <div className="panel-header">
          <div className="panel-icon">🎫</div>
          <h3>Student Entry (Scanner)</h3>
        </div>
        <StudentScanner />
      </section>

      <section className="panel panel-form">
        <div className="panel-header">
          <div className="panel-icon">👤</div>
          <h3>Visitor Check-In</h3>
        </div>
        <VisitorCheckIn />
      </section>

      <section className="panel panel-active">
        <div className="panel-header">
          <div className="panel-icon">📋</div>
          <h3>Active Visitors (Check-Out)</h3>
        </div>
        <ActiveVisitors />
      </section>
      </div>
    </div>
  );
};

export default ReceptionScreen;

