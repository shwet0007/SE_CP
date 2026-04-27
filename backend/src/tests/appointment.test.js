import request from 'supertest';
import app from '../app.js';
import { seed } from '../seeders/seed.js';
import { sequelize } from '../models/index.js';

let token;

beforeAll(async () => {
  await seed();
  const res = await request(app).post('/api/auth/login').send({ email: 'ananya.sharma@example.com', password: 'password' });
  token = res.body.token;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Appointments', () => {
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  it('lists appointments', async () => {
    const res = await request(app).get('/api/appointments').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('books an appointment', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({ patientId: 1, doctorId: 1, appointmentDate: futureDate, appointmentTime: '11:00', reason: 'Follow-up' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('booked');
  });
});
