<p align="center">
  <img src="https://img.shields.io/badge/School_OS-v1.0.0-blueviolet?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiI+PHBhdGggZD0iTTIgMyBoMjAgdiAxOCBIMiB6Ii8+PHBhdGggZD0iTTggMyB2IDE4Ii8+PHBhdGggZD0iTTIgOSBoMjAiLz48L3N2Zz4=" alt="School OS" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
</p>

<h1 align="center">
  🏫 School OS
</h1>

<p align="center">
  <strong>The Intelligent School ERP Platform</strong>
  <br />
  <em>Turning daily administrative chaos into intelligent, automated, data-driven institutional management.</em>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-api-reference">API</a> •
  <a href="#-roadmap">Roadmap</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## 🧠 What is School OS?

**School OS** is a next-generation, cloud-native, AI-ready **School ERP SaaS platform** purpose-built for the Indian K-12 education ecosystem. It unifies **student lifecycle management**, **financial operations**, **academic tracking**, **HR/payroll**, and **institutional communication** into a single, intuitive, role-aware interface — accessible from any device, with zero server management burden.

> **The long-term north star**: An **Agentic School OS** — where AI agents autonomously handle fee reminders, generate progress reports, flag at-risk students, schedule substitutes, and answer parent queries — all without a single manual click.

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║     🏫  Multi-Tenant Architecture    →  100% Data Isolation      ║
║     🔐  Role-Based Access Control    →  Fine-grained RBAC        ║
║     📊  Real-Time Analytics          →  Live Dashboards          ║
║     🤖  AI-Ready Data Architecture   →  LLM-Consumable Schema   ║
║     💰  Complete Finance Suite       →  Fees + Payroll + Ledger  ║
║     📱  Mobile-First Design          →  PWA Ready                ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## ✨ Features

### 🎯 Core Modules — Fully Implemented

<table>
<tr>
<td width="50%">

#### 📚 Student Management
- Full student enrollment with demographics, guardian info & medical records
- Unique school-scoped Student ID generation
- Bulk CSV import with validation & error reporting
- Advanced search with multi-filter (class, section, status)
- Complete student profile with academic history
- Class/section assignment & promotion workflows

</td>
<td width="50%">

#### 👨‍🏫 Staff & HR Management
- Comprehensive staff profiles (qualifications, bank details, emergency contacts)
- Subject-teacher assignment per class/section
- Role-based hierarchy (Owner → Admin → Teacher → Staff)
- Self-service profile editing for all staff levels
- Staff attendance tracking with calendar views
- Substitution ledger with teacher availability

</td>
</tr>
<tr>
<td width="50%">

#### 💰 Financial Operations
- Fee structure definition (tuition, transport, lab — per class)
- Automated invoice generation (class-wide & individual)
- Payment collection with receipt generation (PDF)
- Fee defaulter tracking with dashboard highlights
- Partial payment support with carry-forward logic
- Discount & concession management (sibling, scholarship)
- Complete transaction ledger with audit trails

</td>
<td width="50%">

#### 💼 Payroll System
- Salary structure per staff (basic, HRA, DA, allowances)
- Monthly payroll processing with deductions (PF, TDS)
- One-click payslip generation
- Payroll summary dashboard with monthly breakdowns
- Payout tracking with status management
- Salary configuration with history

</td>
</tr>
<tr>
<td width="50%">

#### ✅ Attendance System
- Daily class-wise attendance (Present / Absent / Late / Leave)
- Teacher-facing mobile-optimized marking interface
- Monthly attendance summaries with trend analysis
- Role-scoped views (teachers see only assigned classes)
- Staff attendance tracking (separate module)
- Real-time statistics with percentage calculations

</td>
<td width="50%">

#### 📝 Exams & Grades
- Exam term configuration (Unit Test, Mid-Term, Annual)
- Schedule management with date/time/venue
- Bulk mark entry with real-time grade calculation
- Grade system configuration (CGPA, percentage, letter grades)
- Comprehensive student report cards
- Teacher-scoped marking (own classes/subjects only)

</td>
</tr>
<tr>
<td width="50%">

