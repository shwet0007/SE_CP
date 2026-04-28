# Smart Hospital Appointment and Record Management System

A full-stack healthcare web application for patient appointment booking, doctor availability management,
medical records, prescriptions, notifications, and admin reports.

The project is built as a Software Engineering academic project with real database-backed workflows. The
doctor and patient sections do not depend on dummy data for core operations. Doctors create real availability
slots in the database, patients book from those slots, doctors complete visits by creating medical records and
prescriptions, and patients view those records from the database.

## Project Summary

The Smart Hospital Appointment and Record Management System solves common hospital workflow problems:

- Patients need a simple way to find doctors and book valid appointment slots.
- Doctors need to manage availability and view upcoming visits.
- Hospitals need reliable appointment lifecycle tracking.
- Medical records and prescriptions should be stored digitally and accessed securely.
- Admins need summary reports for hospital activity.

The system supports three roles:

- `patient`
- `doctor`
- `admin`

Each role has protected routes, role-specific dashboards, and database-scoped access.

## Key Features

### Patient Features

- Patient registration and login.
- Patient dashboard with upcoming appointments, records, and doctors.
- Real doctor search by name or specialization.
- Appointment booking using real doctor availability slots.
- Appointment rescheduling using available slots.
- Appointment cancellation.
- Appointment deletion from the database.
- Medical record viewing.
- Prescription viewing inside medical records.
- Printable prescription sheet.
- Patient-scoped notifications.

### Doctor Features

- Doctor registration and login.
- Doctor dashboard with statistics, upcoming visits, availability, and recent notes.
- Doctor availability slot creation.
- Doctor availability slot deletion when not booked.
- Upcoming appointment queue.
- Complete visit workflow.
- Medical record creation from appointment.
- Optional prescription creation during visit completion.
- Completed appointment status update.
- Doctor-scoped appointment and record access.

### Admin Features

- Admin login.
- Admin dashboard.
- Summary counts for patients, doctors, active appointments, and records.
- Appointment status reports.
- Specialization-wise doctor summaries.
- System-level monitoring view.

## Real Database-Backed Workflows

### Appointment Booking Flow

1. Doctor logs in.
2. Doctor adds availability slots with date, start time, and end time.
3. Patient logs in.
4. Patient selects doctor and date.
5. System loads only open slots from the database.
6. Patient books one available slot.
7. Backend checks:
   - user authentication,
   - patient ownership,
   - doctor existence,
   - slot availability,
   - duplicate appointment conflict.
8. Appointment is stored with status `booked`.
9. Patient and doctor notifications are created.

### Appointment Reschedule Flow

1. Patient opens the appointments page.
2. Patient clicks reschedule.
3. System loads real open slots for the same doctor.
4. Patient selects a new date and slot.
5. Backend validates availability and conflict rules.
6. Appointment date and time are updated in the database.

### Appointment Cancel/Delete Flow

- Cancel changes appointment status to `cancelled`.
- Delete removes the appointment record from the database.
- Deleted appointments no longer appear in the patient appointment list or doctor dashboard.

### Doctor Visit Completion Flow

1. Doctor opens the dashboard.
2. Doctor selects a booked appointment.
3. Doctor enters diagnosis, treatment, notes, and visit date.
4. Doctor optionally enters medicines and dosage instructions.
5. System creates a medical record.
6. System creates a prescription if prescription fields are provided.
7. Appointment status changes to `completed`.
8. Patient can view the record and prescription.

## Tech Stack

### Frontend

- React 18
- Vite 5
- Tailwind CSS 3
- React Router 6
- Axios
- lucide-react icons
- dayjs

### Backend

- Node.js
- Express.js
- Sequelize ORM
- MySQL
- JWT authentication
- bcrypt password hashing
- Nodemailer-ready notification service
- Jest
- Supertest

## Project Structure

```text
Project/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seeders/
│   │   ├── services/
│   │   ├── tests/
│   │   └── utils/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── data/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── state/
│   └── package.json
├── docs/
│   ├── api.md
│   ├── syllabus-alignment.md
│   ├── srs-smart-hospital.docx
│   ├── srs-smart-hospital.html
│   └── srs-smart-hospital.pdf
└── README.md
```

## Main Frontend Pages

- `LandingPage.jsx` - public project landing page.
- `LoginPage.jsx` - user login.
- `RegisterPage.jsx` - patient, doctor, and admin registration.
- `PatientDashboard.jsx` - patient workspace.
- `DoctorDashboard.jsx` - doctor workspace, availability, and visit completion.
- `AdminDashboard.jsx` - admin monitoring dashboard.
- `AppointmentPage.jsx` - booking, listing, rescheduling, cancellation, deletion.
- `MedicalRecordsPage.jsx` - medical records and prescriptions.
- `NotificationsPage.jsx` - user notifications.

