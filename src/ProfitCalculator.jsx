// ProfitCalculator.jsx - Profit calculation system for different stores

import React, { useState } from 'react';

function ProfitCalculator() {
    const [selectedStore, setSelectedStore] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        itemName: '',
        realPrice: '',
        deliveryCharges: '',
        deliveredOrders: ''
    });
    const [result, setResult] = useState(null);

    const stores = [
        { id: 'metro', name: 'Metro Hardware Store', color: '#e11d48' },
        { id: 'emirate', name: 'Emirate Essentials', color: '#2563eb' },
        { id: 'habibi', name: 'Habibi Tools', color: '#16a34a' },
        { id: 'ahsan', name: 'Ahsan Store', color: '#dc2626' },
        { id: 'wahab', name: 'Wahab Business', color: '#7c3aed' }
    ];

    const handleStoreSelect = (store) => {
        setSelectedStore(store);
        setShowForm(true);
        setResult(null);
        setFormData({
            itemName: '',
            realPrice: '',
            deliveryCharges: '',
            deliveredOrders: ''
        });
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const calculateProfit = () => {
        const { realPrice, deliveryCharges, deliveredOrders } = formData;
        
        if (!realPrice || !deliveryCharges || !deliveredOrders) {
            alert('Please fill all fields');
            return;
        }

        const realPriceNum = parseFloat(realPrice);
        const deliveryChargesNum = parseFloat(deliveryCharges);
        const deliveredOrdersNum = parseInt(deliveredOrders);

        // Profit calculation: (Real Price + Delivery Charges) × Number of Delivered Orders
        const totalProfit = (realPriceNum + deliveryChargesNum) * deliveredOrdersNum;

        setResult({
            itemName: formData.itemName,
            storeName: stores.find(s => s.id === selectedStore.id)?.name,
            realPrice: realPriceNum,
            deliveryCharges: deliveryChargesNum,
            deliveredOrders: deliveredOrdersNum,
            totalProfit: totalProfit,
            profitPerOrder: realPriceNum + deliveryChargesNum
        });
    };

    const resetCalculator = () => {
        setSelectedStore('');
        setShowForm(false);
        setResult(null);
        setFormData({
            itemName: '',
            realPrice: '',
            deliveryCharges: '',
            deliveredOrders: ''
        });
    };

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            {/* Header */}
            <div style={{ 
                textAlign: 'center', 
                marginBottom: '40px',
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                color: 'white',
                padding: '30px',
                borderRadius: '16px'
            }}>
                <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '700' }}>
                    Profit Calculator
                </h1>
                <p style={{ margin: '10px 0 0', opacity: 0.9, fontSize: '16px' }}>
                    Calculate profits for different stores in AED
                </p>
            </div>

            {/* Store Selection */}
            {!showForm && (
                <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ 
                        textAlign: 'center', 
                        marginBottom: '30px', 
                        color: '#1f2937', 
                        fontSize: '24px' 
                    }}>
                        Select Store
                    </h2>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '20px'
                    }}>
                        {stores.map(store => (
                            <button
                                key={store.id}
                                onClick={() => handleStoreSelect(store)}
                                style={{
                                    background: `linear-gradient(135deg, ${store.color}15 0%, ${store.color}25 100%)`,
                                    border: `2px solid ${store.color}`,
                                    borderRadius: '12px',
                                    padding: '24px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    textAlign: 'center'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-4px)';
                                    e.target.style.boxShadow = `0 12px 30px ${store.color}40`;
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    background: store.color,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px',
                                    color: 'white',
                                    fontSize: '24px',
                                    fontWeight: 'bold'
                                }}>
                                    {store.name.charAt(0)}
                                </div>
                                <h3 style={{ 
                                    margin: 0, 
                                    color: store.color, 
                                    fontSize: '18px',
                                    fontWeight: '600'
                                }}>
                                    {store.name}
                                </h3>
                                <p style={{ 
                                    margin: '8px 0 0', 
                                    color: '#6b7280', 
                                    fontSize: '14px' 
                                }}>
                                    Calculate profit for {store.name.toLowerCase()}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Profit Form */}
            {showForm && !result && (
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '32px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    border: `3px solid ${selectedStore.color}20`
                }}>
                    <div style={{ 
                        textAlign: 'center', 
                        marginBottom: '30px',
                        paddingBottom: '20px',
                        borderBottom: `2px solid ${selectedStore.color}20`
                    }}>
                        <h2 style={{ 
                            margin: 0, 
                            color: selectedStore.color,
                            fontSize: '24px',
                            fontWeight: '600'
                        }}>
                            {selectedStore.name} - Profit Calculator
                        </h2>
                    </div>

                    <div style={{ display: 'grid', gap: '24px' }}>
                        {/* Item Name */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '500',
                                color: '#374151'
                            }}>
                                Item Name
                            </label>
                            <input
                                type="text"
                                value={formData.itemName}
                                onChange={(e) => handleInputChange('itemName', e.target.value)}
                                placeholder="Enter item name"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = selectedStore.color}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            />
                        </div>

                        {/* Real Price */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '500',
                                color: '#374151'
                            }}>
                                Real Price per Item (AED)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.realPrice}
                                onChange={(e) => handleInputChange('realPrice', e.target.value)}
                                placeholder="Enter real price in AED"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = selectedStore.color}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            />
                        </div>

                        {/* Delivery Charges */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '500',
                                color: '#374151'
                            }}>
                                Delivery Charges per Order (AED)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.deliveryCharges}
                                onChange={(e) => handleInputChange('deliveryCharges', e.target.value)}
                                placeholder="Enter delivery charges in AED"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = selectedStore.color}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            />
                        </div>

                        {/* Number of Delivered Orders */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '500',
                                color: '#374151'
                            }}>
                                Number of Delivered Orders
                            </label>
                            <input
                                type="number"
                                value={formData.deliveredOrders}
                                onChange={(e) => handleInputChange('deliveredOrders', e.target.value)}
                                placeholder="Enter number of delivered orders"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = selectedStore.color}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            />
                        </div>

                        {/* Buttons */}
                        <div style={{ 
                            display: 'flex', 
                            gap: '16px', 
                            justifyContent: 'center',
                            marginTop: '20px'
                        }}>
                            <button
                                onClick={calculateProfit}
                                style={{
                                    background: `linear-gradient(135deg, ${selectedStore.color} 0%, ${selectedStore.color}dd 100%)`,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '14px 28px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = `0 8px 20px ${selectedStore.color}40`;
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                Calculate Profit
                            </button>
                            
                            <button
                                onClick={resetCalculator}
                                style={{
                                    background: 'white',
                                    color: '#6b7280',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '14px 28px',
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.borderColor = '#9ca3af';
                                    e.target.style.color = '#374151';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                    e.target.style.color = '#6b7280';
                                }}
                            >
                                Back to Stores
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            {result && (
                <div style={{
                    background: `linear-gradient(135deg, ${selectedStore.color}10 0%, ${selectedStore.color}20 100%)`,
                    borderRadius: '16px',
                    padding: '32px',
                    border: `3px solid ${selectedStore.color}40`
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <h2 style={{ 
                            margin: 0, 
                            color: selectedStore.color,
                            fontSize: '28px',
                            fontWeight: '700'
                        }}>
                            Profit Calculation Results
                        </h2>
                        <p style={{ 
                            margin: '8px 0 0', 
                            color: '#6b7280', 
                            fontSize: '16px' 
                        }}>
                            {result.storeName} - {result.itemName}
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '20px',
                        marginBottom: '30px'
                    }}>
                        <div style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '12px',
                            textAlign: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                                REAL PRICE
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: selectedStore.color }}>
                                {result.realPrice.toFixed(2)} AED
                            </div>
                        </div>

                        <div style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '12px',
                            textAlign: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                                DELIVERY CHARGES
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: selectedStore.color }}>
                                {result.deliveryCharges.toFixed(2)} AED
                            </div>
                        </div>

                        <div style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '12px',
                            textAlign: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                                DELIVERED ORDERS
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: selectedStore.color }}>
                                {result.deliveredOrders}
                            </div>
                        </div>

                        <div style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '12px',
                            textAlign: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                                PROFIT PER ORDER
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: selectedStore.color }}>
                                {result.profitPerOrder.toFixed(2)} AED
                            </div>
                        </div>
                    </div>

                    {/* Total Profit Highlight */}
                    <div style={{
                        background: `linear-gradient(135deg, ${selectedStore.color} 0%, ${selectedStore.color}dd 100%)`,
                        color: 'white',
                        padding: '30px',
                        borderRadius: '16px',
                        textAlign: 'center',
                        marginBottom: '30px'
                    }}>
                        <div style={{ fontSize: '18px', opacity: 0.9, marginBottom: '8px' }}>
                            TOTAL PROFIT
                        </div>
                        <div style={{ fontSize: '48px', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                            {result.totalProfit.toFixed(2)} AED
                        </div>
                        <div style={{ fontSize: '16px', opacity: 0.8, marginTop: '8px' }}>
                            ({result.profitPerOrder.toFixed(2)} AED × {result.deliveredOrders} orders)
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ 
                        display: 'flex', 
                        gap: '16px', 
                        justifyContent: 'center' 
                    }}>
                        <button
                            onClick={() => {
                                setResult(null);
                                setFormData({
                                    itemName: '',
                                    realPrice: '',
                                    deliveryCharges: '',
                                    deliveredOrders: ''
                                });
                            }}
                            style={{
                                background: 'white',
                                color: selectedStore.color,
                                border: `2px solid ${selectedStore.color}`,
                                borderRadius: '8px',
                                padding: '12px 24px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Calculate Again
                        </button>
                        
                        <button
                            onClick={resetCalculator}
                            style={{
                                background: 'white',
                                color: '#6b7280',
                                border: '2px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '12px 24px',
                                fontSize: '16px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Back to Stores
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProfitCalculator;