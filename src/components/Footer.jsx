import React from 'react';

export default function Footer({ setActiveView }) {
  return (
    <footer id="client-footer" className="site-footer">
      <div className="container">
        
        {/* Top Section: Multi-Column Grid */}
        <div className="footer-grid">
          
          {/* Column 1: Brand & Contact Info */}
          <div className="footer-column">
            <div className="footer-logo-box">
              <a href="#home" className="footer-logo" onClick={(e) => {
                e.preventDefault();
                setActiveView('home');
              }}>
                <span className="logo-light">Build</span><span className="logo-accent">_Trust</span>
              </a>
            </div>
            <p className="footer-desc">
              India's premier marketplace connecting verified skilled construction specialists and contractors with project managers and homeowners.
            </p>
            <div className="footer-contact-info">
              <div className="contact-detail-item">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <span>contact@buildtrust.in</span>
              </div>
              <div className="contact-detail-item">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.57a1 1 0 0 0-1.01.24l-2.2 2.2a15.045 15.045 0 0 1-6.59-6.59l2.2-2.2a1 1 0 0 0 .24-1.01c-.38-1.11-.57-2.3-.57-3.53 0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/>
                </svg>
                <span>+91 120 4567890</span>
              </div>
              <div className="contact-detail-item">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span>Sector 62, Noida, Uttar Pradesh, India</span>
              </div>
            </div>
          </div>

          {/* Column 2: Core Services */}
          <div className="footer-column">
            <h3>Core Services</h3>
            <ul className="footer-list">
              <li><a href="#search" onClick={(e) => { e.preventDefault(); setActiveView('search'); }}>Masonry & Stonework</a></li>
              <li><a href="#search" onClick={(e) => { e.preventDefault(); setActiveView('search'); }}>Electrical installations</a></li>
              <li><a href="#search" onClick={(e) => { e.preventDefault(); setActiveView('search'); }}>Interior & Exterior Painting</a></li>
              <li><a href="#search" onClick={(e) => { e.preventDefault(); setActiveView('search'); }}>Plumbing & Fixtures</a></li>
              <li><a href="#search" onClick={(e) => { e.preventDefault(); setActiveView('search'); }}>General Contracting</a></li>
            </ul>
          </div>

          {/* Column 3: Navigation */}
          <div className="footer-column">
            <h3>Navigation</h3>
            <ul className="footer-list">
              <li><a href="#home" onClick={(e) => { e.preventDefault(); setActiveView('home'); }}>Home</a></li>
              <li><a href="#search" onClick={(e) => { e.preventDefault(); setActiveView('search'); }}>Find Specialists</a></li>
              <li><a href="#search" onClick={(e) => { e.preventDefault(); setActiveView('search'); }}>AI Cost Estimator</a></li>
              <li><a href="#admin" onClick={(e) => { e.preventDefault(); setActiveView('admin'); }}>Admin Portal</a></li>
              <li><a href="#home" onClick={(e) => { e.preventDefault(); setActiveView('home'); }}>Support Center</a></li>
            </ul>
          </div>

          {/* Column 4: Trust & Compliance */}
          <div className="footer-column">
            <h3>Trust & Security</h3>
            <ul className="footer-list">
              <li><a href="#" onClick={(e) => e.preventDefault()}>Payment Protection</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Verification Standards</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Quality Guarantee</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Section: Copyright & Socials */}
        <div className="footer-bottom">
          <span className="copyright">
            © 2026 Build_Trust Marketplace. All rights reserved.
          </span>
          <div className="footer-socials">
            <a href="#" className="social-icon" title="Share" onClick={(e) => e.preventDefault()}>
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/>
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
