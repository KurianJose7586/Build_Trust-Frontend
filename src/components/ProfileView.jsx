import React, { useState } from 'react';
import Breadcrumbs from './Breadcrumbs';

export default function ProfileView({ 
  workerId, 
  workers, 
  setActiveView, 
  onOpenBookingWizard, 
  onOpenChatSimulator, 
  onCallWorker 
}) {
  const [activeTab, setActiveTab] = useState('overview');

  const worker = workers.find(w => w.id === workerId);

  if (!worker) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <h2>Specialist Not Found</h2>
        <p>The profile you are looking for does not exist or has been moved.</p>
        <button className="btn btn-primary" onClick={() => setActiveView('search')}>Back to Search</button>
      </div>
    );
  }

  const breadcrumbPaths = [
    { label: "Search Specialists", url: "/search" },
    { label: worker.name, active: true }
  ];

  return (
    <div id="view-profile" className="app-view active-view profile-view">
      <Breadcrumbs paths={breadcrumbPaths} />

      <div className="container profile-layout">
        <aside className="profile-sidebar">
          <div className="profile-card sticky-sidebar">
            <div 
              className="profile-avatar-large"
              style={{ backgroundImage: `url('${worker.image}')` }}
            >
              {worker.verified && <span className="verified-badge-large" title="Build_Trust Verified">✓</span>}
            </div>
            
            <div className="profile-sidebar-header">
              <h1>{worker.name}</h1>
              <p className="profile-specialty">{worker.specialty}</p>
              <div className="profile-rating-box">
                <span className="stars">★ {worker.rating}</span>
                <span className="reviews">({worker.reviewsCount} reviews)</span>
              </div>
            </div>

            <div className="profile-quick-stats">
              <div className="p-stat">
                <span className="p-stat-label">Rate</span>
                <span className="p-stat-val">₹{worker.rate}/hr</span>
              </div>
              <div className="p-stat">
                <span className="p-stat-label">Exp.</span>
                <span className="p-stat-val">{worker.experience} Yrs</span>
              </div>
              <div className="p-stat">
                <span className="p-stat-label">Dist.</span>
                <span className="p-stat-val">{worker.distance || 5}km</span>
              </div>
            </div>

            <div className="profile-actions">
              <button className="btn btn-accent btn-full" onClick={() => onOpenBookingWizard(worker.id)}>Book Specialist</button>
              <button className="btn btn-outline btn-full" onClick={() => onOpenChatSimulator(worker.id)}>Message</button>
              <button className="btn btn-text btn-full text-center" onClick={() => onCallWorker(worker.name)}>Secure Call</button>
            </div>
            
            <div className="profile-skills-list">
              <h4>Top Skills</h4>
              <div className="skills-tags">
                {(worker.tags || []).map(t => <span key={t} className="skill-tag">{t}</span>)}
              </div>
            </div>
          </div>
        </aside>

        <main className="profile-main">
          <nav className="profile-tabs">
            <button 
              className={`tab-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-item ${activeTab === 'portfolio' ? 'active' : ''}`}
              onClick={() => setActiveTab('portfolio')}
            >
              Portfolio
            </button>
            <button 
              className={`tab-item ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews
            </button>
          </nav>

          <div className="profile-tab-content">
            {activeTab === 'overview' && (
              <section className="tab-pane animate-fade">
                <div className="overview-section">
                  <h3>About {worker.name}</h3>
                  <p>{worker.about}</p>
                </div>
                
                <div className="overview-section">
                  <h3>Professional Equipment</h3>
                  <div className="equipment-card">
                    <svg viewBox="0 0 24 24" width="24" height="24" className="eq-icon">
                      <path fill="currentColor" d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.3C.5 6.7.9 9.8 2.9 11.8c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.1z"/>
                    </svg>
                    <p>{worker.equipment}</p>
                  </div>
                </div>

                <div className="overview-section">
                  <h3>Service Locations</h3>
                  <div className="locations-grid">
                    {["Sector 62, Noida", "Greater Noida West", "Sector 44, Noida", "Indirapuram"].map(loc => (
                      <div key={loc} className="loc-item">
                        <span className="dot"></span> {loc}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'portfolio' && (
              <section className="tab-pane animate-fade">
                <h3>Work Gallery</h3>
                <div className="portfolio-grid">
                  {(worker.portfolio || []).map((img, idx) => (
                    <div key={idx} className="portfolio-item">
                      <img src={img} alt={`Project ${idx + 1}`} />
                      <div className="portfolio-overlay">
                        <span>Project Detail</span>
                      </div>
                    </div>
                  ))}
                  {(!worker.portfolio || worker.portfolio.length === 0) && (
                    <div className="text-center" style={{ padding: '40px', width: '100%', color: 'var(--text-muted)' }}>
                      No portfolio images uploaded yet.
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === 'reviews' && (
              <section className="tab-pane animate-fade">
                <div className="reviews-header-row">
                  <h3>Customer Reviews</h3>
                  <button className="btn btn-outline btn-small">Write a Review</button>
                </div>
                
                <div className="reviews-list">
                  {(worker.reviews || []).map((rev, idx) => (
                    <div key={idx} className="review-card">
                      <div className="rev-header">
                        <div className="rev-user">
                          <div className="rev-avatar">{rev.author.charAt(0)}</div>
                          <div>
                            <strong>{rev.author}</strong>
                            <span className="rev-date">{rev.date}</span>
                          </div>
                        </div>
                        <div className="rev-stars">{"★".repeat(Math.floor(rev.rating))}</div>
                      </div>
                      <p className="rev-text">{rev.text}</p>
                    </div>
                  ))}
                  {(!worker.reviews || worker.reviews.length === 0) && (
                    <div className="text-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>
                      No reviews yet for this specialist.
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
