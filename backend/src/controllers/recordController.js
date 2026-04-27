import { Op } from 'sequelize';
import { MedicalRecord, Prescription, Doctor, Patient, User } from '../models/index.js';

const getPatientProfile = (userId) => Patient.findOne({ where: { userId } });
const getDoctorProfile = (userId) => Doctor.findOne({ where: { userId } });

export const listRecords = async (req, res) => {
  const { patientId, doctorId, date, q } = req.query;
  const where = {};
  if (req.user.role === 'patient') {
    const patient = await getPatientProfile(req.user.id);
    if (!patient) return res.json([]);
    where.patientId = patient.id;
  } else if (req.user.role === 'doctor') {
    const doctor = await getDoctorProfile(req.user.id);
    if (!doctor) return res.json([]);
    where.doctorId = doctor.id;
  } else {
    if (patientId) where.patientId = patientId;
    if (doctorId) where.doctorId = doctorId;
  }
  if (date) where.visitDate = date;
  if (q) {
    where[Op.or] = [
      { diagnosis: { [Op.like]: `%${q}%` } },
      { treatment: { [Op.like]: `%${q}%` } },
      { notes: { [Op.like]: `%${q}%` } }
    ];
  }
  const data = await MedicalRecord.findAll({
    where,
    include: [
      { model: Prescription },
      { model: Doctor, include: [{ model: User, attributes: ['name', 'email'] }] },
      { model: Patient, include: [{ model: User, attributes: ['name', 'email'] }] }
    ],
    order: [['visitDate', 'DESC']]
  });
  res.json(data);
};

export const createRecord = async (req, res) => {
  let { patientId, doctorId, diagnosis, treatment, notes, visitDate } = req.body;
  if (req.user.role === 'patient') return res.status(403).json({ message: 'Patients cannot create medical records' });
  if (req.user.role === 'doctor') {
    const doctor = await getDoctorProfile(req.user.id);
    if (!doctor) return res.status(400).json({ message: 'Doctor profile not found' });
    if (doctorId && Number(doctorId) !== doctor.id) {
      return res.status(403).json({ message: 'Cannot create records for another doctor' });
    }
    doctorId = doctor.id;
  }
  if (!patientId || !doctorId || !diagnosis || !visitDate) return res.status(400).json({ message: 'Missing fields' });
  const [patient, doctor] = await Promise.all([Patient.findByPk(patientId), Doctor.findByPk(doctorId)]);
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  const rec = await MedicalRecord.create({ patientId, doctorId, diagnosis, treatment, notes, visitDate });
  res.status(201).json(rec);
};

export const updateRecord = async (req, res) => {
  const { id } = req.params;
  const rec = await MedicalRecord.findByPk(id);
  if (!rec) return res.status(404).json({ message: 'Not found' });
  if (req.user.role === 'patient') return res.status(403).json({ message: 'Patients cannot update medical records' });
  if (req.user.role === 'doctor') {
    const doctor = await getDoctorProfile(req.user.id);
    if (!doctor || rec.doctorId !== doctor.id) return res.status(404).json({ message: 'Not found' });
  }
  const { diagnosis, treatment, notes, visitDate } = req.body;
  const updates = {};
  if (diagnosis !== undefined) updates.diagnosis = diagnosis;
  if (treatment !== undefined) updates.treatment = treatment;
  if (notes !== undefined) updates.notes = notes;
  if (visitDate !== undefined) updates.visitDate = visitDate;
  await rec.update(updates);
  res.json(rec);
};
