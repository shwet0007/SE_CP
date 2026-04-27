import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { Mail, User, UserCircle2 } from 'lucide-react';
import { specializations } from '../data/mockData';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'patient',
    password: 'password',
    specializationId: '',
    specializationName: '',
    qualification: '',
    experienceYears: '',
    consultationFee: '',
    age: '',
    gender: '',
    phone: '',
    address: '',
    bloodGroup: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        specializationId: form.role === 'doctor' ? Number(form.specializationId) : undefined,
        specializationName:
          form.role === 'doctor'
            ? specializations.find((s) => String(s.id) === String(form.specializationId))?.name
            : undefined,
        experienceYears: form.role === 'doctor' ? Number(form.experienceYears) : undefined,
        consultationFee: form.role === 'doctor' ? Number(form.consultationFee) : undefined,
        age: form.role === 'patient' && form.age ? Number(form.age) : undefined
      };
      const user = await register(payload);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-soft">
        <div className="grid md:grid-cols-2">
          <div className="p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Join</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">Create a smart hospital account</h2>
            <p className="mt-2 text-sm text-slate-500">Pick your role to auto-load the right dashboard.</p>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="text-sm text-slate-600">
                Full name
                <div className="relative mt-1">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm focus:border-brand-400 focus:outline-none"
                    required
                  />
                </div>
              </label>
              <label className="text-sm text-slate-600">
                Email
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm focus:border-brand-400 focus:outline-none"
                    required
                  />
                </div>
              </label>
              <label className="text-sm text-slate-600">
                Role
                <div className="relative mt-1">
                  <UserCircle2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <select
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 pl-10 text-sm focus:border-brand-400 focus:outline-none"
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </label>

              {form.role === 'doctor' && (
                <>
                  <label className="text-sm text-slate-600">
                    Specialization
                    <select
                      value={form.specializationId}
                      onChange={(e) => setForm((f) => ({ ...f, specializationId: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm focus:border-brand-400 focus:outline-none"
                      required
                    >
                      <option value="">Select specialization</option>
                      {specializations.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm text-slate-600">
                    Qualification
                    <input
                      value={form.qualification}
                      onChange={(e) => setForm((f) => ({ ...f, qualification: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-3 text-sm focus:border-brand-400 focus:outline-none"
                      placeholder="e.g., MD (Cardiology)"
                      required
                    />
                  </label>
                  <label className="text-sm text-slate-600">
                    Experience (years)
                    <input
                      type="number"
                      value={form.experienceYears}
                      onChange={(e) => setForm((f) => ({ ...f, experienceYears: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-3 text-sm focus:border-brand-400 focus:outline-none"
                      min="0"
                      required
                    />
                  </label>
                  <label className="text-sm text-slate-600">
                    Consultation fee (₹)
                    <input
                      type="number"
                      value={form.consultationFee}
                      onChange={(e) => setForm((f) => ({ ...f, consultationFee: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-3 text-sm focus:border-brand-400 focus:outline-none"
                      min="0"
                      required
                    />
                  </label>
                </>
              )}

              {form.role === 'patient' && (
                <>
                  <label className="text-sm text-slate-600">
                    Age
                    <input
                      type="number"
                      value={form.age}
                      onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-3 text-sm focus:border-brand-400 focus:outline-none"
                      min="0"
                    />
                  </label>
                  <label className="text-sm text-slate-600">
                    Gender
                    <select
                      value={form.gender}
                      onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm focus:border-brand-400 focus:outline-none"
                    >
                      <option value="">Select</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                  <label className="text-sm text-slate-600">
                    Phone
                    <input
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-3 text-sm focus:border-brand-400 focus:outline-none"
                      placeholder="+91 98765 12345"
                    />
                  </label>
                  <label className="text-sm text-slate-600">
                    Address
                    <input
                      value={form.address}
                      onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-3 text-sm focus:border-brand-400 focus:outline-none"
                      placeholder="City, State"
                    />
                  </label>
                  <label className="text-sm text-slate-600">
                    Blood group
                    <input
                      value={form.bloodGroup}
                      onChange={(e) => setForm((f) => ({ ...f, bloodGroup: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-3 text-sm focus:border-brand-400 focus:outline-none"
                      placeholder="O+, A-, B+, etc."
                    />
                  </label>
                </>
              )}
              <label className="text-sm text-slate-600">
                Password
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-3 text-sm focus:border-brand-400 focus:outline-none"
                  required
                />
              </label>
              {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 disabled:opacity-60"
              >
                {loading ? 'Registering...' : 'Register & Continue'}
              </button>
            </form>
            <p className="mt-3 text-xs text-slate-500">
              Already registered?{' '}
              <Link className="font-semibold text-brand-700" to="/login">
                Login
              </Link>
            </p>
          </div>
          <div className="hidden bg-gradient-to-br from-slate-900 to-brand-600 p-10 text-white md:block">
            <p className="text-sm uppercase tracking-[0.2em]">Hospital workflow</p>
            <h3 className="mt-4 text-2xl font-semibold">One account opens the right hospital workspace</h3>
            <ul className="mt-6 space-y-3 text-sm text-brand-50/90">
              <li>• Patients can book OPD appointments and view medical records</li>
              <li>• Doctors can track assigned visits and consultation notes</li>
              <li>• Admins can monitor appointments, records, and hospital activity</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
