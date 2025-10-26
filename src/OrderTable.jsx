import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import OrderForm from './OrderForm'; 
import EditOrderModal from './EditOrderModal'; 
import './styles/table.css';
import ConfirmDialog from './components/ConfirmDialog';
import Modal from './components/Modal';
import LoadingPopup from './components/LoadingPopup';
import { logActivity } from './utils/activity';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { verifyWahabPassword } from './auth';

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

    // Multi-select state
    const [selectedIds, setSelectedIds] = useState(new Set());
    const allSelected = orders.length > 0 && selectedIds.size === orders.length;
    const deliveredCount = (orders || []).filter(o => String(o.deliveryStatus).toLowerCase() === 'delivered').length;
    const cancelledCount = (orders || []).filter(o => String(o.deliveryStatus).toLowerCase() === 'cancelled').length;
    const toggleSelect = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };
    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(orders.map(o => o._id)));
        }
    };

    // Password gate for edit/delete actions
    const [pwdOpen, setPwdOpen] = useState(false);
    const [pwd, setPwd] = useState('');
    const [pwdError, setPwdError] = useState('');
    const [pwdAction, setPwdAction] = useState(null); // 'edit' | 'delete' | 'deleteAll' | 'deleteSelected' | 'deleteDelivered' | 'deleteCancelled'
    const [pwdPayload, setPwdPayload] = useState(null);

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

    const openPwd = (action, payload = null) => {
        setPwdOpen(true);
        setPwd('');
        setPwdError('');
        setPwdAction(action);
        setPwdPayload(payload);
    };

    const submitPwd = () => {
        if (!verifyWahabPassword(pwd)) {
            setPwdError('Incorrect password');
            return;
        }
        if (pwdAction === 'edit' && pwdPayload) {
            handleEditClick(pwdPayload);
        } else if (pwdAction === 'delete' && pwdPayload) {
            askDelete(pwdPayload);
        } else if (pwdAction === 'deleteAll') {
            handleDeleteAllOrders();
        } else if (pwdAction === 'deleteSelected') {
            handleDeleteSelected();
        } else if (pwdAction === 'deleteDelivered') {
            handleDeleteDelivered();
        } else if (pwdAction === 'deleteCancelled') {
            handleDeleteCancelled();
        }
        setPwdOpen(false);
        setPwdAction(null);
        setPwdPayload(null);
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

    // Delete delivered orders (with confirm)
    const [confirmDeliveredOpen, setConfirmDeliveredOpen] = useState(false);
    const handleDeleteDelivered = () => {
        if (deliveredCount === 0) {
            alert('No delivered orders to delete');
            return;
        }
        setConfirmDeliveredOpen(true);
    };
    const confirmDeleteDelivered = async () => {
        const toDelete = (orders || []).filter(o => String(o.deliveryStatus).toLowerCase() === 'delivered');
        try {
            await Promise.all(toDelete.map(o => axios.delete(`${API_URL}/${o._id}`)));
            setOrders(prev => prev.filter(o => String(o.deliveryStatus).toLowerCase() !== 'delivered'));
            logActivity({ type: 'delete', title: 'Delivered orders deleted', detail: `${toDelete.length} orders` });
        } catch (err) {
            alert('❌ Failed to delete some delivered orders.');
            console.error(err);
        } finally {
            setConfirmDeliveredOpen(false);
        }
    };

    // Delete cancelled orders (with confirm)
    const [confirmCancelledOpen, setConfirmCancelledOpen] = useState(false);
    const handleDeleteCancelled = () => {
        if (cancelledCount === 0) {
            alert('No cancelled orders to delete');
            return;
        }
        setConfirmCancelledOpen(true);
    };
    const confirmDeleteCancelled = async () => {
        const toDelete = (orders || []).filter(o => String(o.deliveryStatus).toLowerCase() === 'cancelled');
        try {
            await Promise.all(toDelete.map(o => axios.delete(`${API_URL}/${o._id}`)));
            setOrders(prev => prev.filter(o => String(o.deliveryStatus).toLowerCase() !== 'cancelled'));
            logActivity({ type: 'delete', title: 'Cancelled orders deleted', detail: `${toDelete.length} orders` });
        } catch (err) {
            alert('❌ Failed to delete some cancelled orders.');
            console.error(err);
        } finally {
            setConfirmCancelledOpen(false);
        }
    };

    // Delete selected orders (with confirm)
    const [confirmSelectedOpen, setConfirmSelectedOpen] = useState(false);
    const handleDeleteSelected = () => {
        if (selectedIds.size === 0) {
            alert('Select at least one order');
            return;
        }
        setConfirmSelectedOpen(true);
    };

    const confirmDeleteSelected = async () => {
        const ids = Array.from(selectedIds);
        try {
            await Promise.all(ids.map(id => axios.delete(`${API_URL}/${id}`)));
            setOrders(prev => prev.filter(o => !selectedIds.has(o._id)));
            setSelectedIds(new Set());
            logActivity({ type: 'delete', title: 'Selected orders deleted', detail: `${ids.length} orders` });
        } catch (err) {
            alert('❌ Failed to delete some selected orders.');
            console.error(err);
        } finally {
            setConfirmSelectedOpen(false);
        }
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

    const safeSavePDF = (doc, filename) => {
        try {
            doc.save(filename);
        } catch (e) {
            try {
                const blob = doc.output('blob');
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = filename; a.style.display = 'none';
                document.body.appendChild(a); a.click();
                setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a); }, 0);
            } catch {}
        }
    };

    const exportByStatus = (status) => {
        const list = (orders || []).filter(o => String(o.deliveryStatus).toLowerCase() === String(status).toLowerCase());
        if (!list.length) { alert(`No ${status} orders to export.`); return; }
        const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'A4' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        doc.text(`Orders Report — ${status}`, 40, 40);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}  •  Total: ${list.length}`, 40, 58);
        const body = list.map((o, i) => [
            String(i + 1),
            o.serialNumber || '-',
            new Date(o.orderDate || o.createdAt).toLocaleDateString(),
            o.owner || '-',
            o.deliveryStatus || '-',
        ]);
        autoTable(doc, {
            startY: 76,
            head: [['#', 'Serial', 'Date', 'Owner', 'Status']],
            body,
            styles: { fontSize: 9, cellPadding: 6 },
            headStyles: { fillColor: [37, 99, 235] },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 140 },
                2: { cellWidth: 90 },
                3: { cellWidth: 140 },
                4: { cellWidth: 'auto' },
            },
            didDrawPage: () => {
                const pageSize = doc.internal.pageSize;
                const pageHeight = pageSize.getHeight();
                doc.setFontSize(9);
                doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageSize.getWidth() - 80, pageHeight - 16);
            }
        });
        const fname = `orders-${status.toLowerCase().replace(/\s+/g,'-')}.pdf`;
        safeSavePDF(doc, fname);
    };

    const exportAllOrders = () => {
        const list = orders || [];
        if (!list.length) { alert('No orders to export.'); return; }
        const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'A4' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        doc.text('Orders Report — All', 40, 40);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}  •  Total: ${list.length}`, 40, 58);
        const body = list.map((o, i) => [
            String(i + 1),
            o.serialNumber || '-',
            new Date(o.orderDate || o.createdAt).toLocaleDateString(),
            o.owner || '-',
            o.deliveryStatus || '-',
        ]);
        autoTable(doc, {
            startY: 76,
            head: [['#', 'Serial', 'Date', 'Owner', 'Status']],
            body,
            styles: { fontSize: 9, cellPadding: 6 },
            headStyles: { fillColor: [37, 99, 235] },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 140 },
                2: { cellWidth: 90 },
                3: { cellWidth: 140 },
                4: { cellWidth: 'auto' },
            },
            didDrawPage: () => {
                const pageSize = doc.internal.pageSize;
                const pageHeight = pageSize.getHeight();
                doc.setFontSize(9);
                doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageSize.getWidth() - 80, pageHeight - 16);
            }
        });
        safeSavePDF(doc, 'orders-all.pdf');
    };

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
                  <div style={{ display:'flex', gap: 8, flexWrap:'wrap', alignItems:'center' }}>
                    <button type="button" className="btn" onClick={exportAllOrders} style={{ background:'#111827', color:'#fff', border:'1px solid #0f172a' }}>Export All</button>
                    <button type="button" className="btn" onClick={() => exportByStatus('Pending')} style={{ background:'#e5e7eb', color:'#111827', border:'1px solid #d1d5db' }}>Export Pending</button>
                    <button type="button" className="btn" onClick={() => exportByStatus('Delivered')} style={{ background:'#22c55e', color:'#fff', border:'1px solid #16a34a' }}>Export Delivered</button>
                    <button type="button" className="btn" onClick={() => exportByStatus('Cancelled')} style={{ background:'#ef4444', color:'#fff', border:'1px solid #dc2626' }}>Export Cancelled</button>
                    <button 
                      className="btn" 
                      disabled={selectedIds.size === 0}
                      onClick={() => openPwd('deleteSelected')}
                      style={{ background: selectedIds.size === 0 ? '#e5e7eb' : '#f97316', color: selectedIds.size === 0 ? '#111827' : '#fff', border:'1px solid #ea580c' }}
                      title={selectedIds.size === 0 ? 'Select rows to delete' : `Delete selected (${selectedIds.size})`}
                    >
                      🗑️ Delete Selected ({selectedIds.size})
                    </button>
                    <button 
                      className="btn"
                      disabled={deliveredCount === 0}
                      onClick={() => openPwd('deleteDelivered')}
                      style={{ background: deliveredCount === 0 ? '#e5e7eb' : '#dc2626', color: '#fff', border:'1px solid #b91c1c' }}
                      title={deliveredCount === 0 ? 'No delivered orders' : `Delete all delivered (${deliveredCount})`}
                    >
                      🗑️ Delete Delivered ({deliveredCount})
                    </button>
                    <button 
                      className="btn"
                      disabled={cancelledCount === 0}
                      onClick={() => openPwd('deleteCancelled')}
                      style={{ background: cancelledCount === 0 ? '#e5e7eb' : '#7f1d1d', color: '#fff', border:'1px solid #7f1d1d' }}
                      title={cancelledCount === 0 ? 'No cancelled orders' : `Delete all cancelled (${cancelledCount})`}
                    >
                      🗑️ Delete Cancelled ({cancelledCount})
                    </button>
                  </div>
                  <button 
                    className="btn btn-delete-all" 
                    onClick={() => openPwd('deleteAll')}
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
                  <table className="table table--profile">
                    <thead>
                      <tr>
                        <th><input type="checkbox" checked={allSelected} onChange={toggleSelectAll} /></th>
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
                          <td data-label="Select"><input type="checkbox" checked={selectedIds.has(order._id)} onChange={()=>toggleSelect(order._id)} /></td>
                          <td data-label="Serial No.">{order.serialNumber}</td>
                          <td data-label="Date">{new Date(order.orderDate || order.createdAt).toLocaleDateString()}</td>
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
                            <button className="btn btn-edit" onClick={()=>openPwd('edit', order)}>Edit</button>
                            <button className="btn btn-delete" onClick={()=>openPwd('delete', order)}>Delete</button>
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
            <ConfirmDialog
                open={confirmSelectedOpen}
                title={`Delete selected (${selectedIds.size}) orders?`}
                description={`This will permanently remove ${selectedIds.size} selected orders.`}
                confirmText="Delete Selected"
                cancelText="Cancel"
                onConfirm={confirmDeleteSelected}
                onCancel={() => setConfirmSelectedOpen(false)}
                danger
            />
            <ConfirmDialog
                open={confirmDeliveredOpen}
                title={`Delete ALL Delivered orders?`}
                description={`This will permanently remove ${deliveredCount} delivered orders.`}
                confirmText="Delete Delivered"
                cancelText="Cancel"
                onConfirm={confirmDeleteDelivered}
                onCancel={() => setConfirmDeliveredOpen(false)}
                danger
            />
            <ConfirmDialog
                open={confirmCancelledOpen}
                title={`Delete ALL Cancelled orders?`}
                description={`This will permanently remove ${cancelledCount} cancelled orders.`}
                confirmText="Delete Cancelled"
                cancelText="Cancel"
                onConfirm={confirmDeleteCancelled}
                onCancel={() => setConfirmCancelledOpen(false)}
                danger
            />

            {/* Password Modal for protected actions */}
            <Modal open={pwdOpen} title="Enter Password" onClose={()=>setPwdOpen(false)} size="md">
              <div style={{ display:'grid', gap: 10 }}>
                <input
                  type="password"
                  placeholder="Password"
                  value={pwd}
                  onChange={(e)=>setPwd(e.target.value)}
                  style={{ padding:'10px 12px', border:'2px solid #e5e7eb', borderRadius:8 }}
                />
                {pwdError && <div style={{ color:'#dc2626', fontWeight:600 }}>{pwdError}</div>}
                <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
                  <button className="btn" onClick={()=>setPwdOpen(false)} style={{ background:'#e5e7eb', border:'1px solid #d1d5db' }}>Cancel</button>
                  <button className="btn" onClick={submitPwd} style={{ background:'#2563eb', color:'#fff', border:'1px solid #1e40af' }}>Continue</button>
                </div>
              </div>
            </Modal>
        </div>
    );
}

export default OrderTable;
