import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { logActivity } from './utils/activity';

const API_URL = 'https://order-b.vercel.app/api/orders';

export default function AutoDetect() {
  const [imgSrc, setImgSrc] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const [form, setForm] = useState({ serialNumber: '', owner: '', orderDate: new Date().toISOString().slice(0,10) });

  const owners = useMemo(() => ['Ahsan', 'Emirate Essentials', 'Habibi Tools', 'Wahab'], []);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr(''); setText(''); setForm(prev => ({ ...prev }));
    const r = new FileReader();
    r.onload = () => setImgSrc(String(r.result));
    r.readAsDataURL(f);
  };

  const runOCR = async () => {
    if (!imgSrc) return;
    setBusy(true); setErr(''); setText('');
    try {
      const Tesseract = await import('tesseract.js');
      const { data } = await Tesseract.recognize(imgSrc, 'eng', { logger: () => {} });
      const t = data?.text || '';
      setText(t);
      // simple parsing
      const serialMatch = t.match(/(?:Serial|Invoice|Order)[\s#:]*([A-Z0-9-]{4,})/i) || t.match(/\b([A-Z]{1,3}-?\d{4,})\b/);
      const dateMatch = t.match(/(\d{4}[-\/.]\d{1,2}[-\/.]\d{1,2})|(\d{1,2}[\/.]\d{1,2}[\/.]\d{2,4})/);
      const ownerFound = owners.find(o => new RegExp(o, 'i').test(t));
      setForm(prev => ({
        ...prev,
        serialNumber: serialMatch ? serialMatch[1] || serialMatch[0] : prev.serialNumber,
        orderDate: dateMatch ? normalizeDate(dateMatch[0]) : prev.orderDate,
        owner: ownerFound || prev.owner
      }));
    } catch (e) {
      setErr('OCR failed. Try a clearer image.');
    } finally {
      setBusy(false);
    }
  };

  const normalizeDate = (s) => {
    try {
      const d = new Date(s.replace(/\./g,'/').replace(/-/g,'/'));
      if (!isNaN(d.getTime())) return d.toISOString().slice(0,10);
    } catch {}
    return new Date().toISOString().slice(0,10);
  };

  const createOrder = async () => {
    if (!form.serialNumber || !form.owner) { setErr('Please fill Serial and Owner'); return; }
    setBusy(true); setErr('');
    try {
      const payload = { serialNumber: form.serialNumber, owner: form.owner, orderDate: form.orderDate };
      await axios.post(API_URL, payload);
      logActivity({ type: 'create', title: 'Order created from invoice', detail: form.serialNumber });
      alert('Order created successfully');
      setImgSrc(''); setText('');
    } catch (e) {
      setErr('Failed to create order (maybe already exists).');
    } finally { setBusy(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (imgSrc) runOCR(); /* auto run on select */ }, [imgSrc]);

  return (
    <div className="profile-card" style={{ padding: 16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 12 }}>
        <h3 style={{ margin:0 }}>Auto Detect from Invoice (beta)</h3>
        <label className="btn" style={{ background:'#2563eb', color:'#fff', border:'1px solid #1e40af', padding:'8px 12px', borderRadius:6, cursor:'pointer' }}>
          Upload Image
          <input type="file" accept="image/*" onChange={onFile} style={{ display:'none' }} />
        </label>
      </div>

      {err && <div style={{ color:'#b91c1c', marginBottom: 8 }}>{err}</div>}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div>
          {imgSrc ? (
            <img src={imgSrc} alt="preview" style={{ width:'100%', maxHeight:320, objectFit:'contain', border:'1px solid #e5e7eb', borderRadius:8 }} />
          ) : (
            <div style={{ border:'1px dashed #cbd5e1', borderRadius:8, padding:20, color:'#64748b' }}>Select an invoice image to start OCR.</div>
          )}
          {busy && <div style={{ marginTop:8, color:'#475569' }}>Detecting text…</div>}
          {text && (
            <div style={{ marginTop:8 }}>
              <div style={{ fontSize:12, color:'#64748b', marginBottom:4 }}>Detected text (for reference)</div>
              <textarea value={text} readOnly rows={8} style={{ width:'100%', fontSize:12 }} />
            </div>
          )}
        </div>
        <div>
          <div className="input-group"><label>Serial Number</label><input value={form.serialNumber} onChange={e=>setForm({ ...form, serialNumber: e.target.value })} /></div>
          <div className="input-group"><label>Owner</label>
            <select value={form.owner} onChange={e=>setForm({ ...form, owner: e.target.value })}>
              <option value="">Select owner</option>
              {owners.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="input-group"><label>Date</label><input type="date" value={form.orderDate} onChange={e=>setForm({ ...form, orderDate: e.target.value })} /></div>
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <button className="btn" onClick={runOCR} disabled={!imgSrc || busy}>Re-run Detect</button>
            <button className="btn" onClick={createOrder} disabled={busy} style={{ background:'#16a34a', color:'#fff', border:'1px solid #15803d' }}>Create Order</button>
          </div>
        </div>
      </div>
    </div>
  );
}
