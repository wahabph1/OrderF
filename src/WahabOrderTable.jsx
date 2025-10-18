// WahabOrderTable.jsx - Exclusive dashboard for Wahab orders

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import WahabOrderForm from './WahabOrderForm'; 
import EditOrderModal from './EditOrderModal';
import WahabReports from './WahabReports';
import './styles/table.css';

const API_URL = 'https://order-b.vercel.app/api/orders';
const statusOptions = ['Pending', 'In Transit', 'Delivered', 'Cancelled'];
const DEBOUNCE_DELAY = 300;

function WahabOrderTable() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [showReports, setShowReports] = useState(false);
    const [editingStatusId, setEditingStatusId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

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
    
    // Delete all Wahab orders
    const handleDeleteAllOrders = async () => {
        if (orders.length === 0) {
            alert('No Wahab orders to delete');
            return;
        }
        
        if (window.confirm(`Are you sure you want to delete ALL ${orders.length} Wahab orders? This action cannot be undone!`)) {
            try {
                // Delete all orders from backend
                const deletePromises = orders.map(order => 
                    axios.delete(`${API_URL}/${order._id}`)
                );
                
                await Promise.all(deletePromises);
                setOrders([]);
                alert('✅ All Wahab orders deleted successfully!');
            } catch (err) {
                alert('❌ Failed to delete some Wahab orders. Please try again.');
                console.error(err);
            }
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => fetchWahabOrders(), DEBOUNCE_DELAY);
        return () => clearTimeout(delay);
    }, [searchTerm, fetchWahabOrders]);

    const statusClass = (s) => `status status--${String(s || '').toLowerCase().replace(/\\s+/g,'-')}`;

    if (loading) return <p style={{textAlign:'center'}}>Loading Wahab orders...</p>;
    if (error) return <p style={{color:'red', textAlign:'center'}}>{error}</p>;

    return (
        <div className="container">
            {/* Add Wahab Order Button */}
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
                    Add Wahab Order
                    
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
              <div className="table-toolbar" style={{ 
                overflowX: 'auto',
                display: 'flex',
                flexWrap: 'nowrap',
                gap: '16px'
              }}>
                <div className="toolbar-left">
                  <span className="kpi">
                    <span className="kpi-label">Wahab Orders</span>
                    <span className="kpi-value">{orders.length}</span>
                  </span>
                </div>
                <div className="toolbar-right" style={{ 
                  gap: 12, 
                  display: 'flex',
                  overflowX: 'auto',
                  minWidth: 0,
                  paddingBottom: '4px'
                }}>
                  <input
                    className="search"
                    type="text"
                    placeholder="Search Wahab Serial No..."
                    value={searchTerm}
                    onChange={(e)=>setSearchTerm(e.target.value)}
                    style={{ minWidth: '200px', flexShrink: 0 }}
                  />
                  <button 
                    className="btn" 
                    onClick={() => setShowReports(true)}
                    style={{ 
                      background: '#2563eb', 
                      color: 'white',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    Wahab Reports
                  </button>
                  <button 
                    className="btn" 
                    onClick={handleRefresh}
                    style={{
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    Refresh Wahab
                  </button>
                  <button 
                    className="btn" 
                    onClick={handleDeleteAllOrders}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: '1px solid #dc2626',
                      marginLeft: '8px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                    title={`Delete all ${orders.length} Wahab orders`}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#ef4444';
                    }}
                  >
                    🗑️ Delete All Wahab ({orders.length})
                  </button>
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

            {showReports && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '8px',
                        maxWidth: '95vw',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                    }}>
                        <WahabReports onClose={() => setShowReports(false)} />
                    </div>
                </div>
            )}

            {/* Add Wahab Order Modal */}
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
                                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                    color: 'white',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '18px'
                                }}>+</span>
                                Add Wahab Order
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
                            <WahabOrderForm 
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

export default WahabOrderTable;