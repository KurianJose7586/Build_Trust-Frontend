import React from 'react';

export default function LandingView({ 
  workers, 
  setActiveView, 
  setSearchFilters, 
  onOpenBookingWizard, 
  onOpenAiTool, 
  onOpenPostJob 
}) {
  
  const handleServiceClick = (specialty) => {
    setSearchFilters(prev => ({
      ...prev,
      category: specialty,
      text: specialty
    }));
    setActiveView('search');
  };

  // We show 4 workers on the landing page
  const featuredWorkers = workers.slice(0, 4);

  return (
    <div id="view-home" className="app-view active-view">
      {/* Hero Section */}
      <div 
        className="hero-section" 
        style={{ 
          backgroundImage: `linear-gradient(rgba(11, 19, 43, 0.75), rgba(11, 19, 43, 0.85)), url('/assets/images/hero_construction_bg.png')` 
        }}
      >
        <div className="hero-content container">
          <h1>Book Trusted Construction Workers Near You</h1>
          <p>Precision-matched skilled tradespeople for your commercial and residential projects. Indian-origin verified experts, transparent pricing, and guaranteed craftsmanship.</p>
          <div className="hero-actions">
            <button className="btn btn-accent btn-large" onClick={() => setActiveView('search')}>Book Now</button>
            <button className="btn btn-outline btn-large" onClick={onOpenAiTool}>Get Price Estimate</button>
          </div>
        </div>
      </div>

      {/* Core Services Section */}
      <section className="services-section container" id="services-section">
        <h2 className="section-title">Core Services</h2>
        <div className="services-grid">
          {/* Masonry Card */}
          <div 
            className="service-card" 
            onClick={() => handleServiceClick('Masonry')}
            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=500&q=80')` }}
          >
            <div className="service-card-content">
              <div className="service-card-icon">
                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-9 14H5v-4h5v4zm0-5H5V9h5v4zm9 5h-8v-4h8v4zm0-5h-8V9h8v4z"/></svg>
              </div>
              <h3>Mason</h3>
            </div>
          </div>
          {/* Painter Card */}
          <div 
            className="service-card" 
            onClick={() => handleServiceClick('Painting')}
            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=500&q=80')` }}
          >
            <div className="service-card-content">
              <div className="service-card-icon">
                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 16c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
              </div>
              <h3>Painter</h3>
            </div>
          </div>
          {/* Electrician Card */}
          <div 
            className="service-card" 
            onClick={() => handleServiceClick('Electrical')}
            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=80')` }}
          >
            <div className="service-card-content">
              <div className="service-card-icon">
                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
              </div>
              <h3>Electrician</h3>
            </div>
          </div>
          {/* Plumber Card */}
          <div 
            className="service-card" 
            onClick={() => handleServiceClick('Plumbing')}
            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=500&q=80')` }}
          >
            <div className="service-card-content">
              <div className="service-card-icon">
                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2c-4.97 0-9 4.03-9 9 0 5.25 9 11 9 11s9-5.75 9-11c0-4.97-4.03-9-9-9zm0 13c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>
              </div>
              <h3>Plumber</h3>
            </div>
          </div>
          {/* Contractor Card */}
          <div 
            className="service-card" 
            onClick={() => handleServiceClick('Contracting')}
            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=500&q=80')` }}
          >
            <div className="service-card-content">
              <div className="service-card-icon">
                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              </div>
              <h3>Contractor</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal Value Props Strip */}
      <section className="value-strip">
        <div className="container value-strip-container">
          <div className="value-item" onClick={() => onOpenBookingWizard('rajesh-kumar', true)}>
            <div className="value-icon orange-bg">
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            </div>
            <div className="value-text">
              <h4>Emergency Hire</h4>
              <p>Worker onsite within 2 hours</p>
            </div>
          </div>
          <div className="value-item" onClick={onOpenAiTool}>
            <div className="value-icon blue-bg">
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M20 5h-3.17L15 3H9L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-8 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
            </div>
            <div class="value-text">
              <h4>AI Cost Tool</h4>
              <p>Upload image for instant estimate</p>
            </div>
          </div>
          <div className="value-item" onClick={() => {
            setSearchFilters(prev => ({ ...prev, category: 'All' }));
            setActiveView('search');
          }}>
            <div className="value-icon yellow-bg">
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
            </div>
            <div className="value-text">
              <h4>Combo Packages</h4>
              <p>Save 10% on multi-trade projects</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top-Rated Professionals Section */}
      <section className="professionals-section container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Top-Rated Professionals</h2>
            <p className="section-subtitle">Highly skilled workers with 4.8+ ratings and full certification.</p>
          </div>
        </div>
        
        <div className="professionals-carousel-wrapper">
          <div className="professionals-grid" style={{ minWidth: 'auto', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            {featuredWorkers.map(worker => (
              <div key={worker.id} className="worker-card-flat">
                <div 
                  className="worker-card-image" 
                  style={{ backgroundImage: `url('${worker.image}')` }}
                >
                  <span className="rating-badge">★ {worker.rating}</span>
                </div>
                <div className="worker-card-body">
                  <h3>{worker.name} {worker.verified && <span className="verified-icon">✓</span>}</h3>
                  <p className="worker-tagline">{worker.specialty} • {worker.experience} yrs exp.</p>
                  <div className="worker-card-footer">
                    <div className="rate-info">
                      <span className="rate-label">STARTS AT</span>
                      <span className="rate-val">₹{worker.rate}</span><span className="rate-unit">/hr</span>
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        window.location.hash = `#profile/${worker.id}`;
                        setActiveView(`profile/${worker.id}`);
                      }}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ready to Start CTA */}
      <section className="cta-banner">
        <div className="container cta-container">
          <h2>Ready to start your project?</h2>
          <p>Join over 50,000 project managers and homeowners who trust Build_Trust for their structural and maintenance needs.</p>
          <div className="cta-actions">
            <button className="btn btn-accent btn-large" onClick={onOpenPostJob}>Post a Job</button>
            <button className="btn btn-outline btn-large" onClick={() => setActiveView('search')}>Browse Workers</button>
          </div>
        </div>
      </section>
    </div>
  );
}
