// Frontend/src/components/EditOrderModal.jsx
import React, { useState } from 'react';
import axios from 'axios';

// ✅ Correct deployed backend URL
const API_URL = 'https://order-b.vercel.app/api/orders';

function EditOrderModal({ order, onClose, onOrderUpdated }) {
    const statusOptions = ['Pending', 'In Transit', 'Delivered', 'Cancelled'];
    const ownerOptions = ['Emirate Essentials', 'Ahsan', 'Habibi Tools'];

    const [formData, setFormData] = useState({
        serialNumber: order.serialNumber,
        orderDate: new Date(order.orderDate).toISOString().split('T')[0],
        deliveryStatus: order.deliveryStatus,
        owner: order.owner,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
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
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white', padding: '2rem', borderRadius: '12px',
                maxWidth: '500px', width: '90%', position: 'relative', boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b'
                }}>&times;</button>

                <h3>Edit Order: {order.serialNumber}</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label>Serial Number:</label>
                        <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} required style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}/>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label>Order Date:</label>
                        <input type="date" name="orderDate" value={formData.orderDate} onChange={handleChange} required style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}/>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label>Delivery Status:</label>
                        <select name="deliveryStatus" value={formData.deliveryStatus} onChange={handleChange} required style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                            {statusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label>Owner:</label>
                        <select name="owner" value={formData.owner} onChange={handleChange} required style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                            {ownerOptions.map(owner => <option key={owner} value={owner}>{owner}</option>)}
                        </select>
                    </div>

                    <button type="submit" disabled={loading} style={{
                        backgroundColor: '#3b82f6', color: 'white', padding: '0.6rem',
                        border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                    }}>{loading ? 'Updating...' : 'Save Changes'}</button>

                    {error && <p style={{ color: '#dc2626', fontWeight: 600 }}>{error}</p>}
                </form>
            </div>
        </div>
    );
}

export default EditOrderModal;
