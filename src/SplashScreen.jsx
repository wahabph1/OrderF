import React, { useEffect } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onAnimationEnd }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationEnd();
    }, 3500); // Animation duration

    return () => clearTimeout(timer);
  }, [onAnimationEnd]);

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="logo-container">
          <div className="logo-text">
            <span className="track">Track</span>
            <span className="mate">Mate</span>
          </div>
          <div className="uae-text">UAE</div>
        </div>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;