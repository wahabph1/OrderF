import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = (process.env.REACT_APP_API_BASE_URL && typeof window !== 'undefined' && window.location.hostname === 'localhost')
  ? process.env.REACT_APP_API_BASE_URL
  : 'https://order-b.vercel.app/api/orders';

export default function BulkWahabOrderForm({ onDone }) {
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().slice(0,10));
  const [serialsText, setSerialsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const owner = 'Wahab';

  const parseLines = (text) => {
    const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    return Array.from(new Set(lines));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const serialNumbers = parseLines(serialsText);
    if (serialNumbers.length === 0) { setMessage('Enter at least one serial number.'); return; }
    setLoading(true);
    try {
      const isoDate = orderDate ? new Date(`${orderDate}T00:00:00.000Z`).toISOString() : undefined;
      const payload = { owner, orderDate: isoDate, serialNumbers };
      const res = await axios.post(`${API_BASE}/bulk`, payload);
      const data = res?.data || {};
      setMessage(`✅ Added ${data.createdCount || 0}, skipped ${data.skippedCount || 0}.`);
      setSerialsText('');
      onDone && onDone({ refresh: true });
    } catch (err) {
      setMessage(`❌ Error: ${err.response?.data?.message || 'Bulk add failed'}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="form-container compact">
      <h3>🏷️ Bulk Add Wahab Orders</h3>
      <p className="form-subtle">One serial per line. Duplicates allowed for Wahab.</p>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Owner</label>
          <input type="text" value={owner} readOnly style={{ background:'#f1f5f9', fontWeight:'bold', color:'#2563eb' }} />
        </div>
        <div className="input-group">
          <label>Order Date</label>
          <input type="date" value={orderDate} onChange={(e)=>setOrderDate(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Serial Numbers (one per line)</label>
          <textarea
            placeholder={"e.g.\nWH-1001\nWH-1002\nWH-1003"}
            rows={8}
            value={serialsText}
            onChange={(e)=>setSerialsText(e.target.value)}
            required
            style={{ width:'100%', resize:'vertical' }}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className={`action-btn add-btn ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? '' : '🏷️ Add All (Wahab)'}
          </button>
        </div>
      </form>
      {message && <p className={`form-message ${message.startsWith('❌') ? 'error-message' : ''}`}>{message}</p>}
    </div>
  );
}
