import React, { useState, useEffect } from 'react';
import { ToastProvider } from '../context/ToastContext.jsx';
import { CardThemeProvider } from '../context/CardThemeContext.jsx';
import ReceptionScreen from './ReceptionScreen.jsx';
import AdminScreen from './AdminScreen.jsx';

const AppLayout = () => {
  const [activeTab, setActiveTab] = useState('reception');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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
          <button
            className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <span className="nav-icon">📊</span>
            {!sidebarCollapsed && <span>Admin Dashboard</span>}
          </button>
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
              {activeTab === 'reception' ? <ReceptionScreen /> : <AdminScreen />}
            </ToastProvider>
          </CardThemeProvider>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
