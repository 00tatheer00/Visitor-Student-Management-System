import React, { useState, useEffect } from 'react';
import { ToastProvider } from '../context/ToastContext.jsx';
import { CardThemeProvider } from '../context/CardThemeContext.jsx';
import { AuthProvider, useAuth } from '../context/AuthContext.jsx';
import ReceptionScreen from './ReceptionScreen.jsx';
import AdminScreen from './AdminScreen.jsx';

const ADMIN_TABS = [
  { id: 'visitors', label: 'Visitor Logs', icon: '📊' },
  { id: 'students', label: 'Register Students', icon: '👥' },
  { id: 'studentLogs', label: 'Student Entry Logs', icon: '📚' },
  { id: 'report', label: 'Daily Report', icon: '📈' },
  { id: 'addFine', label: 'Add Fine', icon: '💰' },
  { id: 'finesHistory', label: 'Fines History', icon: '📋' }
];

const AppLayoutInner = () => {
  const [activeTab, setActiveTab] = useState('reception');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role !== 'security';

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  return (
    <div className={`app-layout ${darkMode ? 'dark' : ''}`}>
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-icon">🏥</span>
          {!sidebarCollapsed && <span className="brand-text">IHS Visitor Management</span>}
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">R</div>
          {!sidebarCollapsed && (
            <div className="user-info">
              <span className="user-name">Reception</span>
              <span className="user-role">Entry Management</span>
              <span className="user-status">● Active</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'reception' ? 'active' : ''}`}
            onClick={() => setActiveTab('reception')}
          >
            <span className="nav-icon">🏠</span>
            {!sidebarCollapsed && <span>Reception</span>}
          </button>
          {ADMIN_TABS.filter((t) => t.id !== 'addFine' || isAdmin).map((tab) => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              {!sidebarCollapsed && <span>{tab.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <div className="main-wrapper">
        <header className="top-bar">
          <button
            className="top-bar-toggle"
            onClick={() => setSidebarCollapsed((c) => !c)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <div className="top-bar-title">
            <h1>Institute of Health Sciences</h1>
            <p>Visitor &amp; Student Entry Management System</p>
          </div>
          <div className="top-bar-actions">
            <button
              className="top-bar-btn"
              onClick={() => setDarkMode((d) => !d)}
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? '☀' : '🌙'}
            </button>
          </div>
        </header>

        <main className="main-content">
          <CardThemeProvider>
            <ToastProvider>
              {activeTab === 'reception' ? (
                <ReceptionScreen />
              ) : (
                <AdminScreen activeTab={activeTab} />
              )}
            </ToastProvider>
          </CardThemeProvider>
        </main>
      </div>
    </div>
  );
};

const AppLayout = () => (
  <AuthProvider>
    <AppLayoutInner />
  </AuthProvider>
);

export default AppLayout;
