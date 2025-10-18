import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/Dashboard.css';
import OrderTable from './OrderTable';

const API_URL = 'https://order-b.vercel.app/api/orders';

// Light dashboard: left fixed analysis panel, right orders table (no buttons)
export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, delivered: 0, pending: 0, inTransit: 0, cancelled: 0 });
  const [ownerStats, setOwnerStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(API_URL);
        // Exclude Wahab from analysis (same as main dashboard default)
        const orders = (res.data || []).filter(o => o.owner !== 'Wahab');
        const delivered = orders.filter(o => o.deliveryStatus === 'Delivered').length;
        const pending = orders.filter(o => o.deliveryStatus === 'Pending').length;
        const inTransit = orders.filter(o => o.deliveryStatus === 'In Transit').length;
        const cancelled = orders.filter(o => o.deliveryStatus === 'Cancelled').length;

        // Owner-wise breakdown
        const ownersMap = {};
        for (const o of orders) {
          const key = o.owner || 'Unknown';
          if (!ownersMap[key]) ownersMap[key] = { owner: key, total: 0, delivered: 0, pending: 0, inTransit: 0, cancelled: 0 };
          ownersMap[key].total += 1;
          if (o.deliveryStatus === 'Delivered') ownersMap[key].delivered += 1;
          else if (o.deliveryStatus === 'Pending') ownersMap[key].pending += 1;
          else if (o.deliveryStatus === 'In Transit') ownersMap[key].inTransit += 1;
          else if (o.deliveryStatus === 'Cancelled') ownersMap[key].cancelled += 1;
        }
        const ownersArr = Object.values(ownersMap).sort((a,b) => b.total - a.total);

        if (!ignore) {
          setStats({ total: orders.length, delivered, pending, inTransit, cancelled });
          setOwnerStats(ownersArr);
        }
      } catch (e) {
        if (!ignore) setError('Failed to load analysis');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  return (
    <div className="dash-shell dash-light">
      <aside className="dash-sidebar dash-light">
        <div className="analysis-sticky">
          <h3 className="analysis-title">Analysis</h3>
          <div className="analysis-grid">
            <div className="analysis-card">
              <div className="ac-label">Total Orders</div>
              <div className="ac-value">{loading ? '…' : stats.total}</div>
            </div>
            <div className="analysis-card">
              <div className="ac-label">Delivered</div>
              <div className="ac-value">{loading ? '…' : stats.delivered}</div>
            </div>
            <div className="analysis-card">
              <div className="ac-label">Pending</div>
              <div className="ac-value">{loading ? '…' : stats.pending}</div>
            </div>
            <div className="analysis-card">
              <div className="ac-label">In Transit</div>
              <div className="ac-value">{loading ? '…' : stats.inTransit}</div>
            </div>
            <div className="analysis-card">
              <div className="ac-label">Cancelled</div>
              <div className="ac-value">{loading ? '…' : stats.cancelled}</div>
            </div>
            {error && (
              <div className="analysis-card" style={{ borderColor: '#fecaca', background: '#fef2f2' }}>
                <div className="ac-label" style={{ color: '#b91c1c' }}>{error}</div>
              </div>
            )}
          </div>

          {/* Owner-wise breakdown */}
          <div className="owners-wrap">
            <div className="owners-title">By Owner</div>
            <div className="owners-list">
              {ownerStats.map(o => {
                const t = o.total || 1;
                const dPct = Math.round((o.delivered / t) * 100);
                const pPct = Math.round((o.pending / t) * 100);
                const iPct = Math.round((o.inTransit / t) * 100);
                const cPct = Math.round((o.cancelled / t) * 100);
                return (
                  <div className="owner-chip" key={o.owner} title={`${o.owner}: ${o.total} total`}>
                    <div className="owner-chip-head">
                      <span className="owner-name">{o.owner}</span>
                      <span className="owner-count">{o.total}</span>
                    </div>
                    <div className="owner-bar" aria-hidden>
                      <span className="ob delivered" style={{ width: `${dPct}%` }}></span>
                      <span className="ob pending" style={{ width: `${pPct}%` }}></span>
                      <span className="ob transit" style={{ width: `${iPct}%` }}></span>
                      <span className="ob cancelled" style={{ width: `${cPct}%` }}></span>
                    </div>
                    <div className="owner-legend">
                      <span className="ol-item d">D {o.delivered}</span>
                      <span className="ol-item p">P {o.pending}</span>
                      <span className="ol-item t">T {o.inTransit}</span>
                      <span className="ol-item c">C {o.cancelled}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      <section className="dash-content">
        <div className="orders-wrap">
          <OrderTable />
        </div>
      </section>
    </div>
  );
}
