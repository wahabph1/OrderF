import React from 'react';

function Footer() {
  const projectName = 'TrackMate UAE';
  const developerName = 'Abdul Wahab Shaikh';
  const contactEmail = 'aw599822@gmail.com';
  const githubLink = 'https://github.com/YourUsername';
  const linkedinLink = 'https://www.linkedin.com/in/yourprofile';
  const xLink = 'https://x.com/yourhandle';

  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-cta">
        <h3 className="footer-cta-title">Ready to streamline your orders?</h3>
        <a className="cta-btn" href="#add-order">Add Order</a>
      </div>
      <div className="footer-top">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="brand-row">
              <span className="f-brand-logo" aria-hidden>TM</span>
              <span className="f-brand-name">{projectName}</span>
            </div>
            <p className="footer-desc">
              Modern order tracking for SMEs in UAE. Fast, reliable, and simple to use.
            </p>
          </div>

          {/* Quick Links */}
          <nav className="footer-links" aria-label="Quick Links">
            <h4 className="footer-title">Quick Links</h4>
            <ul>
              <li><a href="#dashboard">Dashboard</a></li>
              <li><a href="#reports">Reports</a></li>
              <li><a href="#add-order">Add Order</a></li>
              <li><a href="#profile">Profile</a></li>
            </ul>
          </nav>

          {/* Contact */}
          <div className="footer-contact">
            <h4 className="footer-title">Contact</h4>
            <ul>
              <li><a href={`mailto:${contactEmail}`}>{contactEmail}</a></li>
              <li>Developer: {developerName}</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-newsletter">
            <h4 className="footer-title">Subscribe</h4>
            <p className="footer-desc">Get occasional updates and tips. No spam.</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Your email" aria-label="Email address" />
              <button type="button" className="newsletter-btn">Subscribe</button>
            </form>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="copyright">
          © {year} {projectName}. All rights reserved.
        </p>
        <ul className="social-links" aria-label="Social media">
          <li>
            <a href={githubLink} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
                <path d="M12 2a10 10 0 0 0-3.162 19.496c.5.092.683-.216.683-.48 0-.237-.01-1.024-.015-1.86-2.78.604-3.366-1.19-3.366-1.19-.455-1.157-1.11-1.466-1.11-1.466-.907-.62.07-.608.07-.608 1.003.07 1.53 1.03 1.53 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.087.636-1.337-2.22-.253-4.555-1.11-4.555-4.944 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.203 2.397.1 2.65.64.699 1.028 1.592 1.028 2.683 0 3.842-2.338 4.688-4.566 4.937.36.31.68.92.68 1.855 0 1.338-.012 2.417-.012 2.744 0 .266.18.577.688.479A10.002 10.002 0 0 0 12 2z"/>
              </svg>
            </a>
          </li>
          <li>
            <a href={linkedinLink} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
                <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V23h-4V8zm7.5 0h3.8v2.05h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V23h-4v-6.7c0-1.6-.03-3.65-2.22-3.65-2.23 0-2.57 1.74-2.57 3.54V23h-4V8z"/>
              </svg>
            </a>
          </li>
          <li>
            <a href={xLink} target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
                <path d="M18.244 2H21l-6.743 7.71L22 22h-6.906l-4.57-6.006L4.9 22H2.14l7.2-8.23L2 2h6.97l4.13 5.59L18.245 2zM8.03 3.65H5.32l10.73 14.67h2.77L8.03 3.65z"/>
              </svg>
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
