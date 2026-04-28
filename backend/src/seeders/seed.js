import { hashPassword } from '../middleware/auth.js';
import {
  Appointment,
  Doctor,
  DoctorAvailability,
  MedicalRecord,
  Notification,
  Patient,
  Prescription,
  Specialization,
  User,
  sequelize
} from '../models/index.js';

export async function seed() {
  await sequelize.sync({ force: true });

  const specs = await Specialization.bulkCreate(
    [
      { name: 'Cardiology' },
      { name: 'Neurology' },
      { name: 'Pediatrics' },
      { name: 'Orthopedics' },
      { name: 'Dermatology' },
      { name: 'General Medicine' }
    ],
    { returning: true }
  );

  const [patientUser, doctorUser, doctorUser2, adminUser, patientUser2] = await Promise.all([
    User.create({
      name: 'Ananya Sharma',
      email: 'ananya.sharma@example.com',
      passwordHash: await hashPassword('password'),
      role: 'patient'
    }),
    User.create({
      name: 'Dr. Asha Iyer',
      email: 'asha.iyer@example.com',
      passwordHash: await hashPassword('password'),
      role: 'doctor'
    }),
    User.create({
      name: 'Dr. Arjun Mehta',
      email: 'arjun.mehta@example.com',
      passwordHash: await hashPassword('password'),
      role: 'doctor'
    }),
    User.create({
      name: 'Admin Priya',
      email: 'admin@example.com',
      passwordHash: await hashPassword('password'),
      role: 'admin'
    }),
    User.create({
      name: 'Ravi Kumar',
      email: 'ravi.kumar@example.com',
      passwordHash: await hashPassword('password'),
      role: 'patient'
    })
  ]);

  const [patient, patient2] = await Patient.bulkCreate(
    [
      { userId: patientUser.id, age: 32, gender: 'Female', phone: '+91 98765 12345', address: 'Bengaluru, KA' },
      { userId: patientUser2.id, age: 41, gender: 'Male', phone: '+91 98111 22334', address: 'Mumbai, MH' }
    ],
    { returning: true }
  );

  const [doctor1, doctor2] = await Doctor.bulkCreate(
    [
      {
        userId: doctorUser.id,
        specializationId: specs[0].id,
        qualification: 'MD, DM (Cardiology)',
        experienceYears: 14,
        consultationFee: 1800
      },
      {
        userId: doctorUser2.id,
        specializationId: specs[2].id,
        qualification: 'MD (Pediatrics)',
        experienceYears: 9,
        consultationFee: 1200
      }
    ],
    { returning: true }
  );

  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  await DoctorAvailability.bulkCreate([
    {
      doctorId: doctor1.id,
      availableDate: new Date().toISOString().slice(0, 10),
      startTime: '10:30',
      endTime: '11:00'
    },
    { doctorId: doctor1.id, availableDate: futureDate, startTime: '11:00', endTime: '11:30' },
    { doctorId: doctor1.id, availableDate: futureDate, startTime: '13:30', endTime: '14:00' },
    { doctorId: doctor2.id, availableDate: futureDate, startTime: '12:30', endTime: '13:00' }
  ]);

  await Appointment.bulkCreate([
    {
      patientId: patient.id,
      doctorId: doctor1.id,
      appointmentDate: new Date().toISOString().slice(0, 10),
      appointmentTime: '10:30',
      status: 'booked',
      reason: 'Chest discomfort after commute'
    },
    {
      patientId: patient.id,
      doctorId: doctor2.id,
      appointmentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      appointmentTime: '15:00',
      status: 'completed',
      reason: 'Child vaccination follow-up'
    }
  ]);

  const record = await MedicalRecord.create({
    patientId: patient.id,
    doctorId: doctor1.id,
    diagnosis: 'Mild angina',
    treatment: 'Lifestyle changes, beta blockers',
    notes: 'Schedule TMT at next visit',
    visitDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
  });

  await Prescription.create({
    medicalRecordId: record.id,
    patientId: patient.id,
    doctorId: doctor1.id,
    medicines: 'Metoprolol 50mg',
    dosageInstructions: '1 tablet twice daily after meals'
  });

  await Notification.bulkCreate([
    { userId: patientUser.id, title: 'Appointment reminder', message: 'Visit tomorrow 10:30 AM', type: 'appointment' },
    { userId: doctorUser.id, title: 'New patient record', message: 'Migraine follow-up added', type: 'record' }
  ]);
}

if (process.argv[1].includes('seed.js')) {
  seed().then(() => {
    console.log('Database seeded');
    process.exit(0);
  });
}
