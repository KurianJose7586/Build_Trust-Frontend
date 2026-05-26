import React, { useState } from 'react';

export default function ProfileView({ 
  workerId, 
  workers, 
  setActiveView, 
  onOpenBookingWizard, 
  onOpenChatSimulator, 
  onCallWorker 
}) {
  const [activeTab, setActiveTab] = useState('about');

  const worker = workers.find(w => w.id === workerId);
  if (!worker) {
    return (
      <div className="container text-center" style={{ padding: '80px 24px' }}>
        <h2>Specialist not found</h2>
        <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setActiveView('search')}>
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <section id="view-profile" className="app-view active-view">
      <div className="container profile-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <a href="#home" onClick={(e) => { e.preventDefault(); setActiveView('home'); }}>Marketplace</a> &gt;{' '}
          <a href="#search" onClick={(e) => { e.preventDefault(); setActiveView('search'); }}>Skilled Workers</a> &gt;{' '}
          <span>{worker.name}</span>
        </div>

        <div className="profile-grid">
          {/* Main Profile Content (Left) */}
          <div className="profile-main">
            {/* Header Card */}
            <div className="profile-header-card">
              <div className="profile-avatar-wrapper">
                <img src={worker.image} alt={worker.name} className="profile-avatar-img" />
                <span className="badge badge-verified">
                  {worker.verified ? "Verified" : "Vetted Pro"}
                </span>
              </div>
              
              <div className="profile-info-details">
                <div className="name-row">
                  <h1>{worker.name}</h1>
                  <div className="rating-badge-box">
                    <span className="rating-icon" style={{ color: 'var(--color-accent)', marginRight: '4px' }}>★</span>
                    <span>{worker.rating}</span>
                    <span className="reviews-count"> ({worker.reviewsCount} Reviews)</span>
                  </div>
                </div>

                <div className="skills-tags">
                  {worker.tags.map(t => <span key={t} className="skill-tag">{t}</span>)}
                </div>

                <div className="meta-row">
                  <div className="meta-item">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span>{worker.location}</span>
                  </div>
                  <div className="meta-item">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path fill="currentColor" d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                    </svg>
                    <span>₹{worker.rate} / hr</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Nav Tabs */}
            <div className="profile-tabs">
              <button 
                className={`profile-tab-btn ${activeTab === 'about' ? 'active' : ''}`}
                onClick={() => setActiveTab('about')}
              >
                About
              </button>
              <button 
                className={`profile-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews
              </button>
              <button 
                className={`profile-tab-btn ${activeTab === 'work' ? 'active' : ''}`}
                onClick={() => setActiveTab('work')}
              >
                Past Work
              </button>
            </div>

            {/* Profile Tab Contents */}
            <div className="profile-tab-content">
              {/* About Tab */}
              {activeTab === 'about' && (
                <div className="tab-pane active">
                  <h2>Reliable {worker.specialty} Craftsmanship & Dedication</h2>
                  <p className="about-paragraph">{worker.about}</p>
                  
                  <div className="equipment-box">
                    <div className="equipment-title">
                      <svg viewBox="0 0 24 24" width="18" height="18" style={{ marginRight: '8px' }}>
                        <path fill="currentColor" d="M22 2H2v20h20V2zM10 18H5v-5h5v5zm0-7H5V6h5v5zm9 7h-7v-5h7v5zm0-7h-7V6h7v5z"/>
                      </svg>
                      Equipment Ownership
                    </div>
                    <p>{worker.equipment}</p>
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="tab-pane active">
                  <div className="reviews-summary-grid">
                    <div className="overall-rating-box">
                      <h3>{worker.rating}</h3>
                      <div className="rating-stars">★★★★★</div>
                      <p>Average Rating</p>
                    </div>
                    <div className="rating-bars-box">
                      <div className="rating-bar-row">
                        <span>5 Star</span>
                        <div className="rating-bar"><div className="rating-bar-fill" style={{ width: '90%' }}></div></div>
                        <span>90%</span>
                      </div>
                      <div className="rating-bar-row">
                        <span>4 Star</span>
                        <div className="rating-bar"><div className="rating-bar-fill" style={{ width: '8%' }}></div></div>
                        <span>8%</span>
                      </div>
                      <div className="rating-bar-row">
                        <span>3 Star</span>
                        <div className="rating-bar"><div className="rating-bar-fill" style={{ width: '2%' }}></div></div>
                        <span>2%</span>
                      </div>
                    </div>
                  </div>

                  <div className="reviews-list">
                    {worker.reviews.map((rev, idx) => (
                      <div key={idx} className="review-item">
                        <div className="review-meta">
                          <span className="review-author">{rev.author}</span>
                          <span className="review-date">{rev.date}</span>
                        </div>
                        <div className="rating-stars">{"★".repeat(Math.round(rev.rating))}</div>
                        <p className="review-text">{rev.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Past Work Tab */}
              {activeTab === 'work' && (
                <div className="tab-pane active">
                  <div className="portfolio-grid">
                    {worker.portfolio.map((imgUrl, idx) => (
                      <div key={idx} className="portfolio-item">
                        <img src={imgUrl} alt="Project Work" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Profile Sidebar (Right) */}
          <div className="profile-sidebar">
            <div className="sidebar-card booking-widget-card">
              <div className="pricing-headline">
                <span className="price-lbl">Pricing starts at</span>
                <div className="price-amt">
                  ₹{worker.rate} <span className="price-unit">/ hr</span>
                </div>
              </div>

              <div className="availability-status">
                <span className="status-indicator online"></span>
                <span>Available Today</span>
              </div>

              <button 
                className="btn btn-accent btn-full btn-large"
                onClick={() => onOpenBookingWizard(worker.id)}
              >
                Book Now
              </button>

              <div className="contact-actions-row">
                <button className="btn btn-outline flex-1" onClick={() => onOpenChatSimulator(worker.id)}>
                  <svg viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: '6px' }}>
                    <path fill="currentColor" d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
                  </svg>
                  Chat
                </button>
                <button className="btn btn-outline flex-1" onClick={() => onCallWorker(worker.name)}>
                  <svg viewBox="0 0 24 24" width="16" height="16" style={{ marginRight: '6px' }}>
                    <path fill="currentColor" d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.57a1 1 0 0 0-1.01.24l-2.2 2.2a15.045 15.045 0 0 1-6.59-6.59l2.2-2.2a1 1 0 0 0 .24-1.01c-.38-1.11-.57-2.3-.57-3.53 0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/>
                  </svg>
                  Call
                </button>
              </div>

              <div className="trust-assurances">
                <div className="assurance-item">
                  <svg viewBox="0 0 24 24" width="16" height="16" className="icon-secure" style={{ color: 'var(--color-primary)' }}>
                    <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 15l-4-4 1.41-1.41L10 13.17l5.59-5.59L17 9l-7 7z"/>
                  </svg>
                  <span>Build_Trust Payment Protection</span>
                </div>
                <div className="assurance-item">
                  <svg viewBox="0 0 24 24" width="16" height="16" className="icon-badge" style={{ color: 'var(--color-primary)' }}>
                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                  <span>Quality Satisfaction Guaranteed</span>
                </div>
              </div>
            </div>

            <div className="sidebar-card stats-card">
              <h3>Project Stats</h3>
              <table class="stats-table">
                <tbody>
                  <tr>
                    <td>Completed Jobs</td>
                    <td className="stat-value">{worker.id === "rajesh-kumar" ? 482 : (worker.id === "rahul-choudhary" ? 160 : 75)}</td>
                  </tr>
                  <tr>
                    <td>Repeat Clients</td>
                    <td className="stat-value">{worker.id === "rajesh-kumar" ? "85%" : "92%"}</td>
                  </tr>
                  <tr>
                    <td>Response Time</td>
                    <td className="stat-value">&lt; 15 mins</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
