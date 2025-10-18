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
import ProfitCalculator from '../src/ProfitCalculator'; // Profit Calculator

function App() {
    // Splash screen state
    const [showSplash, setShowSplash] = useState(true);
    
    // App open hone par sirf Add Order form dikhana hai
    const [currentView, setCurrentView] = useState('addOrder');
    
    // Wahab authentication states
    const [showWahabLogin, setShowWahabLogin] = useState(false);
    const [wahabAuthenticated, setWahabAuthenticated] = useState(false);
    
    // No persistent authentication - always require login after refresh
    // Reset to addOrder if trying to access wahabOrders without authentication
    useEffect(() => {
        if (currentView === 'wahabOrders' && !wahabAuthenticated) {
            setCurrentView('addOrder');
        }
    }, [currentView, wahabAuthenticated]);
    
    // Function jo view change karega
    const handleNavClick = (view) => {
        // Check if trying to access Wahab Orders
        if (view === 'wahabOrders') {
            // Always require authentication for Wahab Orders
            if (wahabAuthenticated) {
                setCurrentView(view);
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
                ) : currentView === 'profitCalculator' ? (
                    <ProfitCalculator />
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
