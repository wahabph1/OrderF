// Frontend/src/components/EditOrderModal.jsx (UPDATED - Full Edit & CSS Classes)

import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/orders';

function EditOrderModal({ order, onClose, onOrderUpdated }) {
    
    const statusOptions = ['Pending', 'In Transit', 'Delivered', 'Cancelled'];
    const ownerOptions = ['Emirate Essentials', 'Ahsan', 'Habibi Tools'];

    // Serial Number aur Order Date bhi state mein shamil kiye gaye hain
    const [formData, setFormData] = useState({
        serialNumber: order.serialNumber, 
        orderDate: new Date(order.orderDate).toISOString().split('T')[0],
        deliveryStatus: order.deliveryStatus,
        owner: order.owner,
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // PUT Request to update all fields
            const response = await axios.put(`${API_URL}/${order._id}`, formData);
            
            onOrderUpdated(response.data); 
            
            alert(`Order ${formData.serialNumber} successfully updated!`);
            onClose(); 

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update order.');
            console.error('Update error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button onClick={onClose} className="close-btn">&times;</button>
                <h3>Edit Order: {order.serialNumber}</h3>
                
                <form onSubmit={handleSubmit}>
                    
                    {/* 1. Serial Number (Now editable) */}
                    <div className="input-group">
                        <label htmlFor="serialNumber">Serial Number (Unique):</label>
                        <input
                            type="text"
                            name="serialNumber"
                            id="serialNumber"
                            value={formData.serialNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* 2. Order Date (Now editable) */}
                    <div className="input-group">
                        <label htmlFor="orderDate">Order Date:</label>
                        <input
                            type="date"
                            name="orderDate"
                            id="orderDate"
                            value={formData.orderDate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    {/* 3. Delivery Status Change */}
                    <div className="input-group">
                        <label htmlFor="deliveryStatus">Delivery Status:</label>
                        <select
                            name="deliveryStatus"
                            id="deliveryStatus"
                            value={formData.deliveryStatus}
                            onChange={handleChange}
                            required
                        >
                            {statusOptions.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>

                    {/* 4. Owner Change */}
                    <div className="input-group">
                        <label htmlFor="owner">Owner:</label>
                        <select
                            name="owner"
                            id="owner"
                            value={formData.owner}
                            onChange={handleChange}
                            required
                        >
                            {ownerOptions.map(owner => (
                                <option key={owner} value={owner}>{owner}</option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="action-btn save-btn" disabled={loading}>
                        {loading ? 'Updating...' : 'Save Changes'}
                    </button>
                    
                    {error && <p className="error-message">{error}</p>}
                </form>
            </div>
        </div>
    );
}

export default EditOrderModal;