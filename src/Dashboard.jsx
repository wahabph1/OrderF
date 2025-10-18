import React from 'react';
import './styles/Dashboard.css';
import OrderTable from './OrderTable';

// Light dashboard: left fixed analysis panel, right orders table (no buttons)
export default function Dashboard() {
  return (
    <div className="dash-shell dash-light">
      <aside className="dash-sidebar dash-light">
        <div className="analysis-sticky">
          <h3 className="analysis-title">Analysis</h3>
          <div className="analysis-grid">
            <div className="analysis-card">
              <div className="ac-label">Total Orders</div>
              <div className="ac-value">—</div>
            </div>
            <div className="analysis-card">
              <div className="ac-label">Delivered</div>
              <div className="ac-value">—</div>
            </div>
            <div className="analysis-card">
              <div className="ac-label">Pending</div>
              <div className="ac-value">—</div>
            </div>
            <div className="analysis-card">
              <div className="ac-label">In Transit</div>
              <div className="ac-value">—</div>
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
