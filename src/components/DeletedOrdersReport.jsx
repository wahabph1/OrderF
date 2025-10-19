import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const API_URL = 'https://order-b.vercel.app/api/orders';

function safeSavePDF(doc, filename) {
  try {
    // Primary path
    doc.save(filename);
  } catch (e) {
    try {
      // Fallback: manual anchor download
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.style.display = 'none';
      document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a); }, 0);
    } catch {}
  }
}

export default function DeletedOrdersReport() {
  const [busy, setBusy] = useState(false);
  const [deleted, setDeleted] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setErr('');
        const res = await axios.get(`${API_URL}/deleted`);
        const items = Array.isArray(res.data) ? res.data : [];
        const norm = items.map((x, idx) => ({
          idx: items.length - idx,
          time: x.deletedAt || x.updatedAt || x.createdAt,
          detail: x.serialNumber || x.originalId || '-',
          owner: x.owner || 'Unknown',
        }));
        setDeleted(norm);
      } catch (e) {
        setErr('Failed to fetch deleted orders from server');
        setDeleted([]);
      }
    })();
  }, []);

  const groups = useMemo(() => chunk(deleted, 50), [deleted]);

  const downloadBatch = async (g) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'A4' });
    const title = `Deleted Orders Report — Batch ${g + 1} of ${groups.length}`;
    // Improve font embedding reliability across browsers
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text(title, 40, 40);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 58);

    const body = groups[g].map((r, i) => [
      String(g * 50 + i + 1),
      new Date(r.time).toLocaleString(),
      r.detail,
      r.owner,
    ]);

    autoTable(doc, {
      startY: 76,
      head: [['#', 'Deleted At', 'Serial/ID', 'Owner']],
      body,
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [37, 99, 235] },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 160 },
        2: { cellWidth: 200 },
        3: { cellWidth: 'auto' },
      },
      didDrawPage: () => {
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.getHeight();
        doc.setFontSize(9);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageSize.getWidth() - 80, pageHeight - 16);
      }
    });

    const filename = `deleted-orders-batch-${String(g + 1).padStart(2, '0')}.pdf`;
    safeSavePDF(doc, filename);
  };

  const downloadFirst5 = () => {
    const subset = deleted.slice(0, 5);
    if (!subset.length) return;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'A4' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.text('Deleted Orders — First 5', 40, 40);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 58);

    const body = subset.map((r, i) => [
      String(i + 1),
      new Date(r.time).toLocaleString(),
      r.detail,
      r.owner,
    ]);

    autoTable(doc, {
      startY: 76,
      head: [['#', 'Deleted At', 'Serial/ID', 'Owner']],
      body,
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [37, 99, 235] },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 160 },
        2: { cellWidth: 200 },
        3: { cellWidth: 'auto' },
      },
    });

    safeSavePDF(doc, 'deleted-orders-first-5.pdf');
  };

  const downloadAll = async () => {
    if (!deleted.length) return;
    setBusy(true);
    try {
      for (let g = 0; g < groups.length; g++) {
        await downloadBatch(g);
        // small delay to allow downloads to queue
        // eslint-disable-next-line no-await-in-loop
        await new Promise(r => setTimeout(r, 200));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="profile-card" style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Deleted Orders Report</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={downloadFirst5} disabled={!deleted.length} style={{
            background: '#059669', color: '#fff', border: '1px solid #047857', padding: '8px 12px', borderRadius: 6,
            cursor: deleted.length ? 'pointer' : 'not-allowed', transition: 'none', boxShadow: 'none'
          }}>
            Download first 5
          </button>
          <button type="button" onClick={downloadAll} disabled={!deleted.length || busy} style={{
            background: '#2563eb', color: '#fff', border: '1px solid #1e40af', padding: '8px 12px', borderRadius: 6,
            cursor: deleted.length && !busy ? 'pointer' : 'not-allowed', transition: 'none', boxShadow: 'none'
          }}>
            {busy ? 'Preparing…' : `Download PDFs (${groups.length || 0})`}
          </button>
        </div>
      </div>
      <p className="subtle" style={{ marginTop: 0 }}>
        Found {deleted.length} delete events in activity log. Files are generated in batches of 50 rows each.
      </p>
      {err && <div className="status-message error-message" style={{color:'#b91c1c'}}>{err}</div>}

      {!deleted.length ? (
        <div className="muted">No deletions found.</div>
      ) : (
        <div style={{ margin: '8px 0 12px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {groups.map((_, i) => (
            <button key={i} type="button" onClick={() => downloadBatch(i)} style={{
              background: '#e5e7eb', color: '#111827', border: '1px solid #d1d5db', padding: '6px 10px', borderRadius: 6,
              cursor: 'pointer', transition: 'none', boxShadow: 'none'
            }}>
              Download batch {i + 1}
            </button>
          ))}
        </div>
      )}

      {!deleted.length ? null : (
        <div style={{ maxHeight: 280, overflow: 'auto', borderTop: '1px solid #f1f5f9', marginTop: 8 }}>
          <table className="table" style={{ width: '100%', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 6px'}}>#</th>
                <th style={{ textAlign: 'left', padding: '8px 6px'}}>Deleted At</th>
                <th style={{ textAlign: 'left', padding: '8px 6px'}}>Serial/ID</th>
                <th style={{ textAlign: 'left', padding: '8px 6px'}}>Owner</th>
              </tr>
            </thead>
            <tbody>
              {deleted.map((r, i) => (
                <tr key={`${r.time}-${i}`}>
                  <td style={{ padding: '6px' }}>{i + 1}</td>
                  <td style={{ padding: '6px' }}>{new Date(r.time).toLocaleString()}</td>
                  <td style={{ padding: '6px' }}>{r.detail}</td>
                  <td style={{ padding: '6px' }}>{r.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
