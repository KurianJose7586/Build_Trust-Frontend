import React, { useState, useEffect } from 'react';

export default function SearchView({ 
  workers, 
  setActiveView, 
  searchFilters, 
  setSearchFilters, 
  comparisonList, 
  setComparisonList, 
  onOpenComparison 
}) {
  const [inputText, setInputText] = useState(searchFilters.text || "");
  const [budgetVal, setBudgetVal] = useState(searchFilters.budget || 1000);
  const [ratingVal, setRatingVal] = useState(searchFilters.rating || null);
  const [distanceVal, setDistanceVal] = useState(searchFilters.distance || 15);

  // Sync state if searchFilters changed externally (e.g. from service click on landing page)
  useEffect(() => {
    setInputText(searchFilters.text || "");
    setBudgetVal(searchFilters.budget || 1000);
  }, [searchFilters]);

  const handleApplyFilters = () => {
    setSearchFilters({
      text: inputText,
      category: searchFilters.category, // keep current selected category
      budget: budgetVal,
      rating: ratingVal,
      distance: distanceVal
    });
  };

  const handleClearFilters = () => {
    setInputText("");
    setBudgetVal(1000);
    setRatingVal(null);
    setDistanceVal(15);
    setSearchFilters({
      text: "",
      category: "All",
      budget: 1000,
      rating: null,
      distance: 15
    });
  };

  // Filter list of workers
  const filteredWorkers = workers.filter(worker => {
    // Category check
    if (searchFilters.category !== "All" && worker.specialty !== searchFilters.category) return false;
    
    // Text search
    if (searchFilters.text) {
      const q = searchFilters.text.toLowerCase();
      const inName = worker.name.toLowerCase().includes(q);
      const inTag = worker.tags.some(t => t.toLowerCase().includes(q));
      const inSpec = worker.specialty.toLowerCase().includes(q);
      if (!inName && !inTag && !inSpec) return false;
    }

    // Budget limit in INR
    if (worker.rate > searchFilters.budget) return false;

    // Rating check
    if (searchFilters.rating && worker.rating < searchFilters.rating) return false;

    // Distance check (km)
    if (worker.distance > searchFilters.distance) return false;

    return true;
  });

  const handleCompareChange = (workerId, checked) => {
    if (checked) {
      if (comparisonList.length >= 3) {
        // Trigger custom toast
        const event = new CustomEvent('show-toast', { detail: { message: "You can compare up to 3 specialists side-by-side.", type: 'info' } });
        window.dispatchEvent(event);
        return;
      }
      setComparisonList(prev => [...prev, workerId]);
    } else {
      setComparisonList(prev => prev.filter(id => id !== workerId));
    }
  };

  return (
    <section id="view-search" className="app-view active-view">
      {/* Progress Bar Tracker */}
      <div className="progress-bar-container">
        <div className="container progress-steps">
          <div className="step completed">
            <span className="step-num">✓</span>
            <span className="step-label">1. Requirements</span>
          </div>
          <div className="step-line active"></div>
          <div className="step active">
            <span className="step-num">2</span>
            <span className="step-label">2. Matching</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${comparisonList.length >= 2 ? 'active' : ''}`}>
            <span className="step-num">3</span>
            <span className="step-label">3. Comparison</span>
          </div>
          <div className="step-line"></div>
          <div className="step">
            <span className="step-num">4</span>
            <span className="step-label">4. Booking</span>
          </div>
        </div>
      </div>

      <div className="search-layout container">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <h3>Filters</h3>
          <div className="filter-group">
            <label className="filter-label">Search Projects / Skills</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by name, skill..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <div className="label-row">
              <label className="filter-label">Budget Range (₹/hr)</label>
              <span>₹100 - {budgetVal >= 1000 ? `₹1,000+` : `₹${budgetVal}`}</span>
            </div>
            <input 
              type="range" 
              min="200" 
              max="1000" 
              step="50"
              value={budgetVal} 
              className="form-slider"
              onChange={(e) => setBudgetVal(parseInt(e.target.value))}
            />
            <div className="slider-labels">
              <span>₹200</span>
              <span>₹1,000+</span>
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Minimum Rating</label>
            <label className="checkbox-container">
              <input 
                type="checkbox" 
                checked={ratingVal === 4.5} 
                onChange={() => setRatingVal(ratingVal === 4.5 ? null : 4.5)}
              />
              <span className="checkmark"></span>
              4.5+ Stars
            </label>
            <label className="checkbox-container">
              <input 
                type="checkbox" 
                checked={ratingVal === 4.0} 
                onChange={() => setRatingVal(ratingVal === 4.0 ? null : 4.0)}
              />
              <span className="checkmark"></span>
              4.0+ Stars
            </label>
          </div>

          <div className="filter-group">
            <label className="filter-label">Max Distance</label>
            <select 
              value={distanceVal} 
              className="form-select"
              onChange={(e) => setDistanceVal(parseInt(e.target.value))}
            >
              <option value={5}>Within 5 km</option>
              <option value={10}>Within 10 km</option>
              <option value={15}>Within 15 km</option>
              <option value={30}>Within 30 km</option>
            </select>
          </div>

          <button className="btn btn-primary btn-full" onClick={handleApplyFilters}>Apply Filters</button>
          <button className="btn btn-text btn-full text-center" onClick={handleClearFilters}>Clear All</button>
        </aside>

        {/* Matched Specialists Panel */}
        <main className="results-panel">
          <div className="results-header">
            <div>
              <h2>Matched Specialists</h2>
              <p className="results-subtitle">
                Based on your requirements. <strong>{filteredWorkers.length}</strong> Matches Found
              </p>
            </div>
          </div>

          <div className="worker-list">
            {filteredWorkers.length === 0 ? (
              <div className="text-center" style={{ padding: '40px', color: 'var(--text-muted)' }}>
                No specialists found matching your filter criteria. Try expanding your search.
              </div>
            ) : (
              filteredWorkers.map(worker => (
                <div key={worker.id} className="worker-row-card">
                  <div 
                    className="worker-row-avatar" 
                    style={{ backgroundImage: `url('${worker.image}')` }}
                  ></div>
                  <div className="worker-row-info">
                    <div className="worker-info-header">
                      <div className="worker-title-box">
                        <h3 
                          onClick={() => {
                            window.location.hash = `#profile/${worker.id}`;
                            setActiveView(`profile/${worker.id}`);
                          }}
                        >
                          {worker.name} {worker.verified && <span className="verified-icon">✓</span>}
                        </h3>
                        <div className="worker-skills-tags">
                          {worker.tags.map(t => <span key={t} className="tag-badge">{t}</span>)}
                        </div>
                      </div>
                      <div className="worker-row-rating">
                        ★ {worker.rating} <span className="worker-reviews-lbl">({worker.reviewsCount} reviews)</span>
                      </div>
                    </div>
                    <p className="worker-desc">{worker.about}</p>
                    
                    <div className="worker-row-footer">
                      <div className="worker-row-price">₹{worker.rate}<span>/hr</span></div>
                      <div className="flex-align" style={{ gap: '16px' }}>
                        <label className="checkbox-container" style={{ marginBottom: 0 }}>
                          <input 
                            type="checkbox"
                            checked={comparisonList.includes(worker.id)}
                            onChange={(e) => handleCompareChange(worker.id, e.target.checked)}
                          />
                          <span className="checkmark"></span>
                          Add to Comparison
                        </label>
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
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Floating Bottom Comparison Drawer */}
      <div className={`comparison-drawer ${comparisonList.length > 0 ? 'active' : ''}`}>
        <div className="container comparison-drawer-content">
          <div className="drawer-left">
            <div className="comparison-count-badge">{comparisonList.length}</div>
            <div>
              <h3>Compare Specialists</h3>
              <p>Compare credentials side-by-side to make the right choice.</p>
            </div>
          </div>
          <div className="drawer-center">
            {comparisonList.map(id => {
              const w = workers.find(item => item.id === id);
              if (!w) return null;
              return (
                <div key={id} className="compare-thumb-wrapper">
                  <img src={w.image} className="compare-thumb" alt={w.name} />
                  <span 
                    className="remove-compare-thumb" 
                    onClick={() => setComparisonList(prev => prev.filter(wid => wid !== id))}
                  >
                    &times;
                  </span>
                </div>
              );
            })}
          </div>
          <div className="drawer-right">
            <button className="btn btn-text" style={{ color: 'white' }} onClick={() => setComparisonList([])}>Clear</button>
            <button 
              className="btn btn-accent" 
              disabled={comparisonList.length < 2}
              onClick={onOpenComparison}
            >
              Compare Side-by-Side
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
