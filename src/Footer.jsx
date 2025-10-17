// Frontend/src/components/Footer.jsx
import React from 'react';

function Footer() {
    const developerName = "Abdul Wahab Shaikh";
    const contactEmail = "aw599822@gmail.com";

    return (
        <footer style={footerStyle}>
            <div style={containerStyle}>
                <p style={titleStyle}>Order Tracking System (OTS)</p>

                <p style={detailStyle}>Developed by: <strong>{developerName}</strong></p>

                <p style={detailStyle}>
                    Contact: <a href={`mailto:${contactEmail}`} style={linkStyle}>{contactEmail}</a>
                </p>

                <p style={copyrightStyle}>
                    &copy; {new Date().getFullYear()} All rights reserved.
                </p>
            </div>
        </footer>
    );
}

// Inline CSS
const footerStyle = {
    background: 'linear-gradient(135deg, #1e293b, #111827)', // subtle dark gradient
    color: '#f8f9fa',
    padding: '30px 20px',
    marginTop: '50px',
    borderTop: '5px solid #2563eb', // blue top border
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
    color: '#38bdf8', // bright blue for title
};

const detailStyle = {
    margin: '6px 0',
    fontSize: '0.95em',
};

const linkStyle = {
    color: '#60a5fa',
    textDecoration: 'none',
    transition: 'color 0.3s',
    fontWeight: '500',
};

const copyrightStyle = {
    marginTop: '18px',
    fontSize: '0.8em',
    color: '#94a3b8', // subtle gray
};

// Add hover effect for link
linkStyle[':hover'] = {
    color: '#38bdf8',
};

export default Footer;
