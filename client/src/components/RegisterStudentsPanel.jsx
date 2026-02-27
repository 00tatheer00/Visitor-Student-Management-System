import React, { useState, useEffect, useCallback } from 'react';
import { ScanLine, Heart, FlaskConical, AlertCircle, Stethoscope, Cross, Eye, Users, Upload, Sprout, FolderOpen } from 'lucide-react';
import * as XLSX from 'xlsx';
import { LoaderInline } from './Loader.jsx';
import { useToast } from '../context/ToastContext.jsx';
import CardPreviewModal from './cards/CardPreviewModal.jsx';
import { API_BASE } from '../config.js';

const DEPT_CONFIG = {
  Radiology: { Icon: ScanLine, color: '#0ea5e9', gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' },
  Cardiology: { Icon: Heart, color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
  MLT: { Icon: FlaskConical, color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
  Emergency: { Icon: AlertCircle, color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
  Dental: { Icon: Stethoscope, color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' },
  Surgical: { Icon: Cross, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  Optometry: { Icon: Eye, color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }
};

export default function RegisterStudentsPanel({ isAdmin = true }) {
  const { addToast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentForm, setStudentForm] = useState({ name: '', department: '' });
  const [loading, setLoading] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingBulk, setLoadingBulk] = useState(false);
  const [loadingSeed, setLoadingSeed] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [lastAddedDept, setLastAddedDept] = useState(null);
  const [cardPreviewStudent, setCardPreviewStudent] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);
  const fileInputRef = React.useRef(null);

  const loadDepartments = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/students/departments`, { credentials: 'include' });
      const d = await res.json();
      setDepartments(d.departments || []);
    } catch {
      setDepartments([]);
    }
  }, []);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/students`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load students');
      setStudents(data);
    } catch (err) {
      addToast({ message: err.message || 'Failed to load students', type: 'error', size: 'small' });
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const studentsByDept = React.useMemo(() => {
    const map = {};
    departments.forEach((d) => { map[d] = []; });
    students.forEach((s) => {
      if (map[s.department]) map[s.department].push(s);
    });
    return map;
  }, [students, departments]);

  const addStudent = async (e) => {
    e.preventDefault();
    const nameVal = (studentForm.name || '').trim();
    const deptVal = (studentForm.department || '').trim();
    if (!nameVal || !deptVal) {
      addToast({ message: 'Name and department are required', type: 'error', size: 'small' });
      return;
    }
    setLoadingAdd(true);
    try {
      const res = await fetch(`${API_BASE}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: nameVal, department: deptVal })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add student');
      setLastAddedDept(deptVal);
      setSelectedDept(deptVal);
      setStudentForm({ name: '', department: '' });
      addToast({ message: `${data.name} added to ${deptVal}`, type: 'success', size: 'small' });
      await loadStudents();
      setTimeout(() => setLastAddedDept(null), 1500);
    } catch (err) {
      addToast({ message: err.message || 'Failed to add student', type: 'error', size: 'small' });
    } finally {
      setLoadingAdd(false);
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
      addToast({ message: 'Student deleted', type: 'success', size: 'small' });
      loadStudents();
    } catch (err) {
      addToast({ message: err.message || 'Delete failed', type: 'error', size: 'small' });
    }
  };

  const parseFile = (file) => {
    return new Promise((resolve, reject) => {
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          let list = [];
          const text = e.target?.result;
          if (ext === 'json') {
            const p = JSON.parse(text);
            list = Array.isArray(p) ? p : [p];
          } else if (ext === 'csv') {
            const lines = text.trim().split(/\n/).filter(Boolean);
            if (lines.length < 2) return reject(new Error('CSV needs header + data'));
            const headers = lines[0].split(/[,\t]/).map((h) => h.trim().toLowerCase().replace(/\s+/g, ''));
            list = lines.slice(1).map((line) => {
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
            const sh = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sh, { header: 1, defval: '' });
            if (rows.length < 2) return reject(new Error('Excel needs header + data'));
            const rawH = rows[0].map((h) => String(h || '').trim());
            const headers = rawH.map((h) => h.toLowerCase().replace(/\s+|_/g, ''));
            list = rows.slice(1).map((row) => {
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
          } else return reject(new Error('Use CSV, JSON, or XLS/XLSX'));
          resolve(list);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      if (ext === 'json' || ext === 'csv') reader.readAsText(file);
      else if (ext === 'xlsx' || ext === 'xls') reader.readAsBinaryString(file);
      else reject(new Error('Use CSV, JSON, or XLS/XLSX'));
    });
  };

  const handleSeedDummy = async () => {
    if (!window.confirm('Add 50 dummy students to each department (350 total)? IDs will be auto-generated.')) return;
    setLoadingSeed(true);
    try {
      const res = await fetch(`${API_BASE}/students/seed-dummy`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Seed failed');
      addToast({ message: `Created ${data.created} students (${data.perDepartment} per department)`, type: 'success', size: 'small' });
      await loadStudents();
    } catch (err) {
      addToast({ message: err.message || 'Seed failed', type: 'error', size: 'small' });
    } finally {
      setLoadingSeed(false);
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setBulkResult(null);
    setLoadingBulk(true);
    try {
      const list = await parseFile(file);
      if (!list.length) throw new Error('No valid records');
      const res = await fetch(`${API_BASE}/students/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ students: list })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Import failed');
      setBulkResult(data);
      addToast({ message: `Imported ${data.created} students`, type: 'success', size: 'small' });
      loadStudents();
    } catch (err) {
      setBulkResult({ error: err.message });
      addToast({ message: err.message || 'Import failed', type: 'error', size: 'small' });
    } finally {
      setLoadingBulk(false);
    }
  };

  return (
    <div className="admin-section register-students-panel">
      <div className="panel-header">
        <div className="panel-icon"><Users size={20} strokeWidth={2} /></div>
        <h3>Register Students</h3>
      </div>
      <p className="section-hint">
        Add students by department. Each student is auto-assigned to their department card.
      </p>

      <form className="form-large student-form dept-form" onSubmit={addStudent}>
        <div className="form-row-inline">
          <div className="form-group">
            <label>Full Name</label>
            <input
              name="name"
              value={studentForm.name}
              onChange={(e) => setStudentForm((p) => ({ ...p, name: e.target.value }))}
              className="input-large"
              placeholder="Student name"
              required
            />
          </div>
          <div className="form-group">
            <label>Department</label>
            <select
              name="department"
              value={studentForm.department}
              onChange={(e) => setStudentForm((p) => ({ ...p, department: e.target.value }))}
              className="input-large select-professional"
              required
            >
              <option value="">Select department...</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="btn-primary-wide" disabled={loadingAdd}>
          {loadingAdd ? <><LoaderInline /> Adding...</> : '+ Add Student'}
        </button>
      </form>

      <div className="bulk-row">
        <input ref={fileInputRef} type="file" accept=".csv,.json,.xls,.xlsx" onChange={handleBulkUpload} style={{ display: 'none' }} />
        <button type="button" className="btn-secondary" disabled={loadingBulk} onClick={() => fileInputRef.current?.click()}>
          {loadingBulk ? 'Importing...' : <><Upload size={16} strokeWidth={2} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Bulk Import (CSV / JSON / XLS)</>}
        </button>
        {isAdmin && (
          <button type="button" className="btn-secondary" disabled={loadingSeed} onClick={handleSeedDummy}>
            {loadingSeed ? <><LoaderInline /> Seeding...</> : <><Sprout size={16} strokeWidth={2} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Seed 50 Dummy Students per Dept</>}
          </button>
        )}
        {bulkResult && !bulkResult.error && <span className="bulk-ok">Created: {bulkResult.created}, Skipped: {bulkResult.skipped}</span>}
        {bulkResult?.error && <span className="bulk-err">{bulkResult.error}</span>}
      </div>

      {selectedDept ? (
        <div className="dept-table-page">
          <div className="dept-table-header">
            <button type="button" className="btn-back" onClick={() => setSelectedDept(null)}>
              ← Back to Departments
            </button>
            <h3 className="dept-table-title">
              {DEPT_CONFIG[selectedDept]?.Icon && (
                <span className="dept-title-icon">
                  {React.createElement(DEPT_CONFIG[selectedDept].Icon, { size: 20, strokeWidth: 2 })}
                </span>
              )}
              {selectedDept} — Students
            </h3>
          </div>
          {(studentsByDept[selectedDept] || []).length === 0 ? (
            <div className="empty-state">No students in this department yet.</div>
          ) : (
            <div className="table-wrapper dept-students-table">
              <table className="table-large">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>QR Code Value</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(studentsByDept[selectedDept] || []).map((s) => (
                    <tr key={s._id}>
                      <td><strong>{s.studentId}</strong></td>
                      <td>{s.name}</td>
                      <td>{s.qrCodeValue || '—'}</td>
                      <td>
                        <button type="button" className="btn-secondary btn-sm" onClick={() => setCardPreviewStudent(s)}>
                          Print Card
                        </button>
                        {isAdmin && (
                          <button type="button" className="btn-small danger" onClick={() => deleteStudent(s._id)}>
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
      ) : (
        <>
          <h4 className="dept-cards-title">Click a department to view its students</h4>
          {loading ? (
            <div className="dept-cards-grid dept-skeleton">
              {[1,2,3,4,5,6,7].map((i) => (
                <div key={i} className="dept-card skeleton-card" style={{ pointerEvents: 'none' }}>
                  <div className="dept-card-header" style={{ background: '#94a3b8' }}>
                    <span className="dept-icon"><FolderOpen size={20} strokeWidth={2} /></span>
                    <div className="dept-info">
                      <div className="skeleton" style={{ width: '80%', height: '1rem', borderRadius: 6 }} />
                      <div className="skeleton" style={{ width: '50%', height: '0.8rem', marginTop: '0.5rem', borderRadius: 6 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dept-cards-grid">
              {departments.map((dept) => {
                const cfg = DEPT_CONFIG[dept] || { Icon: FolderOpen, gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)' };
                const list = studentsByDept[dept] || [];
                const isJustAdded = lastAddedDept === dept;
                return (
                  <div
                    key={dept}
                    className={`dept-card dept-card-clickable ${isJustAdded ? 'just-added' : ''}`}
                    style={{ '--dept-gradient': cfg.gradient }}
                    onClick={() => setSelectedDept(dept)}
                  >
                    <div className="dept-card-header">
                      <span className="dept-icon">{cfg.Icon ? <cfg.Icon size={20} strokeWidth={2} /> : null}</span>
                      <div className="dept-info">
                        <span className="dept-name">{dept}</span>
                        <span className="dept-count">{list.length} student{list.length !== 1 ? 's' : ''}</span>
                      </div>
                      <span className="dept-chevron">→</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {cardPreviewStudent && (
        <CardPreviewModal
          type="student"
          data={cardPreviewStudent}
          onClose={() => setCardPreviewStudent(null)}
          autoPrint={false}
          playSound={false}
        />
      )}
    </div>
  );
}
