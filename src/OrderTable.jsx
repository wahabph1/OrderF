import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import OrderForm from './OrderForm'; 
import EditOrderModal from './EditOrderModal'; 
import './styles/table.css';

const API_URL = 'https://order-b.vercel.app/api/orders';
// Removed 'All' option and excluded Wahab from main dashboard
const ownerOptions = ['All (Exc. Wahab)', 'Emirate Essentials', 'Ahsan', 'Habibi Tools']; 
const statusOptions = ['Pending', 'In Transit', 'Delivered', 'Cancelled'];
const DEBOUNCE_DELAY = 300;

function OrderTable() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterOwner, setFilterOwner] = useState('All (Exc. Wahab)');
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [editingStatusId, setEditingStatusId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchOrders = useCallback(async () => {
        setLoading(true); 
        setError(null);
        
        let url = API_URL;
        const queryParams = [];
        
        // Handle filtering logic - exclude Wahab orders from main dashboard
        if (filterOwner === 'All (Exc. Wahab)') {
            // Don't add owner filter, but we'll filter out Wahab after fetching
        } else {
            queryParams.push(`owner=${filterOwner}`);
        }
        
        if (searchTerm) queryParams.push(`search=${searchTerm}`);
        if (queryParams.length > 0) url = `${API_URL}?${queryParams.join('&')}`;

        try {
            const response = await axios.get(url);
            let filteredOrders = response.data;
            
            // If "All (Exc. Wahab)" is selected, filter out Wahab orders
            if (filterOwner === 'All (Exc. Wahab)') {
                filteredOrders = response.data.filter(order => order.owner !== 'Wahab');
            }
            
            const sortedOrders = filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
    
    // Handle inline status change
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await axios.put(`${API_URL}/${orderId}`, { deliveryStatus: newStatus });
            // Update local state
            setOrders(prev => prev.map(order => 
                order._id === orderId 
                    ? { ...order, deliveryStatus: newStatus }
                    : order
            ));
            setEditingStatusId(null);
        } catch (err) {
            alert('Failed to update status.');
            console.error(err);
        }
    };
    
    // Toggle status dropdown
    const toggleStatusEdit = (orderId) => {
        setEditingStatusId(editingStatusId === orderId ? null : orderId);
    };
    
    // Delete all orders
    const handleDeleteAllOrders = async () => {
        if (orders.length === 0) {
            alert('No orders to delete');
            return;
        }
        
        if (window.confirm(`Are you sure you want to delete ALL ${orders.length} orders? This action cannot be undone!`)) {
            try {
                // Delete all orders from backend
                const deletePromises = orders.map(order => 
                    axios.delete(`${API_URL}/${order._id}`)
                );
                
                await Promise.all(deletePromises);
                setOrders([]);
                alert('✅ All orders deleted successfully!');
            } catch (err) {
                alert('❌ Failed to delete some orders. Please try again.');
                console.error(err);
            }
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => fetchOrders(), DEBOUNCE_DELAY);
        return () => clearTimeout(delay);
    }, [filterOwner, searchTerm, fetchOrders]);

    const statusClass = (s) => `status status--${String(s || '').toLowerCase().replace(/\s+/g,'-')}`;

    if (loading) return <p style={{textAlign:'center'}}>Loading orders...</p>;
    if (error) return <p style={{color:'red', textAlign:'center'}}>{error}</p>;

    return (
        <div className="container">
            {/* Add Order Button */}
            <div style={{ marginBottom: '16px', textAlign: 'right' }}>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="add-order-btn"
                    style={{
                        background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(30, 64, 175, 0.25)',
                        transform: 'translateY(0) scale(1)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        letterSpacing: '0.025em',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-1px) scale(1.02)';
                        e.target.style.boxShadow = '0 8px 20px rgba(30, 64, 175, 0.35)';
                        e.target.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0) scale(1)';
                        e.target.style.boxShadow = '0 4px 12px rgba(30, 64, 175, 0.25)';
                        e.target.style.background = 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)';
                    }}
                    onMouseDown={(e) => {
                        e.target.style.transform = 'translateY(0) scale(0.98)';
                    }}
                    onMouseUp={(e) => {
                        e.target.style.transform = 'translateY(-1px) scale(1.02)';
                    }}
                >
                    <span style={{ 
                        fontSize: '16px', 
                        fontWeight: '300',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '16px',
                        height: '16px'
                    }}>+</span>
                    Add Order
                    
                    {/* Subtle shine effect */}
                    <span style={{
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        transition: 'left 0.6s ease',
                        pointerEvents: 'none'
                    }} className="shine-effect" />
                </button>
            </div>

            <div className="table-card">
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
                  <button 
                    className="btn" 
                    onClick={handleDeleteAllOrders}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: '1px solid #dc2626',
                      marginLeft: '8px'
                    }}
                    title={`Delete all ${orders.length} orders`}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#ef4444';
                    }}
                  >
                    🗑️ Delete All ({orders.length})
                  </button>
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
                            {editingStatusId === order._id ? (
                              <select
                                value={order.deliveryStatus}
                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                onBlur={() => setEditingStatusId(null)}
                                autoFocus
                                style={{
                                  padding: '4px 8px',
                                  border: '2px solid #2563eb',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  background: 'white',
                                  cursor: 'pointer'
                                }}
                              >
                                {statusOptions.map(status => (
                                  <option key={status} value={status}>{status}</option>
                                ))}
                              </select>
                            ) : (
                              <span 
                                className={statusClass(order.deliveryStatus)}
                                onClick={() => toggleStatusEdit(order._id)}
                                style={{ 
                                  cursor: 'pointer',
                                  transition: 'all 0.2s',
                                  position: 'relative'
                                }}
                                title="Click to change status"
                              >
                                {order.deliveryStatus}
                              </span>
                            )}
                          </td>
<td data-label="Actions" className="actions-cell">
                            <button className="btn btn-edit" onClick={()=>handleEditClick(order)}>✏️ Edit</button>
                            <button className="btn btn-delete" onClick={()=>handleDelete(order._id, order.serialNumber)}>🗑️ Delete</button>
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

            {/* Add Order Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.6)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        maxWidth: '500px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        transform: 'scale(1)',
                        animation: 'slideUp 0.3s ease-out'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '24px 24px 0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: '24px',
                                fontWeight: '600',
                                color: '#1f2937',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <span style={{
                                    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                                    color: 'white',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '18px'
                                }}>+</span>
                                Add New Order
                            </h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '28px',
                                    cursor: 'pointer',
                                    color: '#9ca3af',
                                    padding: '4px',
                                    borderRadius: '6px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.color = '#ef4444';
                                    e.target.style.background = '#fef2f2';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.color = '#9ca3af';
                                    e.target.style.background = 'none';
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div style={{ padding: '0 24px 24px' }}>
                            <OrderForm 
                                onOrderAdded={() => {
                                    handleRefresh();
                                    setShowAddModal(false);
                                }} 
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OrderTable;
