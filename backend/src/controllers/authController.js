import { User, Patient, Doctor, Specialization } from '../models/index.js';
import { signToken } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../middleware/auth.js';
import sequelize from '../config/database.js';

const ROLES = ['patient', 'doctor', 'admin'];

const toNullableNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  return Number.isNaN(number) ? null : number;
};

const publicUser = (user, extras = {}) => {
  const { passwordHash, ...safeUser } = user.toJSON();
  return { ...safeUser, ...extras };
};

export const register = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    let {
      name,
      email,
      password,
      role,
      specializationId,
      specializationName,
      qualification,
      experienceYears,
      consultationFee,
      age,
      gender,
      phone,
      address,
      bloodGroup
    } = req.body;

    role = role?.toLowerCase()?.trim();
    email = email?.toLowerCase()?.trim();
    name = name?.trim();
    if (!name || !email || !password || !role) {
      await t.rollback();
      return res.status(400).json({ message: 'Missing fields' });
    }
    if (!ROLES.includes(role)) {
      await t.rollback();
      return res.status(400).json({ message: 'Invalid role' });
    }

    const exists = await User.findOne({ where: { email }, transaction: t });
    if (exists) {
      await t.rollback();
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, email, passwordHash, role }, { transaction: t });

    if (role === 'patient') {
      await Patient.create(
        {
          userId: user.id,
          age: toNullableNumber(age),
          gender: gender ?? null,
          phone: phone ?? null,
          address: address ?? null,
          bloodGroup: bloodGroup ?? null
        },
        { transaction: t }
      );
    }

    if (role === 'doctor') {
      let spec = null;

      // Try to find by numeric id
      if (specializationId) {
        const idNum = Number(specializationId);
        if (!Number.isNaN(idNum)) {
          spec = await Specialization.findByPk(idNum, { transaction: t });
        }
      }

      // Try to create/find by name if provided
      const specNameFallback =
        specializationName ||
        (!Number.isNaN(Number(specializationId)) ? null : specializationId) || // when value sent is a name
        null;

      if (!spec && specNameFallback) {
        const [createdSpec] = await Specialization.findOrCreate({
          where: { name: specNameFallback },
          defaults: { name: specNameFallback },
          transaction: t
        });
        spec = createdSpec;
      }

      // Absolute fallback: pick any specialization or create a generic one
      if (!spec) {
        const existing = await Specialization.findOne({ transaction: t });
        if (existing) {
          spec = existing;
        } else {
          spec = await Specialization.create({ name: 'General Medicine' }, { transaction: t });
        }
      }

      await Doctor.create(
        {
          userId: user.id,
          specializationId: spec.id,
          qualification: qualification ?? null,
          experienceYears: toNullableNumber(experienceYears),
          consultationFee: toNullableNumber(consultationFee)
        },
        { transaction: t }
      );
    }

    await t.commit();
    const patient = role === 'patient' ? await Patient.findOne({ where: { userId: user.id } }) : null;
    const doctor = role === 'doctor' ? await Doctor.findOne({ where: { userId: user.id } }) : null;
    const token = signToken({ id: user.id, role: user.role });
    return res.status(201).json({ token, user: publicUser(user, { patientId: patient?.id, doctorId: doctor?.id }) });
  } catch (err) {
    if (!t.finished) await t.rollback();
    return res.status(500).json({ message: err.message || 'Failed to register' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.toLowerCase()?.trim();
  if (!normalizedEmail || !password) return res.status(400).json({ message: 'Missing fields' });
  const user = await User.findOne({ where: { email: normalizedEmail } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const patient = user.role === 'patient' ? await Patient.findOne({ where: { userId: user.id } }) : null;
  const doctor = user.role === 'doctor' ? await Doctor.findOne({ where: { userId: user.id } }) : null;
  const token = signToken({ id: user.id, role: user.role });
  return res.json({ token, user: publicUser(user, { patientId: patient?.id, doctorId: doctor?.id }) });
};

export const me = async (req, res) => {
  const patient = req.user.role === 'patient' ? await Patient.findOne({ where: { userId: req.user.id } }) : null;
  const doctor = req.user.role === 'doctor' ? await Doctor.findOne({ where: { userId: req.user.id } }) : null;
  return res.json({ user: publicUser(req.user, { patientId: patient?.id, doctorId: doctor?.id }) });
};
