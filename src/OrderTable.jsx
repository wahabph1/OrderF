import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import OrderForm from './OrderForm'; 
import EditOrderModal from './EditOrderModal'; 

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

    // ==== INLINE STYLES ====
    const containerStyle = { padding:'1rem', maxWidth:'1200px', margin:'auto' };
    const headingStyle = { textAlign:'center', margin:'1rem 0', fontSize:'1.8rem', fontWeight:'600' };
    const filterContainer = { display:'flex', flexWrap:'wrap', gap:'1rem', marginBottom:'1rem' };
    const inputGroup = { display:'flex', flexDirection:'column', flex:1, minWidth:'150px' };
    const inputStyle = { padding:'0.5rem', borderRadius:'6px', border:'1px solid #cbd5e1', fontSize:'0.95rem' };
    const tableWrapper = { overflowX:'auto', borderRadius:'10px', marginTop:'1rem' };
    const tableStyle = { width:'100%', borderCollapse:'collapse', minWidth:'500px', background:'#fff' };
    const thStyle = { padding:'0.8rem', background:'#1e293b', color:'white', textTransform:'uppercase', fontSize:'0.85rem', textAlign:'left' };
    const tdStyle = { padding:'0.7rem', fontSize:'0.85rem', textAlign:'left' };
    const actionBtn = { padding:'0.3rem 0.6rem', fontSize:'0.8rem', marginRight:'0.3rem', border:'none', borderRadius:'6px', cursor:'pointer' };
    const statusStyles = {
        Delivered: { background:'#dcfce7', color:'#166534', padding:'0.3rem 0.6rem', borderRadius:'6px', fontWeight:'600' },
        Pending: { background:'#fef3c7', color:'#92400e', padding:'0.3rem 0.6rem', borderRadius:'6px', fontWeight:'600' },
        'In Transit': { background:'#dbeafe', color:'#1e3a8a', padding:'0.3rem 0.6rem', borderRadius:'6px', fontWeight:'600' },
        Cancelled: { background:'#fee2e2', color:'#991b1b', padding:'0.3rem 0.6rem', borderRadius:'6px', fontWeight:'600' }
    };

    if (loading) return <p style={{textAlign:'center'}}>Loading orders...</p>;
    if (error) return <p style={{color:'red', textAlign:'center'}}>{error}</p>;

    return (
        <div style={containerStyle}>
            <OrderForm onOrderAdded={handleRefresh} />
            <h2 style={headingStyle}>Order Tracking Dashboard</h2>

            <div style={filterContainer}>
                <div style={inputGroup}>
                    <label>Search (Serial No.):</label>
                    <input
                        type="text"
                        placeholder="Type Serial Number..."
                        value={searchTerm}
                        onChange={(e)=>setSearchTerm(e.target.value)}
                        style={inputStyle}
                    />
                </div>
                <div style={inputGroup}>
                    <label>Filter by Owner:</label>
                    <select
                        value={filterOwner}
                        onChange={(e)=>setFilterOwner(e.target.value)}
                        style={inputStyle}
                    >
                        {ownerOptions.map(owner => (
                            <option key={owner} value={owner}>{owner}</option>
                        ))}
                    </select>
                </div>
            </div>

            <p style={{margin:'0.5rem 0'}}>Total Orders: {orders.length}</p>

            {orders.length === 0 ? (
                <p style={{textAlign:'center'}}>No orders found for the current selection.</p>
            ) : (
                <div style={tableWrapper}>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Serial No.</th>
                                <th style={thStyle}>Date</th>
                                <th style={thStyle}>Owner</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order=>(
                                <tr key={order._id} style={{background:'#f8fafc'}}>
                                    <td style={tdStyle}>{order.serialNumber}</td>
                                    <td style={tdStyle}>{new Date(order.orderDate).toLocaleDateString()}</td>
                                    <td style={tdStyle}>{order.owner}</td>
                                    <td style={tdStyle}>
                                        <span style={statusStyles[order.deliveryStatus] || {}}>{order.deliveryStatus}</span>
                                    </td>
                                    <td style={tdStyle}>
                                        <button
                                            className="action-btn edit-btn"
                                            onClick={()=>handleEditClick(order)}
                                        >✏️ Edit</button>
                                        <button
                                            className="action-btn delete-btn"
                                            onClick={()=>handleDelete(order._id, order.serialNumber)}
                                        >🗑️ Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

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
