// Frontend/src/components/Navbar.jsx (UPDATED - With Hamburger Menu Logic)

import React, { useState } from 'react';

// Props: onNavClick (view change) aur currentView (active link highlight ke liye)
function Navbar({ onNavClick, currentView }) { 
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const projectName = "Order Tracking System ny wahab (OTS)";

    // Menu toggle function
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Nav link click hone par menu band ho jaaye aur view change ho jaaye
    const handleNavClick = (view) => {
        onNavClick(view);
        setIsMenuOpen(false); // Menu close karo
    };

    return (
        <header className="header">
            <div className="navbar-container">
                
                {/* Project Title / Brand Name */}
                <div className="brand-name">{projectName}</div>

                {/* Hamburger Icon (Mobile Only) */}
                <button className="menu-toggle" onClick={toggleMenu}>
                    {/* Unicode Hamburger Icon or simple X */}
                    {isMenuOpen ? (
                        <span className="close-icon">&times;</span> 
                    ) : (
                        <span className="hamburger-icon">&#9776;</span>
                    )}
                </button>

                {/* Navigation Links */}
                <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
                    
                    <a 
                        href="#" 
                        className={currentView === 'dashboard' ? 'nav-link active' : 'nav-link'}
                        onClick={() => handleNavClick('dashboard')} 
                    >
                        Dashboard
                    </a>
                    
                    <a 
                        href="#" 
                        className="nav-link" 
                        onClick={() => handleNavClick('dashboard')} 
                    >
                        Add Order
                    </a>
                    
                    <a href="#" className="nav-link">Reports</a> 
                    <a href="#" className="nav-link">Profile</a>
                </nav>
            </div>
        </header>
    );
}

export default Navbar;