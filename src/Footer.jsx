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
                <p style={titleStyle}>Order Tracking System (OTS)</p>

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
    background: 'linear-gradient(135deg, #1e293b, #111827)',
    color: '#f8f9fa',
    padding: '30px 20px',
    marginTop: '50px',
    borderTop: '5px solid #2563eb',
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
    color: '#38bdf8',
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
    color: '#60a5fa',
    textDecoration: 'none',
    fontSize: '0.9em',
    fontWeight: '500',
    transition: 'color 0.3s',
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
