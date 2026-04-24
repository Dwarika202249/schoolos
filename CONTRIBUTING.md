# 🤝 Contributing to School OS

First off, thank you for considering contributing to **School OS**! It's people like you that make School OS an incredible tool for schools everywhere.

As a contributor, you are helping build the **Institutional Intelligence Layer** for schools. We have high standards for code quality, architectural integrity, and security (especially tenant isolation).

---

## 🚀 Quick Start

### 1. Setup Your Environment
- Fork the repository and clone it locally.
- Ensure you have **Node.js ≥ 18** and **npm ≥ 9**.
- Run `npm install` in the root directory (this installs dependencies for both `client` and `server` via workspaces).

### 2. Development Workflow
We use a unified development command to run both the frontend and backend concurrently:
```bash
npm run dev
```
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

---

## 🛠 Architectural Standards

To maintain the integrity of our **Multi-Tenant SaaS** architecture, all contributors MUST follow these rules:

### 1. Mandatory Tenant Isolation (Backend)
**Never query the database without scoping by `schoolId`.**
- Use the `req.tenantId` injected by the `TenantContextMiddleware`.
- **Incorrect**: `Student.find({ admissionNumber: '123' })`
- **Correct**: `Student.find({ schoolId: req.tenantId, admissionNumber: '123' })`

### 2. Role-Based Access Control (RBAC)
Protect every route with the appropriate RBAC guard from `rbac.middleware.ts`:
```typescript
router.get('/payroll', requireOwner, PayrollController.list);
```
- `requireOwner`: Only School Owners.
- `requireAdmin`: Owners and Admins.
- `requireTeacher`: Owners, Admins, and Teachers.
- `requireAnyStaff`: Anyone with a staff-level role.

### 3. End-to-End Type Safety
- We use **Strict TypeScript**. Do not use `any` unless absolutely necessary (e.g., legacy data mapping).
- Define Zod schemas for request validation to ensure the API is robust against malformed data.

---

## 🎨 Styling & UI Standards

### Design System
We use **TailwindCSS** for styling and **Framer Motion** for animations.
- Use the predefined tokens in `tailwind.config.ts`.
- Components should be responsive and accessible (aria-labels, keyboard navigation).
- Follow the **"Principal's 30-Second Scan"** principle: critical info should be visible at a glance.

### UI Components
Check `client/src/components/ui/` before building new components. Reuse our design system (Buttons, Cards, Tables, Modals) to maintain aesthetic consistency.

---

## 📝 Commit & PR Guidelines

### Conventional Commits
We strictly follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` for new features.
- `fix:` for bug fixes.
- `docs:` for documentation changes.
- `refactor:` for code changes that neither fix a bug nor add a feature.
- `chore:` for updating build tasks, package manager configs, etc.

**Example**: `feat(finance): add partial payment support for invoices`

### Pull Request Process
1. Create a branch: `git checkout -b feature/your-feature-name`.
2. Ensure your code passes type checks: `npm run type-check` (in both client/server).
3. Update relevant documentation in the `docs/` folder if you change architecture or API endpoints.
4. Open a PR with a clear description of changes and a screenshot/video for UI changes.

---

## 🧪 Testing

We value stability. If you're adding a core feature, please include tests:
- **Unit Tests**: For utility functions and business logic.
- **Tenant Isolation Tests**: Ensure your new API endpoints correctly scope data to the tenant.

Run tests using:
```bash
npm run test --workspace=server
```

---

## 🤖 The Agentic Future

We are moving towards an **Agentic School OS**. When building new features, consider:
- **Data Serialization**: Does your new model have a `toTextChunk()` method for AI consumption?
- **Metadata**: Are you storing enough structured metadata for an LLM to reason about this data later?

---

<p align="center">
  <strong>Let's build the future of education together.</strong><br />
  <em>School OS — The Intelligent Institutional Intelligence Layer</em>
</p>