#### 🗓️ Timetable & Scheduling
- Class-wise timetable with period/slot management
- Teacher master schedule with conflict detection
- Substitution management with available teacher lookup
- Daily substitution ledger for admin oversight
- "My Schedule Today" view for teachers

</td>
<td width="50%">

#### ⚙️ Institutional Settings
- School branding (name, logo, theme colors)
- Academic year & session configuration
- Class & section management
- Subject master configuration
- Multi-branch setup with HQ designation
- Role-aware settings (admin vs staff views)

</td>
</tr>
</table>

### 🔒 Security & Access Control

```
ROLE HIERARCHY & ACCESS MATRIX
═══════════════════════════════════════════════════════════
  OWNER   │ Full system access + financial controls
  ADMIN   │ Student/Staff CRUD + attendance + exams + fees
  TEACHER │ Own class attendance + marks + timetable view
  STAFF   │ View-only access + self-service profile
  PARENT  │ Ward's data + fee status (Phase 2)
═══════════════════════════════════════════════════════════
  ✓ JWT + Refresh Token rotation with HttpOnly cookies
  ✓ Mandatory tenant context middleware on every request
  ✓ Per-route RBAC guards with convenience factories
  ✓ Backend field whitelisting for sensitive operations
```

---

## 🏗 Architecture

```
                        SCHOOL OS — SYSTEM ARCHITECTURE
═══════════════════════════════════════════════════════════════════════

                    ┌─────────────────────────────────┐
                    │         CLIENTS (Browser)        │
                    │  React 18 + Vite + TailwindCSS   │
                    │  Redux Toolkit + Framer Motion   │
                    └───────────────┬─────────────────┘
                                    │  HTTPS
                                    ▼
                    ┌─────────────────────────────────┐
                    │        API GATEWAY (Express)     │
                    │  ┌─────────┐ ┌───────────────┐  │
                    │  │ Helmet  │ │     CORS      │  │
                    │  └────┬────┘ └───────┬───────┘  │
                    │       ▼              ▼          │
                    │  ┌──────────────────────────┐   │
                    │  │   Auth Middleware (JWT)   │   │
                    │  └────────────┬─────────────┘   │
                    │               ▼                 │
                    │  ┌──────────────────────────┐   │
                    │  │  Tenant Context Middleware │   │
                    │  │  (schoolId injection)      │   │
                    │  └────────────┬─────────────┘   │
                    │               ▼                 │
                    │  ┌──────────────────────────┐   │
                    │  │  RBAC Middleware (roles)   │   │
                    │  └────────────┬─────────────┘   │
                    └───────────────┼─────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
     ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
     │  Controllers   │   │   Services     │   │    Models      │
     │ (Core Modules) │   │  (Auth, etc.)  │   │ (Data Schemas) │
     └────────┬───────┘   └────────┬───────┘   └────────┬───────┘
              │                    │                     │
              └────────────────────┼─────────────────────┘
                                   ▼
                    ┌─────────────────────────────────┐
                    │     MongoDB Atlas (Multi-Tenant) │
                    │  ┌───────────────────────────┐   │
                    │  │  schoolId-scoped queries   │   │
                    │  │  (hard tenant isolation)   │   │
                    │  └───────────────────────────┘   │
                    └─────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════
```

### Multi-Tenancy Model

School OS uses **hard tenant isolation** — not row-level security. Every document carries a `schoolId` field, and every API call passes through `TenantContextMiddleware` that:

1. Extracts `schoolId` from the authenticated JWT
2. Validates the user's membership to that tenant
3. Injects `req.tenantId` for downstream use
4. **No school can ever access another school's data**

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | UI Framework |
| **Styling** | TailwindCSS 3 | Utility-first CSS |
| **State** | Redux Toolkit | Global state management |
| **Animations** | Framer Motion | Micro-interactions & transitions |
| **Charts** | Recharts | Dashboard analytics |
| **Icons** | Lucide React | Modern icon system |
| **Build** | Vite 5 | Lightning-fast dev server & bundler |
| **Backend** | Node.js + Express 4 | REST API server |
| **Language** | TypeScript 5 (Strict) | End-to-end type safety |
| **Database** | MongoDB + Mongoose 8 | Document store with ODM |
| **Auth** | JWT + HttpOnly Cookies | Stateless auth with secure refresh |
| **Security** | Helmet + CORS + Zod | Request hardening & validation |
| **Hosting** | Vercel (Client) + Render (Server) | Cloud deployment |
| **DB Hosting** | MongoDB Atlas (Free Tier) | Managed cloud database |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB** (local or Atlas connection string)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Dwarika202249/schoolos.git
cd schoolos

