# Apparel Group – Audit Management System (Frontend)

React single-page application for the Apparel Group Audit Management System — role-based dashboards, audit creation and review, cash reconciliation, notifications, and printable reports.

## Tech Stack

- **Framework:** React 19 + Vite
- **Routing:** `react-router-dom`
- **UI:** `react-select`, `react-icons`, `sweetalert2`
- **Auth:** `jwt-decode` (client-side JWT decoding for `AuthContext`)
- **Linting:** ESLint (`eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`)

## Prerequisites

- Node.js 18 or later
- npm
- A running instance of the [backend API](../backend/README.md)

## Project Structure


## Setup

1. Install dependencies:
```bash
   npm install
```

2. Create a `.env` file in the frontend root, pointing at your running backend:
```env
   VITE_API_URL=http://localhost:5000/api
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite dev server (default: `http://localhost:5173`) with hot module reload |
| `npm run build` | Type-checks nothing (JS project) and produces a production build in `dist/` |
| `npm run preview` | Serves the production build locally for a final check before deploying |
| `npm run lint` | Runs ESLint across the project |

## Authentication

The login screen (`Login.jsx`) accepts a single identifier field and routes it automatically:

- A **purely numeric** value is treated as an **Oracle ID** → `POST /api/users/login`, `{ OracleID, Password }`.
- Any other value is treated as a **Store Code** → `POST /api/users/store-login`, `{ StoreCode, Password }`.

The returned JWT is decoded client-side (`jwt-decode`) and stored via `AuthContext`, which exposes the current user's role, location, and (for store accounts) `IsStoreAccount` / `StoreSerial` to the rest of the app. `ProtectedRoute` and `PublicRoute` gate access based on this context.

## User Roles

| Role | ID | Sidebar / Access |
|---|---|---|
| Admin | 1 | Users, Brands, Criteria, Location, Ops Managers, Store Managers, Stores, Audit Points, My Tasks, Audits, Reports |
| Ops Manager | 2 | My Tasks, Audits, Reports |
| Store Manager | 3 | My Tasks, Audits, Reports |
| Auditor | 4 | Start Audit, My Tasks, Past Audits, Reports |
| Audit Manager | 5 | Audit Points, My Tasks, Audits, Reports |

Store accounts (login by store code) get Store Manager–level access scoped to their single store, with a brand chip shown in the navbar.

## Key Features

- **Audit workflow** — `Employee/Audit/` covers the full cycle: starting an audit against a store, saving drafts, submitting, and the review stages (Needs Revision, Rejected, Forwarded, Sent to Store, Completed) surfaced per-role in `MyTasks.jsx` via `utils/auditWorkflow.js`.
- **Cash reconciliation** — a per-cashier tally of BHD notes/coins, foreign currency, paid bills/IOUs, and reimbursement statements, reconciled against till float + sale cash, built into `AuditDetails.jsx` and displayed read-only in `Auditview.jsx`.
- **Notifications** — polled bell icon in `NavBar` backed by `services/NotificationServices.js`.
- **Reports** — filterable KPIs, risk/status breakdowns, and store ranking on `/Reports`, with a dedicated print stylesheet for a formal A4-landscape report.
- **Print-ready audit report** — `Auditview.jsx` includes a `print-only` formal letterhead layout separate from the on-screen view.

## Deployment Notes

- Set `VITE_API_URL` to the production backend's `/api` base URL before running `npm run build` — Vite inlines env vars at build time, so this cannot be changed after the build without rebuilding.
- Serve the contents of `dist/` from any static host (Nginx, Vercel, Netlify, etc.), configured to fall back to `index.html` for client-side routing (`react-router-dom`).
- Ensure the backend's CORS configuration allows requests from the deployed frontend origin.


