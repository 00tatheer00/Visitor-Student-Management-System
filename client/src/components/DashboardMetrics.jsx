import React, { useEffect, useState } from 'react';
import { API_BASE } from '../config.js';

const DashboardMetrics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/reports/today`);
        const data = await res.json();
        if (res.ok) {
          setStats(data);
          setApiError(false);
        } else {
          setStats({ visitorCount: 0, studentEntryCount: 0, activeVisitors: 0 });
          setApiError(true);
        }
      } catch (e) {
        setStats({ visitorCount: 0, studentEntryCount: 0, activeVisitors: 0 });
        setApiError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <div className="metrics-row">
        {[1, 2, 3].map((i) => (
          <div key={i} className="metric-card metric-skeleton" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Active Visitors',
      value: stats.activeVisitors,
      subtitle: 'Currently in building',
      gradient: 'pink',
      icon: '👥'
    },
    {
      title: "Today's Visitors",
      value: stats.visitorCount,
      subtitle: 'Checked in today',
      gradient: 'blue',
      icon: '📋'
    },
    {
      title: 'Student Entries',
      value: stats.studentEntryCount,
      subtitle: 'QR scans today',
      gradient: 'teal',
      icon: '🎫'
    }
  ];

  return (
    <>
      {apiError && (
        <div className="api-status-banner" role="alert">
          <span className="api-status-icon">⚠</span>
          <span>Unable to connect to server. Please ensure the backend is running (<code>cd backend && npm start</code>).</span>
        </div>
      )}
      <div className="metrics-row">
      {cards.map((card, i) => (
        <div
          key={card.title}
          className={`metric-card metric-${card.gradient}`}
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <div className="metric-pattern" />
          <div className="metric-icon">{card.icon}</div>
          <div className="metric-content">
            <span className="metric-title">{card.title}</span>
            <span className="metric-value">{card.value}</span>
            <span className="metric-subtitle">{card.subtitle}</span>
          </div>
        </div>
      ))}
      </div>
    </>
  );
};

export default DashboardMetrics;
