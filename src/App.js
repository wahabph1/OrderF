// Frontend/src/App.js

import './App.css'; 
import React, { useState } from 'react'; // <--- useState import kiya
import OrderTable from '../src/OrderTable'; 
import Footer from '../src/Footer'; 
import Navbar from '../src/Navbar';
import SplashScreen from '../src/SplashScreen';
import OrderForm from '../src/OrderForm';
import Reports from '../src/Reports';
import Profile from '../src/Profile';
import WahabOrderTable from '../src/WahabOrderTable'; // Wahab component import

function App() {
    // Splash screen state
    const [showSplash, setShowSplash] = useState(true);
    
    // App open hone par sirf Add Order form dikhana hai
    const [currentView, setCurrentView] = useState('addOrder'); 

    // Function jo view change karega
    const handleNavClick = (view) => {
        setCurrentView(view);
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
            
        </div>
    );
}

export default App;
