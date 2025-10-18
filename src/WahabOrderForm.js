// WahabOrderForm.js - Exclusive form for Wahab orders

import React, { useState } from 'react';
import axios from 'axios';

// API URL same as main OrderForm
const API_URL = 'https://order-b.vercel.app/api/orders';

function WahabOrderForm({ onOrderAdded }) {
    const [serialNumber, setSerialNumber] = useState('');
    const [orderDate, setOrderDate] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Fixed owner as "Wahab"
    const owner = 'Wahab';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        try {
            const newOrder = { serialNumber, owner, orderDate };
            await axios.post(API_URL, newOrder);
            
            setMessage(`✅ Wahab Order ${serialNumber} added successfully!`);
            
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
        <div className="form-container compact">
            <h3>🏷️ Add Wahab Order</h3>
            <p className="form-subtle">Exclusive entry for Wahab orders</p>
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="input-group">
                        <label>Serial Number (Unique):</label>
                        <input 
                            type="text" 
                            placeholder="Serial Number for Wahab" 
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
                        <input 
                            type="text" 
                            value={owner} 
                            readOnly 
                            style={{ 
                                backgroundColor: '#f0f0f0', 
                                cursor: 'not-allowed',
                                fontWeight: 'bold',
                                color: '#2563eb'
                            }} 
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="submit" 
                        className={`action-btn add-btn ${loading ? 'loading' : ''}`} 
                        disabled={loading}
                    >
                        {loading ? '' : '🏷️ Add Wahab Order'}
                    </button>
                </div>
            </form>
            {message && <p className={`form-message ${message.startsWith('❌') ? 'error-message' : ''}`}>{message}</p>}
        </div>
    );
}

export default WahabOrderForm;