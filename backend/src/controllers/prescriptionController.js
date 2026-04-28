import { Doctor, MedicalRecord, Patient, Prescription, User } from '../models/index.js';

const getPatientProfile = (userId) => Patient.findOne({ where: { userId } });
const getDoctorProfile = (userId) => Doctor.findOne({ where: { userId } });

const prescriptionIncludes = [
  { model: MedicalRecord },
  { model: Doctor, include: [{ model: User, attributes: ['name', 'email'] }] },
  { model: Patient, include: [{ model: User, attributes: ['name', 'email'] }] }
];

export const listPrescriptions = async (req, res) => {
  const { recordId, patientId, doctorId } = req.query;
  const where = {};
  if (recordId) where.medicalRecordId = recordId;
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
  const data = await Prescription.findAll({ where, include: prescriptionIncludes });
  res.json(data);
};

export const createPrescription = async (req, res) => {
  let { medicalRecordId, patientId, doctorId, medicines, dosageInstructions } = req.body;
  if (req.user.role === 'patient') return res.status(403).json({ message: 'Patients cannot create prescriptions' });
  if (req.user.role === 'doctor') {
    const doctor = await getDoctorProfile(req.user.id);
    if (!doctor) return res.status(400).json({ message: 'Doctor profile not found' });
    if (doctorId && Number(doctorId) !== doctor.id) {
      return res.status(403).json({ message: 'Cannot create prescriptions for another doctor' });
    }
    doctorId = doctor.id;
  }
  if (!medicalRecordId || !patientId || !doctorId || !medicines || !dosageInstructions) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  const [record, patient, doctor] = await Promise.all([
    MedicalRecord.findByPk(medicalRecordId),
    Patient.findByPk(patientId),
    Doctor.findByPk(doctorId)
  ]);
  if (!record) return res.status(404).json({ message: 'Medical record not found' });
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  if (record.patientId !== Number(patientId) || record.doctorId !== Number(doctorId)) {
    return res.status(400).json({ message: 'Prescription must match the medical record patient and doctor' });
  }
  const pres = await Prescription.create({ medicalRecordId, patientId, doctorId, medicines, dosageInstructions });
  const prescriptionWithDetails = await Prescription.findByPk(pres.id, { include: prescriptionIncludes });
  res.status(201).json(prescriptionWithDetails);
};
