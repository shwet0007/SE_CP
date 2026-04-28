import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, FileText, Stethoscope } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/StatCard';
import AppointmentCard from '../components/AppointmentCard';
import SectionCard from '../components/SectionCard';
import { useAuth } from '../state/AuthContext';
import { fetchAppointments } from '../api/appointments';
import { fetchRecords } from '../api/records';
import { fetchDoctors } from '../api/doctors';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const patientId = user?.role === 'patient' ? user?.patientId || user.id : 1;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [apptData, recordData, doctorData] = await Promise.all([
          fetchAppointments({ patientId }),
          fetchRecords({ patientId }),
          fetchDoctors()
        ]);
        setAppointments(apptData);
        setRecords(recordData);
        setDoctors(
          (doctorData || []).map((d) => ({
            id: d.id,
            name: d.User?.name || d.name,
            specializationId: d.specializationId || d.specialization_id || d.Specialization?.id,
            specializationName: d.Specialization?.name || d.specializationName || 'Specialist',
            experienceYears: d.experienceYears || d.experience_years,
            consultationFee: d.consultationFee || d.consultation_fee
          }))
        );
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load patient workspace data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId]);

  const myAppointments = appointments.filter((a) => a.patientId === patientId);
  const myRecords = records.filter((r) => r.patientId === patientId);

  const stats = [
    {
      label: 'Upcoming',
      value: myAppointments.filter((a) => a.status === 'booked').length,
      delta: '+2 slots',
      icon: CalendarDays
    },
    { label: 'Medical records', value: myRecords.length, delta: 'Updated weekly', icon: FileText },
    { label: 'Consult doctors', value: doctors.length, delta: 'Available now', icon: Stethoscope }
  ];

  const filteredDoctors = useMemo(() => {
    if (!search) return doctors;
    return doctors.filter((d) => `${d.name} ${d.specializationName}`.toLowerCase().includes(search.toLowerCase()));
  }, [search, doctors]);

  return (
    <DashboardLayout role="patient" title="Patient workspace" subtitle="Track appointments and health records">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Next appointments" action={<p className="text-xs text-slate-500">Updated live</p>}>
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading appointments...</p>
            ) : (
              myAppointments
                .filter((a) => a.status === 'booked')
                .slice(0, 3)
                .map((appt) => <AppointmentCard key={appt.id} appointment={appt} />)
            )}
            {!loading && myAppointments.filter((a) => a.status === 'booked').length === 0 && (
              <p className="text-sm text-slate-500">No bookings yet. Use the Appointment tab to schedule.</p>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Recent records"
          action={<span className="text-xs text-slate-500">Last updated {myRecords[0]?.visitDate || 'N/A'}</span>}
        >
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading records...</p>
            ) : myRecords.slice(0, 3).map((rec) => (
              <div key={rec.id} className="rounded-2xl border border-slate-100 bg-white p-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">{rec.diagnosis}</p>
                <p className="text-xs text-slate-500">Visit: {rec.visitDate}</p>
                <p className="mt-1 text-slate-600">Treatment: {rec.treatment}</p>
              </div>
            ))}
            {!loading && myRecords.length === 0 && <p className="text-sm text-slate-500">No records found.</p>}
          </div>
        </SectionCard>

        <SectionCard
          title="Find a doctor"
          action={
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or specialty"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-brand-400 focus:outline-none"
            />
          }
        >
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading doctors...</p>
            ) : (
              filteredDoctors.slice(0, 5).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-3">
                  <div>
                    <p className="font-semibold text-slate-900">{doc.name}</p>
                    <p className="text-xs text-slate-500">
                      {doc.specializationName} • {doc.experienceYears || 0} yrs exp
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    ₹{doc.consultationFee || 0}
                  </span>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}
