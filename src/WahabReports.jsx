// WahabReports.jsx - Exclusive reports for Wahab orders

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://order-b.vercel.app/api/orders';

// Reusable animated SVG Donut Chart
function DonutChart({ segments, size = 240, strokeWidth = 36 }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const total = segments.reduce((s, x) => s + x.value, 0);
    const [reveal, setReveal] = useState(false);

    useEffect(() => {
        // trigger animation on mount/update
        const t = setTimeout(() => setReveal(true), 30);
        return () => clearTimeout(t);
    }, [total, JSON.stringify(segments)]);

    let acc = 0; // cumulative offset

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            style={{ transform: 'rotate(-90deg)' }}
            role="img"
            aria-label="Wahab Orders Donut chart"
        >
            {/* background track */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={strokeWidth}
            />
            {segments.map((seg, i) => {
                const fraction = total > 0 ? seg.value / total : 0;
                const length = fraction * circumference;
                const offset = circumference - acc;
                acc += length;
                return (
                    <circle
                        key={seg.label}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="butt"
                        strokeDasharray={`${reveal ? length : 0} ${circumference}`}
                        strokeDashoffset={offset}
                        style={{
                            transition: 'stroke-dasharray 1.2s ease-out, stroke-dashoffset 1.2s ease-out',
                            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))'
                        }}
                    />
                );
            })}
        </svg>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div className="report-card" style={{ borderTopColor: color }}>
            <div className="report-card-label">{label}</div>
            <div className="report-card-value" style={{ color }}>{value}</div>
        </div>
    );
}

function WahabReports({ onClose }) {
    const [orders, setOrders] = useState([]);
    const [counts, setCounts] = useState({ pending: 0, inTransit: 0, delivered: 0, cancelled: 0, total: 0 });

    useEffect(() => {
        const fetchWahabOrders = async () => {
            try {
                // Fetch only Wahab orders
                const res = await axios.get(`${API_URL}?owner=Wahab`);
                const data = Array.isArray(res.data) ? res.data : [];
                setOrders(data);
                computeCounts(data);
            } catch (e) {
                setOrders([]);
                setCounts({ pending: 0, inTransit: 0, delivered: 0, cancelled: 0, total: 0 });
            }
        };
        fetchWahabOrders();
    }, []);

    const computeCounts = (list) => {
        const c = { pending: 0, inTransit: 0, delivered: 0, cancelled: 0 };
        (list || []).forEach(o => {
            const s = (o.deliveryStatus || '').toLowerCase();
            if (s === 'pending') c.pending += 1;
            else if (s === 'in transit') c.inTransit += 1;
            else if (s === 'delivered') c.delivered += 1;
            else if (s === 'cancelled') c.cancelled += 1;
        });
        const total = c.pending + c.inTransit + c.delivered + c.cancelled;
        setCounts({ ...c, total });
    };

    const colors = {
        pending: '#f59e0b',     // amber
        inTransit: '#3b82f6',   // blue  
        delivered: '#22c55e',   // green
        cancelled: '#ef4444'    // red
    };

    const segments = [
        { label: 'Pending', value: counts.pending, color: colors.pending },
        { label: 'In Transit', value: counts.inTransit, color: colors.inTransit },
        { label: 'Delivered', value: counts.delivered, color: colors.delivered },
        { label: 'Cancelled', value: counts.cancelled, color: colors.cancelled },
    ];

    return (
        <div className="reports-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="reports-title">🏷️ Wahab Orders Reports & Analytics</h2>
                <button 
                    className="btn" 
                    onClick={onClose}
                    style={{ 
                        background: '#ef4444', 
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    ✕ Close
                </button>
            </div>

            <div className="owner-filter" style={{ marginBottom: '20px' }}>
                <button
                    type="button"
                    className="owner-chip active"
                    style={{
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontWeight: 'bold'
                    }}
                    disabled
                >
                    <span className="owner-name">Wahab Orders Only</span>
                    <span className="owner-count">{counts.total}</span>
                </button>
            </div>

            <div className="reports-grid">
                <div className="donut-wrap">
                    <div className="donut-outer glow">
                        <DonutChart segments={segments} />
                        <div className="donut-center">
                            <div className="center-label">Wahab Orders</div>
                            <div className="center-value count-up">{counts.total}</div>
                        </div>
                    </div>
                </div>

                <div className="legend-wrap">
                    {segments.map(s => (
                        <div className="legend-item" key={s.label}>
                            <span className="legend-dot" style={{ background: s.color }} />
                            <span className="legend-text">{s.label}</span>
                            <span className="legend-value">{s.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="cards-row">
                <StatCard label="Pending" value={counts.pending} color={colors.pending} />
                <StatCard label="In Transit" value={counts.inTransit} color={colors.inTransit} />
                <StatCard label="Delivered" value={counts.delivered} color={colors.delivered} />
                <StatCard label="Cancelled" value={counts.cancelled} color={colors.cancelled} />
            </div>

            <div className="bars-wrap">
                {segments.map(s => (
                    <div className="bar-item" key={`bar-${s.label}`}>
                        <div className="bar-label">{s.label}</div>
                        <div className="bar-track">
                            <div
                                className="bar-fill"
                                style={{
                                    width: counts.total > 0 ? `${Math.round((s.value / counts.total) * 100)}%` : '0%',
                                    background: s.color
                                }}
                            />
                        </div>
                        <div className="bar-value">{counts.total > 0 ? `${Math.round((s.value / counts.total) * 100)}%` : '0%'}</div>
                    </div>
                ))}
            </div>

            {counts.total === 0 && (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    color: '#666',
                    fontSize: '18px' 
                }}>
                    📊 No Wahab orders found. Add some orders to see analytics!
                </div>
            )}
        </div>
    );
}

export default WahabReports;