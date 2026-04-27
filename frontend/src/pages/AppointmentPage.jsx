import React, { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import SectionCard from '../components/SectionCard';
import AppointmentCard from '../components/AppointmentCard';
import AppointmentForm from '../components/AppointmentForm';
import Badge from '../components/Badge';
import { useAuth } from '../state/AuthContext';
import { createAppointment, fetchAppointments } from '../api/appointments';

export default function AppointmentPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ status: 'all', date: '' });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
              <AppointmentCard key={appt.id} appointment={appt} />
            ))}
            {filtered.length === 0 && <p className="text-sm text-slate-500">No appointments match the filters.</p>}
          </div>
        )}
      </SectionCard>
    </DashboardLayout>
  );
}
