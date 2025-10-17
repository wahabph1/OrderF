// Frontend/src/components/Footer.jsx

import React from 'react';

function Footer() {
    // Apne hisaab se details change kar lein
    const developerName = "Abdul wahab shaikh"; 
    const contactEmail = "aw599822@gmail.com";
    // const githubLink = "https://github.com/YourUsername";

    return (
        <footer style={footerStyle}>
            <div style={containerStyle}>
                <p style={textStyle}>
                    Order Tracking System (OTS)
                </p>
                <p style={detailStyle}>
                    Developed by: **{developerName}**
                </p>
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

// Simple Inline CSS for the Footer
const footerStyle = {
    backgroundColor: '#333',
    color: 'white',
    padding: '20px 0',
    marginTop: '50px', // Content aur footer ke beech space dene ke liye
    borderTop: '5px solid #007bff',
};

const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center',
};

const textStyle = {
    fontSize: '1.2em',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#007bff', // Title ko blue colour diya
};

const detailStyle = {
    margin: '5px 0',
    fontSize: '0.9em',
};

const linkStyle = {
    color: '#f8f9fa',
    textDecoration: 'none',
    transition: 'color 0.3s',
};

const copyrightStyle = {
    marginTop: '15px',
    fontSize: '0.8em',
    color: '#ccc',
};

export default Footer;