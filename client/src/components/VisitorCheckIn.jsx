import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { LoaderInline } from './Loader.jsx';
import { useToast } from '../context/ToastContext.jsx';
import CardPreviewModal from './cards/CardPreviewModal.jsx';
import { API_BASE } from '../config.js';

const VisitorCheckIn = () => {
  const { addToast } = useToast();
  const [form, setForm] = useState({
    name: '',
    cnic: '',
    phone: '',
    purpose: '',
    purposeCustom: '',
    personToMeet: '',
    personToMeetCustom: '',
    visitorType: 'Guest'
  });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [lastCheckedIn, setLastCheckedIn] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (!form.name || !form.cnic) {
      const msg = 'Name and CNIC are required.';
      setStatus({ type: 'error', message: msg });
      addToast({ message: msg, type: 'error', size: 'small' });
      return;
    }
    const purposeVal = form.purpose === 'Other' && form.purposeCustom ? form.purposeCustom : form.purpose;
    if (!purposeVal) {
      const msg = 'Please select or specify purpose of visit.';
      setStatus({ type: 'error', message: msg });
      addToast({ message: msg, type: 'error', size: 'small' });
      return;
    }
    setSubmitting(true);
    try {
      const purposeVal = form.purpose === 'Other' ? (form.purposeCustom || 'Other') : form.purpose;
      const personVal = form.personToMeet === 'Other' && form.personToMeetCustom ? form.personToMeetCustom : form.personToMeet;
      const payload = {
        ...form,
        purpose: purposeVal,
        personToMeet: personVal
      };
      const res = await fetch(`${API_BASE}/visitors/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to check in visitor');
      }

      setStatus({ type: 'success', message: `Visitor checked in. Token: ${data.tokenNumber || '—'}` });
      setLastCheckedIn(data);
      addToast({
        message: `${form.name} — Token ${data.tokenNumber || ''}`,
        type: 'success',
        size: 'big',
        title: 'Visitor Added'
      });
      setForm({ name: '', cnic: '', phone: '', purpose: '', purposeCustom: '', personToMeet: '', personToMeetCustom: '', visitorType: 'Guest' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Something went wrong' });
      addToast({ message: err.message || 'Something went wrong', type: 'error', size: 'small' });
    } finally {
      setSubmitting(false);
    }
  };

  const PURPOSE_OPTIONS = [
    'Meeting',
    'Interview',
    'Admission Inquiry',
    'Fee Submission',
    'Document Submission',
    'Parent-Teacher Meeting',
    'Vendor / Delivery',
    'Official Visit',
    'Other'
  ];

  const PERSON_OPTIONS = [
    'Admin Office',
    'Registrar',
    'Principal',
    'Academic Office',
    'Accounts',
    'Reception',
    'Other'
  ];

  return (
    <form className="visitor-checkin-form form-large" onSubmit={handleSubmit}>
      <div className="form-row-inline form-row-2">
        <div className="form-group">
          <label>Full Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="input-large"
            placeholder="e.g. Ahmed Khan"
            required
          />
        </div>
        <div className="form-group">
          <label>CNIC Number</label>
          <input
            name="cnic"
            value={form.cnic}
            onChange={handleChange}
            className="input-large"
            placeholder="e.g. 3520112345678"
            required
          />
        </div>
      </div>

      <div className="form-row-inline form-row-2">
        <div className="form-group">
          <label>Visitor Type</label>
          <select
            name="visitorType"
            value={form.visitorType}
            onChange={handleChange}
            className="input-large select-professional"
          >
            <option value="Guest">Guest</option>
            <option value="Parent">Parent</option>
            <option value="Vendor">Vendor</option>
            <option value="Student">Student</option>
            <option value="Staff">Staff</option>
            <option value="Contractor">Contractor</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Purpose of Visit</label>
          <select
            name="purpose"
            value={form.purpose}
            onChange={(e) => {
              const val = e.target.value;
              handleChange(e);
              if (val !== 'Other') setForm((p) => ({ ...p, purposeCustom: '' }));
            }}
            className="input-large select-professional"
            required
          >
            <option value="">Select purpose...</option>
            {PURPOSE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {form.purpose === 'Other' && (
            <input
              type="text"
              placeholder="Specify purpose (optional)"
              value={form.purposeCustom || ''}
              onChange={(e) => setForm((p) => ({ ...p, purposeCustom: e.target.value }))}
              className="input-large"
              style={{ marginTop: '0.5rem' }}
            />
          )}
        </div>
      </div>

      <div className="form-row-inline form-row-2">
        <div className="form-group">
          <label>Phone Number</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="input-large"
            placeholder="e.g. 03001234567"
          />
        </div>
        <div className="form-group">
          <label>Person to Meet</label>
          <select
            name="personToMeet"
            value={form.personToMeet}
            onChange={(e) => {
              const val = e.target.value;
              handleChange(e);
              if (val !== 'Other') setForm((p) => ({ ...p, personToMeetCustom: '' }));
            }}
            className="input-large select-professional"
          >
            <option value="">Select (optional)</option>
            {PERSON_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {form.personToMeet === 'Other' && (
            <input
              type="text"
              placeholder="Specify name or department"
              value={form.personToMeetCustom || ''}
              onChange={(e) => setForm((p) => ({ ...p, personToMeetCustom: e.target.value }))}
              className="input-large"
              style={{ marginTop: '0.5rem' }}
            />
          )}
        </div>
      </div>

      <button type="submit" className="btn-primary-wide btn-checkin" disabled={submitting}>
        {submitting ? <><LoaderInline /> Checking In...</> : <><Check size={16} strokeWidth={2} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Check In Visitor</>}
      </button>

      {status && (
        <div className={status.type === 'success' ? 'status success' : 'status error'}>
          {status.message}
        </div>
      )}

      {lastCheckedIn && (
        <CardPreviewModal
          type="visitor"
          data={lastCheckedIn}
          onClose={() => setLastCheckedIn(null)}
          autoPrint={true}
          playSound={true}
        />
      )}
    </form>
  );
};

export default VisitorCheckIn;

