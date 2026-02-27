import React, { useState, useEffect } from 'react';
import { BarChart3, Users, BookOpen, TrendingUp, DollarSign, ClipboardList, Building2, Home, Menu, Sun, Moon } from 'lucide-react';
import { ToastProvider } from '../context/ToastContext.jsx';
import { CardThemeProvider } from '../context/CardThemeContext.jsx';
import { AuthProvider, useAuth } from '../context/AuthContext.jsx';
import ReceptionScreen from './ReceptionScreen.jsx';
import AdminScreen from './AdminScreen.jsx';

const ADMIN_TABS = [
  { id: 'visitors', label: 'Visitor Logs', Icon: BarChart3 },
  { id: 'students', label: 'Register Students', Icon: Users },
  { id: 'studentLogs', label: 'Student Entry Logs', Icon: BookOpen },
  { id: 'report', label: 'Daily Report', Icon: TrendingUp },
  { id: 'addFine', label: 'Add Fine', Icon: DollarSign },
  { id: 'finesHistory', label: 'Fines History', Icon: ClipboardList }
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
          <Building2 className="brand-icon" size={28} strokeWidth={2} />
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
            <Home className="nav-icon" size={20} strokeWidth={2} />
            {!sidebarCollapsed && <span>Reception</span>}
          </button>
          {ADMIN_TABS.filter((t) => t.id !== 'addFine' || isAdmin).map((tab) => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.Icon className="nav-icon" size={20} strokeWidth={2} />
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
            <Menu size={20} strokeWidth={2} />
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
              {darkMode ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
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
