import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Header({ 
  activeView, 
  setActiveView, 
  currentLocation, 
  setCurrentLocation, 
  onOpenLogin,
  onOpenAiTool,
  isLoggedIn,
  currentUser
}) {
  const [locDropdownOpen, setLocDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const indianLocations = [
    "Greater Noida",
    "Noida",
    "Delhi NCR",
    "Mumbai",
    "Bangalore",
    "Pune"
  ];

  const handleLocationChange = (loc) => {
    setCurrentLocation(loc);
    setLocDropdownOpen(false);
    const event = new CustomEvent('show-toast', { detail: { message: `Location switched to: ${loc}.`, type: 'info' } });
    window.dispatchEvent(event);
  };

  const handleScrollToServices = (e) => {
    e.preventDefault();
    setActiveView('home');
    setTimeout(() => {
      const el = document.getElementById('services-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            <span className="logo-bold">Build</span><span className="logo-accent">_Trust</span>
          </Link>
          
          <div 
            className="location-selector" 
            onClick={() => setLocDropdownOpen(!locDropdownOpen)}
            onMouseLeave={() => setLocDropdownOpen(false)}
          >
            <svg className="icon-location" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span>{currentLocation}</span>
            <svg className="icon-chevron" viewBox="0 0 24 24" width="12" height="12">
              <path fill="currentColor" d="M7 10l5 5 5-5z"/>
            </svg>

            {locDropdownOpen && (
              <div className="dropdown-menu" style={{ display: 'block', opacity: 1, visibility: 'visible', transform: 'translateY(0)' }}>
                {indianLocations.map(loc => (
                  <button 
                    key={loc} 
                    className={`dropdown-item ${currentLocation === loc ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLocationChange(loc);
                    }}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <nav className="header-nav">
          <Link 
            to="/" 
            className={`nav-link ${activeView === 'home' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/search" 
            className={`nav-link ${activeView === 'search' ? 'active' : ''}`}
          >
            Find Workers
          </Link>
          {/* AI Estimator Button Styled as Link */}
          <button 
            className="nav-link btn-ai-nav" 
            onClick={onOpenAiTool}
          >
            AI Estimator
          </button>
          <a 
            href="#services" 
            className="nav-link"
            onClick={handleScrollToServices}
          >
            Services
          </a>
          
          <div 
            className="nav-dropdown"
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            onMouseLeave={() => setLangDropdownOpen(false)}
          >
            <button className="nav-dropdown-btn">
              <svg className="icon-lang" viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 0 1 5.08 16zm2.95-8H5.08a7.987 7.987 0 0 1 3.56-3.56A15.65 15.65 0 0 0 7.31 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/>
              </svg>
              Language
            </button>
            {langDropdownOpen && (
              <div className="dropdown-menu" style={{ display: 'block', opacity: 1, visibility: 'visible', transform: 'translateY(0)' }}>
                <a href="#" className="dropdown-item active" onClick={(e) => e.preventDefault()}>English</a>
                <a href="#" className="dropdown-item" onClick={(e) => e.preventDefault()}>Español</a>
                <a href="#" className="dropdown-item" onClick={(e) => e.preventDefault()}>हिन्दी</a>
              </div>
            )}
          </div>
        </nav>

        <div className="header-actions">
          {!isLoggedIn ? (
            <>
              <button className="btn btn-text login-btn" onClick={onOpenLogin}>Login</button>
              <button 
                className="btn btn-primary admin-shortcut-btn"
                onClick={() => {
                  onOpenLogin();
                }}
              >
                Admin Portal
              </button>
            </>
          ) : (
            <div 
              className="user-profile-menu"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              onMouseLeave={() => setUserDropdownOpen(false)}
            >
              <div className="user-avatar-circle">
                {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="user-name-label">
                {currentUser?.role === 'admin' ? 'Admin Vikram' : 'My Account'}
              </span>
              <svg className="icon-chevron" viewBox="0 0 24 24" width="12" height="12">
                <path fill="currentColor" d="M7 10l5 5 5-5z"/>
              </svg>

              {userDropdownOpen && (
                <div className="dropdown-menu" style={{ display: 'block', right: 0, left: 'auto' }}>
                  {currentUser?.role === 'admin' ? (
                    <Link to="/admin" className="dropdown-item">Admin Dashboard</Link>
                  ) : (
                    <Link to="/profile" className="dropdown-item">My Bookings & Chats</Link>
                  )}
                  <button 
                    className="dropdown-item" 
                    onClick={() => {
                      localStorage.removeItem('bt_token');
                      window.location.reload();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
