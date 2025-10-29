import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = (process.env.REACT_APP_API_BASE_URL && typeof window !== 'undefined' && window.location.hostname === 'localhost')
  ? process.env.REACT_APP_API_BASE_URL
  : 'https://order-b.vercel.app/api/orders';

const STATUS = ['Pending', 'In Transit', 'Delivered', 'Cancelled'];

export default function BulkStatusUpdate({ defaultOwner = 'All owners', fixedOwner = null, onDone }) {
  const [status, setStatus] = useState('Delivered');
  const [owner, setOwner] = useState(defaultOwner);
  const [serialsText, setSerialsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const owners = ['All owners', 'Emirate Essentials', 'Ahsan', 'Habibi Tools', 'Wahab'];
  const effectiveOwner = fixedOwner ? fixedOwner : (owner === 'All owners' ? undefined : owner);

  const parseLines = (text) => Array.from(new Set(text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const serialNumbers = parseLines(serialsText);
    if (!serialNumbers.length) { setMessage('Kuch serial numbers daalo.'); return; }
    setLoading(true);
    try {
      const payload = { serialNumbers, status };
      if (effectiveOwner) payload.owner = effectiveOwner;
      const res = await axios.post(`${API_BASE}/bulk-status`, payload);
      const d = res?.data || {};
      setMessage(`✅ Updated: ${d.updated || 0} • Already: ${d.already || 0} • Missing: ${d.missing?.length || 0}`);
      if (onDone) onDone({ refresh: true });
      setSerialsText('');
    } catch (err) {
      setMessage(`❌ Error: ${err.response?.data?.message || 'Bulk status failed'}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="form-container compact">
      <h3>↻ Bulk Status Update</h3>
      <p className="form-subtle">Multiple serials (1 per line) paste karo, naya status select karo.</p>
      <form onSubmit={handleSubmit}>
        {!fixedOwner && (
          <div className="input-group">
            <label>Owner</label>
            <select value={owner} onChange={(e)=>setOwner(e.target.value)}>
              {owners.map(o => (<option key={o} value={o}>{o}</option>))}
            </select>
          </div>
        )}
        {fixedOwner && (
          <div className="input-group">
            <label>Owner</label>
            <input type="text" value={fixedOwner} readOnly style={{ background:'#f1f5f9', fontWeight:'bold' }} />
          </div>
        )}
        <div className="input-group">
          <label>New Status</label>
          <select value={status} onChange={(e)=>setStatus(e.target.value)}>
            {STATUS.map(s => (<option key={s} value={s}>{s}</option>))}
          </select>
        </div>
        <div className="input-group">
          <label>Serial Numbers (one per line)</label>
          <textarea rows={8} placeholder={"e.g.\nEE-00123\nEE-00124"} value={serialsText} onChange={(e)=>setSerialsText(e.target.value)} required style={{ width:'100%', resize:'vertical' }} />
        </div>
        <div className="form-actions">
          <button type="submit" className={`action-btn add-btn ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? '' : 'Update Status'}
          </button>
        </div>
      </form>
      {message && <p className={`form-message ${message.startsWith('❌') ? 'error-message' : ''}`}>{message}</p>}
    </div>
  );
}
