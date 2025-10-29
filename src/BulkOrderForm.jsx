import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = (process.env.REACT_APP_API_BASE_URL && typeof window !== 'undefined' && window.location.hostname === 'localhost')
  ? process.env.REACT_APP_API_BASE_URL
  : 'https://order-f-ahp6.vercel.app/api/orders';

const ownerOptions = ['Emirate Essentials', 'Ahsan', 'Habibi Tools'];

export default function BulkOrderForm({ onDone }) {
  const [owner, setOwner] = useState(ownerOptions[0]);
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().slice(0,10));
  const [serialsText, setSerialsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const parseLines = (text) => {
    const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    // de-dup within batch
    return Array.from(new Set(lines));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const serialNumbers = parseLines(serialsText);
    if (serialNumbers.length === 0) {
      setMessage('Enter at least one serial number.');
      return;
    }
    setLoading(true);
    try {
      // Normalize to midnight UTC like single form
      const isoDate = orderDate ? new Date(`${orderDate}T00:00:00.000Z`).toISOString() : undefined;
      const payload = { owner, orderDate: isoDate, serialNumbers };
      const res = await axios.post(`${API_BASE}/bulk`, payload);
      const data = res?.data || {};
      setMessage(`✅ Added ${data.createdCount || 0}, skipped ${data.skippedCount || 0}.`);
      setSerialsText('');
      if (onDone) onDone({ refresh: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Bulk add failed';
      setMessage(`❌ Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container compact">
      <h3>➕ Bulk Add Orders</h3>
      <p className="form-subtle">One serial per line. Same date and owner applied to all.</p>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Owner</label>
          <select value={owner} onChange={(e)=>setOwner(e.target.value)} required>
            {ownerOptions.map(o => (<option key={o} value={o}>{o}</option>))}
          </select>
        </div>

        <div className="input-group">
          <label>Order Date</label>
          <input type="date" value={orderDate} onChange={(e)=>setOrderDate(e.target.value)} required />
        </div>

        <div className="input-group">
          <label>Serial Numbers (one per line)</label>
          <textarea
            placeholder="e.g.\nEE-00123\nEE-00124\nEE-00125"
            rows={8}
            value={serialsText}
            onChange={(e)=>setSerialsText(e.target.value)}
            required
            style={{ width:'100%', resize:'vertical' }}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className={`action-btn add-btn ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? '' : '➕ Add All'}
          </button>
        </div>
      </form>
      {message && (
        <p className={`form-message ${message.startsWith('❌') ? 'error-message' : ''}`}>{message}</p>
      )}
    </div>
  );
}
