import React, { useState } from 'react';

// Professional, responsive navbar with improved layout and visuals
function Navbar({ onNavClick, currentView }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const projectName = 'TrackMate UAE';

  const toggleMenu = () => setIsMenuOpen((v) => !v);

  const handleNavClick = (view) => {
    onNavClick(view);
    setIsMenuOpen(false);
  };

  return (
    <header className="header" role="banner">
      <div className="navbar-container">
        {/* Brand */}
        <button
          type="button"
          className="brand"
          onClick={() => handleNavClick('dashboard')}
          aria-label={`${projectName} home`}
        >
          <span className="brand-logo" aria-hidden>TM</span>
          <span className="brand-name">{projectName}</span>
        </button>

        {/* Mobile menu toggle */}
        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          type="button"
        >
          {isMenuOpen ? (
            <span className="close-icon" aria-hidden>&times;</span>
          ) : (
            <span className="hamburger-icon" aria-hidden>&#9776;</span>
          )}
        </button>

        {/* Primary nav */}
        <nav
          id="primary-navigation"
          className={`nav-links ${isMenuOpen ? 'open' : ''}`}
          aria-label="Primary"
        >
          <button
            type="button"
            className={currentView === 'dashboard' ? 'nav-link active' : 'nav-link'}
            onClick={() => handleNavClick('dashboard')}
          >
            Dashboard
          </button>

          <button
            type="button"
            className={currentView === 'reports' ? 'nav-link active' : 'nav-link'}
            onClick={() => handleNavClick('reports')}
          >
            Reports
          </button>

          <button
            type="button"
            className={
              currentView === 'addOrder' ? 'nav-link primary active' : 'nav-link primary'
            }
            onClick={() => handleNavClick('addOrder')}
          >
            Add Order
          </button>

          <button
            type="button"
            className={currentView === 'profile' ? 'nav-link active' : 'nav-link'}
            onClick={() => handleNavClick('profile')}
          >
            Profile
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
