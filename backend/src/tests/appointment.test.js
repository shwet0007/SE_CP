import request from 'supertest';
import app from '../app.js';
import { seed } from '../seeders/seed.js';
import { sequelize } from '../models/index.js';

let token;
let doctorToken;

beforeAll(async () => {
  await seed();
  const [patientRes, doctorRes] = await Promise.all([
    request(app).post('/api/auth/login').send({ email: 'ananya.sharma@example.com', password: 'password' }),
    request(app).post('/api/auth/login').send({ email: 'asha.iyer@example.com', password: 'password' })
  ]);
  token = patientRes.body.token;
  doctorToken = doctorRes.body.token;
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

  it('returns the real doctor details after booking a newly registered doctor', async () => {
    const doctorRes = await request(app).post('/api/auth/register').send({
      name: 'Swaraj',
      email: 'swaraj@example.com',
      password: 'password',
      role: 'doctor',
      specializationId: 2
    });
    expect(doctorRes.status).toBe(201);
    const doctorId = doctorRes.body.user.doctorId;
    const availabilityRes = await request(app)
      .post('/api/availability')
      .set('Authorization', `Bearer ${doctorRes.body.token}`)
      .send({ doctorId, availableDate: futureDate, startTime: '12:30', endTime: '13:00' });
    expect(availabilityRes.status).toBe(201);

    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({ patientId: 1, doctorId, appointmentDate: futureDate, appointmentTime: '12:30', reason: 'Consultation' });

    expect(res.status).toBe(201);
    expect(res.body.doctorId).toBe(doctorId);
    expect(res.body.Doctor.User.name).toBe('Swaraj');
  });

  it('lets a patient delete an appointment so it no longer appears for the doctor', async () => {
    const createRes = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({ patientId: 1, doctorId: 1, appointmentDate: futureDate, appointmentTime: '13:30', reason: 'Delete check' });
    expect(createRes.status).toBe(201);

    const deleteRes = await request(app)
      .delete(`/api/appointments/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteRes.status).toBe(204);

    const patientList = await request(app).get('/api/appointments').set('Authorization', `Bearer ${token}`);
    const doctorList = await request(app).get('/api/appointments').set('Authorization', `Bearer ${doctorToken}`);

    expect(patientList.body.some((appointment) => appointment.id === createRes.body.id)).toBe(false);
    expect(doctorList.body.some((appointment) => appointment.id === createRes.body.id)).toBe(false);
  });

  it('supports doctor completion with a medical record and prescription', async () => {
    const availabilityRes = await request(app)
      .post('/api/availability')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ doctorId: 1, availableDate: futureDate, startTime: '14:30', endTime: '15:00' });
    expect(availabilityRes.status).toBe(201);

    const createRes = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${token}`)
      .send({ patientId: 1, doctorId: 1, appointmentDate: futureDate, appointmentTime: '14:30', reason: 'Completion check' });
    expect(createRes.status).toBe(201);

    const recordRes = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        patientId: 1,
        doctorId: 1,
        diagnosis: 'Routine follow-up',
        treatment: 'Continue medication',
        notes: 'Review in two weeks',
        visitDate: futureDate
      });
    expect(recordRes.status).toBe(201);

    const prescriptionRes = await request(app)
      .post('/api/prescriptions')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        medicalRecordId: recordRes.body.id,
        patientId: 1,
        doctorId: 1,
        medicines: 'Paracetamol 500mg',
        dosageInstructions: 'One tablet after food'
      });
    expect(prescriptionRes.status).toBe(201);

    const completeRes = await request(app)
      .patch(`/api/appointments/${createRes.body.id}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({ status: 'completed' });
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.status).toBe('completed');

    const records = await request(app).get('/api/records').set('Authorization', `Bearer ${token}`);
    const createdRecord = records.body.find((record) => record.id === recordRes.body.id);
    expect(createdRecord.Prescriptions[0].medicines).toBe('Paracetamol 500mg');
  });
});
