import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import LoadingPopup from './components/LoadingPopup';

const API_URL = (process.env.REACT_APP_API_BASE_URL && typeof window !== 'undefined' && window.location.hostname === 'localhost')
  ? process.env.REACT_APP_API_BASE_URL
  : 'https://order-b.vercel.app/api/orders';

// Compute Friday-start week for a date
function weekStartFriday(d) {
  const x = new Date(d);
  x.setHours(0,0,0,0);
  const day = x.getDay(); // Sun=0..Sat=6, Fri=5
  const offset = (day - 5 + 7) % 7; // days since last Friday
  x.setDate(x.getDate() - offset);
  return x;
}
function weekEndFromStart(ws) {
  const e = new Date(ws);
  e.setDate(e.getDate() + 6);
  e.setHours(23,59,59,999);
  return e;
}
const fmt = (d) => new Date(d).toLocaleDateString();

function safeSavePDF(doc, filename) {
  try { doc.save(filename); }
  catch (e) {
    try {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.style.display = 'none';
      document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a); }, 0);
    } catch {}
  }
}

export default function WahabWeeklyExport() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hiddenWeeks, setHiddenWeeks] = useState(() => new Set());
  const [exportingAll, setExportingAll] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true); setError('');
      try {
        const res = await axios.get(`${API_URL}?owner=Wahab`);
        const sorted = (res.data || []).sort((a,b)=> new Date(a.orderDate||a.createdAt) - new Date(b.orderDate||b.createdAt));
        setOrders(sorted);
      } catch (e) {
        setError('Failed to load Wahab orders');
      } finally { setLoading(false); }
    })();
  }, []);

  const groups = useMemo(() => {
    const map = new Map();
    for (const o of orders) {
      const d = new Date(o.orderDate || o.createdAt);
      const ws = weekStartFriday(d);
      const key = ws.toISOString().slice(0,10); // yyyy-mm-dd of Friday
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(o);
    }
    // to array, sort by week start desc
    const arr = Array.from(map.entries()).map(([key, list]) => {
      const ws = new Date(key);
      const we = weekEndFromStart(ws);
      return { key, start: ws, end: we, orders: list };
    }).sort((a,b)=> b.start - a.start);
    return arr;
  }, [orders]);

  const generatePdf = (week) => {
    const weekOrders = week.orders.sort((a,b)=> new Date(a.orderDate||a.createdAt) - new Date(b.orderDate||b.createdAt));
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'A4' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text(`Wahab Orders — ${fmt(week.start)} to ${fmt(week.end)}`, 40, 40);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}  •  Total: ${weekOrders.length}`, 40, 58);

    // Legend (status colors)
    const legendY = 64;
    const legendItems = [
      // Match table.css badge colors (bg, text, border)
      { label: 'Pending', bg: [255, 247, 237], text: [180, 83, 9], border: [254, 215, 170] },
      { label: 'In Transit', bg: [238, 242, 255], text: [67, 56, 202], border: [199, 210, 254] },
      { label: 'Delivered', bg: [236, 253, 245], text: [21, 128, 61], border: [187, 247, 208] },
      { label: 'Cancelled', bg: [254, 242, 242], text: [185, 28, 28], border: [254, 202, 202] },
    ];
    let lx = 40;
    legendItems.forEach(item => {
      doc.setFillColor(...item.bg);
      doc.setDrawColor(...item.border);
      doc.rect(lx, legendY - 8, 10, 10, 'FD');
      doc.setTextColor(...item.text);
      doc.text(item.label, lx + 14, legendY);
      lx += 110;
    });

    const body = weekOrders.map((o, i) => [
      String(i + 1),
      o.serialNumber || '-',
      new Date(o.orderDate || o.createdAt).toLocaleDateString(),
      o.deliveryStatus || '-',
    ]);
    autoTable(doc, {
      startY: 80,
      head: [['#', 'Serial', 'Date', 'Status']],
      body,
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [37, 99, 235] },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 180 },
        2: { cellWidth: 110 },
        3: { cellWidth: 'auto' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
          const s = String(data.cell.raw || '').toLowerCase();
          // Match table.css badge palette
          let bg = null, text = null, border = null;
          if (s === 'pending') { bg = [255, 247, 237]; text = [180, 83, 9]; border = [254, 215, 170]; }
          else if (s === 'in transit') { bg = [238, 242, 255]; text = [67, 56, 202]; border = [199, 210, 254]; }
          else if (s === 'delivered') { bg = [236, 253, 245]; text = [21, 128, 61]; border = [187, 247, 208]; }
          else if (s === 'cancelled') { bg = [254, 242, 242]; text = [185, 28, 28]; border = [254, 202, 202]; }
          if (bg) {
            data.cell.styles.fillColor = bg;
            data.cell.styles.textColor = text;
            data.cell.styles.lineColor = border;
            data.cell.styles.lineWidth = 0.5;
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.halign = 'center';
          }
        }
      },
      didDrawPage: () => {
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.getHeight();
        doc.setFontSize(9);
        doc.setTextColor(0);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageSize.getWidth() - 80, pageHeight - 16);
      }
    });
    const fname = `wahab-${week.key}_to_${week.end.toISOString().slice(0,10)}.pdf`;
    safeSavePDF(doc, fname);
  };

  const downloadAllVisible = async () => {
    setExportingAll(true);
    try {
      for (const w of groups) {
        if (hiddenWeeks.has(w.key)) continue;
        generatePdf(w);
        // brief pause to let browser save
        // eslint-disable-next-line no-await-in-loop
        await new Promise(r => setTimeout(r, 80));
      }
    } finally { setExportingAll(false); }
  };

  const visibleGroups = groups.filter(g => !hiddenWeeks.has(g.key));

  if (error) return <p style={{color:'red', textAlign:'center'}}>{error}</p>;

  return (
    <div className="container">
      <LoadingPopup open={loading || exportingAll} label={exportingAll ? 'Exporting…' : 'Loading'} />
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', margin:'16px 0', gap:8, flexWrap:'wrap' }}>
        <h2 style={{ margin:0 }}>Wahab Weekly PDFs (Fri→Thu)</h2>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button className="btn" onClick={downloadAllVisible} disabled={exportingAll || !visibleGroups.length} style={{ background:'#2563eb', color:'#fff', border:'1px solid #1e40af' }}>
            {exportingAll ? 'Exporting…' : `Download All (${visibleGroups.length})`}
          </button>
          <button className="btn" onClick={()=>setHiddenWeeks(new Set())} style={{ background:'#e5e7eb', border:'1px solid #d1d5db' }}>Reset Hidden</button>
        </div>
      </div>

      {groups.length === 0 ? (
        <div style={{ padding:16, textAlign:'center' }}>No Wahab orders found.</div>
      ) : (
        <div className="table-card" style={{ padding:16 }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{minWidth:160}}>Week</th>
                  <th>Orders</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map(w => (
                  hiddenWeeks.has(w.key) ? null : (
                    <tr key={w.key}>
                      <td>{fmt(w.start)} → {fmt(w.end)}</td>
                      <td>{w.orders.length}</td>
                      <td className="actions-cell">
                        <button className="btn" onClick={()=>generatePdf(w)} style={{ background:'#111827', color:'#fff', border:'1px solid #0f172a' }}>Download PDF</button>
                        <button className="btn btn-delete" onClick={()=>{ setHiddenWeeks(s => { const n = new Set(s); n.add(w.key); return n; }); }}>Delete</button>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="muted">Showing {visibleGroups.length} weeks (hidden {hiddenWeeks.size})</span>
          </div>
        </div>
      )}
    </div>
  );
}