# 2. Install all dependencies (root + workspaces)
npm install

# 3. Configure environment variables
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI and JWT secrets
```

### Environment Variables

Create a `server/.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/school-os
ACCESS_TOKEN_SECRET=your_super_secret_access_token_64_chars
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_64_chars
NODE_ENV=development
```

### Running Locally

```bash
# Start both client & server concurrently
npm run dev

# Or run individually:
npm run client    # React app on http://localhost:3000
npm run server    # Express API on http://localhost:5000
```

### Production Build

```bash
# Client (Vercel)
cd client && npm run build

# Server (Render)
cd server && npm run build
# Output: server/dist/server.js
```

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/auth/register` | Register school + owner | Public |
| `POST` | `/api/v1/auth/login` | Login with credentials | Public |
| `POST` | `/api/v1/auth/refresh` | Refresh access token | Cookie |
| `POST` | `/api/v1/auth/logout` | Clear refresh token | Cookie |
| `GET` | `/api/v1/auth/me` | Get current user + school | Bearer |

### Student Operations
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `POST` | `/api/v1/students` | Enroll new student | Admin+ |
| `GET` | `/api/v1/students` | List with filters & pagination | Admin+ |
| `GET` | `/api/v1/students/:id` | Get full student profile | Admin+ |
| `PATCH` | `/api/v1/students/:id` | Update student data | Admin+ |
| `POST` | `/api/v1/students/bulk-import` | CSV bulk enrollment | Admin+ |

### Finance & Fee Management
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `POST` | `/api/v1/tenant/finance/categories` | Create fee category | Owner |
| `POST` | `/api/v1/tenant/finance/structures` | Create fee structure | Owner |
| `POST` | `/api/v1/tenant/finance/invoices/generate-class` | Generate class invoices | Admin+ |
| `POST` | `/api/v1/tenant/finance/collect` | Record payment | Admin+ |
| `GET` | `/api/v1/tenant/finance/defaulters` | Get defaulter list | Admin+ |
| `POST` | `/api/v1/tenant/finance/payroll/process` | Process monthly payroll | Owner |

### Exam & Academic
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `POST` | `/api/v1/tenant/exams/terms` | Create exam term | Admin+ |
| `POST` | `/api/v1/tenant/exams/schedules` | Create exam schedule | Admin+ |
| `POST` | `/api/v1/tenant/exams/bulk-update-marks` | Bulk marks entry | Staff+ |
| `GET` | `/api/v1/tenant/exams/student-report/:id` | Student report card | Staff+ |

<details>
<summary><strong>📋 View All API Endpoints</strong></summary>

Full API documentation covering branches, academic years, classes, subjects, attendance, timetables, substitutions, staff management, and grade systems is available in [`docs/04-API-Endpoints-SOP.md`](docs/04-API-Endpoints-SOP.md).

</details>

---

## 📁 Project Structure

