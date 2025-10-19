import React, { useMemo, useState } from 'react';
import { readActivity } from '../utils/activity';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default function DeletedOrdersReport() {
  const [busy, setBusy] = useState(false);

  const deleted = useMemo(() => {
    const items = (readActivity() || []).filter(x => x.type === 'delete');
    // normalize
    return items.map((x, idx) => ({
      idx: items.length - idx, // reverse order index
      time: x.time,
      title: x.title || 'Deleted',
      detail: x.detail || '-',
    }));
  }, []);

  const groups = useMemo(() => chunk(deleted, 50), [deleted]);

  const downloadAll = async () => {
    if (!deleted.length) return;
    setBusy(true);
    try {
      for (let g = 0; g < groups.length; g++) {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'A4' });
        const title = `Deleted Orders Report — Batch ${g + 1} of ${groups.length}`;
        doc.setFontSize(14);
        doc.text(title, 40, 40);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 58);

        const body = groups[g].map((r, i) => [
          String(g * 50 + i + 1),
          new Date(r.time).toLocaleString(),
          r.title,
          r.detail,
        ]);

        doc.autoTable({
          startY: 76,
          head: [['#', 'Deleted At', 'Title', 'Detail']],
          body,
          styles: { fontSize: 9, cellPadding: 6 },
          headStyles: { fillColor: [37, 99, 235] },
          columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 150 },
            2: { cellWidth: 170 },
            3: { cellWidth: 'auto' },
          },
          didDrawPage: (data) => {
            const pageSize = doc.internal.pageSize;
            const pageHeight = pageSize.getHeight();
            doc.setFontSize(9);
            doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageSize.getWidth() - 80, pageHeight - 16);
          }
        });

        const filename = `deleted-orders-batch-${String(g + 1).padStart(2, '0')}.pdf`;
        doc.save(filename);
        // small delay to allow downloads to queue
        // eslint-disable-next-line no-await-in-loop
        await new Promise(r => setTimeout(r, 150));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="profile-card" style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Deleted Orders Report</h3>
        <button className="action-btn add-btn" onClick={downloadAll} disabled={!deleted.length || busy}>
          {busy ? 'Preparing…' : `Download PDFs (${groups.length || 0})`}
        </button>
      </div>
      <p className="subtle" style={{ marginTop: 0 }}>
        Found {deleted.length} delete events in activity log. Files are generated in batches of 50 rows each.
      </p>
      {!deleted.length ? (
        <div className="muted">No deletions recorded yet.</div>
      ) : (
        <div style={{ maxHeight: 280, overflow: 'auto', borderTop: '1px solid #f1f5f9', marginTop: 8 }}>
          <table className="table" style={{ width: '100%', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 6px'}}>#</th>
                <th style={{ textAlign: 'left', padding: '8px 6px'}}>Deleted At</th>
                <th style={{ textAlign: 'left', padding: '8px 6px'}}>Title</th>
                <th style={{ textAlign: 'left', padding: '8px 6px'}}>Detail</th>
              </tr>
            </thead>
            <tbody>
              {deleted.map((r, i) => (
                <tr key={`${r.time}-${i}`}>
                  <td style={{ padding: '6px' }}>{i + 1}</td>
                  <td style={{ padding: '6px' }}>{new Date(r.time).toLocaleString()}</td>
                  <td style={{ padding: '6px' }}>{r.title}</td>
                  <td style={{ padding: '6px' }}>{r.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
