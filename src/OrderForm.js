// Frontend/src/components/OrderForm.jsx (NEW FILE - ADDED)

import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/orders';
const ownerOptions = ['Emirate Essentials', 'Ahsan', 'Habibi Tools'];

function OrderForm({ onOrderAdded }) {
    const [serialNumber, setSerialNumber] = useState('');
    const [orderDate, setOrderDate] = useState('');
    const [owner, setOwner] = useState(ownerOptions[0]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        try {
            const newOrder = { serialNumber, owner, orderDate };
            await axios.post(API_URL, newOrder);
            
            setMessage(`✅ Order ${serialNumber} added successfully!`);
            
            setSerialNumber('');
            setOrderDate('');
            onOrderAdded(); 

        } catch (error) {
            setMessage(`❌ Error: ${error.response?.data?.message || 'Could not connect to server or Serial No. already exists.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h3>➕ Add New Order</h3>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>Serial Number (Unique):</label>
                    <input 
                        type="text" 
                        placeholder="Serial Number" 
                        value={serialNumber} 
                        onChange={(e) => setSerialNumber(e.target.value)} 
                        required 
                    />
                </div>
                
                <div className="input-group">
                    <label>Order Date:</label>
                    <input 
                        type="date" 
                        value={orderDate} 
                        onChange={(e) => setOrderDate(e.target.value)} 
                        required 
                    />
                </div>

                <div className="input-group">
                    <label>Owner:</label>
                    <select value={owner} onChange={(e) => setOwner(e.target.value)} required>
                        {ownerOptions.map(o => (<option key={o} value={o}>{o}</option>))}
                    </select>
                </div>

                <button type="submit" className="action-btn add-btn" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Order'}
                </button>
            </form>
            {message && <p className={`form-message ${message.startsWith('❌') ? 'error-message' : ''}`}>{message}</p>}
        </div>
    );
}

export default OrderForm;