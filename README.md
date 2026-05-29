<div align="center">

<br />

```
  ██████╗ ██╗   ██╗██╗██╗     ██████╗     ████████╗██████╗ ██╗   ██╗███████╗████████╗
  ██╔══██╗██║   ██║██║██║     ██╔══██╗    ╚══██╔══╝██╔══██╗██║   ██║██╔════╝╚══██╔══╝
  ██████╔╝██║   ██║██║██║     ██║  ██║       ██║   ██████╔╝██║   ██║███████╗   ██║   
  ██╔══██╗██║   ██║██║██║     ██║  ██║       ██║   ██╔══██╗██║   ██║╚════██║   ██║   
  ██████╔╝╚██████╔╝██║███████╗██████╔╝       ██║   ██║  ██║╚██████╔╝███████║   ██║   
  ╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝        ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝  
```

# 🏗️ Build_Trust

### *India's Construction & Labour Marketplace — Where Every Job Builds Trust*

<br />

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com) 
[![Dataverse](https://img.shields.io/badge/Database-Dataverse-0078D4?style=for-the-badge&logo=microsoft&logoColor=white)](.)
[![Status](https://img.shields.io/badge/Status-Prototype%20Finalized-brightgreen?style=for-the-badge)](.)

<br />

> **Build_Trust** is a professional-grade marketplace connecting customers with verified contractors and labour workers —
> powered by **Gemma AI** pricing, **Dataverse** enterprise storage, and **Resend** verified email authentication.

<br />

[🚧 Current Status](#-current-status) · [📖 Docs](#) · [🐛 Report Bug](#) · [✨ Request Feature](#)

<br />

---

</div>

## 📋 Table of Contents

- [🚧 Current Status](#-current-status)
- [💡 The Problem We Solve](#-the-problem-we-solve)
- [✨ What Build_Trust Offers](#-what-build_trust-offers)
- [🏛️ Platform Modules](#️-platform-modules)
- [🗂️ Project Structure](#️-project-structure)
- [⚙️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [👥 User Roles](#-user-roles)
- [💎 Subscription Plans](#-subscription-plans)
- [💰 Business Model](#-business-model)
- [🗺️ Roadmap](#️-roadmap)
- [⚠️ Known Challenges](#️-known-challenges)
- [🤝 Contributing](#-contributing)

---

## 🚧 Current Status

> **Build_Trust has evolved into a fully functional prototype with a real Python backend and Dataverse integration.**

| Area | Status | Notes |
|---|---|---|
| 🎨 Landing Page UI | ✅ Complete | Professional layout with routing |
| 🔍 Search / Finder View | ✅ Complete | Server-side filtering + 100k scale |
| 👤 Worker Profile View | ✅ Complete | Dynamic profiles + deep linking |
| 📊 Admin Dashboard View | ✅ Complete | Real-time Dataverse metrics & logs |
| 🔐 Authentication | ✅ Complete | Secure Email OTP (Resend + JWT) |
| 🗄️ Backend / Database | ✅ Complete | FastAPI + Dataverse (OData) |
| 🤖 AI Pricing Engine | ✅ Complete | OpenRouter + Gemma-2-9b analysis |
| 📍 Navigation | ✅ Complete | React Router + Breadcrumbs |

---

## 💡 The Problem We Solve

India's ₹20 lakh crore construction industry still runs on **word-of-mouth, middlemen, and handshake deals** — leaving both customers and workers exposed:

| Pain Point | Who It Hurts |
|---|---|
| 🔍 No trusted discovery platform | Customers can't find verified workers |
| 💸 Opaque, inconsistent pricing | Both sides get exploited |
| 📄 No contracts or paper trail | Payment disputes with no resolution |
| 📵 Workers have no digital presence | Skilled labour stays invisible |
| 🤝 Deep trust deficit | Projects stall, quality suffers |

**Build_Trust** is being built to fix exactly this — one verified booking at a time.

---

## ✨ What Build_Trust Offers

<table>
<tr>
<td width="50%">

### 🤖 AI-Powered Pricing
Smart cost estimation based on location, work type, and real-time market trends via **Gemma-2-9b**. Includes a conversational, step-by-step interactive UI to accurately scope projects before estimation.

### 🏢 Enterprise Dataverse Storage
Robust backend integrated with **Microsoft Dataverse**, handling 100,000+ legacy records with optimized OData querying, server-side filtering, and persistent job tracking.

### 🔐 Secure Passwordless Login
A professional **OTP (One-Time Password)** system delivered via **Resend** using a verified custom domain (`kurianjose.me`), ensuring secure onboarding.

### 🏆 Worker Recognition Engine *(Planned)*
Top Performer badges, verified tags, skill-based rankings — rewarding quality and building long-term trust.

</td>
<td width="50%">

### 📊 Real-Time Admin Portal
A comprehensive command center for administrators featuring live operation event streams, Dataverse-backed metrics, and a mobile-responsive dashboard.

### 📋 Digital Contracts *(Planned)*
Legally structured agreements generated between workers and customers in seconds.

### 📸 Progress Tracking *(Planned)*
Daily geo-tagged photo updates. Know exactly what's happening on-site.

### 🗣️ Voice + Multi-Language *(Planned)*
Hindi and regional language support with a voice interface for low-literacy workers.

</td>
</tr>
</table>

---

## 🏛️ Platform Modules

```
┌─────────────────────────────────────────────────────────────────┐
│                        BUILD_TRUST PLATFORM                      │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  MODULE 1    │  MODULE 2    │  MODULE 3    │   MODULE 4         │
│  Dashboard   │  Lead Mgmt  │  Financial   │  Customer          │
│              │  System      │  Analysis    │  Engagement        │
├──────────────┼──────────────┼──────────────┼────────────────────┤
│  MODULE 5    │  MODULE 6    │  MODULE 7    │   FUTURE           │
│  Worker      │ Performance  │ Integration  │  CRM / API /       │
│  Recognition │  Analytics   │ & Access.    │  Webhooks          │
└──────────────┴──────────────┴──────────────┴────────────────────┘
```

<details>
<summary><strong>🔷 Module 1 — Dashboard</strong></summary>
<br/>

- Role-based secure login (Admin / Customer / Worker)
- Real-time overview: active jobs, pending leads, revenue, worker availability
- Labour assignment & availability tracking
- Offers & combo packages (e.g., "Full House Construction", "Painting + Polishing")
- AI-based pricing suggestions
- Escrow payment management *(planned)*
- Subscription plan management
- Auto wage calculation (work type × hours × area in sq ft)

</details>

<details>
<summary><strong>🔷 Module 2 — Lead Management System</strong></summary>
<br/>

Fully automated 6-stage pipeline:

```
  📥 Capture → 🔍 Qualify → 🎯 Assign → 🔔 Follow-Up → ✅ Convert → ⭐ Feedback
```

- Filter leads by budget, urgency & location
- Auto-assign to relevant contractor
- Notification & reminder automation
- Lead → Booking conversion tracking
- Post-service rating & review collection

</details>

<details>
<summary><strong>🔷 Module 3 — Financial Analysis</strong></summary>
<br/>

- AI Agent interactive cost estimation tools
- Budget tracking & payment history
- Revenue reports & profit insights

</details>

---

## 🗂️ Project Structure

```
Construction_workplace/
│
├── index.html                       # Core HTML entry point
├── package.json                     # Project dependencies & scripts
├── vite.config.js                   # Vite build & dev configuration
│
├── backend/                         # FastAPI Python Backend
│   ├── app/services/
│   │   ├── ai/openrouter_service.py # Gemma AI Integration
│   │   ├── auth_service.py          # Resend OTP Auth
│   │   └── dataverse_service.py     # MSAL & OData DB connection
│   ├── main.py                      # API Router (Port 8001)
│   └── run.bat                      # Auto-setup and run script
│
└── src/
    ├── main.jsx                     # Application bootstrap & React root
    ├── App.jsx                      # Core routing, view selection & global state
    ├── index.css                    # Design system, CSS variables & layout resets
    │
    └── components/
        ├── Header.jsx               # Premium nav bar
        ├── Footer.jsx               # Public site footer
        ├── LandingView.jsx          # Homepage / landing page
        ├── SearchView.jsx           # Worker finder with 100k backend pagination
        ├── ProfileView.jsx          # Worker profile page with booking widget
        └── AdminView.jsx            # Admin dashboard with live Dataverse polling
```

---

## ⚙️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 18 + Vite 5 | Fast component-based UI |
| **Styling** | Vanilla CSS + Variables | Themeable, scalable premium design |
| **Routing & State** | React Router DOM | Client-side navigation |
| **Backend API** | Python 3.12 + FastAPI | High-performance server logic |
| **Database** | Microsoft Dataverse | Enterprise cloud storage via OData |
| **AI Layer** | OpenRouter (Gemma-2-9b) | Interactive Agentic AI for estimates |
| **Authentication** | Resend SDK + JWT | Passwordless OTP login |

---

## 🚀 Getting Started

### Prerequisites

```bash
node >= 18.x
python >= 3.10
```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/KurianJose7586/Build_Trust

# 2. Setup Backend
cd backend
# Create .env based on .env.example
./run.bat # Installs dependencies and starts server on port 8001

# 3. Setup Frontend
cd ..
npm install
npm run dev # Starts Vite on port 8000
```

---

## 👥 User Roles

| Role | Access Level | Key Capabilities |
|---|---|---|
| 🔴 **Admin** | Full platform | Manage workers, leads, payments, analytics |
| 🔵 **Customer** | Customer portal | Search, book, track jobs, review workers |
| 🟢 **Worker** | Worker portal | Manage profile, accept jobs, track earnings |

---

## 💎 Subscription Plans

```
┌──────────────────┬──────────────────┬──────────────────────────┐
│   🟢 BASIC        │   🔵 PREMIUM      │   🟣 PRO  (Coming Soon)  │
│   Free            │   Paid            │   Enterprise             │
├──────────────────┼──────────────────┼──────────────────────────┤
│ Search workers   │ Priority booking │ Multi-team management    │
│ Basic booking    │ AI cost estimate │ Advanced analytics       │
│ View ratings     │ Verified workers │ CRM integration          │
│ Basic profile    │ Faster service   │ Custom API access        │
│ Limited leads    │ Analytics dash   │ Dedicated support        │
│                  │ Premium badge    │ White-label option       │
└──────────────────┴──────────────────┴──────────────────────────┘
```

---

## 💰 Business Model

```
Build_Trust Revenue Streams
│
├── 📦 Commission per booking       % cut on every completed transaction
├── 💳 Subscription plans           Basic (free) / Premium / Pro (paid tiers)
├── 📢 Featured listings            Paid boost for worker visibility
├── 📣 In-platform advertising      Targeted ads for material suppliers etc.
└── 🎁 Service packages             Bundled construction combos & deals
```

---

## 🗺️ Roadmap

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PHASE 1 — Frontend Foundation  (DONE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅  Project setup (Vite + React)
  ✅  Landing page & core UI shell
  ✅  Worker search with filters (SearchView)
  ✅  Worker profile + booking widget (ProfileView)
  ✅  Admin operational dashboard (AdminView)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PHASE 2 — Core Backend & Auth (DONE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅  Role-based authentication (Admin / Customer)
  ✅  FastAPI REST API layer
  ✅  Dataverse Database integration
  ✅  Real-time lead management pipeline
  ✅  Secure OTP Login Gateway

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PHASE 3 — Intelligence & Trust Layer (DONE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅  Conversational AI Agent for cost estimates (Gemma)
  ✅  Dynamic UI with interactive Question Chips
  ✅  Real-time Dataverse Worker Matchmaking
  ✅  IP Rate Limiting for AI interactions
  🔮  Job progress tracking with geo-tagged photos
  🔮  Digital contract generation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PHASE 4 — Scale & Accessibility
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔮  Multi-language support (Hindi + regional)
  🔮  Voice-based interaction for workers
  🔮  Mobile app (iOS + Android)

Legend:  ✅ Done   🔄 In Progress   🔮 Planned
```

---

## ⚠️ Known Challenges

| Challenge | Our Approach |
|---|---|
| 📵 Low digital literacy among workers | Voice UI + simplified onboarding (Phase 4) |
| 🤝 Trust deficit on a new platform | KYC verification + escrow payment protection |
| 💸 Payment disputes | Milestone-based escrow release system |
| 🌐 Internet access in remote areas | Offline-first features (under consideration) |

---

## 🤝 Contributing

Build_Trust is in active development — ideas, feedback, and contributions are very welcome.

```bash
# 1. Fork this repo
# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Commit using Conventional Commits
git commit -m "feat: describe what you added"

# 4. Push & open a Pull Request
git push origin feature/your-feature-name
```

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) standard.

---

<div align="center">

<br />

**Built with ❤️ for India's construction workers and ecosystem.**

### *Every job booked. Every worker verified. Every payment secured.*
### *That's how we Build_Trust.*

<br />

[![Made in India](https://img.shields.io/badge/Made%20in-India%20🇮🇳-FF9933?style=flat-square)](.)
[![MIT License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](.)

</div>