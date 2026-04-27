import sequelize from '../config/database.js';
import User from './User.js';
import Patient from './Patient.js';
import Doctor from './Doctor.js';
import Specialization from './Specialization.js';
import Appointment from './Appointment.js';
import MedicalRecord from './MedicalRecord.js';
import Prescription from './Prescription.js';
import Notification from './Notification.js';

// Associations
User.hasOne(Patient, { foreignKey: 'userId' });
Patient.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Doctor, { foreignKey: 'userId' });
Doctor.belongsTo(User, { foreignKey: 'userId' });

Specialization.hasMany(Doctor, { foreignKey: 'specializationId' });
Doctor.belongsTo(Specialization, { foreignKey: 'specializationId' });

Patient.hasMany(Appointment, { foreignKey: 'patientId' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });

Doctor.hasMany(Appointment, { foreignKey: 'doctorId' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId' });

Patient.hasMany(MedicalRecord, { foreignKey: 'patientId' });
MedicalRecord.belongsTo(Patient, { foreignKey: 'patientId' });

Doctor.hasMany(MedicalRecord, { foreignKey: 'doctorId' });
MedicalRecord.belongsTo(Doctor, { foreignKey: 'doctorId' });

MedicalRecord.hasMany(Prescription, { foreignKey: 'medicalRecordId' });
Prescription.belongsTo(MedicalRecord, { foreignKey: 'medicalRecordId' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

export {
  sequelize,
  User,
  Patient,
  Doctor,
  Specialization,
  Appointment,
  MedicalRecord,
  Prescription,
  Notification
};
