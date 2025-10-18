// Frontend/src/App.js

import './App.css'; 
import React, { useState, useEffect } from 'react'; // <--- useState aur useEffect import kiya
import OrderTable from '../src/OrderTable'; 
import Footer from '../src/Footer'; 
import Navbar from '../src/Navbar';
import SplashScreen from '../src/SplashScreen';
import OrderForm from '../src/OrderForm';
import Reports from '../src/Reports';
import Profile from '../src/Profile';
import WahabOrderTable from '../src/WahabOrderTable'; // Wahab component import
import WahabLogin from '../src/WahabLogin'; // Wahab authentication

function App() {
    // Splash screen state
    const [showSplash, setShowSplash] = useState(true);
    
    // App open hone par sirf Add Order form dikhana hai
    const [currentView, setCurrentView] = useState('addOrder');
    
    // Wahab authentication states
    const [showWahabLogin, setShowWahabLogin] = useState(false);
    const [wahabAuthenticated, setWahabAuthenticated] = useState(false);

    // Check authentication on component mount
    useEffect(() => {
        const isAuthenticated = sessionStorage.getItem('wahabAuthenticated') === 'true';
        setWahabAuthenticated(isAuthenticated);
    }, []);
    
    // Function jo view change karega
    const handleNavClick = (view) => {
        // Check if trying to access Wahab Orders
        if (view === 'wahabOrders') {
            const isAuthenticated = sessionStorage.getItem('wahabAuthenticated') === 'true';
            if (isAuthenticated) {
                setCurrentView(view);
                setWahabAuthenticated(true);
            } else {
                setShowWahabLogin(true);
            }
        } else {
            setCurrentView(view);
        }
    };
    
    // Handle successful Wahab login
    const handleWahabLoginSuccess = () => {
        setWahabAuthenticated(true);
        setCurrentView('wahabOrders');
        setShowWahabLogin(false);
    };
    
    // Handle login modal close
    const handleWahabLoginClose = () => {
        setShowWahabLogin(false);
    };
    
    // Function to handle splash screen end
    const handleSplashEnd = () => {
        setShowSplash(false);
    };

    // Show splash screen first
    if (showSplash) {
        return <SplashScreen onAnimationEnd={handleSplashEnd} />;
    }

    return (
        <div className="App">
            
            {/* 1. Navigation Bar: setCurrentView function pass kiya */}
            <Navbar onNavClick={handleNavClick} currentView={currentView} />

            {/* 2. Main Content */}
            <main>
                {currentView === 'dashboard' ? (
                    <OrderTable />
                ) : currentView === 'reports' ? (
                    <Reports />
                ) : currentView === 'profile' ? (
                    <Profile />
                ) : currentView === 'wahabOrders' ? (
                    <WahabOrderTable />
                ) : (
                    <OrderForm onOrderAdded={() => {}} />
                )}
            </main>
            
            {/* 3. Footer */}
            <Footer />
            
            {/* Wahab Authentication Modal */}
            {showWahabLogin && (
                <WahabLogin 
                    onLoginSuccess={handleWahabLoginSuccess}
                    onClose={handleWahabLoginClose}
                />
            )}
            
        </div>
    );
}

export default App;
