import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import OrderForm from './OrderForm'; 
import EditOrderModal from './EditOrderModal'; 
import './styles/table.css';
import ConfirmDialog from './components/ConfirmDialog';
import Modal from './components/Modal';
import LoadingPopup from './components/LoadingPopup';
import { logActivity } from './utils/activity';

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
    // Delete confirmations
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAllOpen, setConfirmAllOpen] = useState(false);
    const [targetOrder, setTargetOrder] = useState(null);

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

    const askDelete = (order) => {
        setTargetOrder(order);
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!targetOrder) return;
        try {
            await axios.delete(`${API_URL}/${targetOrder._id}`);
            setOrders(prev => prev.filter(o => o._id !== targetOrder._id));
            logActivity({ type: 'delete', title: 'Order deleted', detail: targetOrder.serialNumber || targetOrder._id, owner: targetOrder.owner || 'Unknown' });
        } catch(err) {
            alert('Failed to delete order.');
        } finally {
            setConfirmOpen(false);
            setTargetOrder(null);
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
            logActivity({ type: 'status', title: 'Status updated', detail: `${orderId} → ${newStatus}` });
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
    const handleDeleteAllOrders = () => {
        if (orders.length === 0) {
            alert('No orders to delete');
            return;
        }
        setConfirmAllOpen(true);
    };

    const confirmDeleteAll = async () => {
        try {
            const deletePromises = orders.map(order => axios.delete(`${API_URL}/${order._id}`));
            await Promise.all(deletePromises);
            setOrders([]);
            logActivity({ type: 'delete', title: 'All orders deleted', detail: `${orders.length} orders` });
        } catch (err) {
            alert('❌ Failed to delete some orders. Please try again.');
            console.error(err);
        } finally {
            setConfirmAllOpen(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => fetchOrders(), DEBOUNCE_DELAY);
        return () => clearTimeout(delay);
    }, [filterOwner, searchTerm, fetchOrders]);

    const statusClass = (s) => `status status--${String(s || '').toLowerCase().replace(/\s+/g,'-')}`;

    // Show animated popup instead of inline loading text
    if (error) return <p style={{color:'red', textAlign:'center'}}>{error}</p>;

    return (
        <div className="container">
            <LoadingPopup open={loading} />
            {/* Add Order Button */}
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
                    Add Order
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
                    className="btn btn-delete-all" 
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
            <Modal open={showAddModal} title="Add New Order" onClose={() => setShowAddModal(false)}>
              <OrderForm 
                onOrderAdded={() => {
                  handleRefresh();
                  setShowAddModal(false);
                }} 
              />
            </Modal>

            {/* Delete confirmation dialogs */}
            <ConfirmDialog
                open={confirmOpen}
                title="Delete this order?"
                description={targetOrder ? `Serial ${targetOrder.serialNumber} will be permanently removed.` : ''}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => { setConfirmOpen(false); setTargetOrder(null); }}
                danger
            />
            <ConfirmDialog
                open={confirmAllOpen}
                title="Delete ALL orders?"
                description={`This will remove ${orders.length} orders permanently.`}
                confirmText="Delete All"
                cancelText="Cancel"
                onConfirm={confirmDeleteAll}
                onCancel={() => setConfirmAllOpen(false)}
                danger
            />
        </div>
    );
}

export default OrderTable;
