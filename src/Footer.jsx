// Frontend/src/components/Footer.jsx
import React from 'react';

function Footer() {
    const developerName = "Abdul Wahab Shaikh";
    const contactEmail = "aw599822@gmail.com";
    const githubLink = "https://github.com/YourUsername"; // replace with your GitHub
    const linkedinLink = "https://www.linkedin.com/in/yourprofile"; // replace with your LinkedIn

    return (
        <footer style={footerStyle}>
            <div style={containerStyle}>
                <p style={titleStyle}>TrackMate UAE</p>

                <p style={detailStyle}>Developed by: <strong>{developerName}</strong></p>

                <p style={detailStyle}>
                    Contact: <a href={`mailto:${contactEmail}`} style={linkStyle}>{contactEmail}</a>
                </p>

                {/* Social Icons */}
                <div style={socialContainer}>
                    <a href={githubLink} target="_blank" rel="noopener noreferrer" style={socialLink}>
                        &#xf09b; {/* GitHub icon (Font Awesome unicode) */}
                        <span style={socialText}>GitHub</span>
                    </a>
                    <a href={linkedinLink} target="_blank" rel="noopener noreferrer" style={socialLink}>
                        &#xf08c; {/* LinkedIn icon */}
                        <span style={socialText}>LinkedIn</span>
                    </a>
                </div>

                <p style={copyrightStyle}>
                    &copy; {new Date().getFullYear()} All rights reserved.
                </p>
            </div>
        </footer>
    );
}

// Inline CSS
const footerStyle = {
    background: 'linear-gradient(135deg, #0f0c29 0%, #24243e 50%, #302b63 100%)',
    color: '#f8f9fa',
    padding: '30px 20px',
    marginTop: '50px',
    borderTop: '3px solid transparent',
    borderImage: 'linear-gradient(90deg, #ffd700, #ff6b35) 1',
    boxShadow: '0 -8px 25px rgba(15, 12, 41, 0.6), 0 -2px 10px rgba(255, 215, 0, 0.1)',
};

const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center',
};

const titleStyle = {
    fontSize: '1.4em',
    fontWeight: '700',
    marginBottom: '12px',
    background: 'linear-gradient(45deg, #ffd700, #ff6b35, #f7931e)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
};

const detailStyle = {
    margin: '6px 0',
    fontSize: '0.95em',
};

const linkStyle = {
    color: '#ffd700',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    fontWeight: '500',
    position: 'relative',
    textShadow: '0 0 10px rgba(255, 215, 0, 0.3)',
};

const socialContainer = {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginTop: '15px',
    flexWrap: 'wrap',
};

const socialLink = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: '#ffd700',
    textDecoration: 'none',
    fontSize: '0.9em',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    padding: '8px 12px',
    borderRadius: '20px',
    background: 'rgba(255, 215, 0, 0.1)',
    border: '1px solid rgba(255, 215, 0, 0.2)',
    textShadow: '0 0 10px rgba(255, 215, 0, 0.3)',
};

const socialText = {
    display: 'inline',
};

const copyrightStyle = {
    marginTop: '18px',
    fontSize: '0.8em',
    color: '#94a3b8',
};

export default Footer;