## Main Backend Modules

- `authController.js` - registration, login, current user.
- `doctorController.js` - doctor listing.
- `availabilityController.js` - doctor availability slots.
- `appointmentController.js` - appointment booking, listing, update, delete.
- `recordController.js` - medical record listing, creation, update.
- `prescriptionController.js` - prescription listing and creation.
- `notificationController.js` - notification listing and read status.
- `reportController.js` - admin summary reports.

## Database Entities

The Sequelize models represent the core hospital domain:

- `User`
- `Patient`
- `Doctor`
- `Specialization`
- `DoctorAvailability`
- `Appointment`
- `MedicalRecord`
- `Prescription`
- `Notification`

Important relationships:

- One `User` can have one `Patient` profile.
- One `User` can have one `Doctor` profile.
- One `Specialization` has many `Doctors`.
- One `Doctor` has many `DoctorAvailability` slots.
- One `Patient` has many `Appointments`.
- One `Doctor` has many `Appointments`.
- One `Patient` has many `MedicalRecords`.
- One `Doctor` has many `MedicalRecords`.
- One `MedicalRecord` has many `Prescriptions`.
- One `User` has many `Notifications`.

## API Overview

Base path:

```text
/api
```

### Authentication

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Doctors

- `GET /doctors`

### Availability

- `GET /availability`
- `POST /availability`
- `DELETE /availability/:id`

### Appointments

- `GET /appointments`
- `POST /appointments`
- `PATCH /appointments/:id`
- `DELETE /appointments/:id`

### Medical Records

- `GET /records`
- `POST /records`
- `PATCH /records/:id`

### Prescriptions

- `GET /prescriptions`
- `POST /prescriptions`

### Notifications

- `GET /notifications`
- `PATCH /notifications/:id/read`

### Reports

- `GET /reports/summary`

See [docs/api.md](docs/api.md) for the API reference.

## Security

- Passwords are hashed using bcrypt.
- JWT tokens are issued after login and registration.
- Protected backend routes use authentication middleware.
- Role guards and controller checks restrict patient, doctor, and admin access.
- Patients can only access their own appointments, records, prescriptions, and notifications.
- Doctors can only access their own appointment queue and records.
- Appointment booking and rescheduling require real availability slots.

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env` using the expected values:

```env
PORT=5001
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=smart_hospital
JWT_SECRET=your-secret-string
JWT_EXPIRES_IN=7d
```

Start the backend:

```bash
npm run dev
```

Seed/reset the database:

```bash
npm run seed
```

The local API runs at:

```text
http://localhost:5001
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The local frontend runs at:

```text
http://localhost:5173
```

The frontend API client defaults to:

```text
http://localhost:5001/api
```

You can override it with `frontend/.env`:

```env
VITE_API_URL=http://localhost:5001/api
```

## Demo Credentials

After running the seed script:

- Patient: `ananya.sharma@example.com` / `password`
- Doctor: `asha.iyer@example.com` / `password`
- Admin: `admin@example.com` / `password`

Seed data is only for initial demonstration. New doctors, patients, slots, appointments, records, and prescriptions
are stored in the database through the application.

## Testing

Backend route tests live in `backend/src/tests/`.

Run tests:

```bash
cd backend
npm test
```

Current tested workflows include:

- Login and bad credential rejection.
- Patient-scoped appointment listing.
- Appointment booking.
- Registered doctor details in booking response.
- Appointment deletion disappearing from doctor list.
- Doctor completion with medical record and prescription.
- Role-based access prevention.
- Admin report access.
- Notification read status update.

Frontend production build:

```bash
cd frontend
npm run build
```

## Agile Plan

### Sprint 1: Authentication and Foundation

Deliverables:

- React app structure.
- Express API setup.
- Sequelize models.
- MySQL connection.
- JWT login/register.
- Protected routes.
- Patient, doctor, and admin roles.

### Sprint 2: Appointment Workflow

Deliverables:

- Doctor listing.
- Doctor availability slots.
- Slot-based appointment booking.
- Appointment list filters.
- Appointment reschedule, cancel, and delete.
- Patient and doctor appointment visibility.

### Sprint 3: Medical Records and Prescriptions

Deliverables:

- Doctor visit completion.
- Medical record creation.
- Prescription creation.
- Patient medical record view.
- Prescription print view.

### Sprint 4: Notifications, Reports, and Testing

Deliverables:

- Notifications.
- Admin summary reports.
- Seed data.
- Jest/Supertest backend tests.
- SRS and syllabus documentation.

## Software Engineering Syllabus Mapping

The project maps to major Software Engineering syllabus units:

- Unit I: Software Engineering paradigms.
- Unit II: Requirements engineering.
- Unit III: Agile methodology.
- Unit IV: Static and dynamic interaction modeling.
- Unit V: Software architecture design.
- Unit VI: Design patterns.

