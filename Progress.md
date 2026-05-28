# Build_Trust Project Progress

This document tracks the migration of the Build_Trust CRM from a static mock-up to a fully dynamic, MongoDB-integrated Enterprise application.

## 🚀 Current Status: **Backend Pivoted to MongoDB (Ready for Connection)**

---

## 🛠 Phase 1: Backend Foundation
- [x] **Initialize Python FastAPI Backend**
  - [x] Set up directory structure
  - [x] Create `requirements.txt` with core dependencies (FastAPI, Motor, Pandas)
  - [x] Implement `MongoDB` connection logic
- [x] **Development Environment**
  - [x] Create `.env.example` with MongoDB connection strings
  - [x] Create `run.bat` for local execution

## 📊 Phase 2: Data Migration (The 100k Challenge)
- [ ] **CSV Migration Engine**
  - [ ] Implement chunk-based reader for `Hire_Worker_CRM_Migration_Sample_100000.csv`
  - [ ] Build data cleaning logic (Email validation, Status mapping)
  - [ ] Create MongoDB Bulk Insert service
- [ ] **Validation & Quality Control**
  - [ ] Implement "Migration Batch" tracking
  - [ ] Handle `duplicate_flag` and quality issues reported in CSV

## 🔗 Phase 3: Frontend Integration (Dynamic Conversion)
- [ ] **Data Sourcing**
  - [ ] Replace `initialWorkers` with API call to `GET /api/workers`
  - [ ] Replace `initialAdminState` metrics with `GET /api/admin/stats`
- [ ] **Interactive Pipelines**
  - [ ] Connect "Post Job" modal to `POST /api/leads`
  - [ ] Connect "Booking Wizard" to backend Job creation
  - [ ] Implement dynamic "Specialist Profile" fetching by ID


## 🧠 Phase 4: Advanced Persistence & Logic
- [ ] **Communication**
  - [ ] Move Chat Logs from local state to Dataverse `bt_Messages`
  - [ ] Replace hardcoded Chat auto-replies with backend logic
- [ ] **Live Operations**
  - [ ] Replace local "Live Ops" array with a real event stream/DB query
  - [ ] Implement "Issue Resolution" persistence
- [ ] **AI & Analytics**
  - [ ] Create backend handler for "AI Cost Estimation"
  - [ ] Generate dynamic SVG chart paths based on real revenue data

## 🔐 Phase 5: Security & Deployment
- [ ] **Authentication**
  - [ ] Implement Microsoft SSO for Admin Portal
- [ ] **Resilience**
  - [ ] Add global error boundaries for API failures
  - [ ] Implement caching for Specialist data to improve performance

---

## ⚠️ Current "Simulated" Features (Mock List)
As of now, the following features are still **simulated** (hardcoded in the frontend):
1. **AI Cost Estimation:** The "Processing" delay and results are hardcoded `setTimeout`.
2. **Chat Simulator:** Worker replies are hardcoded logic in `App.jsx`.
3. **Admin Revenue Charts:** The visual curves on the graph do not reflect real numbers.
4. **Live Ops Feed:** New items are added to a local temporary list that resets on refresh.
5. **Worker Images:** Using local placeholder assets instead of dynamic URLs.
6. **Authentication:** Clicking "Login" bypasses all security and sets a dummy admin state.
