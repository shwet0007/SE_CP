# Smart Hospital Appointment & Record Management System

Modern full‑stack web app for patient self‑service bookings, doctor scheduling, medical records, and admin insights.  
Frontend is production-ready (Vite + React + Tailwind). Backend APIs are implemented (Express + Sequelize + MySQL) with JWT auth, appointments, records, prescriptions, notifications, and reports.

## Project Structure
- `frontend/` — Vite React app with Tailwind, role-based dashboards, booking & records UI.
- `backend/` — Express + Sequelize API with auth, appointments, records, prescriptions, notifications, reports, seeders, and tests.
- `docs/api.md` — REST surface reference.
- `docs/syllabus-alignment.md` — Software Engineering syllabus mapping with requirements, Agile plan, UML-style diagrams, architecture, and design patterns.

## Tech Stack
- Frontend: React 18, Vite 5, Tailwind 3, React Router 6, lucide icons, dayjs.
- Backend (scaffolded): Node.js, Express, Sequelize, MySQL, JWT, bcrypt, Nodemailer.
  - API live: auth, doctors, appointments, records, prescriptions, notifications, reports; seed data + Jest/Supertest tests.

## Quick Start
1) Install frontend
```bash
cd frontend
npm install
npm run dev
```
2) Backend
```bash
cd backend
npm install
# add .env from backend/.env.example
npm run dev                 # starts API on PORT from .env (5001 locally)
npm run seed                # reset/load sample data
```

## Demo Credentials
- Patient: `ananya.sharma@example.com` / `password`
- Doctor: `asha.iyer@example.com` / `password`
- Admin: `admin@example.com` / `password`

## Environment Variables
- `frontend/.env.example` — `VITE_API_URL` for pointing to the API (defaults to `http://localhost:5000/api`).
- `backend/.env.example` — DB credentials, JWT secret, email SMTP config.

## Agile Plan (4 Sprints)
- **Product backlog (high level)**: Auth (JWT, roles), user management, doctor schedules, appointment lifecycle (book/reschedule/cancel), medical records CRUD, prescriptions, notifications, admin reports, audit logs, seed data, tests.
- **Sprint 1 – Auth + UI + DB setup**: Frontend auth flows, dashboards, MySQL schema via Sequelize, JWT/bcrypt auth APIs. (Done.)
- **Sprint 2 – Appointment system**: REST for booking/reschedule/cancel, availability checks, calendar views, reminders hook. (Done.)
- **Sprint 3 – Records & prescriptions**: CRUD for medical records, prescriptions, file attachments guardrails. (Done.)
- **Sprint 4 – Notifications & reports + testing**: Email-ready notifications, admin statistics, automated tests, hardening. (Done.)

### Sample User Stories & Acceptance Criteria
- *As a patient* I can book a slot with a specialist so that I get confirmed time. **AC**: requires valid token, slot availability check, success returns booking ID, status `booked`.
- *As a doctor* I can see today’s patients in one view. **AC**: shows name/reason/time, sortable by time, hides cancelled.
- *As an admin* I can view weekly utilization. **AC**: API returns counts by status and specialization; filters by date range.

## Syllabus Fit
This project aligns with the Software Engineering syllabus through incremental/RAD process planning, requirements engineering, Scrum artifacts, static and dynamic interaction models, layered client-server MVC architecture, and design-pattern mapping. See `docs/syllabus-alignment.md` for the full unit-wise mapping.

## Testing
- Frontend runs on Vite dev server.
- Backend route tests live in `backend/src/tests/`. Run: `cd backend && npm test`.

## Running Notes
- Frontend now has API client; set `VITE_API_URL` to `http://localhost:5000/api`, ensure backend running, and the UI will pull live data (fallback to mock if API unreachable).
- Tailwind design avoids generic defaults: expressive typography, gradient canvas, glass cards, responsive dashboards.

## Git
- Keep commits per feature/sprint. No destructive commands. Node modules are ignored via `.gitignore`.