Full mapping is available in:

- [docs/syllabus-alignment.md](docs/syllabus-alignment.md)

## SRS Documents

The project includes a formal Software Requirement Specification:

- [docs/srs-smart-hospital.docx](docs/srs-smart-hospital.docx)
- [docs/srs-smart-hospital.pdf](docs/srs-smart-hospital.pdf)
- [docs/srs-smart-hospital.html](docs/srs-smart-hospital.html)

The SRS includes:

- Abstract.
- Introduction.
- Problem statement.
- System overview.
- Requirement engineering methodology.
- Functional requirements.
- Non-functional requirements.
- Constraints.
- Hardware and software requirements.
- Conclusion.

## Architecture

The system follows a layered client-server architecture.

```text
Browser
  ↓
React Frontend
  ↓
Axios API Clients
  ↓
Express Routes
  ↓
Auth and Role Middleware
  ↓
Controllers
  ↓
Sequelize Models
  ↓
MySQL Database
```

Architecture qualities:

- Modular frontend pages and reusable components.
- Centralized API clients.
- Separated backend routes, controllers, middleware, and models.
- Role-based access control.
- Relational database persistence.
- Automated backend route tests.

## Design Patterns Used

- MVC-style architecture: React views, Express controllers, Sequelize models.
- Facade: frontend API modules hide Axios details.
- Adapter: API client adapts Axios and token storage.
- Chain of Responsibility: Express middleware chain.
- Factory Method: Sequelize create/findOrCreate methods.
- Repository-like model layer: Sequelize models encapsulate persistence operations.

## Suggested PPT Structure

Use this slide order for presentation:

1. Title Slide
   - Project name
   - Team members
   - Guide/department details

2. Problem Statement
   - Manual scheduling issues
   - Record access problems
   - Need for role-based hospital system

3. Objectives
   - Real slot-based appointment booking
   - Digital medical records
   - Doctor availability management
   - Secure patient/doctor/admin access

4. System Users
   - Patient
   - Doctor
   - Admin

5. Tech Stack
   - React, Tailwind, Express, Sequelize, MySQL, JWT

6. System Architecture
   - Browser to React to Express to Sequelize to MySQL

7. Database Design
   - User, Patient, Doctor, Specialization, Availability, Appointment, Record, Prescription, Notification

8. Patient Module
   - Book, reschedule, cancel, delete appointments
   - View records and prescriptions

9. Doctor Module
   - Add availability
   - View appointments
   - Complete visit
   - Create record and prescription

10. Admin Module
    - Dashboard
    - Reports
    - Monitoring

11. Key Workflows
    - Booking workflow
    - Doctor visit completion workflow

12. Security
    - JWT
    - bcrypt
    - Role-based access
    - Data scoping

13. Testing
    - Jest and Supertest
    - Tested workflows

14. Output Screens
    - Login/Register
    - Patient dashboard
    - Appointment page
    - Doctor dashboard
    - Medical records
    - Admin dashboard

15. Conclusion and Future Scope
    - Current achievements
    - Payment, video consultation, lab integration, analytics

## Suggested Report Structure

Use this order for a written report:

1. Cover page
2. Certificate or declaration
3. Acknowledgement
4. Abstract
5. Introduction
6. Problem statement
7. Objectives
8. Scope
9. Requirement analysis
10. Functional requirements
11. Non-functional requirements
12. System design
13. Architecture diagram
14. Database design
15. Module description
16. Implementation details
17. Testing
18. Result screenshots
19. Conclusion
20. Future scope
21. References

## Suggested Screenshots for PPT and Report

Capture these screens:

- Landing page.
- Login page.
- Registration page with role selection.
- Patient dashboard.
- Appointment booking with real slots.
- Appointment reschedule/cancel/delete actions.
- Doctor dashboard.
- Doctor availability form.
- Doctor complete visit form.
- Medical records page with prescription.
- Admin dashboard.
- Backend test output.

## Future Scope

- Payment gateway for consultation fees.
- Video consultation.
- Lab test integration.
- Insurance claim processing.
- File upload for reports and prescriptions.
- SMS/email reminders.
- Doctor rating and feedback.
- Advanced admin analytics.
- Audit logs for medical record access.
- Deployment with HTTPS and production database backups.

## Viva Points

- The project is not only CRUD; it has real role-based workflows.
- Patients book only real doctor availability slots from the database.
- Doctors can complete appointments and create linked records and prescriptions.
- Deleting an appointment removes it from both patient and doctor views because it is deleted from the database.
- JWT and bcrypt secure authentication.
- Patient privacy is enforced through backend query scoping.
- The architecture is layered and maintainable.
- The project includes SRS, syllabus alignment, API documentation, and automated tests.
