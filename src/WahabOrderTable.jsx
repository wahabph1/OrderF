// WahabOrderTable.jsx - Exclusive dashboard for Wahab orders

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import WahabOrderForm from './WahabOrderForm'; 
import EditOrderModal from './EditOrderModal'; 
import './styles/table.css';

const API_URL = 'https://order-b.vercel.app/api/orders';
const DEBOUNCE_DELAY = 300; 

function WahabOrderTable() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);

    // Fetch only Wahab orders
    const fetchWahabOrders = useCallback(async () => {
        setLoading(true); 
        setError(null);
        
        let url = `${API_URL}?owner=Wahab`; // Fixed filter for Wahab
        
        if (searchTerm) {
            url = `${API_URL}?owner=Wahab&search=${searchTerm}`;
        }

        try {
            const response = await axios.get(url);
            const sortedOrders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sortedOrders);
        } catch (err) {
            setError('Failed to fetch Wahab orders from server.');
            console.error(err);
        } finally { 
            setLoading(false); 
        }
    }, [searchTerm]);

    const handleDelete = async (id, serialNumber) => {
        if (window.confirm(`Are you sure you want to delete Wahab order ${serialNumber}?`)) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                setOrders(prev => prev.filter(o => o._id !== id));
            } catch(err) {
                alert('Failed to delete Wahab order.');
            }
        }
    };

    const handleEditClick = (order) => { setCurrentOrder(order); setIsEditing(true); };
    const handleCloseModal = () => { setIsEditing(false); setCurrentOrder(null); };
    const handleRefresh = useCallback(() => fetchWahabOrders(), [fetchWahabOrders]);

    useEffect(() => {
        const delay = setTimeout(() => fetchWahabOrders(), DEBOUNCE_DELAY);
        return () => clearTimeout(delay);
    }, [searchTerm, fetchWahabOrders]);

    const statusClass = (s) => `status status--${String(s || '').toLowerCase().replace(/\\s+/g,'-')}`;

    if (loading) return <p style={{textAlign:'center'}}>Loading Wahab orders...</p>;
    if (error) return <p style={{color:'red', textAlign:'center'}}>{error}</p>;

    return (
        <div className="container">
            {/* Wahab Order Form */}
            <WahabOrderForm onOrderAdded={handleRefresh} />

            <div className="table-card" style={{ marginTop: 16 }}>
              <div className="table-toolbar">
                <div className="toolbar-left">
                  <span className="kpi">
                    <span className="kpi-label">🏷️ Wahab Orders</span>
                    <span className="kpi-value">{orders.length}</span>
                  </span>
                </div>
                <div className="toolbar-right" style={{ gap: 12 }}>
                  <input
                    className="search"
                    type="text"
                    placeholder="Search Wahab Serial No..."
                    value={searchTerm}
                    onChange={(e)=>setSearchTerm(e.target.value)}
                  />
                  <button className="btn" onClick={handleRefresh}>Refresh Wahab</button>
                </div>
              </div>

              {orders.length === 0 ? (
                <div style={{ padding: 16, textAlign: 'center' }}>
                  No Wahab orders found for the current search.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Serial No.</th>
                        <th>Date</th>
                        <th>Owner</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order._id}>
                          <td data-label="Serial No.">{order.serialNumber}</td>
                          <td data-label="Date">{new Date(order.orderDate).toLocaleDateString()}</td>
                          <td data-label="Owner">
                            <span style={{ 
                              fontWeight: 'bold', 
                              color: '#2563eb',
                              backgroundColor: '#eff6ff',
                              padding: '4px 8px',
                              borderRadius: '4px'
                            }}>
                              {order.owner}
                            </span>
                          </td>
                          <td data-label="Status">
                            <span className={statusClass(order.deliveryStatus)}>
                              {order.deliveryStatus}
                            </span>
                          </td>
                          <td data-label="Actions" className="actions-cell">
                            <button className="btn" onClick={()=>handleEditClick(order)}>✏️ Edit</button>
                            <button className="btn" onClick={()=>handleDelete(order._id, order.serialNumber)}>🗑️ Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="table-footer">
                <span className="muted">Showing {orders.length} Wahab records</span>
              </div>
            </div>

            {isEditing && currentOrder && (
                <EditOrderModal
                    order={currentOrder}
                    onClose={handleCloseModal}
                    onOrderUpdated={handleRefresh}
                />
            )}
        </div>
    );
}

export default WahabOrderTable;