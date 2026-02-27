import React, { useEffect, useRef, useState } from 'react';
import { Lock, BarChart3, BookOpen, TrendingUp } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import CardPreviewModal from './cards/CardPreviewModal.jsx';
import AddFinePanel from './AddFinePanel.jsx';
import FinesHistoryPanel from './FinesHistoryPanel.jsx';
import RegisterStudentsPanel from './RegisterStudentsPanel.jsx';
import * as XLSX from 'xlsx';
import { LoaderInline } from './Loader.jsx';
import { SkeletonTable, SkeletonCards } from './Skeleton.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { API_BASE } from '../config.js';

const AdminScreen = ({ activeTab }) => {
  const { addToast } = useToast();
  const { user: currentUser, setUser: setAuthUser } = useAuth();
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [status, setStatus] = useState(null);
  const tab = activeTab || 'visitors';

  const [visitors, setVisitors] = useState([]);
  const [visitorFilters, setVisitorFilters] = useState({ from: '', to: '', q: '' });

  const [studentLogs, setStudentLogs] = useState([]);
  const [studentLogFilters, setStudentLogFilters] = useState({ from: '', to: '', studentId: '', department: '' });

  const [students, setStudents] = useState([]);
  const [studentForm, setStudentForm] = useState({ name: '', department: '' });
  const [studentSearch, setStudentSearch] = useState('');
  const [qrPreview, setQrPreview] = useState(null);
  const [cardPreviewStudent, setCardPreviewStudent] = useState(null);
  const qrPrintRef = useRef(null);

  const [report, setReport] = useState(null);

  const [loadingVisitors, setLoadingVisitors] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingStudentLogs, setLoadingStudentLogs] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingAddStudent, setLoadingAddStudent] = useState(false);
  const [bulkImportResult, setBulkImportResult] = useState(null);
  const [loadingBulkImport, setLoadingBulkImport] = useState(false);
  const [departments, setDepartments] = useState([]);
  const fileInputRef = useRef(null);
  const isAdmin = currentUser?.role !== 'security';

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const login = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoadingLogin(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      const userData = { username: data.username, role: data.role || 'admin' };
      setLoggedIn(true);
      setAuthUser(userData);
      setStatus({ type: 'success', message: 'Logged in as ' + data.username });
      addToast({ message: 'Logged in as ' + data.username, type: 'success', size: 'small' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Login failed' });
      addToast({ message: err.message || 'Login failed', type: 'error', size: 'small' });
    } finally {
      setLoadingLogin(false);
    }
  };

  const loadVisitors = async () => {
    setLoadingVisitors(true);
    try {
      const params = new URLSearchParams();
      if (visitorFilters.from) params.append('from', visitorFilters.from);
      if (visitorFilters.to) params.append('to', visitorFilters.to);
      if (visitorFilters.q) params.append('q', visitorFilters.q);
      const res = await fetch(`${API_BASE}/visitors?${params.toString()}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load visitors');
      setVisitors(data);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to load visitors' });
      addToast({ message: err.message || 'Failed to load visitors', type: 'error', size: 'small' });
    } finally {
      setLoadingVisitors(false);
    }
  };

  const exportVisitors = () => {
    const params = new URLSearchParams();
    if (visitorFilters.from) params.append('from', visitorFilters.from);
    if (visitorFilters.to) params.append('to', visitorFilters.to);
    if (visitorFilters.q) params.append('q', visitorFilters.q);
    const url = `${API_BASE}/export/visitors?${params.toString()}`;
    window.open(url, '_blank');
    addToast({ message: 'CSV export opened in new tab', type: 'success', size: 'small' });
  };

  const loadStudentLogs = async () => {
    setLoadingStudentLogs(true);
    try {
      const params = new URLSearchParams();
      if (studentLogFilters.from) params.append('from', studentLogFilters.from);
      if (studentLogFilters.to) params.append('to', studentLogFilters.to);
      if (studentLogFilters.studentId) params.append('studentId', studentLogFilters.studentId);
      if (studentLogFilters.department) params.append('department', studentLogFilters.department);
      const res = await fetch(`${API_BASE}/students/logs/all?${params.toString()}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load logs');
      setStudentLogs(data);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to load student logs' });
      addToast({ message: err.message || 'Failed to load logs', type: 'error', size: 'small' });
    } finally {
      setLoadingStudentLogs(false);
    }
  };

  const loadDailyReport = async () => {
    setLoadingReport(true);
    try {
      const res = await fetch(`${API_BASE}/reports/daily`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load report');
      setReport(data);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to load report' });
      addToast({ message: err.message || 'Failed to load report', type: 'error', size: 'small' });
    } finally {
      setLoadingReport(false);
    }
  };

  const loadStudents = async () => {
    setLoadingStudents(true);
    try {
      const params = studentSearch ? `?q=${encodeURIComponent(studentSearch)}` : '';
      const res = await fetch(`${API_BASE}/students${params}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load students');
      setStudents(data);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to load students' });
      addToast({ message: err.message || 'Failed to load students', type: 'error', size: 'small' });
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleStudentFormChange = (e) => {
    const { name, value } = e.target;
    setStudentForm((prev) => ({ ...prev, [name]: value }));
  };

  const addStudent = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoadingAddStudent(true);
    try {
      const nameVal = (studentForm.name || '').trim();
      const deptVal = (studentForm.department || '').trim();
      if (!nameVal || !deptVal) {
        setStatus({ type: 'error', message: 'Name and department are required' });
        addToast({ message: 'Name and department are required', type: 'error', size: 'small' });
        setLoadingAddStudent(false);
        return;
      }
      const res = await fetch(`${API_BASE}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: nameVal, department: deptVal })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add student');
      setStatus({ type: 'success', message: `Student registered as ${data.studentId}` });
      addToast({ message: `Student registered as ${data.studentId}`, type: 'success', size: 'small' });
      setStudentForm({ name: '', department: '' });
      loadStudents();
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
      addToast({ message: err.message || 'Failed to add student', type: 'error', size: 'small' });
    } finally {
      setLoadingAddStudent(false);
    }
  };

  const deleteStudent = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try {
      const res = await fetch(`${API_BASE}/students/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      setStatus({ type: 'success', message: 'Student deleted.' });
      addToast({ message: 'Student deleted', type: 'success', size: 'small' });
      loadStudents();
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Delete failed' });
      addToast({ message: err.message || 'Delete failed', type: 'error', size: 'small' });
    }
  };

  const parseFileToStudents = (file) => {
    return new Promise((resolve, reject) => {
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          let students = [];
          const text = e.target?.result;

          if (ext === 'json') {
            const parsed = JSON.parse(text);
            students = Array.isArray(parsed) ? parsed : [parsed];
          } else if (ext === 'csv') {
            const lines = text.trim().split(/\n/).filter(Boolean);
            if (lines.length < 2) {
              reject(new Error('CSV must have header row and at least one data row'));
              return;
            }
            const headers = lines[0].split(/[,\t]/).map((h) => h.trim().toLowerCase().replace(/\s+/g, ''));
            students = lines.slice(1).map((line) => {
              const vals = line.split(/[,\t]/).map((v) => v.trim());
              const row = {};
              headers.forEach((h, i) => {
                const key = h === 'studentid' ? 'studentId' : h === 'name' ? 'name' : h === 'department' ? 'department' : h;
                row[key] = vals[i] || '';
              });
              return row;
            });
          } else if (ext === 'xlsx' || ext === 'xls') {
            const wb = XLSX.read(text, { type: 'binary' });
            const firstSheet = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
            if (rows.length < 2) {
              reject(new Error('Excel file must have header row and at least one data row'));
              return;
            }
            const rawHeaders = rows[0].map((h) => String(h || '').trim());
            const headers = rawHeaders.map((h) => h.toLowerCase().replace(/\s+|_/g, ''));
            students = rows.slice(1).map((row) => {
              const vals = Array.isArray(row) ? row : Object.values(row);
              const obj = {};
              headers.forEach((h, i) => {
                let key = h;
                if (h === 'studentid' || h === 'student_id') key = 'studentId';
                else if (h === 'name') key = 'name';
                else if (h === 'department') key = 'department';
                obj[key] = String(vals[i] ?? '').trim();
              });
              return obj;
            });
          } else {
            reject(new Error('Unsupported format. Use CSV, JSON, or XLS/XLSX.'));
            return;
          }
          resolve(students);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));

      if (ext === 'json' || ext === 'csv') {
        reader.readAsText(file);
      } else if (ext === 'xlsx' || ext === 'xls') {
        reader.readAsBinaryString(file);
      } else {
        reject(new Error('Unsupported format. Use CSV, JSON, or XLS/XLSX.'));
      }
    });
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setBulkImportResult(null);
    setLoadingBulkImport(true);
    try {
      const students = await parseFileToStudents(file);
      if (!students.length) {
        throw new Error('No valid student records found in file');
      }
      const res = await fetch(`${API_BASE}/students/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ students })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Import failed');
      setBulkImportResult(data);
      addToast({ message: `Imported ${data.created} students`, type: 'success', size: 'small' });
      loadStudents();
    } catch (err) {
      setBulkImportResult({ error: err.message });
      addToast({ message: err.message || 'Import failed', type: 'error', size: 'small' });
    } finally {
      setLoadingBulkImport(false);
    }
  };

  const showQrPreview = (student) => {
    const value = student.qrCodeValue || student.studentId;
    setQrPreview({ student, value });
  };

  const showPremiumCard = (student) => {
    setCardPreviewStudent(student);
  };

  const printQr = () => {
    if (!qrPrintRef.current) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>QR Code - ${qrPreview.student.name}</title></head>
        <body style="font-family:sans-serif;padding:20px;text-align:center">
          <h2>${qrPreview.student.name}</h2>
          <p><strong>ID:</strong> ${qrPreview.student.studentId} | <strong>Dept:</strong> ${qrPreview.student.department}</p>
          <p style="font-size:12px;color:#666">Encoded value: ${qrPreview.value}</p>
          <div style="margin:20px auto;display:inline-block">${qrPrintRef.current.innerHTML}</div>
          <p style="font-size:11px;color:#999">Institute of Health Sciences - Student ID Card</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setLoggedIn(true);
          setAuthUser(d.user);
        }
      })
      .catch(() => {});
  }, [setAuthUser]);

  useEffect(() => {
    fetch(`${API_BASE}/students/departments`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setDepartments(d.departments || []))
      .catch(() => setDepartments([]));
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    if (tab === 'visitors') {
      loadVisitors();
    } else if (tab === 'studentLogs') {
      loadStudentLogs();
    } else if (tab === 'students') {
      /* RegisterStudentsPanel loads its own data */
    } else if (tab === 'report') {
      loadDailyReport();
    } else if (tab === 'addFine' || tab === 'finesHistory') {
      // Fines panels load their own data
    }
  }, [loggedIn, tab]);

  const handleVisitorFilterChange = (e) => {
    const { name, value } = e.target;
    setVisitorFilters((prev) => ({ ...prev, [name]: value }));
  };

  const deleteVisitor = async (id) => {
    if (!window.confirm('Delete this visitor record?')) return;
    try {
      const res = await fetch(`${API_BASE}/visitors/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      setStatus({ type: 'success', message: 'Visitor deleted' });
      addToast({ message: 'Visitor deleted', type: 'success', size: 'small' });
      loadVisitors();
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Delete failed' });
      addToast({ message: err.message || 'Delete failed', type: 'error', size: 'small' });
    }
  };

  if (!loggedIn) {
    return (
      <div className="admin-login panel">
        <div className="panel-header">
          <div className="panel-icon"><Lock size={20} strokeWidth={2} /></div>
          <h3>Admin Login</h3>
        </div>
        <form className="form-large" onSubmit={login}>
          <div className="form-group">
            <label>Username</label>
            <input
              name="username"
              value={loginForm.username}
              onChange={handleLoginChange}
              className="input-large"
              placeholder="Enter username"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={loginForm.password}
              onChange={handleLoginChange}
              className="input-large"
              placeholder="Enter password"
            />
          </div>
          <button type="submit" className="btn-primary-wide" disabled={loadingLogin}>
            {loadingLogin ? <><LoaderInline /> Signing in...</> : 'Sign In'}
          </button>
          {status && (
            <div className={status.type === 'success' ? 'status success' : 'status error'}>
              {status.message}
            </div>
          )}
        </form>
      </div>
    );
  }

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
      setLoggedIn(false);
      setAuthUser(null);
      addToast({ message: 'Logged out', type: 'success', size: 'small' });
    } catch (e) {}
  };

  return (
    <div className="admin-panel">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2>Admin Dashboard</h2>
          <span className="page-subtitle">Overview {currentUser && `• ${currentUser.username} (${currentUser.role || 'admin'})`}</span>
        </div>
        <button type="button" className="btn-secondary" onClick={logout}>
          Log Out
        </button>
      </div>

      {status && (
        <div className={status.type === 'success' ? 'status success' : 'status error'}>
          {status.message}
        </div>
      )}

      {tab === 'visitors' && (
        <div className="admin-section">
          <div className="panel-header">
            <div className="panel-icon"><BarChart3 size={20} strokeWidth={2} /></div>
            <h3>Visitor Logs</h3>
          </div>
          <div className="filters-row">
            <div>
              <label>From</label>
              <input
                type="date"
                name="from"
                value={visitorFilters.from}
                onChange={handleVisitorFilterChange}
              />
            </div>
            <div>
              <label>To</label>
              <input
                type="date"
                name="to"
                value={visitorFilters.to}
                onChange={handleVisitorFilterChange}
              />
            </div>
            <div>
              <label>Search (CNIC / Name)</label>
              <input
                name="q"
                value={visitorFilters.q}
                onChange={handleVisitorFilterChange}
                placeholder="Search by CNIC or name"
              />
            </div>
            <button className="btn-secondary" onClick={loadVisitors}>
              Apply Filters
            </button>
            <button className="btn-secondary" onClick={exportVisitors}>
              Export CSV
            </button>
          </div>

          {loadingVisitors ? (
            <SkeletonTable rows={6} cols={8} />
          ) : (
          <div className="table-wrapper">
          <table className="table-large">
            <thead>
              <tr>
                <th>Token</th>
                <th>Name</th>
                <th>Type</th>
                <th>CNIC</th>
                <th>Phone</th>
                <th>Purpose</th>
                <th>Person To Meet</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v) => (
                <tr key={v._id}>
                  <td><span className="token-badge">{v.tokenNumber || '—'}</span></td>
                  <td>{v.name}</td>
                  <td><span className="visitor-type-badge">{v.visitorType || 'Guest'}</span></td>
                  <td>{v.cnic}</td>
                  <td>{v.phone}</td>
                  <td>{v.purpose}</td>
                  <td>{v.personToMeet}</td>
                  <td>{v.checkInTime ? new Date(v.checkInTime).toLocaleString() : ''}</td>
                  <td>{v.checkOutTime ? new Date(v.checkOutTime).toLocaleString() : ''}</td>
                  <td>
                    {isAdmin && (
                      <button className="btn-small danger" onClick={() => deleteVisitor(v._id)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          )}
        </div>
      )}

      {tab === 'students' && (
        <RegisterStudentsPanel isAdmin={isAdmin} />
      )}

      {tab === 'studentLogs' && (
        <div className="admin-section">
          <div className="panel-header">
            <div className="panel-icon"><BookOpen size={20} strokeWidth={2} /></div>
            <h3>Student Entry Logs</h3>
          </div>
          <div className="filters-row" style={{ marginBottom: '1rem' }}>
            <div>
              <label>From</label>
              <input
                type="date"
                value={studentLogFilters.from}
                onChange={(e) => setStudentLogFilters((f) => ({ ...f, from: e.target.value }))}
              />
            </div>
            <div>
              <label>To</label>
              <input
                type="date"
                value={studentLogFilters.to}
                onChange={(e) => setStudentLogFilters((f) => ({ ...f, to: e.target.value }))}
              />
            </div>
            <div>
              <label>Department</label>
              <select
                value={studentLogFilters.department}
                onChange={(e) => setStudentLogFilters((f) => ({ ...f, department: e.target.value }))}
              >
                <option value="">All</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Student ID</label>
              <input
                type="text"
                value={studentLogFilters.studentId}
                onChange={(e) => setStudentLogFilters((f) => ({ ...f, studentId: e.target.value }))}
                placeholder="Filter by ID"
              />
            </div>
            <button className="btn-secondary" onClick={loadStudentLogs}>
              Apply
            </button>
          </div>
          {loadingStudentLogs ? (
            <SkeletonTable rows={6} cols={4} />
          ) : (
          <div className="table-wrapper">
          <table className="table-large">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Entry Time</th>
              </tr>
            </thead>
            <tbody>
              {studentLogs.map((log) => (
                <tr key={log._id}>
                  <td>{log.student?.studentId}</td>
                  <td>{log.student?.name}</td>
                  <td><span className="dept-badge">{log.student?.department}</span></td>
                  <td>{log.entryTime ? new Date(log.entryTime).toLocaleString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          )}
        </div>
      )}

      {tab === 'addFine' && <AddFinePanel />}
      {tab === 'finesHistory' && <FinesHistoryPanel />}

      {tab === 'report' && (
        <div className="admin-section">
          <div className="panel-header">
            <div className="panel-icon"><TrendingUp size={20} strokeWidth={2} /></div>
            <h3>Today's Summary</h3>
          </div>
          {loadingReport ? (
            <SkeletonCards count={3} />
          ) : report ? (
            <div className="report-cards">
              <div className="report-card">
                <span className="label">Date</span>
                <span className="value">{report.date}</span>
              </div>
              <div className="report-card">
                <span className="label">Total Visitors</span>
                <span className="value">{report.visitorCount}</span>
              </div>
              <div className="report-card">
                <span className="label">Student Entries</span>
                <span className="value">{report.studentEntryCount}</span>
              </div>
            </div>
          ) : (
            <button className="btn-secondary" onClick={loadDailyReport} disabled={loadingReport}>
              {loadingReport ? 'Loading...' : "Load Today's Report"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminScreen;

