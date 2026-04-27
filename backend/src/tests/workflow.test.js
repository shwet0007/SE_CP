import request from 'supertest';
import app from '../app.js';
import { seed } from '../seeders/seed.js';
import { sequelize } from '../models/index.js';

let patientToken;
let doctorToken;
let adminToken;

beforeAll(async () => {
  await seed();
  const [patient, doctor, admin] = await Promise.all([
    request(app).post('/api/auth/login').send({ email: 'ananya.sharma@example.com', password: 'password' }),
    request(app).post('/api/auth/login').send({ email: 'asha.iyer@example.com', password: 'password' }),
    request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'password' })
  ]);
  patientToken = patient.body.token;
  doctorToken = doctor.body.token;
  adminToken = admin.body.token;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Role-based workflows', () => {
  it('scopes patient appointment lists to the logged-in patient', async () => {
    const res = await request(app).get('/api/appointments').set('Authorization', `Bearer ${patientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((appointment) => appointment.patientId === 1)).toBe(true);
  });

  it('prevents doctors from booking patient appointments', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ patientId: 1, doctorId: 1, appointmentDate: '2030-04-02', appointmentTime: '11:00' });
    expect(res.status).toBe(403);
  });

  it('prevents patients from creating medical records', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ patientId: 1, doctorId: 1, diagnosis: 'Demo', visitDate: '2030-04-02' });
    expect(res.status).toBe(403);
  });

  it('allows admins to view summary reports', async () => {
    const res = await request(app).get('/api/reports/summary').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.appointments.booked).toBeDefined();
    expect(Array.isArray(res.body.bySpecialization)).toBe(true);
  });

  it('lists and marks current-user notifications as read', async () => {
    const list = await request(app).get('/api/notifications').set('Authorization', `Bearer ${patientToken}`);
    expect(list.status).toBe(200);
    expect(list.body.length).toBeGreaterThan(0);

    const update = await request(app)
      .patch(`/api/notifications/${list.body[0].id}/read`)
      .set('Authorization', `Bearer ${patientToken}`);
    expect(update.status).toBe(200);
    expect(update.body.isRead).toBe(true);
  });
});
