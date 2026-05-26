import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingView from './components/LandingView';
import SearchView from './components/SearchView';
import ProfileView from './components/ProfileView';
import AdminView from './components/AdminView';

import { initialWorkers, initialAdminState } from './data/mockData';

export default function App() {
  // Navigation & Location states
  const [activeView, setActiveView] = useState('home');
  const [profileId, setProfileId] = useState(null);
  const [currentLocation, setCurrentLocation] = useState('Greater Noida');

  // React Global Databases
  const [workers, setWorkers] = useState(initialWorkers);
  const [adminState, setAdminState] = useState(initialAdminState);
  
  // Modals & Overlays Visibility
  const [activeModal, setActiveModal] = useState(null); // 'login' | 'booking' | 'chat' | 'ai' | 'post-job' | 'comparison'
  const [bookingWorkerId, setBookingWorkerId] = useState(null);
  const [chattingWorkerId, setChattingWorkerId] = useState(null);
  
  // Comparison lists
  const [comparisonList, setComparisonList] = useState([]);

  // Filter conditions
  const [searchFilters, setSearchFilters] = useState({
    text: "",
    category: "All",
    budget: 1000,
    rating: null,
    distance: 15
  });

  // Toasts notifications queue
  const [toasts, setToasts] = useState([]);

  // Simulated Chat logs { workerId: [messages] }
  const [chatLogs, setChatLogs] = useState({});

  // 1. SIMPLE ROUTING SYNC WITH HASHES
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#home';
      if (hash === '#admin') {
        setActiveView('admin');
      } else if (hash.startsWith('#profile/')) {
        const id = hash.split('/')[1];
        setProfileId(id);
        setActiveView('profile');
      } else if (hash === '#search') {
        setActiveView('search');
      } else {
        setActiveView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Run on mount

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync hash when state activeView changes manually (for button click routes)
  const changeRoute = (viewName) => {
    if (viewName === 'home') window.location.hash = '#home';
    else if (viewName === 'search') window.location.hash = '#search';
    else if (viewName === 'admin') window.location.hash = '#admin';
    else if (viewName.startsWith('profile/')) {
      const id = viewName.split('/')[1];
      setProfileId(id);
      window.location.hash = `#profile/${id}`;
    }
  };

  // 2. TOAST NOTIFICATION HANDLER
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  useEffect(() => {
    const handleToastEvent = (e) => {
      const { message, type } = e.detail;
      addToast(message, type);
    };
    window.addEventListener('show-toast', handleToastEvent);
    return () => window.removeEventListener('show-toast', handleToastEvent);
  }, []);

  // 3. BOOKING WIZARD HANDLERS (CLOSED-LOOP PIPELINE)
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardForm, setWizardForm] = useState({
    description: "Need masonry stone work repair for my garden patio walls.",
    address: "Sector 62, Noida",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().substring(0,10),
    hours: 8,
    priority: "Standard"
  });

  const handleBookingConfirm = () => {
    const worker = workers.find(w => w.id === bookingWorkerId);
    if (!worker) return;

    const totalCost = worker.rate * wizardForm.hours;
    
    // Increment active jobs count reactively
    setAdminState(prev => {
      const newActiveJobs = prev.activeJobs + 1;
      const newOnSchedule = prev.onSchedule + 1;
      
      const newLiveOps = [
        {
          id: Date.now(),
          text: `Hired: ${worker.name} accepted job at ${wizardForm.address} (₹${totalCost.toLocaleString()} / ${wizardForm.hours} hrs) - [${wizardForm.priority}]`,
          time: "Just now",
          type: "job",
          icon: "✓",
          color: "green-bg"
        },
        ...prev.liveOps
      ];

      return {
        ...prev,
        activeJobs: newActiveJobs,
        onSchedule: newOnSchedule,
        liveOps: newLiveOps
      };
    });

    addToast(`Hired ${worker.name}! Hired request registered on Admin Portal.`, 'success');
    setActiveModal(null);
    changeRoute('search');
  };

  // 4. POST JOB WIZARD HANDLERS (CLOSED-LOOP PIPELINE)
  const [postJobForm, setPostJobForm] = useState({
    title: "",
    category: "Electrical",
    location: "Sector 62, Noida",
    budget: "₹15,000",
    desc: ""
  });

  const handlePostJobConfirm = () => {
    if (postJobForm.title.trim() === "" || postJobForm.location.trim() === "") {
      addToast("Please fill all required project details", "info");
      return;
    }

    setAdminState(prev => {
      const newPendingLeads = prev.pendingLeads + 1;
      const newLiveOps = [
        {
          id: Date.now(),
          text: `Lead Posted: "${postJobForm.title}" (${postJobForm.category}) in ${postJobForm.location} - Budget: ${postJobForm.budget}`,
          time: "Just now",
          type: "lead",
          icon: "★",
          color: "blue-bg"
        },
        ...prev.liveOps
      ];

      return {
        ...prev,
        pendingLeads: newPendingLeads,
        liveOps: newLiveOps
      };
    });

    addToast("Project requirements posted successfully! Admin Dashboard notified.");
    setActiveModal(null);
  };

  // 5. CHAT SIMULATOR HANDLERS
  const [chatInput, setChatInput] = useState("");

  const handleSendChatMessage = () => {
    if (chatInput.trim() === "") return;
    
    const workerId = chattingWorkerId;
    const worker = workers.find(w => w.id === workerId);
    if (!worker) return;

    // Save Client message
    const clientMsg = { sender: 'client', text: chatInput };
    setChatLogs(prev => {
      const list = prev[workerId] || [];
      return { ...prev, [workerId]: [...list, clientMsg] };
    });
    setChatInput("");

    // Simulate auto worker reply after 1.2s
    setTimeout(() => {
      let reply = "";
      if (workerId === "rajesh-kumar") {
        reply = "Thanks for the details. I own all the scaffolding and heavy concrete mixers. Let's arrange a time to look at the garden walls this weekend?";
      } else if (workerId === "manish-sharma") {
        reply = "Got it! Electrical rewiring requires a quick inspection of the main distribution boards. Does tomorrow afternoon work for a video call?";
      } else {
        reply = `Thank you! I will review these project specs and get back to you with a draft estimate.`;
      }

      const workerMsg = { sender: 'worker', text: reply };
      setChatLogs(prev => {
        const list = prev[workerId] || [];
        return { ...prev, [workerId]: [...list, workerMsg] };
      });

      // Update admin logs
      setAdminState(prev => {
        const newLiveOps = [
          {
            id: Date.now(),
            text: `Message from ${worker.name}: "${reply.substring(0, 25)}..."`,
            time: "Just now",
            type: "lead",
            icon: "★",
            color: "blue-bg"
          },
          ...prev.liveOps
        ];
        return { ...prev, liveOps: newLiveOps };
      });
    }, 1200);
  };

  // 6. AI ESTIMATION TOOL
  const [aiState, setAiState] = useState('upload'); // 'upload' | 'processing' | 'result'
  
  const handleAiUpload = () => {
    setAiState('processing');
    setTimeout(() => {
      setAiState('result');
    }, 2000);
  };

  // 7. ADMIN DASHBOARD ISSUE RESOLVER
  const handleResolveIssue = (issueId) => {
    const issue = adminState.criticalIssues.find(i => i.id === issueId);
    if (!issue) return;

    setAdminState(prev => {
      const remainingIssues = prev.criticalIssues.filter(i => i.id !== issueId);
      const newLiveOps = [
        {
          id: Date.now(),
          text: `Resolved critical issue: ${issue.title}`,
          time: "Just now",
          type: "job",
          icon: "✓",
          color: "green-bg"
        },
        ...prev.liveOps
      ];
      return {
        ...prev,
        criticalIssues: remainingIssues,
        issuesCount: remainingIssues.length,
        liveOps: newLiveOps
      };
    });

    addToast(`Successfully resolved: ${issue.title}`);
  };

  return (
    <React.Fragment>
      {/* Client Header */}
      {activeView !== 'admin' && (
        <Header 
          activeView={activeView}
          setActiveView={changeRoute}
          currentLocation={currentLocation}
          setCurrentLocation={setCurrentLocation}
          onOpenLogin={() => setActiveModal('login')}
        />
      )}

      {/* Main Views Router */}
      <main id="app-container">
        {activeView === 'home' && (
          <LandingView 
            workers={workers}
            setActiveView={changeRoute}
            setSearchFilters={setSearchFilters}
            onOpenBookingWizard={(id, isEmergency) => {
              setBookingWorkerId(id);
              if (isEmergency) setWizardForm(prev => ({ ...prev, priority: 'Emergency' }));
              setWizardStep(1);
              setActiveModal('booking');
            }}
            onOpenAiTool={() => {
              setAiState('upload');
              setActiveModal('ai');
            }}
            onOpenPostJob={() => {
              setPostJobForm({ title: "", category: "Electrical", location: "Sector 62, Noida", budget: "₹15,000", desc: "" });
              setActiveModal('post-job');
            }}
          />
        )}

        {activeView === 'search' && (
          <SearchView 
            workers={workers}
            setActiveView={changeRoute}
            searchFilters={searchFilters}
            setSearchFilters={setSearchFilters}
            comparisonList={comparisonList}
            setComparisonList={setComparisonList}
            onOpenComparison={() => setActiveModal('comparison')}
          />
        )}

        {activeView === 'profile' && (
          <ProfileView 
            workerId={profileId}
            workers={workers}
            setActiveView={changeRoute}
            onOpenBookingWizard={(id) => {
              setBookingWorkerId(id);
              setWizardStep(1);
              setActiveModal('booking');
            }}
            onOpenChatSimulator={(id) => {
              setChattingWorkerId(id);
              // Init message log
              if (!chatLogs[id]) {
                const w = workers.find(item => item.id === id);
                setChatLogs(prev => ({
                  ...prev,
                  [id]: [{ sender: 'worker', text: `Namaste! Thanks for reaching out. I'm ${w.name}, a professional ${w.specialty} specialist. How can I help you today?` }]
                }));
              }
              setActiveModal('chat');
            }}
            onCallWorker={(name) => {
              addToast(`Initiating secure direct call connection with ${name}...`, 'info');
            }}
          />
        )}

        {activeView === 'admin' && (
          <AdminView 
            adminState={adminState}
            setActiveView={changeRoute}
            onResolveIssue={handleResolveIssue}
            onPostJob={() => {
              setPostJobForm({ title: "", category: "Electrical", location: "Sector 62, Noida", budget: "₹15,000", desc: "" });
              setActiveModal('post-job');
            }}
            onReviewProfiles={() => {
              setSearchFilters({ text: "", category: "All", budget: 1000, rating: null, distance: 30 });
              changeRoute('search');
              addToast("Displaying all registered specialists awaiting review.", "info");
            }}
          />
        )}
      </main>

      {/* Client Footer */}
      {activeView !== 'admin' && (
        <Footer setActiveView={changeRoute} />
      )}

      {/* ====================================================================
          MODALS & OVERLAYS MANAGEMENT
          ==================================================================== */}

      {/* 1. LOGIN MODAL */}
      {activeModal === 'login' && (
        <div className="modal-backdrop active">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Login to Build_Trust</h3>
              <button className="close-modal-btn" onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" defaultValue="admin@buildtrust.com" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-input" defaultValue="password" required />
                </div>
                <button 
                  type="button" 
                  className="btn btn-accent btn-full"
                  onClick={() => {
                    setActiveModal(null);
                    changeRoute('admin');
                    addToast("Logged in as Administrator Vikram Singh!");
                  }}
                >
                  Login
                </button>
              </form>
              <p className="demo-notice">Note: Click Login to access the Indian Admin Portal.</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. BOOKING WIZARD MODAL (CLOSED LOOP) */}
      {activeModal === 'booking' && bookingWorkerId && (
        <div className="modal-backdrop active">
          <div className="modal-card wizard-card">
            <div className="modal-header">
              <h3>Hire {workers.find(w => w.id === bookingWorkerId)?.name}</h3>
              <button className="close-modal-btn" onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="wizard-steps-indicators">
                <div className={`w-step ${wizardStep >= 1 ? 'active' : ''}`}>1. Details</div>
                <div className={`w-step ${wizardStep >= 2 ? 'active' : ''}`}>2. Schedule</div>
                <div className={`w-step ${wizardStep >= 3 ? 'active' : ''}`}>3. Confirm</div>
              </div>

              {wizardStep === 1 && (
                <div className="wizard-pane active">
                  <div className="form-group">
                    <label className="form-label">Describe your project requirements</label>
                    <textarea 
                      className="form-input" 
                      rows="3" 
                      value={wizardForm.description}
                      onChange={(e) => setWizardForm(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Project Site Address</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={wizardForm.address}
                      onChange={(e) => setWizardForm(prev => ({ ...prev, address: e.target.value }))}
                      required 
                    />
                  </div>
                  <div className="wizard-footer">
                    <div></div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        if (wizardForm.description.trim() === "" || wizardForm.address.trim() === "") {
                          addToast("Please input requirements and site address", "info");
                          return;
                        }
                        setWizardStep(2);
                      }}
                    >
                      Next: Schedule &gt;
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="wizard-pane active">
                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label className="form-label">Preferred Date</label>
                      <input 
                        type="date" 
                        className="form-input"
                        value={wizardForm.date}
                        onChange={(e) => setWizardForm(prev => ({ ...prev, date: e.target.value }))}
                        required 
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label className="form-label">Duration (estimated hours)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        min="1" 
                        max="100"
                        value={wizardForm.hours}
                        onChange={(e) => setWizardForm(prev => ({ ...prev, hours: parseInt(e.target.value) || 1 }))}
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority Type</label>
                    <select 
                      className="form-select"
                      value={wizardForm.priority}
                      onChange={(e) => setWizardForm(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="Standard">Standard Schedule</option>
                      <option value="Emergency">Emergency (Dispatch onsite within 2 hrs)</option>
                    </select>
                  </div>
                  <div className="wizard-footer">
                    <button className="btn btn-outline" style={{ color: 'var(--color-primary)', borderColor: '#cbd5e1' }} onClick={() => setWizardStep(1)}>&lt; Back</button>
                    <button className="btn btn-primary" onClick={() => setWizardStep(3)}>Next: Confirm &gt;</button>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="wizard-pane active">
                  <div className="confirmation-summary-box">
                    <div className="summary-row">
                      <strong>Specialist:</strong>
                      <span>{workers.find(w => w.id === bookingWorkerId)?.name}</span>
                    </div>
                    <div className="summary-row">
                      <strong>Project Location:</strong>
                      <span>{wizardForm.address}</span>
                    </div>
                    <div className="summary-row">
                      <strong>Schedule:</strong>
                      <span>{wizardForm.date} (Est. {wizardForm.hours} hrs)</span>
                    </div>
                    <div className="summary-row">
                      <strong>Hourly Rate:</strong>
                      <span>₹{workers.find(w => w.id === bookingWorkerId)?.rate} / hr</span>
                    </div>
                    <div className="summary-row total-row">
                      <strong>Estimated Total Cost:</strong>
                      <span>₹{(workers.find(w => w.id === bookingWorkerId)?.rate * wizardForm.hours).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="wizard-footer">
                    <button className="btn btn-outline" style={{ color: 'var(--color-primary)', borderColor: '#cbd5e1' }} onClick={() => setWizardStep(2)}>&lt; Back</button>
                    <button className="btn btn-accent btn-large" onClick={handleBookingConfirm}>Confirm Booking</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. POST A JOB MODAL */}
      {activeModal === 'post-job' && (
        <div className="modal-backdrop active">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Post a New Project Requirement</h3>
              <button className="close-modal-btn" onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label className="form-label">Project Title</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Electrical rewiring for flat compound"
                    value={postJobForm.title}
                    onChange={(e) => setPostJobForm(prev => ({ ...prev, title: e.target.value }))}
                    required 
                  />
                </div>
                <div className="form-row">
                  <div className="form-group flex-1">
                    <label className="form-label">Trade Category Required</label>
                    <select 
                      className="form-select"
                      value={postJobForm.category}
                      onChange={(e) => setPostJobForm(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="Electrical">Electrical</option>
                      <option value="Masonry">Masonry</option>
                      <option value="Painting">Painting</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Contracting">General Contractor</option>
                    </select>
                  </div>
                  <div className="form-group flex-1">
                    <label className="form-label">Location / City</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={postJobForm.location}
                      onChange={(e) => setPostJobForm(prev => ({ ...prev, location: e.target.value }))}
                      required 
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Budget</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. ₹25,000"
                    value={postJobForm.budget}
                    onChange={(e) => setPostJobForm(prev => ({ ...prev, budget: e.target.value }))}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Detailed Project Description</label>
                  <textarea 
                    className="form-input" 
                    rows="3" 
                    placeholder="Explain the project scope and specifications..."
                    value={postJobForm.desc}
                    onChange={(e) => setPostJobForm(prev => ({ ...prev, desc: e.target.value }))}
                    required
                  />
                </div>
                <button type="button" className="btn btn-accent btn-full" onClick={handlePostJobConfirm}>
                  Submit Project Lead
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 4. CHAT MODAL SIMULATION */}
      {activeModal === 'chat' && chattingWorkerId && (
        <div className="modal-backdrop active">
          <div className="modal-card chat-modal-card">
            <div className="modal-header">
              <div className="chat-header-user">
                <span className="status-indicator online"></span>
                <div>
                  <h3>{workers.find(w => w.id === chattingWorkerId)?.name}</h3>
                  <p>{workers.find(w => w.id === chattingWorkerId)?.specialty} Specialist</p>
                </div>
              </div>
              <button className="close-modal-btn" onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <div className="modal-body chat-body">
              <div className="chat-messages">
                {(chatLogs[chattingWorkerId] || []).map((msg, idx) => (
                  <div key={idx} className={`chat-msg ${msg.sender}`}>
                    {msg.text}
                  </div>
                ))}
              </div>
              <div className="chat-input-bar">
                <input 
                  type="text" 
                  className="form-input flex-1"
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                />
                <button className="btn btn-accent" onClick={handleSendChatMessage}>
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. AI COST ESTIMATION TOOL MODAL */}
      {activeModal === 'ai' && (
        <div className="modal-backdrop active">
          <div className="modal-card">
            <div className="modal-header">
              <h3>AI Cost Estimation Tool</h3>
              <button className="close-modal-btn" onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <div className="modal-body">
              {aiState === 'upload' && (
                <div className="ai-upload-box" onClick={handleAiUpload}>
                  <svg viewBox="0 0 24 24" width="48" height="48" style={{ color: '#ff6f00', marginBottom: '12px' }}>
                    <path fill="currentColor" d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                  </svg>
                  <h4>Upload Project Photo</h4>
                  <p>Click here to analyze blueprint, wall damages, or layout mockups.</p>
                </div>
              )}

              {aiState === 'processing' && (
                <div className="ai-processing-box">
                  <div className="spinner"></div>
                  <p>Analyzing materials, dimensions, and local trade rates...</p>
                </div>
              )}

              {aiState === 'result' && (
                <div className="ai-result-box">
                  <div className="result-badge-success">AI AUDIT COMPLETE</div>
                  <table className="ai-result-table">
                    <tbody>
                      <tr>
                        <td>Recommended Trade</td>
                        <td>Masonry / Brickwork</td>
                      </tr>
                      <tr>
                        <td>Estimated Work Area</td>
                        <td>120 sq ft</td>
                      </tr>
                      <tr>
                        <td>Average Material Cost</td>
                        <td>₹14,500</td>
                      </tr>
                      <tr>
                        <td>Labor Hours Estimate</td>
                        <td>16 Hours (2 Days)</td>
                      </tr>
                      <tr className="total-row">
                        <td>Total Project Estimate</td>
                        <td>₹24,800</td>
                      </tr>
                    </tbody>
                  </table>
                  <button 
                    className="btn btn-accent btn-full"
                    onClick={() => {
                      setActiveModal(null);
                      setSearchFilters(prev => ({ ...prev, category: 'Masonry', text: 'Masonry' }));
                      changeRoute('search');
                    }}
                  >
                    Find Specialists for this Job
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. SPECIALISTS SIDE-BY-SIDE COMPARISON MODAL */}
      {activeModal === 'comparison' && (
        <div className="modal-backdrop active">
          <div className="modal-card comparison-large-card">
            <div className="modal-header">
              <h3>Specialist Comparison</h3>
              <button className="close-modal-btn" onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div 
                className="comparison-grid-table"
                style={{ gridTemplateColumns: `180px repeat(${comparisonList.length}, 1fr)` }}
              >
                {/* Column 1: Header */}
                <div className="comp-cell comp-header-col">Overview</div>
                {comparisonList.map(id => {
                  const w = workers.find(item => item.id === id);
                  return (
                    <div key={id} className="comp-cell comp-worker-cell">
                      <img src={w.image} className="comp-avatar" alt={w.name} />
                      <span className="comp-value-bold">{w.name}</span>
                      <span className="badge badge-verified" style={{ position: 'static' }}>{w.verified ? 'Verified' : 'Vetted'}</span>
                    </div>
                  );
                })}

                <div className="comp-cell comp-header-col">Specialty</div>
                {comparisonList.map(id => (
                  <div key={id} className="comp-cell" style={{ fontWeight: 600 }}>
                    {workers.find(item => item.id === id)?.specialty}
                  </div>
                ))}

                <div className="comp-cell comp-header-col">Ratings</div>
                {comparisonList.map(id => {
                  const w = workers.find(item => item.id === id);
                  return (
                    <div key={id} className="comp-cell" style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
                      ★ {w.rating} <span style={{ fontWeight: 'normal', color: 'var(--text-muted)', fontSize: '12px' }}>({w.reviewsCount} reviews)</span>
                    </div>
                  );
                })}

                <div className="comp-cell comp-header-col">Hourly Rate</div>
                {comparisonList.map(id => (
                  <div key={id} className="comp-cell comp-value-bold">
                    ₹{workers.find(item => item.id === id)?.rate}/hr
                  </div>
                ))}

                <div className="comp-cell comp-header-col">Experience</div>
                {comparisonList.map(id => (
                  <div key={id} className="comp-cell">
                    {workers.find(item => item.id === id)?.experience} Years
                  </div>
                ))}

                <div className="comp-cell comp-header-col">Service Area</div>
                {comparisonList.map(id => (
                  <div key={id} className="comp-cell">
                    {workers.find(item => item.id === id)?.location}
                  </div>
                ))}

                <div className="comp-cell comp-header-col">Tool Ownership</div>
                {comparisonList.map(id => (
                  <div key={id} className="comp-cell" style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {workers.find(item => item.id === id)?.equipment.substring(0, 60)}...
                  </div>
                ))}

                <div className="comp-cell comp-header-col">Action</div>
                {comparisonList.map(id => (
                  <div key={id} className="comp-cell">
                    <button 
                      className="btn btn-accent btn-full"
                      onClick={() => {
                        setActiveModal(null);
                        setBookingWorkerId(id);
                        setWizardStep(1);
                        setActiveModal('booking');
                      }}
                    >
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          REACT TOAST ALERTS NOTIFIER
          ==================================================================== */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.type === 'success' ? (
              <span>✓</span>
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" style={{ fill: 'currentColor' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </React.Fragment>
  );
}
