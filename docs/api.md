# API Reference

Base path: `/api`

All routes except `POST /auth/register` and `POST /auth/login` require a bearer token.

```http
Authorization: Bearer <jwt>
```

## Auth

### `POST /auth/register`

Registers a user as `patient`, `doctor`, or `admin`.

Patient payload:

```json
{
  "name": "Patient Name",
  "email": "patient@example.com",
  "password": "password",
  "role": "patient",
  "age": 32,
  "gender": "Female",
  "phone": "9876543210",
  "address": "Pune",
  "bloodGroup": "A+"
}
```

Doctor payload:

```json
{
  "name": "Doctor Name",
  "email": "doctor@example.com",
  "password": "password",
  "role": "doctor",
  "specializationId": 1,
  "qualification": "MBBS, MD",
  "experienceYears": 8,
  "consultationFee": 1000
}
```

Response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "name": "Patient Name",
    "email": "patient@example.com",
    "role": "patient",
    "patientId": 1
  }
}
```

### `POST /auth/login`

Logs in a user and returns a JWT token plus public profile.

```json
{
  "email": "patient@example.com",
  "password": "password"
}
```

### `GET /auth/me`

Returns the authenticated user's public profile.

## Doctors

### `GET /doctors`

Lists doctors from the database with linked user and specialization details.

Optional query:

```text
?specialization=1
```

## Availability

### `GET /availability`

Lists doctor availability slots.

Optional query:

```text
?doctorId=1&date=2030-04-02
```

Response includes `isBooked` so the frontend can show only open slots for booking.

### `POST /availability`

Creates a doctor availability slot. Doctors can create only their own slots.

```json
{
  "doctorId": 1,
  "availableDate": "2030-04-02",
  "startTime": "10:30",
  "endTime": "11:00"
}
```

### `DELETE /availability/:id`

Deletes an open availability slot. A booked slot cannot be deleted.

## Appointments

### `GET /appointments`

Lists appointments scoped by role.

- Patients receive only their own appointments.
- Doctors receive only appointments assigned to them.
- Admins can filter by doctor or patient.

Optional query:

```text
?status=booked&date=2030-04-02&doctorId=1&patientId=1
```

### `POST /appointments`

Books an appointment using a real doctor availability slot.

```json
{
  "patientId": 1,
  "doctorId": 1,
  "appointmentDate": "2030-04-02",
  "appointmentTime": "10:30",
  "reason": "General consultation"
}
```

Backend validation:

- authenticated user required,
- patients can book only for themselves,
- doctor and patient must exist,
- selected slot must exist in `doctor_availability`,
- slot must not already have a booked appointment,
- appointment date cannot be in the past.

### `PATCH /appointments/:id`

Updates appointment status, date, time, or reason.

Reschedule payload:

```json
{
  "appointmentDate": "2030-04-03",
  "appointmentTime": "11:30"
}
```

Cancel payload:

```json
{
  "status": "cancelled"
}
```

Complete payload:

```json
{
  "status": "completed"
}
```

Allowed statuses:

- `booked`
- `completed`
- `cancelled`

### `DELETE /appointments/:id`

Deletes an appointment from the database. Patients can delete only their own appointments. Deleted
appointments no longer appear on the patient page or doctor dashboard.

## Medical Records

### `GET /records`

Lists medical records scoped by role.

Optional query:

```text
?patientId=1&doctorId=1&date=2030-04-02&q=fever
```

Response includes linked prescriptions, doctor, and patient details.

### `POST /records`

Creates a medical record. Patients cannot create records.

```json
{
  "patientId": 1,
  "doctorId": 1,
  "diagnosis": "Routine follow-up",
  "treatment": "Continue medication",
  "notes": "Review in two weeks",
  "visitDate": "2030-04-02"
}
```

### `PATCH /records/:id`

Updates diagnosis, treatment, notes, or visit date.

## Prescriptions

### `GET /prescriptions`

Lists prescriptions scoped by role.

Optional query:

```text
?recordId=1&patientId=1&doctorId=1
```

### `POST /prescriptions`

Creates a prescription linked to a medical record.

```json
{
  "medicalRecordId": 1,
  "patientId": 1,
  "doctorId": 1,
  "medicines": "Paracetamol 500mg",
  "dosageInstructions": "One tablet after food"
}
```

The backend verifies that the prescription patient and doctor match the selected medical record.

## Notifications

### `GET /notifications`

Lists notifications for the authenticated user.

### `PATCH /notifications/:id/read`

Marks a notification as read.

## Reports

### `GET /reports/summary`

Admin-only summary report.

Optional query:

```text
?from=2030-04-01&to=2030-04-30
```

Response includes appointment status counts and doctor counts by specialization.

## Security Rules

- JWT auth middleware protects all operational routes.
- Passwords are hashed with bcrypt.
- Patients can access only their own appointments, records, prescriptions, and notifications.
- Doctors can access only their own appointment and record data.
- Patients cannot create medical records or prescriptions.
- Doctors cannot book patient appointments from the patient booking endpoint.
- Appointment booking and rescheduling require valid doctor availability slots.