```
schoolos/
├── 📂 client/                    # React Frontend (Vite)
│   ├── 📂 src/
│   │   ├── 📂 app/               # Page components
│   │   │   ├── Dashboard.tsx         # Admin analytics dashboard
│   │   │   ├── TeacherDashboard.tsx  # Teacher-specific dashboard
│   │   │   ├── StudentManagement.tsx # Student directory + CRUD
│   │   │   ├── ExamManagement.tsx    # Exam terms, schedules, grades
│   │   │   ├── InvoicesPage.tsx      # Invoice generation & tracking
│   │   │   ├── PayrollDashboard.tsx  # Payroll processing & payslips
│   │   │   ├── TimetableManagement.tsx # Schedule builder
│   │   │   └── ...
│   │   ├── 📂 components/        # Shared UI components
│   │   │   ├── 📂 ui/               # Design system (Button, Card, Table...)
│   │   │   ├── Sidebar.tsx           # Role-aware navigation
│   │   │   ├── AuthGuard.tsx         # Route protection
│   │   │   └── ProfileMenu.tsx       # User profile dropdown
│   │   ├── 📂 hooks/             # Custom React hooks
│   │   ├── 📂 store/             # Redux Toolkit store + slices
│   │   ├── 📂 layouts/           # MainLayout, PublicLayout
│   │   ├── 📂 services/          # API service layer
│   │   └── 📂 utils/             # Helpers, API client config
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── 📂 server/                    # Express Backend
│   ├── 📂 src/
│   │   ├── 📂 controllers/      # Controller modules
│   │   │   ├── auth.controller.ts
│   │   │   ├── student.controller.ts
│   │   │   ├── finance.controller.ts
│   │   │   ├── exam.controller.ts
│   │   │   ├── attendance.controller.ts
│   │   │   ├── timetable.controller.ts
│   │   │   └── ...
│   │   ├── 📂 models/           # Mongoose schemas
│   │   │   ├── User.model.ts
│   │   │   ├── Student.model.ts
│   │   │   ├── Invoice.model.ts
│   │   │   ├── StaffProfile.model.ts
│   │   │   └── ...
│   │   ├── 📂 middleware/        # Auth, RBAC, Tenant, Error handling
│   │   ├── 📂 routes/           # Route registration
│   │   ├── 📂 services/         # Business logic layer
│   │   ├── 📂 utils/            # Error handling, API response, tenant queries
│   │   └── server.ts            # Application entry point
│   ├── 📂 tests/                # Jest test suites
│   └── tsconfig.json
│
├── 📂 docs/                      # Architectural documentation
│   ├── 01-Project-Overview-and-MVP-Scope.md
│   ├── 02-Architecture-and-Multi-Tenancy.md
│   ├── 03-Database-Models.md
│   ├── 04-API-Endpoints-SOP.md
│   └── 05-AI-Integration-Roadmap.md
│
├── package.json                  # Workspace root
└── README.md
```

---

## 🗄 Data Models

The platform is built on **interconnected Mongoose schemas** with strict tenant isolation:

```
                         DATA MODEL RELATIONSHIPS
═══════════════════════════════════════════════════════════════════
                              
                          ┌──────────┐
                          │  School  │ ← Root tenant entity
                          └────┬─────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
         ┌─────────┐    ┌──────────┐     ┌──────────┐
         │  Branch  │    │   User   │     │ AcadYear │
         └─────────┘    └────┬─────┘     └──────────┘
                             │
                ┌────────────┼────────────┐
                ▼            ▼            ▼
          ┌──────────┐ ┌──────────┐ ┌────────────┐
          │ Student  │ │  Staff   │ │ ClassSection│
          └────┬─────┘ │ Profile  │ └─────┬──────┘
               │       └────┬─────┘       │
         ┌─────┼──────┐     │        ┌────┼─────┐
         ▼     ▼      ▼     ▼        ▼    ▼     ▼
      Invoice Attend  Mark  Payroll Subj  Time  Exam
              ance          Salary  ect   table  Term
                            Config       Slot   Schedule
═══════════════════════════════════════════════════════════════════
```

---

## 🗺 Roadmap

```
SCHOOL OS EVOLUTION ROADMAP
═══════════════════════════════════════════════════════════════════

  ✅ PHASE 0 — MVP (Current)          🔄 PHASE 1 — Intelligence
  ─────────────────────────            ────────────────────────
  ✅ Multi-tenant architecture          ○ AI Fee Reminder Generation
  ✅ Student lifecycle management       ○ Report Card Narratives
  ✅ Fee collection & invoicing         ○ Attendance Anomaly Detection
  ✅ Attendance system                  ○ Smart Search (NLP)
  ✅ Exams & grade management           ○ WhatsApp Notifications
  ✅ Staff & HR management              ○ Parent Portal (Mobile)
  ✅ Payroll processing
  ✅ Timetable & substitutions
  ✅ Role-based dashboards

  🔮 PHASE 2 — Predictive             🚀 PHASE 3 — Agentic
  ─────────────────────────            ────────────────────────
  ○ At-risk student detection           ○ Autonomous Fee Agent
  ○ Fee default prediction              ○ Attendance Monitoring Agent
  ○ Enrollment forecasting              ○ Academic Counselor Agent
  ○ Teacher performance insights        ○ HR/Payroll Agent
  ○ RAG-powered Q&A                     ○ Admissions Concierge Agent
  ○ Parent Chatbot (WhatsApp)           ○ Multi-agent orchestration

═══════════════════════════════════════════════════════════════════
```

