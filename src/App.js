// Frontend/src/App.js

import './App.css'; 
import React, { useState } from 'react'; // <--- useState import kiya
import OrderTable from '../src/OrderTable'; 
import Footer from '../src/Footer'; 
import Navbar from '../src/Navbar'; 

function App() {
    // NEW STATE: Yeh decide karega ki kaunsa view dikhana hai
    // Default 'dashboard' hoga. 'addOrder' form dikhane ke liye
    const [currentView, setCurrentView] = useState('dashboard'); 

    // Function jo view change karega
    const handleNavClick = (view) => {
        setCurrentView(view);
    };

    return (
        <div className="App">
            
            {/* 1. Navigation Bar: setCurrentView function pass kiya */}
            <Navbar onNavClick={handleNavClick} currentView={currentView} />

            {/* 2. Main Content */}
            <main>
                {currentView === 'dashboard' ? (
                    // Dashboard view mein OrderTable dikhega (jismein form bhi hai)
                    <OrderTable /> 
                ) : (
                    // Agar future mein aap form ko OrderTable se alag karna chahte hain, toh yahan dikha sakte hain
                    // Filhal, hum OrderTable ko hi use karenge jahan form aur table dono hain.
                    // Par agar aap form ko hide karna chahte hain toh agla step dekhein.
                    <OrderTable /> 
                )}
            </main>
            
            {/* 3. Footer */}
            <Footer />
            
        </div>
    );
}

export default App;