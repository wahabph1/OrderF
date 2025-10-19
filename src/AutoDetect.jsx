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

  const drawRotated = (img, angleDeg, scaleFactor = 2) => {
    const rad = (angleDeg * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    const w = img.width * scaleFactor;
    const h = img.height * scaleFactor;
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(w * cos + h * sin);
    canvas.height = Math.floor(w * sin + h * cos);
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rad);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    return canvas;
  };

  const preprocessImage = async (src, angle = 0) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // upscale + rotate
        const base = drawRotated(img, angle, 2);
        const ctx = base.getContext('2d');
        const imageData = ctx.getImageData(0, 0, base.width, base.height);
        const data = imageData.data;
        // adaptive-ish threshold using running mean (simple, fast)
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i+1], b = data[i+2];
          const v = Math.max(r, g, b); // emphasize colored text
          sum += v;
        }
        const avg = sum / (data.length / 4);
        const thresh = Math.max(140, Math.min(190, avg + 10));
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i+1], b = data[i+2];
          let v = Math.max(r, g, b);
          // slight contrast boost
          v = (v - 128) * 1.25 + 128;
          const t = v > thresh ? 255 : 0;
          data[i] = data[i+1] = data[i+2] = t;
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(base.toDataURL('image/png'));
      };
      img.src = src;
    });
  };

  const recognizeOnce = async (src, psm = '6') => {
    const Tesseract = await import('tesseract.js');
    const opts = { logger: () => {}, tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-', preserve_interword_spaces: '1', tessedit_pageseg_mode: psm };
    const { data } = await Tesseract.recognize(src, 'eng', opts);
    return data;
  };

  const pickSerial = (t) => {
    const serialRegexes = [
      /S\s*\.?\s*NO\s*[:#-]?\s*([A-Z0-9-]{3,})/i,
      /S\s*\/?\s*NO\s*[:#-]?\s*([A-Z0-9-]{3,})/i,
      /Serial\s*(?:No\.?|#|:)\s*([A-Z0-9-]{3,})/i,
      /Invoice\s*(?:No\.?|#|:)\s*([A-Z0-9-]{3,})/i,
      /Order\s*(?:No\.?|#|:)\s*([A-Z0-9-]{3,})/i,
      /\b([A-Z]{1,3}-?\d{4,})\b/,
      /\b(\d{5,})\b/
    ];
    for (const rx of serialRegexes) {
      const m = t.match(rx);
      if (m) return m[1] || m[0];
    }
    return '';
  };

  const runOCR = async () => {
    if (!imgSrc) return;
    setBusy(true); setErr(''); setText('');
    try {
      const angles = [0, 90, 180, 270];
      let best = { score: -1, text: '', serial: '', date: '', owner: '' };
      for (const angle of angles) {
        const processed = await preprocessImage(imgSrc, angle);
        const d1 = await recognizeOnce(processed, '6');
        const d2 = await recognizeOnce(processed, '7');
        const candidates = [d1, d2];
        for (const d of candidates) {
          const raw = (d?.text || '').replace(/\uFFFD/g, '');
          const serial = pickSerial(raw);
          const dateMatch = raw.match(/(\d{4}[-\/.]\d{1,2}[-\/.]\d{1,2})|(\d{1,2}[\/.]\d{1,2}[\/.]\d{2,4})/);
          const ownerFound = owners.find(o => new RegExp(o, 'i').test(raw)) || '';
          const score = (serial ? serial.replace(/[^A-Z0-9]/gi,'').length * 10 : 0) + (d?.confidence || 0) + (ownerFound ? 5 : 0);
          if (score > best.score) best = { score, text: raw, serial, date: dateMatch ? dateMatch[0] : '', owner: ownerFound };
        }
      }
      setText(best.text);
      setForm(prev => ({
        ...prev,
        serialNumber: best.serial || prev.serialNumber,
        orderDate: best.date ? normalizeDate(best.date) : prev.orderDate,
        owner: best.owner || prev.owner
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
