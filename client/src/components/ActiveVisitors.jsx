import React, { useEffect, useState } from 'react';
import { SkeletonTable } from './Skeleton.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { API_BASE } from '../config.js';

const ActiveVisitors = () => {
  const { addToast } = useToast();
  const [visitors, setVisitors] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [status, setStatus] = useState(null);

  const loadActive = async (isRefresh = false) => {
    if (!isRefresh) setInitialLoad(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE}/visitors/active`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load active visitors');
      setVisitors(data);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to load visitors' });
      addToast({ message: err.message || 'Failed to load visitors', type: 'error', size: 'small' });
    } finally {
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    loadActive();
    const interval = setInterval(() => loadActive(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const checkOut = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/visitors/${id}/check-out`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to check out');
      setStatus({ type: 'success', message: 'Visitor checked out.' });
      addToast({ message: 'Visitor checked out', type: 'success', size: 'small' });
      loadActive(true);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to check out visitor' });
      addToast({ message: err.message || 'Failed to check out', type: 'error', size: 'small' });
    }
  };

  return (
    <div className="active-visitors">
      {status && (
        <div className={status.type === 'success' ? 'status success' : 'status error'}>
          {status.message}
        </div>
      )}

      {initialLoad ? (
        <SkeletonTable rows={4} cols={6} />
      ) : visitors.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">✓</span>
          <p>No active visitors at the moment.</p>
          <span className="empty-hint">Checked-out visitors will disappear from this list.</span>
        </div>
      ) : (
        <div className="table-wrapper active-visitors-table active-visitors-scroll">
          <table className="table-large active-visitors-grid">
            <thead>
              <tr>
                <th>Token</th>
                <th>Name</th>
                <th>Type</th>
                <th>CNIC</th>
                <th>Phone</th>
                <th>Purpose</th>
                <th>Check-In Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v) => (
                <tr key={v._id}>
                  <td><span className="token-badge">{v.tokenNumber || '—'}</span></td>
                  <td className="cell-name">{v.name}</td>
                  <td><span className="visitor-type-badge">{v.visitorType || 'Guest'}</span></td>
                  <td className="cell-cnic">{v.cnic}</td>
                  <td className="cell-phone">{v.phone || '—'}</td>
                  <td className="cell-purpose">{v.purpose}</td>
                  <td>{new Date(v.checkInTime).toLocaleTimeString()}</td>
                  <td className="cell-action">
                    <button className="btn-checkout" onClick={() => checkOut(v._id)}>
                      ✓ Check Out
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ActiveVisitors;

