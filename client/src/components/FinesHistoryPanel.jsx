import React, { useState, useEffect } from 'react';
import { SkeletonTable } from './Skeleton.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { API_BASE } from '../config.js';

export default function FinesHistoryPanel() {
  const { addToast } = useToast();
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ from: '', to: '', department: '', studentId: '' });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/students/departments`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setDepartments(d.departments || []))
      .catch(() => setDepartments([]));
  }, []);

  const loadFines = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.department) params.append('department', filters.department);
      if (filters.studentId) params.append('studentId', filters.studentId);
      const res = await fetch(`${API_BASE}/fines?${params.toString()}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load fines');
      setFines(data);
    } catch (err) {
      addToast({ message: err.message || 'Failed to load fines', type: 'error', size: 'small' });
      setFines([]);
    } finally {
      setLoading(false);
    }
  };

  const exportFines = () => {
    const params = new URLSearchParams();
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    if (filters.department) params.append('department', filters.department);
    if (filters.studentId) params.append('studentId', filters.studentId);
    window.open(`${API_BASE}/export/fines?${params.toString()}`, '_blank');
    addToast({ message: 'CSV export opened in new tab', type: 'success', size: 'small' });
  };

  useEffect(() => {
    loadFines();
  }, []);

  return (
    <div className="admin-section">
      <div className="panel-header">
        <div className="panel-icon">📋</div>
        <h3>Fines History</h3>
      </div>

      <div className="filters-row" style={{ marginBottom: '1rem' }}>
        <div>
          <label>From</label>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
          />
        </div>
        <div>
          <label>To</label>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
          />
        </div>
        <div>
          <label>Department</label>
          <select
            value={filters.department}
            onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
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
            value={filters.studentId}
            onChange={(e) => setFilters((f) => ({ ...f, studentId: e.target.value }))}
            placeholder="Filter by ID"
          />
        </div>
        <button className="btn-secondary" onClick={loadFines}>
          Apply
        </button>
        <button className="btn-secondary" onClick={exportFines}>
          Export CSV
        </button>
      </div>

      {loading ? (
        <SkeletonTable rows={6} cols={7} />
      ) : (
        <div className="table-wrapper">
          <table className="table-large">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Fine Type</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Date</th>
                <th>Added By</th>
              </tr>
            </thead>
            <tbody>
              {fines.map((f) => (
                <tr key={f._id}>
                  <td>{f.studentId}</td>
                  <td>{f.name}</td>
                  <td><span className="dept-badge">{f.department}</span></td>
                  <td><span className="fine-badge">{f.fineType}</span></td>
                  <td>Rs. {f.amount}</td>
                  <td>{f.reason || '—'}</td>
                  <td>{f.date ? new Date(f.date).toLocaleString() : ''}</td>
                  <td>{f.addedBy || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && fines.length === 0 && (
        <div className="empty-state">No fines recorded.</div>
      )}
    </div>
  );
}
