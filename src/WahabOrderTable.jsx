// WahabOrderTable.jsx - Exclusive dashboard for Wahab orders

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import WahabOrderForm from './WahabOrderForm'; 
import EditOrderModal from './EditOrderModal';
import WahabReports from './WahabReports';
import './styles/table.css';
import ConfirmDialog from './components/ConfirmDialog';
import Modal from './components/Modal';
import LoadingPopup from './components/LoadingPopup';
import { logActivity } from './utils/activity';

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
    // Delete confirmations
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAllOpen, setConfirmAllOpen] = useState(false);
    const [targetOrder, setTargetOrder] = useState(null);

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

    const askDelete = (order) => {
        setTargetOrder(order);
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!targetOrder) return;
        try {
            await axios.delete(`${API_URL}/${targetOrder._id}`);
            setOrders(prev => prev.filter(o => o._id !== targetOrder._id));
            logActivity({ type: 'delete', title: 'Wahab order deleted', detail: targetOrder.serialNumber || targetOrder._id });
        } catch(err) {
            alert('Failed to delete Wahab order.');
        } finally {
            setConfirmOpen(false);
            setTargetOrder(null);
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
            logActivity({ type: 'status', title: 'Wahab status updated', detail: `${orderId} → ${newStatus}` });
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
    const handleDeleteAllOrders = () => {
        if (orders.length === 0) {
            alert('No Wahab orders to delete');
            return;
        }
        setConfirmAllOpen(true);
    };

    const confirmDeleteAll = async () => {
        try {
            const deletePromises = orders.map(order => axios.delete(`${API_URL}/${order._id}`));
            await Promise.all(deletePromises);
            setOrders([]);
            logActivity({ type: 'delete', title: 'All Wahab orders deleted', detail: `${orders.length} orders` });
        } catch (err) {
            alert('❌ Failed to delete some Wahab orders. Please try again.');
            console.error(err);
        } finally {
            setConfirmAllOpen(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => fetchWahabOrders(), DEBOUNCE_DELAY);
        return () => clearTimeout(delay);
    }, [searchTerm, fetchWahabOrders]);

    const statusClass = (s) => `status status--${String(s || '').toLowerCase().replace(/\\s+/g,'-')}`;

    // Animated popup will cover UI when loading; no inline text
    if (error) return <p style={{color:'red', textAlign:'center'}}>{error}</p>;

    return (
        <div className="container">
            <LoadingPopup open={loading} />
            {/* Add Wahab Order Button */}
            <div style={{ marginBottom: '16px', marginTop: '16px', textAlign: 'right' }}>
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
                    <span className="nav-shine" aria-hidden></span>
                    Add Wahab Order
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
                            <button className="btn btn-edit" onClick={()=>handleEditClick(order)}>Edit</button>
                            <button className="btn btn-delete" onClick={()=>askDelete(order)}>Delete</button>
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
            <Modal open={showAddModal} title="Add Wahab Order" onClose={() => setShowAddModal(false)}>
              <WahabOrderForm 
                onOrderAdded={() => {
                  handleRefresh();
                  setShowAddModal(false);
                }} 
              />
            </Modal>

            {/* Delete confirmation dialogs */}
            <ConfirmDialog
                open={confirmOpen}
                title="Delete this Wahab order?"
                description={targetOrder ? `Serial ${targetOrder.serialNumber} will be permanently removed.` : ''}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => { setConfirmOpen(false); setTargetOrder(null); }}
                danger
            />
            <ConfirmDialog
                open={confirmAllOpen}
                title="Delete ALL Wahab orders?"
                description={`This will remove ${orders.length} Wahab orders permanently.`}
                confirmText="Delete All"
                cancelText="Cancel"
                onConfirm={confirmDeleteAll}
                onCancel={() => setConfirmAllOpen(false)}
                danger
            />
        </div>
    );
}

export default WahabOrderTable;
