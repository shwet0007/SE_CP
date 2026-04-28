import { Op } from 'sequelize';
import { Appointment, Doctor, DoctorAvailability, Notification, Patient, Specialization, User } from '../models/index.js';

const VALID_STATUSES = ['booked', 'completed', 'cancelled'];

const getPatientProfile = (userId) => Patient.findOne({ where: { userId } });
const getDoctorProfile = (userId) => Doctor.findOne({ where: { userId } });
const today = () => new Date().toISOString().slice(0, 10);

const appointmentIncludes = [
  {
    model: Doctor,
    include: [
      { model: Specialization, attributes: ['name'] },
      { model: User, attributes: ['name', 'email'] }
    ]
  },
  { model: Patient, include: [{ model: User, attributes: ['name', 'email'] }] }
];

const hasAvailableSlot = (doctorId, appointmentDate, appointmentTime) =>
  DoctorAvailability.findOne({
    where: {
      doctorId,
      availableDate: appointmentDate,
      startTime: appointmentTime
    }
  });

export const listAppointments = async (req, res) => {
  const { status, date, doctorId, patientId } = req.query;
  const where = {};
  if (status && VALID_STATUSES.includes(status)) where.status = status;
  if (date) where.appointmentDate = date;

  if (req.user.role === 'patient') {
    const patient = await getPatientProfile(req.user.id);
    if (!patient) return res.json([]);
    where.patientId = patient.id;
  } else if (req.user.role === 'doctor') {
    const doctor = await getDoctorProfile(req.user.id);
    if (!doctor) return res.json([]);
    where.doctorId = doctor.id;
  } else {
    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;
  }

  const data = await Appointment.findAll({
    where,
    order: [
      ['appointmentDate', 'DESC'],
      ['appointmentTime', 'ASC']
    ],
    include: appointmentIncludes
  });
  res.json(data);
};

export const bookAppointment = async (req, res) => {
  let { patientId, doctorId, appointmentDate, appointmentTime, reason } = req.body;
  if (req.user.role === 'doctor') {
    return res.status(403).json({ message: 'Doctors cannot book patient appointments from this endpoint' });
  }

  if (req.user.role === 'patient') {
    const patient = await getPatientProfile(req.user.id);
    if (!patient) return res.status(400).json({ message: 'Patient profile not found' });
    if (patientId && Number(patientId) !== patient.id) {
      return res.status(403).json({ message: 'Cannot book for another patient' });
    }
    patientId = patient.id;
  }

  if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  if (appointmentDate < today()) return res.status(400).json({ message: 'Appointment date cannot be in the past' });

  const [patient, doctor] = await Promise.all([Patient.findByPk(patientId), Doctor.findByPk(doctorId)]);
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  const slot = await hasAvailableSlot(doctorId, appointmentDate, appointmentTime);
  if (!slot) return res.status(400).json({ message: 'Selected slot is not available for this doctor' });

  const existing = await Appointment.findOne({
    where: {
      doctorId,
      appointmentDate,
      appointmentTime,
      status: 'booked'
    }
  });
  if (existing) return res.status(409).json({ message: 'Doctor already has a booked appointment in this slot' });

  const appt = await Appointment.create({
    patientId,
    doctorId,
    appointmentDate,
    appointmentTime,
    reason,
    status: 'booked'
  });
  await Notification.bulkCreate([
    {
      userId: patient.userId,
      title: 'Appointment booked',
      message: `Your appointment is booked for ${appointmentDate} at ${appointmentTime}`,
      type: 'appointment'
    },
    {
      userId: doctor.userId,
      title: 'New appointment',
      message: `A patient appointment is booked for ${appointmentDate} at ${appointmentTime}`,
      type: 'appointment'
    }
  ]);
  const appointmentWithDetails = await Appointment.findByPk(appt.id, { include: appointmentIncludes });
  res.status(201).json(appointmentWithDetails);
};

export const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const appt = await Appointment.findByPk(id);
  if (!appt) return res.status(404).json({ message: 'Not found' });

  if (req.user.role === 'patient') {
    const patient = await getPatientProfile(req.user.id);
    if (!patient || appt.patientId !== patient.id) return res.status(404).json({ message: 'Not found' });
  }

  if (req.user.role === 'doctor') {
    const doctor = await getDoctorProfile(req.user.id);
    if (!doctor || appt.doctorId !== doctor.id) return res.status(404).json({ message: 'Not found' });
  }

  const { status, appointmentDate, appointmentTime, reason } = req.body;
  if (status && !VALID_STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid appointment status' });
  if (req.user.role === 'patient' && status && status !== 'cancelled') {
    return res.status(403).json({ message: 'Patients can only cancel appointments' });
  }

  const nextDate = appointmentDate ?? appt.appointmentDate;
  const nextTime = appointmentTime ?? appt.appointmentTime;
  if (appointmentDate && appointmentDate < today()) {
    return res.status(400).json({ message: 'Appointment date cannot be in the past' });
  }
  if ((appointmentDate || appointmentTime) && (status ?? appt.status) === 'booked') {
    const slot = await hasAvailableSlot(appt.doctorId, nextDate, nextTime);
    if (!slot) return res.status(400).json({ message: 'Selected slot is not available for this doctor' });

    const existing = await Appointment.findOne({
      where: {
        id: { [Op.ne]: appt.id },
        doctorId: appt.doctorId,
        appointmentDate: nextDate,
        appointmentTime: nextTime,
        status: 'booked'
      }
    });
    if (existing) return res.status(409).json({ message: 'Doctor already has a booked appointment in this slot' });
  }

  const updates = {};
  if (status !== undefined) updates.status = status;
  if (appointmentDate !== undefined) updates.appointmentDate = appointmentDate;
  if (appointmentTime !== undefined) updates.appointmentTime = appointmentTime;
  if (reason !== undefined) updates.reason = reason;

  await appt.update(updates);
  const appointmentWithDetails = await Appointment.findByPk(appt.id, { include: appointmentIncludes });
  res.json(appointmentWithDetails);
};

export const deleteAppointment = async (req, res) => {
  const { id } = req.params;
  const appt = await Appointment.findByPk(id);
  if (!appt) return res.status(404).json({ message: 'Not found' });

  if (req.user.role === 'patient') {
    const patient = await getPatientProfile(req.user.id);
    if (!patient || appt.patientId !== patient.id) return res.status(404).json({ message: 'Not found' });
  } else if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only patients can delete their appointments' });
  }

  await appt.destroy();
  res.status(204).send();
};
