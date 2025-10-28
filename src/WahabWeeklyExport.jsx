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
      { label: 'Pending', color: [234, 179, 8] },      // amber-500
      { label: 'In Transit', color: [59, 130, 246] },  // blue-500
      { label: 'Delivered', color: [34, 197, 94] },    // green-500
      { label: 'Cancelled', color: [239, 68, 68] },    // red-500
    ];
    let lx = 40;
    legendItems.forEach(item => {
      doc.setFillColor(...item.color);
      doc.rect(lx, legendY - 8, 10, 10, 'F');
      doc.setTextColor(30);
      doc.text(item.label, lx + 14, legendY);
      lx += 90;
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
          let fill = null;
          if (s === 'pending') fill = [234, 179, 8];
          else if (s === 'in transit') fill = [59, 130, 246];
          else if (s === 'delivered') fill = [34, 197, 94];
          else if (s === 'cancelled') fill = [239, 68, 68];
          if (fill) {
            data.cell.styles.fillColor = fill;
            data.cell.styles.textColor = 255;
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
