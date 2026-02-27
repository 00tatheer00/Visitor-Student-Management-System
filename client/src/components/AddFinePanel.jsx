import React, { useState, useEffect } from 'react';
import { DollarSign, Check } from 'lucide-react';
import { LoaderInline } from './Loader.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { API_BASE } from '../config.js';

const FINE_TYPES = ['No Uniform', 'Late Entry', 'No ID Card', 'Misconduct'];

export default function AddFinePanel() {
  const { addToast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState({
    fineType: '',
    amount: '',
    reason: '',
    date: new Date().toISOString().slice(0, 10)
  });
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/students/departments`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setDepartments(d.departments || []))
      .catch(() => setDepartments([]));
  }, []);

  const handleSearch = async () => {
    const q = (searchQuery || '').trim();
    if (!q) {
      addToast({ message: 'Enter Student ID or name to search', type: 'error', size: 'small' });
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`${API_BASE}/students?q=${encodeURIComponent(q)}`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Search failed');
      const list = Array.isArray(data) ? data : [];
      setSearchResults(list);
      if (list.length === 0) {
        addToast({ message: 'No students found', type: 'info', size: 'small' });
        setSelectedStudent(null);
      } else if (list.length === 1) {
        setSelectedStudent(list[0]);
        addToast({ message: 'Student selected', type: 'success', size: 'small' });
      } else {
        setSelectedStudent(null);
      }
    } catch (err) {
      addToast({ message: err.message || 'Search failed', type: 'error', size: 'small' });
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectStudent = (s) => {
    setSelectedStudent(s);
    setForm((f) => ({ ...f }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      addToast({ message: 'Select a student first', type: 'error', size: 'small' });
      return;
    }
    if (!form.fineType || !form.amount) {
      addToast({ message: 'Fine type and amount are required', type: 'error', size: 'small' });
      return;
    }
    const amt = Number(form.amount);
    if (isNaN(amt) || amt <= 0) {
      addToast({ message: 'Amount must be a positive number', type: 'error', size: 'small' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/fines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          studentId: selectedStudent.studentId,
          name: selectedStudent.name,
          department: selectedStudent.department,
          fineType: form.fineType,
          amount: amt,
          reason: form.reason || '',
          date: form.date || new Date().toISOString()
        })
      });
      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(res.ok
          ? 'Invalid response from server'
          : 'Backend may not be running or returned an error. Ensure the backend is running on port 5000.');
      }
      if (!res.ok) throw new Error(data.message || 'Failed to add fine');
      addToast({ message: `Fine of Rs.${amt} added for ${selectedStudent.name}`, type: 'success', size: 'small' });
      setForm({ fineType: '', amount: '', reason: '', date: new Date().toISOString().slice(0, 10) });
      setSelectedStudent(null);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      addToast({ message: err.message || 'Failed to add fine', type: 'error', size: 'small' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-section">
      <div className="panel-header">
        <div className="panel-icon"><DollarSign size={20} strokeWidth={2} /></div>
        <h3>Add Fine (Manual Entry)</h3>
      </div>
      <p className="section-hint">Search student by ID or name, then add a fine.</p>

      <div className="form-large" style={{ marginBottom: '1.5rem' }}>
        <div className="form-row-inline" style={{ gap: '0.5rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Search Student (ID or Name)</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
              placeholder="e.g. IHS-RAD-001 or Ahmed"
              className="input-large"
            />
          </div>
          <button type="button" className="btn-secondary" onClick={handleSearch} disabled={searching}>
            {searching ? <><LoaderInline /> Searching...</> : 'Search'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div style={{ marginTop: '0.75rem' }}>
            <p className="section-hint" style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>
              {selectedStudent ? <><Check size={14} strokeWidth={2} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Student selected</> : 'Click a student below to select'}
            </p>
            <div className="search-results" style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            {searchResults.map((s) => (
              <div
                key={s._id}
                onClick={() => selectStudent(s)}
                className={selectedStudent?._id === s._id ? 'search-result-item selected' : 'search-result-item'}
                style={{ padding: '0.6rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
              >
                <strong>{s.studentId}</strong> — {s.name} ({s.department})
              </div>
            ))}
            </div>
          </div>
        )}

        {selectedStudent && (
          <div className="status success" style={{ marginTop: '0.75rem' }}>
            Selected: <strong>{selectedStudent.studentId}</strong> — {selectedStudent.name} ({selectedStudent.department})
          </div>
        )}
      </div>

      <form className="form-large" onSubmit={handleSubmit}>
        <div className="form-row-inline form-row-2">
          <div className="form-group">
            <label>Fine Type</label>
            <select
              value={form.fineType}
              onChange={(e) => setForm((f) => ({ ...f, fineType: e.target.value }))}
              className="input-large select-professional"
              required
            >
              <option value="">Select type...</option>
              {FINE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Amount (Rs.)</label>
            <input
              type="number"
              min="1"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="e.g. 500"
              className="input-large"
              required
            />
          </div>
        </div>
        <div className="form-row-inline form-row-2">
          <div className="form-group">
            <label>Reason (optional)</label>
            <input
              type="text"
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              placeholder="Additional details"
              className="input-large"
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="input-large"
            />
          </div>
        </div>
        <button
          type="submit"
          className="btn-primary-wide"
          disabled={loading || !selectedStudent || !form.fineType || !form.amount}
          title={!selectedStudent ? 'Search and select a student first' : !form.fineType || !form.amount ? 'Fill fine type and amount' : ''}
        >
          {loading ? <><LoaderInline /> Adding...</> : 'Add Fine'}
        </button>
      </form>
    </div>
  );
}
