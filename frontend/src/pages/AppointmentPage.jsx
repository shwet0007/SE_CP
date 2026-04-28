import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import SectionCard from '../components/SectionCard';
import AppointmentCard from '../components/AppointmentCard';
import AppointmentForm from '../components/AppointmentForm';
import Badge from '../components/Badge';
import { useAuth } from '../state/AuthContext';
import { createAppointment, deleteAppointment, fetchAppointments, updateAppointment } from '../api/appointments';
import { fetchAvailability } from '../api/availability';

export default function AppointmentPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ status: 'all', date: '' });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '' });
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAppointments({
        status: filters.status === 'all' ? undefined : filters.status,
        date: filters.date || undefined,
        doctorId: user?.role === 'doctor' ? user?.doctorId : undefined,
        patientId: user?.role === 'patient' ? user?.patientId : undefined
      });
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.date]);

  useEffect(() => {
    const loadSlots = async () => {
      if (!rescheduleTarget || !rescheduleForm.date) {
        setSlots([]);
        return;
      }
      setSlotsLoading(true);
      setError('');
      try {
        const data = await fetchAvailability({ doctorId: rescheduleTarget.doctorId, date: rescheduleForm.date });
        setSlots((data || []).filter((slot) => !slot.isBooked));
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load doctor availability');
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    loadSlots();
  }, [rescheduleTarget, rescheduleForm.date]);

  const filtered = useMemo(() => {
    return items.filter((appt) => {
      if (user?.role === 'patient' && user?.patientId && appt.patientId !== user.patientId) return false;
      if (user?.role === 'doctor' && user?.doctorId && appt.doctorId !== user.doctorId) return false;
      if (filters.status !== 'all' && appt.status !== filters.status) return false;
      if (filters.date && appt.appointmentDate !== filters.date) return false;
      return true;
    });
  }, [items, filters, user]);

  const handleBook = async (appointment) => {
    setError('');
    try {
      const created = await createAppointment(appointment);
      setItems((list) => [created, ...list]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book');
      throw err;
    }
  };

  const handleDelete = async (appointment) => {
    if (!window.confirm('Delete this appointment?')) return;
    setError('');
    setDeletingId(appointment.id);
    try {
      await deleteAppointment(appointment.id);
      setItems((list) => list.filter((item) => item.id !== appointment.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete appointment');
    } finally {
      setDeletingId(null);
    }
  };

  const startReschedule = (appointment) => {
    setRescheduleTarget(appointment);
    setRescheduleForm({ date: appointment.appointmentDate, time: '' });
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleTarget || !rescheduleForm.date || !rescheduleForm.time) return;
    setError('');
    setUpdatingId(rescheduleTarget.id);
    try {
      const updated = await updateAppointment(rescheduleTarget.id, {
        appointmentDate: rescheduleForm.date,
        appointmentTime: rescheduleForm.time
      });
      setItems((list) => list.map((item) => (item.id === updated.id ? updated : item)));
      setRescheduleTarget(null);
      setRescheduleForm({ date: '', time: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reschedule appointment');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (appointment) => {
    if (!window.confirm('Cancel this appointment?')) return;
    setError('');
    setUpdatingId(appointment.id);
    try {
      const updated = await updateAppointment(appointment.id, { status: 'cancelled' });
      setItems((list) => list.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <DashboardLayout role={user?.role || 'patient'} title="Appointments" subtitle="Book, reschedule, and track visits">
      <div className="grid gap-4 lg:grid-cols-2">
        {user?.role === 'patient' && (
          <SectionCard
            title="Book appointment"
            action={<Badge label={`${items.filter((i) => i.status === 'booked').length} active`} variant="booked" />}
          >
            <AppointmentForm onBook={handleBook} />
          </SectionCard>
        )}

        <SectionCard
          title="Filters"
          action={<p className="text-xs text-slate-500">Search quickly</p>}
        >
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="text-slate-600">
              Status
              <select
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              >
                <option value="all">All</option>
                <option value="booked">Booked</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
            <label className="text-slate-600">
              Date
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              />
            </label>
          </div>
        </SectionCard>
      </div>

      {user?.role === 'patient' && rescheduleTarget && (
        <SectionCard
          title="Reschedule appointment"
          action={
            <button
              type="button"
              onClick={() => setRescheduleTarget(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Close
            </button>
          }
        >
          <form className="grid gap-3 md:grid-cols-3" onSubmit={handleReschedule}>
            <label className="text-sm text-slate-600">
              Date
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={rescheduleForm.date}
                onChange={(e) => setRescheduleForm({ date: e.target.value, time: '' })}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                required
              />
            </label>
            <label className="text-sm text-slate-600">
              Slot
              <select
                value={rescheduleForm.time}
                onChange={(e) => setRescheduleForm((form) => ({ ...form, time: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                disabled={slotsLoading}
                required
              >
                <option value="">{slotsLoading ? 'Loading slots...' : 'Select slot'}</option>
                {slots.map((slot) => (
                  <option key={slot.id} value={slot.startTime}>
                    {slot.startTime} - {slot.endTime}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end justify-end">
              <button
                type="submit"
                disabled={updatingId === rescheduleTarget.id}
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save
              </button>
            </div>
          </form>
          {!slotsLoading && slots.length === 0 && (
            <p className="mt-2 text-xs text-slate-500">No open slots for this doctor on the selected date.</p>
          )}
        </SectionCard>
      )}

      <SectionCard
        title="Appointments list"
        action={<span className="text-xs text-slate-500">{filtered.length} results</span>}
      >
        {loading ? (
          <p className="text-sm text-slate-500">Loading appointments...</p>
        ) : error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {filtered.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onCancel={user?.role === 'patient' ? handleCancel : undefined}
                onDelete={user?.role === 'patient' ? handleDelete : undefined}
                onReschedule={user?.role === 'patient' ? startReschedule : undefined}
                deleting={deletingId === appt.id}
                updating={updatingId === appt.id}
              />
            ))}
            {filtered.length === 0 && <p className="text-sm text-slate-500">No appointments match the filters.</p>}
          </div>
        )}
      </SectionCard>
    </DashboardLayout>
  );
}
