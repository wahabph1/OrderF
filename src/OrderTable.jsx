// Frontend/src/components/OrderTable.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import OrderForm from './OrderForm'; 
import EditOrderModal from './EditOrderModal'; 

// 🔑 FIX: API URL aapke backend URL https://order-b.vercel.app se connect kiya gaya hai
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
        
        if (filterOwner !== 'All') {
            queryParams.push(`owner=${filterOwner}`);
        }
        
        if (searchTerm) {
            queryParams.push(`search=${searchTerm}`); 
        }

        if (queryParams.length > 0) {
            url = `${API_URL}?${queryParams.join('&')}`;
        }
        
        try {
            const response = await axios.get(url);
            const sortedOrders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sortedOrders);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch orders from server. Check if backend is running.');
            setLoading(false);
            console.error('Fetch error:', err);
        }
    }, [filterOwner, searchTerm]);

    const handleDelete = async (id, serialNumber) => {
        if (window.confirm(`Are you sure you want to delete order ${serialNumber}?`)) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                setOrders(prevOrders => prevOrders.filter(order => order._id !== id));
            } catch (err) {
                alert('Failed to delete the order.');
                console.error('Delete error:', err);
            }
        }
    };
    
    const handleEditClick = (order) => {
        setCurrentOrder(order);
        setIsEditing(true);
    };

    const handleCloseModal = () => {
        setIsEditing(false);
        setCurrentOrder(null);
    };

    const handleRefresh = useCallback(() => {
        fetchOrders();
    }, [fetchOrders]);
    
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchOrders();
        }, DEBOUNCE_DELAY); 

        return () => clearTimeout(delaySearch); 
    }, [filterOwner, searchTerm, fetchOrders]); 

    if (loading) {
        return <p className="status-message">Loading orders...</p>;
    }
    if (error) {
        return <p className="status-message error-message">Error: {error}</p>;
    }

    return (
        <div className="order-table-view">
            
            {/* onOrderAdded par list refresh hogi */}
            <OrderForm onOrderAdded={handleRefresh} />

            <h2 className="dashboard-heading">Order Tracking Dashboard</h2>
            
            <div className="filter-search-container">
                
                <div className="input-group">
                    <label>Search (Serial No.):</label>
                    <input
                        type="text"
                        placeholder="Type Serial Number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="input-group">
                    <label>Filter by Owner:</label>
                    <select 
                        value={filterOwner} 
                        onChange={(e) => setFilterOwner(e.target.value)}
                        disabled={loading}
                    >
                        {ownerOptions.map(owner => (
                            <option key={owner} value={owner}>{owner}</option>
                        ))}
                    </select>
                </div>

            </div>
            
            <p className="order-count">Total Orders: **{orders.length}**</p>
            
            {orders.length === 0 ? (
                <p className="status-message">No orders found for the current selection.</p>
            ) : (
                <div className="table-wrapper">
                    <table className="order-table">
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
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td>**{order.serialNumber}**</td>
                                    <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                    <td>{order.owner}</td>
                                    <td>
                                        <span className={`status-tag status-${order.deliveryStatus.toLowerCase().replace(/\s/g, '-')}`}>
                                            {order.deliveryStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="action-btn edit-btn"
                                            onClick={() => handleEditClick(order)}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            className="action-btn delete-btn"
                                            onClick={() => handleDelete(order._id, order.serialNumber)}
                                        >
                                            Delete
                                        </button>
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