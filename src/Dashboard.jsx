import React, { useState } from 'react';
import './styles/Dashboard.css';
import OrderTable from './OrderTable';
import Reports from './Reports';
import ProfitCalculator from './ProfitCalculator';

// Desktop-focused dashboard layout with left sidebar and right content
export default function Dashboard() {
  const [section, setSection] = useState('orders');

  return (
    <div className="dash-shell">
      <aside className="dash-sidebar">
        <div className="dash-brand">Dashboard</div>
        <nav className="dash-nav">
          <button
            className={`dash-link ${section === 'orders' ? 'active' : ''}`}
            onClick={() => setSection('orders')}
            aria-current={section === 'orders' ? 'page' : undefined}
          >
            Orders
          </button>
          <button
            className={`dash-link ${section === 'reports' ? 'active' : ''}`}
            onClick={() => setSection('reports')}
            aria-current={section === 'reports' ? 'page' : undefined}
          >
            Reports
          </button>
          <button
            className={`dash-link ${section === 'analysis' ? 'active' : ''}`}
            onClick={() => setSection('analysis')}
            aria-current={section === 'analysis' ? 'page' : undefined}
          >
            Analysis
          </button>
        </nav>
      </aside>

      <section className="dash-content">
        {section === 'orders' && (
          <div className="dash-card">
            <div className="dash-card-header">
              <h2>Orders</h2>
            </div>
            <div className="dash-card-body">
              <OrderTable />
            </div>
          </div>
        )}
        {section === 'reports' && (
          <div className="dash-card">
            <div className="dash-card-header">
              <h2>Reports</h2>
            </div>
            <div className="dash-card-body">
              <Reports />
            </div>
          </div>
        )}
        {section === 'analysis' && (
          <div className="dash-card">
            <div className="dash-card-header">
              <h2>Analysis</h2>
            </div>
            <div className="dash-card-body">
              <ProfitCalculator />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
