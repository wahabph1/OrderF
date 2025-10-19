import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import KpiInsights from './components/KpiInsights';
import ActivityIntegrations from './components/ActivityIntegrations';

// Reuse backend orders for demo of "Current Orders"
const API_URL = 'https://order-b.vercel.app/api/orders';

function StatusPill({ status }) {
  const map = {
    Delivered: 'status-delivered',
    Pending: 'status-pending',
    'In Transit': 'status-in-transit',
    Cancelled: 'status-cancelled',
  };
  const cls = map[status] || 'status-pending';
  return <span className={`status-tag ${cls}`}>{status}</span>;
}

function Section({ title, action, children }) {
  return (
    <section className="profile-card">
      <div className="profile-card-head">
        <h3 className="profile-card-title">{title}</h3>
        {action}
      </div>
      <div className="profile-card-body">{children}</div>
    </section>
  );
}

function CurrentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_URL);
        const sorted = res.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 6);
        if (mounted) setOrders(sorted);
      } catch (e) {
        if (mounted) setError('Failed to load orders');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <p className="status-message">Loading current orders…</p>;
  if (error) return <p className="status-message error-message">{error}</p>;
  if (!orders.length) return <p className="status-message">No current orders.</p>;

  return (
    <div className="orders-grid">
      {orders.map(o => (
        <div key={o._id} className="order-mini-card">
          <div className="omc-row">
            <span className="omc-label">Serial</span>
            <span className="omc-value">{o.serialNumber}</span>
          </div>
          <div className="omc-row">
            <span className="omc-label">Date</span>
            <span className="omc-value">{new Date(o.orderDate).toLocaleDateString()}</span>
          </div>
          <div className="omc-row">
            <span className="omc-label">Owner</span>
            <span className="omc-value">{o.owner}</span>
          </div>
          <div className="omc-row">
            <span className="omc-label">Status</span>
            <StatusPill status={o.deliveryStatus} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Address Book (localStorage for demo)
const ADDR_KEY = 'tm_addresses_v1';
const DEFAULT_ADDR_KEY = 'tm_default_address_id_v1';

function useAddresses() {
  const [addresses, setAddresses] = useState(() => {
    try {
      const raw = localStorage.getItem(ADDR_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [defaultId, setDefaultId] = useState(() => {
    try {
      return localStorage.getItem(DEFAULT_ADDR_KEY) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem(ADDR_KEY, JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    if (defaultId) localStorage.setItem(DEFAULT_ADDR_KEY, defaultId);
  }, [defaultId]);

  const setDefault = (id) => setDefaultId(id);
  const addAddress = (addr) => setAddresses(prev => [...prev, { id: crypto.randomUUID(), ...addr }]);
  const removeAddress = (id) => setAddresses(prev => prev.filter(a => a.id !== id));

  return { addresses, defaultId, setDefault, addAddress, removeAddress };
}

function DeliveryAddresses() {
  const { addresses, defaultId, setDefault, addAddress, removeAddress } = useAddresses();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: '', line1: '', city: '', country: '', phone: '' });

  useEffect(() => {
    if (addresses.length === 0) {
      addAddress({ name: 'Home', line1: 'Street 12, Al Nahda', city: 'Dubai', country: 'UAE', phone: '+971-50-000-0000' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.line1) return;
    addAddress(form);
    setForm({ name: '', line1: '', city: '', country: '', phone: '' });
    setFormOpen(false);
  };

  return (
    <div className="address-wrap">
      <div className="address-list">
        {addresses.map(a => (
          <div key={a.id} className={`address-card ${a.id === defaultId ? 'default' : ''}`}>
            <div className="address-line">
              <div className="address-title-row">
                <h4 className="address-name">{a.name}</h4>
                {a.id === defaultId && <span className="default-pill">Default</span>}
              </div>
              <p className="address-text">{a.line1}</p>
              <p className="address-text subtle">{[a.city, a.country].filter(Boolean).join(', ')}</p>
              {a.phone && <p className="address-text subtle">{a.phone}</p>}
            </div>
            <div className="address-actions">
              <label className="radio">
                <input
                  type="radio"
                  name="defaultAddress"
                  checked={a.id === defaultId}
                  onChange={() => setDefault(a.id)}
                />
                <span>Make default</span>
              </label>
              <button className="action-btn delete-btn" onClick={() => removeAddress(a.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {formOpen ? (
        <form className="address-form" onSubmit={onSubmit}>
          <div className="af-grid">
            <div className="input-group">
              <label>Label</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Home / Office" />
            </div>
            <div className="input-group">
              <label>Address line</label>
              <input value={form.line1} onChange={e => setForm({ ...form, line1: e.target.value })} placeholder="Street, building, flat" />
            </div>
            <div className="input-group"><label>City</label><input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
            <div className="input-group"><label>Country</label><input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} /></div>
            <div className="input-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div className="af-actions">
            <button type="button" className="action-btn" onClick={() => setFormOpen(false)}>Cancel</button>
            <button type="submit" className="action-btn add-btn">Save Address</button>
          </div>
        </form>
      ) : (
        <button className="action-btn add-btn" onClick={() => setFormOpen(true)}>Add New Address</button>
      )}
    </div>
  );
}

function ReturnHistory() {
  const [items] = useState(() => [
    { id: 'r-1023', serial: 'EE-54211', date: '2025-10-12', status: 'Processed', refund: 'AED 120' },
    { id: 'r-1022', serial: 'AH-33112', date: '2025-09-28', status: 'Pending', refund: '-' },
  ]);

  if (!items.length) return <p className="status-message">No return/refund records.</p>;

  return (
    <div className="list-table">
      <div className="lt-head">
        <span>Return ID</span>
        <span>Serial</span>
        <span>Date</span>
        <span>Status</span>
        <span>Refund</span>
      </div>
      {items.map(x => (
        <div key={x.id} className="lt-row">
          <span>{x.id}</span>
          <span>{x.serial}</span>
          <span>{new Date(x.date).toLocaleDateString()}</span>
          <span><span className="badge subtle">{x.status}</span></span>
          <span>{x.refund}</span>
        </div>
      ))}
    </div>
  );
}

function SupportTickets() {
  const [tickets, setTickets] = useState(() => [
    { id: 'T-9001', subject: 'Order delayed', status: 'Open', updatedAt: '2025-10-17' },
    { id: 'T-9000', subject: 'Invoice request', status: 'Closed', updatedAt: '2025-09-02' },
  ]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '' });

  const create = (e) => {
    e.preventDefault();
    if (!form.subject || !form.message) return;
    const newT = { id: `T-${Math.floor(Math.random()*9000)+1000}` , subject: form.subject, status: 'Open', updatedAt: new Date().toISOString() };
    setTickets(prev => [newT, ...prev]);
    setForm({ subject: '', message: '' });
    setOpen(false);
  };

  return (
    <div>
      <div className="tickets-list">
        {tickets.map(t => (
          <div key={t.id} className="ticket-item">
            <div className="ticket-primary">
              <span className="ticket-id">{t.id}</span>
              <span className="ticket-subject">{t.subject}</span>
            </div>
            <div className="ticket-meta">
              <span className={`badge ${t.status === 'Open' ? 'accent' : 'subtle'}`}>{t.status}</span>
              <span className="ticket-date">Updated {new Date(t.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {open ? (
        <form className="ticket-form" onSubmit={create}>
          <div className="input-group">
            <label>Subject</label>
            <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Issue summary" />
          </div>
          <div className="input-group">
            <label>Message</label>
            <textarea rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Describe the issue" />
          </div>
          <div className="tf-actions">
            <button type="button" className="action-btn" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="action-btn save-btn">Create Ticket</button>
          </div>
        </form>
      ) : (
        <button className="action-btn add-btn" onClick={() => setOpen(true)}>New Ticket</button>
      )}
    </div>
  );
}

export default function Profile() {
  const user = useMemo(() => ({
    name: 'Abdul Wahab',
    handle: '@wahab',
    email: 'aw599822@gmail.com',
    joined: '2024-05-12',
  }), []);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="avatar">AW</div>
        <div>
          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-sub">{user.handle} · Joined {new Date(user.joined).toLocaleDateString()}</p>
          <p className="profile-sub subtle">{user.email}</p>
        </div>
      </div>

      <div className="profile-grid">
        <Section title="Current Orders">
          <CurrentOrders />
        </Section>

        <Section title="Delivery Addresses" action={<span className="badge accent">Manage</span>}>
          <DeliveryAddresses />
        </Section>

        <Section title="Return / Refund History">
          <ReturnHistory />
        </Section>

        <Section title="Support Tickets" action={<span className="badge subtle">Support</span>}>
          <SupportTickets />
        </Section>

        <Section title="Business KPIs (30 days)">
          {/* KPIs: last 30 days chart, delivery/cancel rate, owner split, top products/customers */}
          <KpiInsights />
        </Section>

        <Section title="Activity & Integrations">
          {/* Timeline, API keys, Google Sheets export, template order */}
          <ActivityIntegrations />
        </Section>
      </div>
    </div>
  );
}
