import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../state/AuthContext';
import { fetchDoctors } from '../api/doctors';
import { fetchAvailability } from '../api/availability';

const today = new Date().toISOString().slice(0, 10);

const normalizeDoctor = (doctor) => ({
  id: doctor.id,
  name: doctor.User?.name || doctor.name,
  specializationId: doctor.specializationId || doctor.specialization_id || doctor.Specialization?.id,
  specializationName: doctor.Specialization?.name || doctor.specializationName || 'Specialist'
});

export default function AppointmentForm({ onBook }) {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    specializationId: '',
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchDoctors();
        setDoctors((data || []).map(normalizeDoctor));
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load doctors from the database');
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadSlots = async () => {
      if (!form.doctorId || !form.date) {
        setSlots([]);
        return;
      }
      setSlotsLoading(true);
      setError('');
      try {
        const data = await fetchAvailability({ doctorId: form.doctorId, date: form.date });
        setSlots((data || []).filter((slot) => !slot.isBooked));
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load doctor availability');
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    loadSlots();
  }, [form.doctorId, form.date]);

  const specializationOptions = useMemo(() => {
    const byId = new Map();
    doctors.forEach((doctor) => {
      if (doctor.specializationId) byId.set(doctor.specializationId, doctor.specializationName);
    });
    return Array.from(byId, ([id, name]) => ({ id, name }));
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    if (!form.specializationId) return doctors;
    return doctors.filter((d) => d.specializationId === Number(form.specializationId));
  }, [form.specializationId, doctors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.doctorId || !form.date || !form.time) return;
    try {
      await onBook({
        patientId: user?.patientId || user?.id || 1,
        doctorId: Number(form.doctorId),
        appointmentDate: form.date,
        appointmentTime: form.time,
        status: 'booked',
        reason: form.reason || 'General consultation'
      });
      setForm({ specializationId: '', doctorId: '', date: '', time: '', reason: '' });
    } catch (_) {
      // The parent page shows the booking error.
    }
  };

  return (
    <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
      <label className="text-sm text-slate-600">
        Specialization
        <select
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
          value={form.specializationId}
          onChange={(e) => setForm((f) => ({ ...f, specializationId: e.target.value, doctorId: '' }))}
        >
          <option value="">Any</option>
          {specializationOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm text-slate-600">
        Doctor
        <select
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
          value={form.doctorId}
          onChange={(e) => setForm((f) => ({ ...f, doctorId: e.target.value, time: '' }))}
          required
          disabled={loading}
        >
          <option value="">{loading ? 'Loading...' : 'Select'}</option>
          {filteredDoctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
      </label>
      <label className="text-sm text-slate-600">
        Date
        <input
          type="date"
          min={today}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value, time: '' }))}
          required
        />
      </label>
      <label className="text-sm text-slate-600">
        Slot
        <select
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
          value={form.time}
          onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
          required
          disabled={!form.doctorId || !form.date || slotsLoading}
        >
          <option value="">
            {slotsLoading ? 'Loading slots...' : form.doctorId && form.date ? 'Select slot' : 'Select doctor and date'}
          </option>
          {slots.map((slot) => (
            <option key={slot.id} value={slot.startTime}>
              {slot.startTime} - {slot.endTime}
            </option>
          ))}
        </select>
        {form.doctorId && form.date && !slotsLoading && slots.length === 0 && (
          <p className="text-xs text-slate-500 mt-1">No open slots for this date.</p>
        )}
      </label>
      <label className="md:col-span-2 text-sm text-slate-600">
        Reason
        <textarea
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
          value={form.reason}
          onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
          rows={3}
          placeholder="Describe the concern"
        />
      </label>
      <div className="md:col-span-2 flex justify-end">
        <button
          type="submit"
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-brand-700"
        >
          Book Appointment
        </button>
      </div>
    </form>
  );
}
