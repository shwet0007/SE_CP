import React, { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, ClipboardList, Plus, Trash2, Users } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/StatCard';
import AppointmentCard from '../components/AppointmentCard';
import RecordCard from '../components/RecordCard';
import SectionCard from '../components/SectionCard';
import { useAuth } from '../state/AuthContext';
import { fetchAppointments, updateAppointment } from '../api/appointments';
import { createAvailability, deleteAvailability, fetchAvailability } from '../api/availability';
import { createPrescription } from '../api/prescriptions';
import { createRecord, fetchRecords } from '../api/records';

const today = new Date().toISOString().slice(0, 10);

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingVisit, setSavingVisit] = useState(false);
  const [activeVisit, setActiveVisit] = useState(null);
  const [availabilityForm, setAvailabilityForm] = useState({
    availableDate: today,
    startTime: '',
    endTime: ''
  });
  const [visitForm, setVisitForm] = useState({
    diagnosis: '',
    treatment: '',
    notes: '',
    visitDate: today,
    medicines: '',
    dosageInstructions: ''
  });
  const doctorId = useMemo(() => {
    if (user?.role === 'doctor') return user?.doctorId || null;
    return null;
  }, [user]);

  useEffect(() => {
    const load = async () => {
      if (!doctorId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const [apptData, recordData, availabilityData] = await Promise.all([
          fetchAppointments({ doctorId }),
          fetchRecords({ doctorId }),
          fetchAvailability({ doctorId })
        ]);
        setAppointments(apptData);
        setRecords(recordData);
        setAvailability(availabilityData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load doctor workspace data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [doctorId]);

  const myAppointments = appointments.filter((a) => a.doctorId === doctorId);
  const myRecords = records.filter((r) => r.doctorId === doctorId);
  const upcomingAppointments = myAppointments
    .filter((a) => a.status === 'booked')
    .sort((a, b) => `${a.appointmentDate} ${a.appointmentTime}`.localeCompare(`${b.appointmentDate} ${b.appointmentTime}`));

  const startVisit = (appointment) => {
    setActiveVisit(appointment);
    setVisitForm({
      diagnosis: '',
      treatment: '',
      notes: '',
      visitDate: appointment.appointmentDate || today,
      medicines: '',
      dosageInstructions: ''
    });
  };

  const handleVisitSubmit = async (e) => {
    e.preventDefault();
    if (!activeVisit) return;
    if ((visitForm.medicines && !visitForm.dosageInstructions) || (!visitForm.medicines && visitForm.dosageInstructions)) {
      setError('Enter both medicines and dosage instructions to create a prescription');
      return;
    }
    setSavingVisit(true);
    setError('');
    try {
      const record = await createRecord({
        patientId: activeVisit.patientId,
        doctorId,
        diagnosis: visitForm.diagnosis,
        treatment: visitForm.treatment,
        notes: visitForm.notes,
        visitDate: visitForm.visitDate
      });
      let recordForState = record;
      if (visitForm.medicines && visitForm.dosageInstructions) {
        const prescription = await createPrescription({
          medicalRecordId: record.id,
          patientId: activeVisit.patientId,
          doctorId,
          medicines: visitForm.medicines,
          dosageInstructions: visitForm.dosageInstructions
        });
        recordForState = { ...record, Prescriptions: [...(record.Prescriptions || []), prescription] };
      }
      const updated = await updateAppointment(activeVisit.id, { status: 'completed' });
      setAppointments((list) => list.map((appt) => (appt.id === updated.id ? updated : appt)));
      setRecords((list) => [recordForState, ...list]);
      setActiveVisit(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete visit');
    } finally {
      setSavingVisit(false);
    }
  };

  const handleAvailabilitySubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const slot = await createAvailability({ doctorId, ...availabilityForm });
      setAvailability((list) =>
        [...list, slot].sort((a, b) => `${a.availableDate} ${a.startTime}`.localeCompare(`${b.availableDate} ${b.startTime}`))
      );
      setAvailabilityForm((form) => ({ ...form, startTime: '', endTime: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add availability slot');
    }
  };

  const handleDeleteSlot = async (slot) => {
    if (!window.confirm('Delete this availability slot?')) return;
    setError('');
    try {
      await deleteAvailability(slot.id);
      setAvailability((list) => list.filter((item) => item.id !== slot.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete availability slot');
    }
  };

  const stats = [
    {
      label: 'Today',
      value: myAppointments.filter((a) => a.status === 'booked' && a.appointmentDate === today).length,
      icon: CalendarCheck
    },
    { label: 'Completed', value: myAppointments.filter((a) => a.status === 'completed').length, icon: ClipboardList },
    { label: 'Patients', value: new Set(myAppointments.map((a) => a.patientId)).size, icon: Users }
  ];

  return (
    <DashboardLayout role="doctor" title="Doctor workspace" subtitle="Stay on top of your visits and notes">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Upcoming visits">
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : (
              <>
                {upcomingAppointments.slice(0, 4).map((appt) => (
                  <AppointmentCard
                    key={appt.id}
                    appointment={appt}
                    onComplete={startVisit}
                    updating={savingVisit && activeVisit?.id === appt.id}
                  />
                ))}
                {upcomingAppointments.length === 0 && <p className="text-sm text-slate-500">No visits scheduled.</p>}
              </>
            )}
          </div>
        </SectionCard>
        <SectionCard title="Availability">
          <form className="grid gap-3 md:grid-cols-2" onSubmit={handleAvailabilitySubmit}>
            <label className="text-sm text-slate-600">
              Date
              <input
                type="date"
                min={today}
                value={availabilityForm.availableDate}
                onChange={(e) => setAvailabilityForm((form) => ({ ...form, availableDate: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                required
              />
            </label>
            <label className="text-sm text-slate-600">
              Start
              <input
                type="time"
                value={availabilityForm.startTime}
                onChange={(e) => setAvailabilityForm((form) => ({ ...form, startTime: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                required
              />
            </label>
            <label className="text-sm text-slate-600">
              End
              <input
                type="time"
                value={availabilityForm.endTime}
                onChange={(e) => setAvailabilityForm((form) => ({ ...form, endTime: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                required
              />
            </label>
            <div className="flex items-end justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-brand-700"
              >
                <Plus size={15} /> Add
              </button>
            </div>
          </form>
          <div className="mt-4 space-y-2">
            {availability.slice(0, 8).map((slot) => (
              <div key={slot.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-sm">
                <div>
                  <p className="font-semibold text-slate-800">
                    {slot.availableDate} | {slot.startTime} - {slot.endTime}
                  </p>
                  <p className="text-xs text-slate-500">{slot.isBooked ? 'Booked' : 'Open'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteSlot(slot)}
                  disabled={slot.isBooked}
                  title="Delete availability slot"
                  aria-label="Delete availability slot"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-100 text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {availability.length === 0 && !loading && <p className="text-sm text-slate-500">No availability slots added.</p>}
          </div>
        </SectionCard>
      </div>

      {activeVisit && (
        <SectionCard title="Complete visit">
          <form className="grid gap-3 md:grid-cols-2" onSubmit={handleVisitSubmit}>
            <label className="text-sm text-slate-600">
              Visit date
              <input
                type="date"
                value={visitForm.visitDate}
                onChange={(e) => setVisitForm((form) => ({ ...form, visitDate: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                required
              />
            </label>
            <label className="text-sm text-slate-600">
              Diagnosis
              <input
                value={visitForm.diagnosis}
                onChange={(e) => setVisitForm((form) => ({ ...form, diagnosis: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                required
              />
            </label>
            <label className="text-sm text-slate-600">
              Treatment
              <input
                value={visitForm.treatment}
                onChange={(e) => setVisitForm((form) => ({ ...form, treatment: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              />
            </label>
            <label className="text-sm text-slate-600">
              Medicines
              <input
                value={visitForm.medicines}
                onChange={(e) => setVisitForm((form) => ({ ...form, medicines: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              />
            </label>
            <label className="text-sm text-slate-600">
              Dosage instructions
              <input
                value={visitForm.dosageInstructions}
                onChange={(e) => setVisitForm((form) => ({ ...form, dosageInstructions: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              />
            </label>
            <label className="md:col-span-2 text-sm text-slate-600">
              Notes
              <textarea
                value={visitForm.notes}
                onChange={(e) => setVisitForm((form) => ({ ...form, notes: e.target.value }))}
                rows={3}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
              />
            </label>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveVisit(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={savingVisit}
                className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Complete
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Recent notes">
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : (
              <>
                {myRecords.slice(0, 4).map((rec) => (
                  <RecordCard key={rec.id} record={rec} />
                ))}
                {myRecords.length === 0 && <p className="text-sm text-slate-500">No medical records yet.</p>}
              </>
            )}
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}
