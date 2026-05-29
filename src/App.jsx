import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingView from './components/LandingView';
import SearchView from './components/SearchView';
import ProfileView from './components/ProfileView';
import AdminView from './components/AdminView';

import { initialWorkers, initialAdminState } from './data/mockData';

// Wrapper to handle ProfileView with URL params
function ProfileViewWrapper({ 
  workers, 
  changeRoute, 
  setBookingWorkerId, 
  setWizardStep, 
  setActiveModal, 
  chatLogs, 
  setChatLogs, 
  setChattingWorkerId, 
  addToast,
  isLoggedIn,
  currentUser
}) {
  const { id } = useParams();

  // FETCH CHAT HISTORY ON LOAD
  useEffect(() => {
    if (isLoggedIn && currentUser && id) {
      const fetchChat = async () => {
        try {
          const res = await fetch(`http://localhost:8001/api/chat/${id}?customer_email=${currentUser.email}`);
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setChatLogs(prev => ({ ...prev, [id]: data }));
          }
        } catch (err) {
          console.error("Chat fetch failed", err);
        }
      };
      fetchChat();
    }
  }, [id, isLoggedIn, currentUser]);

  return (
    <ProfileView 
      workerId={id}
      workers={workers}
      setActiveView={changeRoute}
      onOpenBookingWizard={(workerId) => {
        setBookingWorkerId(workerId);
        setWizardStep(1);
        setActiveModal('booking');
      }}
      onOpenChatSimulator={(workerId) => {
        if (!isLoggedIn) {
          addToast("Please login to chat with specialists", "info");
          setActiveModal('login');
          return;
        }
        setChattingWorkerId(workerId);
        setActiveModal('chat');
      }}
      onCallWorker={(name) => {
        addToast(`Initiating secure direct call connection with ${name}...`, 'info');
      }}
    />
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation & Location states
  const [currentLocation, setCurrentLocation] = useState('Greater Noida');

  // React Global Databases
  const [workers, setWorkers] = useState([]);
  const [adminState, setAdminState] = useState(initialAdminState);
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(true);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);

  // AUTH STATE
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authStep, setAuthStep] = useState('email'); // 'email' or 'otp'
  const [authEmail, setAuthEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);

  // Filter conditions
  const [searchFilters, setSearchFilters] = useState({
    text: "",
    category: "All",
    budget: 1000,
    rating: null,
    distance: 15
  });

  // AGENTIC AI STATE
  const [aiChatMessages, setAiChatMessages] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAuditResult, setAiAuditResult] = useState(null);
  const [aiStep, setAiStep] = useState(1); // 1, 2, 3
  const [aiChips, setAiChips] = useState([]);
  const [showAiInput, setShowAiInput] = useState(false);
  const [pendingAiResult, setPendingAiResult] = useState(null);
  const aiChatEndRef = useRef(null);

  const openAiTool = () => {
    setAiAuditResult(null);
    setPendingAiResult(null);
    setAiStep(1);
    setAiChips([]);
    setShowAiInput(false);
    setAiChatMessages([{ role: "assistant", content: "Namaste! I am the Build_Trust Project Manager. What kind of construction or repair work do you need today?" }]);
    setActiveModal('ai');
  };

  // OTP Timer Effect
  useEffect(() => {
    let interval;
    if (otpCooldown > 0) {
      interval = setInterval(() => {
        setOtpCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpCooldown]);

  // Scroll AI chat to bottom
  useEffect(() => {
    aiChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiChatMessages]);

  // FETCH WORKERS FROM BACKEND
  const fetchWorkers = async (filters = searchFilters, page = 1) => {
    setIsLoadingWorkers(true);
    try {
      const queryParams = new URLSearchParams({
        page: page,
        limit: 20,
        category: filters.category,
        text: filters.text,
        min_rating: filters.rating || 0,
        max_rate: filters.budget || 1000000
      });

      const response = await fetch(`http://localhost:8001/api/workers?${queryParams.toString()}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        if (page === 1) {
          setWorkers(data);
        } else {
          setWorkers(prev => [...prev, ...data]);
        }
      } else {
        console.error("Malformed workers data:", data);
        if (page === 1) setWorkers(initialWorkers);
      }
    } catch (err) {
      console.error("Failed to fetch workers:", err);
      if (page === 1) setWorkers(initialWorkers);
    } finally {
      setIsLoadingWorkers(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const applyFilters = (newFilters) => {
    setSearchFilters(newFilters);
    fetchWorkers(newFilters, 1);
  };

  // FETCH ADMIN STATS FROM BACKEND
  useEffect(() => {
    const fetchAdminStats = async () => {
      setIsLoadingAdmin(true);
      try {
        const response = await fetch('http://localhost:8001/api/admin/stats');
        const data = await response.json();
        if (data && !data.error) {
          setAdminState(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      } finally {
        setIsLoadingAdmin(false);
      }
    };
    fetchAdminStats();
  }, []);
  
  // Modals & Overlays Visibility
  const [activeModal, setActiveModal] = useState(null); 
  const [bookingWorkerId, setBookingWorkerId] = useState(null);
  const [chattingWorkerId, setChattingWorkerId] = useState(null);
  
  // Comparison lists
  const [comparisonList, setComparisonList] = useState([]);

  // Toasts notifications queue
  const [toasts, setToasts] = useState([]);

  // Persistent Chat logs { workerId: [messages] }
  const [chatLogs, setChatLogs] = useState({});

  // Navigation Sync
  const changeRoute = (viewName) => {
    if (viewName === 'home') navigate('/');
    else if (viewName === 'search') navigate('/search');
    else if (viewName === 'admin') navigate('/admin');
    else if (viewName.startsWith('profile/')) {
      const id = viewName.split('/')[1];
      navigate(`/profile/${id}`);
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

  // 3. BOOKING WIZARD HANDLERS
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardForm, setWizardForm] = useState({
    description: "Need masonry stone work repair for my garden patio walls.",
    address: "Sector 62, Noida",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().substring(0,10),
    hours: 8,
    priority: "Standard"
  });

  const handleBookingConfirm = async () => {
    // SECURITY CHECK: MANDATORY LOGIN
    if (!isLoggedIn) {
      setAuthStep('email');
      setActiveModal('login');
      addToast("Please login to finalize your booking", "info");
      return;
    }

    const worker = workers.find(w => w.id === bookingWorkerId);
    if (!worker) return;

    const totalCost = worker.rate * wizardForm.hours;
    
    const bookingPayload = {
      ...wizardForm,
      workerId: worker.id,
      workerName: worker.name,
      totalCost: totalCost,
      customerEmail: currentUser.email
    };

    try {
      const response = await fetch('http://localhost:8001/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });
      const data = await response.json();

      if (data.status === "success" || data.status === "mock_success") {
        setAdminState(prev => {
          const newActiveJobs = (prev.activeJobs || 0) + 1;
          const newOnSchedule = (prev.onSchedule || 0) + 1;
          
          const newLiveOps = [
            {
              id: Date.now(),
              text: `Hired: ${worker.name} accepted job at ${wizardForm.address} (₹${totalCost.toLocaleString()} / ${wizardForm.hours} hrs)`,
              time: "Just now",
              type: "job",
              icon: "✓",
              color: "green-bg"
            },
            ...(prev.liveOps || [])
          ];

          return { ...prev, activeJobs: newActiveJobs, onSchedule: newOnSchedule, liveOps: newLiveOps };
        });

        addToast(`Hired ${worker.name}! Request saved to Dataverse.`, 'success');
        setActiveModal(null);
        navigate('/search');
      }
    } catch (err) {
      console.error("Failed to confirm booking:", err);
      addToast("Failed to register booking. Check backend connection.", "error");
    }
  };

  // 4. POST JOB WIZARD HANDLERS
  const [postJobForm, setPostJobForm] = useState({
    title: "",
    category: "Electrical",
    location: "Sector 62, Noida",
    budget: "₹15,000",
    desc: ""
  });

  const handlePostJobConfirm = async () => {
    if (postJobForm.title.trim() === "" || postJobForm.location.trim() === "") {
      addToast("Please fill all required project details", "info");
      return;
    }

    try {
      const response = await fetch('http://localhost:8001/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postJobForm)
      });
      const data = await response.json();
      
      if (data.status === "success" || data.status === "mock_success") {
        setAdminState(prev => {
          const newPendingLeads = (prev.pendingLeads || 0) + 1;
          const newLiveOps = [
            {
              id: Date.now(),
              text: `Lead Posted: "${postJobForm.title}" (${postJobForm.category}) in ${postJobForm.location} - Budget: ${postJobForm.budget}`,
              time: "Just now",
              type: "lead",
              icon: "★",
              color: "blue-bg"
            },
            ...(prev.liveOps || [])
          ];

          return {
            ...prev,
            pendingLeads: newPendingLeads,
            liveOps: newLiveOps
          };
        });

        addToast("Project requirements posted successfully! Admin Dashboard notified.");
        setActiveModal(null);
      } else {
        throw new Error(data.message || "Failed to post lead");
      }
    } catch (err) {
      console.error("Failed to post lead:", err);
      addToast("Failed to post lead. Please check backend connection.", "error");
    }
  };

  // 5. AUTH HANDLERS
  const handleSendOtp = async () => {
    if (!authEmail.includes("@")) {
      addToast("Please enter a valid email address", "info");
      return;
    }
    try {
      const res = await fetch('http://localhost:8001/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail })
      });
      const data = await res.json();
      if (data.status === "success") {
        setAuthStep('otp');
        setOtpCooldown(60); 
        addToast("OTP sent! Please check your inbox.");
      } else {
        addToast(data.message, "error");
      }
    } catch (err) {
      addToast("Failed to send OTP", "error");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await fetch('http://localhost:8001/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, code: otpValue })
      });
      const data = await res.json();
      if (data.status === "success") {
        setIsLoggedIn(true);
        setCurrentUser(data.user);
        addToast(`Welcome back, ${data.user.email}!`);
        
        if (bookingWorkerId) {
          setActiveModal('booking');
          setWizardStep(3); 
        } else {
          setActiveModal(null);
        }
      } else {
        addToast(data.message, "error");
      }
    } catch (err) {
      addToast("Verification failed", "error");
    }
  };

  // 6. REAL CHAT HANDLERS
  const [chatInput, setChatInput] = useState("");

  const handleSendChatMessage = async () => {
    if (chatInput.trim() === "" || !isLoggedIn) return;
    
    const workerId = chattingWorkerId;
    const clientMsg = { sender: 'client', text: chatInput };
    
    // Optimistic UI update
    setChatLogs(prev => {
      const list = prev[workerId] || [];
      return { ...prev, [workerId]: [...list, clientMsg] };
    });
    setChatInput("");

    try {
      await fetch('http://localhost:8001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: workerId,
          customerEmail: currentUser.email,
          sender: 'client',
          text: clientMsg.text
        })
      });

      // Simulation: Auto-reply
      setTimeout(async () => {
        const replyText = "Thank you for the message! I've received your inquiry and will review the project specs shortly.";
        const workerMsg = { sender: 'worker', text: replyText };
        
        await fetch('http://localhost:8001/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workerId: workerId,
            customerEmail: currentUser.email,
            sender: 'worker',
            text: replyText
          })
        });

        setChatLogs(prev => {
          const list = prev[workerId] || [];
          return { ...prev, [workerId]: [...list, workerMsg] };
        });
      }, 1000);

    } catch (err) {
      console.error("Chat persistence failed", err);
    }
  };

  // 6. AGENTIC AI CHAT (CHIP-BASED)
  const handleAiChatSubmit = async (e, forcedInput = null) => {
    if (e) e.preventDefault();
    const currentInput = forcedInput || aiInput;
    if (!currentInput.trim() || isAiLoading) return;

    // Reset UI state for next turn
    setAiChips([]);
    setShowAiInput(false);

    const userMsg = { role: "user", content: currentInput };
    const newMessages = [...aiChatMessages, userMsg];
    setAiChatMessages(newMessages);
    setAiInput("");
    setIsAiLoading(true);

    try {
      const response = await fetch('http://localhost:8001/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await response.json();

      if (data.status === "READY") {
        setAiAuditResult(data);
        setAiStep(3);
        setShowAiInput(true); // Always show at the end
        setAiChatMessages(prev => [...prev, { role: "assistant", content: data.message }]);
      } else if (data.status === "QUESTION") {
        setAiStep(2);
        setAiChips(data.chips || []);
        setAiChatMessages(prev => [...prev, { role: "assistant", content: data.message }]);
      } else {
        // Fallback for simple chat responses
        setAiChatMessages(prev => [...prev, { role: "assistant", content: data.message || "I'm not sure how to respond to that." }]);
        setShowAiInput(true);
      }
    } catch (err) {
      console.error("AI Agent failed", err);
      setAiChatMessages(prev => [...prev, { role: "assistant", content: "I'm sorry, I encountered an error while analyzing your request. Please try again." }]);
      setShowAiInput(true);
    } finally {
      setIsAiLoading(false);
    }
  };

  // 7. ADMIN DASHBOARD ISSUE RESOLVER
  const handleResolveIssue = (issueId) => {
    const issue = adminState.criticalIssues.find(i => i.id === issueId);
    if (!issue) return;

    setAdminState(prev => {
      const remainingIssues = (prev.criticalIssues || []).filter(i => i.id !== issueId);
      const newLiveOps = [
        {
          id: Date.now(),
          text: `Resolved critical issue: ${issue.title}`,
          time: "Just now",
          type: "job",
          icon: "✓",
          color: "green-bg"
        },
        ...(prev.liveOps || [])
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
      {location.pathname !== '/admin' && (
        <Header 
          activeView={location.pathname === '/' ? 'home' : location.pathname.substring(1)}
          setActiveView={changeRoute}
          currentLocation={currentLocation}
          setCurrentLocation={setCurrentLocation}
          onOpenLogin={() => {
            setAuthStep('email');
            setActiveModal('login');
          }}
          onOpenAiTool={openAiTool}
        />
      )}

      {/* Main Views Router */}
      <main id="app-container">
        <Routes>
          <Route path="/" element={
            <LandingView 
              workers={workers}
              setActiveView={changeRoute}
              setSearchFilters={applyFilters}
              onOpenBookingWizard={(id, isEmergency) => {
                setBookingWorkerId(id);
                if (isEmergency) setWizardForm(prev => ({ ...prev, priority: 'Emergency' }));
                setWizardStep(1);
                setActiveModal('booking');
              }}
              onOpenAiTool={openAiTool}
              onOpenPostJob={() => {
                setPostJobForm({ title: "", category: "Electrical", location: "Sector 62, Noida", budget: "₹15,000", desc: "" });
                setActiveModal('post-job');
              }}
            />
          } />

          <Route path="/search" element={
            <SearchView 
              workers={workers}
              isLoading={isLoadingWorkers}
              setActiveView={changeRoute}
              searchFilters={searchFilters}
              setSearchFilters={applyFilters}
              comparisonList={comparisonList}
              setComparisonList={setComparisonList}
              onOpenComparison={() => setActiveModal('comparison')}
              onLoadMore={() => {
                const nextPage = Math.floor(workers.length / 20) + 1;
                fetchWorkers(searchFilters, nextPage);
              }}
            />
          } />

          <Route path="/profile/:id" element={
            <ProfileViewWrapper 
              workers={workers}
              changeRoute={changeRoute}
              setBookingWorkerId={setBookingWorkerId}
              setWizardStep={setWizardStep}
              setActiveModal={setActiveModal}
              chatLogs={chatLogs}
              setChatLogs={setChatLogs}
              setChattingWorkerId={setChattingWorkerId}
              addToast={addToast}
              isLoggedIn={isLoggedIn}
              currentUser={currentUser}
            />
          } />

          <Route path="/admin" element={
            <AdminView 
              adminState={adminState}
              isLoading={isLoadingAdmin}
              setActiveView={changeRoute}
              onResolveIssue={handleResolveIssue}
              onPostJob={() => {
                setPostJobForm({ title: "", category: "Electrical", location: "Sector 62, Noida", budget: "₹15,000", desc: "" });
                setActiveModal('post-job');
              }}
              onReviewProfiles={() => {
                applyFilters({ text: "", category: "All", budget: 1000, rating: null, distance: 30 });
                changeRoute('search');
                addToast("Displaying all registered specialists awaiting review.", "info");
              }}
            />
          } />
        </Routes>
      </main>

      {/* Client Footer */}
      {location.pathname !== '/admin' && (
        <Footer setActiveView={changeRoute} />
      )}

      {/* LOGIN / AUTH MODAL */}
      {activeModal === 'login' && (
        <div className="modal-backdrop active">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{authStep === 'email' ? 'Login or Create Account' : 'Verify Email'}</h3>
              <button className="close-modal-btn" onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <div className="modal-body">
              {authStep === 'email' ? (
                <div className="auth-form">
                  <p style={{ marginBottom: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
                    Enter your email to receive a 6-digit secure login code.
                  </p>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      placeholder="name@example.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                    />
                  </div>
                  <button 
                    type="button" 
                    className={`btn btn-accent btn-full ${otpCooldown > 0 ? 'disabled' : ''}`}
                    disabled={otpCooldown > 0}
                    onClick={handleSendOtp}
                  >
                    {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Send Secure Code'}
                  </button>
                  <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button 
                      className="btn btn-text" 
                      style={{ fontSize: '12px' }}
                      onClick={() => {
                        setIsLoggedIn(true);
                        setCurrentUser({ email: 'admin@buildtrust.com', role: 'admin' });
                        changeRoute('admin');
                        setActiveModal(null);
                        addToast("Logged in as Administrator Vikram Singh!");
                      }}
                    >
                      Login as Admin (Vikram Singh)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="auth-form">
                  <p style={{ marginBottom: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
                    We've sent a 6-digit code to <strong>{authEmail}</strong>.
                  </p>
                  <div className="form-group">
                    <label className="form-label">Enter 6-Digit Code</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="000000"
                      maxLength="6"
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value)}
                    />
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-accent btn-full"
                    onClick={handleVerifyOtp}
                  >
                    Verify & Continue
                  </button>
                  <button 
                    className={`btn btn-text btn-full text-center ${otpCooldown > 0 ? 'disabled' : ''}`}
                    disabled={otpCooldown > 0}
                    style={{ marginTop: '10px', fontSize: '13px' }}
                    onClick={() => {
                      if (otpCooldown === 0) handleSendOtp();
                    }}
                  >
                    {otpCooldown > 0 ? `Resend available in ${otpCooldown}s` : 'Resend Code'}
                  </button>
                  <button 
                    className="btn btn-text btn-full text-center" 
                    style={{ marginTop: '5px', fontSize: '13px', opacity: 0.7 }}
                    onClick={() => setAuthStep('email')}
                  >
                    Change Email
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. BOOKING WIZARD MODAL */}
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
                    <button className="btn btn-accent btn-large" onClick={handleBookingConfirm}>
                      {isLoggedIn ? 'Confirm Booking' : 'Login to Confirm'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. AGENTIC AI COST ESTIMATION TOOL MODAL */}
      {activeModal === 'ai' && (
        <div className="modal-backdrop active">
          <div className="modal-card ai-agent-modal">
            <div className="ai-modal-header">
              <div className="header-avatar-box">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.3C.5 6.7.9 9.8 2.9 11.8c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.1z"/>
                </svg>
              </div>
              <div className="header-info">
                <div className="header-name">Build_Trust</div>
                <div className="header-status">Online · responds instantly</div>
              </div>
              <button className="close-modal-btn" onClick={() => setActiveModal(null)} style={{ color: 'var(--color-text-secondary)' }}>&times;</button>
            </div>

            <div className="ai-progress-wrap">
              <div className="ai-progress-label">
                <span>{aiStep === 3 ? "Step 3 of 3 — your estimate is ready" : `Step ${aiStep} of 3 — understanding your project`}</span>
                <span>{aiStep === 1 ? '33%' : aiStep === 2 ? '66%' : '100%'}</span>
              </div>
              <div className="ai-progress-track">
                <div className="ai-progress-fill" style={{ width: aiStep === 1 ? '33%' : aiStep === 2 ? '66%' : '100%' }}></div>
              </div>
            </div>

            <div className="ai-chat-body">
              {aiChatMessages.map((msg, idx) => (
                <div key={idx} className={`ai-msg-row ${msg.role}`}>
                  {msg.role === 'assistant' && (
                    <div className="ai-mini-avatar">
                      <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.3C.5 6.7.9 9.8 2.9 11.8c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.1z"/></svg>
                    </div>
                  )}
                  <div className={`ai-bubble ${msg.role}`}>
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              
              {isAiLoading && (
                <div className="ai-msg-row assistant">
                  <div className="ai-mini-avatar">...</div>
                  <div className="ai-bubble agent typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}

              {/* Option Chips Turn */}
              {!isAiLoading && aiChips.length > 0 && (
                <div className="ai-chip-container animate-fade">
                  {aiChips.map((chip, cidx) => (
                    <button 
                      key={cidx} 
                      className="ai-option-chip"
                      onClick={() => handleAiChatSubmit(null, chip)}
                    >
                      {chip}
                    </button>
                  ))}
                  <button 
                    className="ai-option-chip something-else"
                    onClick={() => setShowAiInput(true)}
                  >
                    Something else...
                  </button>
                </div>
              )}
              
              {aiAuditResult && (
                <div className="animate-fade">
                  <div className="ai-estimate-card">
                    <div className="ai-estimate-header">
                       <svg viewBox="0 0 24 24" width="14" height="14" style={{ marginRight: '4px' }}><path fill="currentColor" d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 3.98 2.53.47 3.3 1.25 3.3 2.23 0 1.14-1.2 1.94-3.05 1.94-2.11 0-2.85-.94-2.95-2.23H6.04c.1 1.97 1.55 3.19 3.46 3.66V21h3v-2.16c1.94-.39 3.51-1.49 3.51-3.66-.01-2.12-1.21-3.53-4.21-4.28z"/></svg>
                       <span>Estimated cost range</span>
                    </div>
                    <div className="ai-estimate-body">
                      <div className="ai-estimate-range">₹{Math.floor((aiAuditResult.estimate.estimated_cost_inr || 0) * 0.8).toLocaleString()} – ₹{Math.ceil((aiAuditResult.estimate.estimated_cost_inr || 0) * 1.2).toLocaleString()}</div>
                      <div className="ai-estimate-note">Based on local trade rates · Parts + labour · {currentLocation}</div>
                    </div>
                  </div>

                  <div className="ai-workers-label">{aiAuditResult.specialists.length} matches · sorted by rating</div>
                  <div className="ai-worker-cards">
                    {aiAuditResult.specialists.map(w => (
                      <div key={w.id} className="ai-worker-card" onClick={() => { setActiveModal(null); navigate(`/profile/${w.id}`); }}>
                        <div className="ai-worker-initials" style={{ 
                          backgroundColor: w.name.includes('S') ? '#EEEDFE' : '#E1F5EE',
                          color: w.name.includes('S') ? '#3C3489' : '#0F6E56'
                        }}>
                          {w.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ai-worker-info">
                          <div className="ai-worker-name">{w.name}</div>
                          <div className="ai-worker-meta">{w.specialty} · 5+ yrs exp · NCR</div>
                          <div className="ai-worker-stars">
                            <svg viewBox="0 0 24 24" width="10" height="10" style={{ color: '#FF6B2B' }}><path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                            {w.rating} · 10+ jobs
                          </div>
                        </div>
                        <div className="ai-worker-price">₹{w.rate}<br/><span style={{ fontSize: '9px', fontWeight: 400, color: 'var(--color-text-secondary)' }}>est.</span></div>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ padding: '10px 0', textAlign: 'center' }}>
                    <button className="btn btn-text btn-small" onClick={() => handleAiChatSubmit(null, "Show more specialists")}>Suggest more workers</button>
                  </div>
                </div>
              )}
              <div ref={aiChatEndRef} />
            </div>

            {/* Input Area (Conditionally visible) */}
            {(showAiInput || aiChatMessages.length === 1) && (
              <form className="ai-input-area" onSubmit={handleAiChatSubmit}>
                <input 
                  className="ai-chat-input" 
                  placeholder="Type your answer…" 
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  disabled={isAiLoading}
                  autoFocus
                />
                <button type="submit" className="ai-send-btn" disabled={isAiLoading}>
                  <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TOASTS */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.type === 'success' ? <span>✓</span> : <span style={{ marginRight: '6px' }}>⚠</span>}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </React.Fragment>
  );
}