### 🤖 The Agentic Vision

School OS is architected from Day 1 to evolve into an **Agentic Platform**. Every data model is designed to be **LLM-consumable** with structured metadata suitable for RAG pipelines:

```
TODAY (MVP):                        TOMORROW (Agentic):
──────────────────────────────────────────────────────────
Admin manually sends                AI detects defaulter →
fee reminders                       auto-generates WhatsApp
                                    message → sends → logs

Teacher enters marks                AI analyzes trends →
                                    flags at-risk students →
                                    suggests interventions

Principal reviews reports           AI Morning Briefing: 5
manually every morning              critical metrics at 7 AM

Parent calls school                 WhatsApp chatbot: "Ravi
to ask about attendance             was absent 3 days. 82%"
──────────────────────────────────────────────────────────
```

---

## 🧪 Testing

```bash
# Run server test suite
npm run test --workspace=server

# Run tenant isolation tests
npm run test:tenant-isolation --workspace=server

# Type check (client)
cd client && npx tsc --noEmit

# Type check (server)
cd server && npx tsc --noEmit
```

---

## 🌐 Deployment

### Vercel (Frontend)

1. Connect your GitHub repository to Vercel
2. Set **Root Directory** to `client`
3. Add environment variable:
   - `VITE_API_URL` = `https://your-render-backend.onrender.com`

### Render (Backend)

1. Connect your GitHub repository to Render
2. Set **Build Command**: `npm run build`
3. Set **Start Command**: `npm run start`
4. Add environment variables:
   - `MONGODB_URI` = Your Atlas connection string
   - `ACCESS_TOKEN_SECRET` = Secure random string
   - `REFRESH_TOKEN_SECRET` = Secure random string
   - `CORS_ORIGINS` = `https://your-vercel-app.vercel.app`
   - `NODE_ENV` = `production`

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [01 — Project Overview & MVP Scope](docs/01-Project-Overview-and-MVP-Scope.md) | Vision, market analysis, feature checklist |
| [02 — Architecture & Multi-Tenancy](docs/02-Architecture-and-Multi-Tenancy.md) | System design, middleware chain, security |
| [03 — Database Models](docs/03-Database-Models.md) | All database schemas with field specifications |
| [04 — API Endpoints SOP](docs/04-API-Endpoints-SOP.md) | Complete API reference with comprehensive endpoints |
| [05 — AI Integration Roadmap](docs/05-AI-Integration-Roadmap.md) | 4-phase AI evolution strategy |

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- TypeScript strict mode enabled across all packages
- ESLint + Prettier for code formatting
- Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`)
- All controllers must use `req.tenantId` for data queries (never raw `schoolId`)

---

## 📄 License

This project is licensed under the **ISC License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with ❤️ for Indian Schools</strong>
  <br />
  <em>Empowering 1.5 million+ private schools with intelligent administration</em>
</p>

<p align="center">
  <a href="https://github.com/Dwarika202249/schoolos">
    <img src="https://img.shields.io/github/stars/Dwarika202249/schoolos?style=social" alt="Stars" />
  </a>
  <a href="https://github.com/Dwarika202249/schoolos/issues">
    <img src="https://img.shields.io/github/issues/Dwarika202249/schoolos?style=flat-square&color=red" alt="Issues" />
  </a>
  <a href="https://github.com/Dwarika202249/schoolos/pulls">
    <img src="https://img.shields.io/github/issues-pr/Dwarika202249/schoolos?style=flat-square&color=blue" alt="PRs" />
  </a>
</p>
