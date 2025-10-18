import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import OrderForm from './OrderForm'; 
import EditOrderModal from './EditOrderModal'; 
import './styles/table.css';

const API_URL = 'https://order-b.vercel.app/api/orders';
const ownerOptions = ['All', 'Emirate Essentials', 'Ahsan', 'Habibi Tools']; 
const DEBOUNCE_DELAY = 300; 

function OrderTable() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterOwner, setFilterOwner] = useState('All'); 
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true); 
        setError(null);
        
        let url = API_URL;
        const queryParams = [];
        
        if (filterOwner !== 'All') queryParams.push(`owner=${filterOwner}`);
        if (searchTerm) queryParams.push(`search=${searchTerm}`);
        if (queryParams.length > 0) url = `${API_URL}?${queryParams.join('&')}`;

        try {
            const response = await axios.get(url);
            const sortedOrders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sortedOrders);
        } catch (err) {
            setError('Failed to fetch orders from server.');
            console.error(err);
        } finally { setLoading(false); }
    }, [filterOwner, searchTerm]);

    const handleDelete = async (id, serialNumber) => {
        if (window.confirm(`Are you sure you want to delete order ${serialNumber}?`)) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                setOrders(prev => prev.filter(o => o._id !== id));
            } catch(err) {
                alert('Failed to delete order.');
            }
        }
    };

    const handleEditClick = (order) => { setCurrentOrder(order); setIsEditing(true); };
    const handleCloseModal = () => { setIsEditing(false); setCurrentOrder(null); };
    const handleRefresh = useCallback(() => fetchOrders(), [fetchOrders]);

    useEffect(() => {
        const delay = setTimeout(() => fetchOrders(), DEBOUNCE_DELAY);
        return () => clearTimeout(delay);
    }, [filterOwner, searchTerm, fetchOrders]);

    const statusClass = (s) => `status status--${String(s || '').toLowerCase().replace(/\s+/g,'-')}`;

    if (loading) return <p style={{textAlign:'center'}}>Loading orders...</p>;
    if (error) return <p style={{color:'red', textAlign:'center'}}>{error}</p>;

    return (
        <div className="container">
            <OrderForm onOrderAdded={handleRefresh} />

            <div className="table-card" style={{ marginTop: 16 }}>
              <div className="table-toolbar">
                <div className="toolbar-left">
                  <span className="kpi">
                    <span className="kpi-label">Total Orders</span>
                    <span className="kpi-value">{orders.length}</span>
                  </span>
                </div>
                <div className="toolbar-right" style={{ gap: 12 }}>
                  <input
                    className="search"
                    type="text"
                    placeholder="Search Serial No..."
                    value={searchTerm}
                    onChange={(e)=>setSearchTerm(e.target.value)}
                  />
                  <select
                    className="search"
                    value={filterOwner}
                    onChange={(e)=>setFilterOwner(e.target.value)}
                  >
                    {ownerOptions.map(owner => (
                      <option key={owner} value={owner}>{owner}</option>
                    ))}
                  </select>
                  <button className="btn" onClick={handleRefresh}>Refresh</button>
                </div>
              </div>

              {orders.length === 0 ? (
                <div style={{ padding: 16, textAlign: 'center' }}>No orders found for the current selection.</div>
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
                          <td data-label="Owner">{order.owner}</td>
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
                <span className="muted">Showing {orders.length} records</span>
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

export default OrderTable;
