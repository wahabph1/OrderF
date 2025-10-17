// Frontend/src/components/Navbar.jsx (Updated with inline modern styling)

import React, { useState } from 'react';

function Navbar({ onNavClick, currentView }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const projectName = "Order Tracking System by Wahab (OTS)";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = (view) => {
    onNavClick(view);
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: 'Dashboard', view: 'dashboard' },
    { name: 'Add Order', view: 'addOrder' },
    { name: 'Reports', view: 'reports' },
    { name: 'Profile', view: 'profile' },
  ];

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <div style={brandStyle}>{projectName}</div>

        <button onClick={toggleMenu} style={hamburgerStyle}>
          {isMenuOpen ? <span style={hamburgerIcon}>&times;</span> : <span style={hamburgerIcon}>&#9776;</span>}
        </button>

        <nav style={{ ...navStyle, ...(isMenuOpen ? navOpenStyle : {}) }}>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href="#"
              onClick={() => handleNavClick(link.view)}
              style={currentView === link.view ? { ...linkStyle, ...activeLinkStyle } : linkStyle}
            >
              {link.name}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

// Inline Styles
const headerStyle = {
  background: 'linear-gradient(90deg, #1e3a8a, #2563eb)',
  color: 'white',
  padding: '12px 20px',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
};

const containerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  maxWidth: '1200px',
  margin: '0 auto',
};

const brandStyle = {
  fontSize: '1.4rem',
  fontWeight: '700',
  color: '#facc15',
};

const navStyle = {
  display: 'flex',
  gap: '20px',
  alignItems: 'center',
};

const navOpenStyle = {
  flexDirection: 'column',
  position: 'absolute',
  top: '60px',
  left: 0,
  width: '100%',
  background: '#1e3a8a',
  padding: '15px 0',
};

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  fontWeight: '500',
  fontSize: '1rem',
  padding: '6px 10px',
  transition: 'all 0.3s',
};

const activeLinkStyle = {
  borderBottom: '2px solid #facc15',
  color: '#facc15',
};

const hamburgerStyle = {
  display: 'none', // hide by default
  background: 'none',
  border: 'none',
  fontSize: '1.8rem',
  color: 'white',
  cursor: 'pointer',
};

const hamburgerIcon = {
  fontSize: '1.8rem',
};

// Media Query Simulation for Inline CSS (for mobile < 768px)
if (typeof window !== 'undefined' && window.innerWidth < 768) {
  hamburgerStyle.display = 'block';
  navStyle.display = 'none';
}

export default Navbar;
