import React, { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, ClipboardList, Users } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import StatCard from '../components/StatCard';
import AppointmentCard from '../components/AppointmentCard';
import RecordCard from '../components/RecordCard';
import SectionCard from '../components/SectionCard';
import { appointments as mockAppointments, medicalRecords as mockRecords } from '../data/mockData';
import { useAuth } from '../state/AuthContext';
import { fetchAppointments } from '../api/appointments';
import { fetchRecords } from '../api/records';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState(mockAppointments);
  const [records, setRecords] = useState(mockRecords);
  const [loading, setLoading] = useState(true);
  const doctorId = useMemo(() => {
    if (user?.role === 'doctor') return user?.doctorId || user.id;
    return 1;
  }, [user]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [apptData, recordData] = await Promise.all([
          fetchAppointments({ doctorId }),
          fetchRecords({ doctorId })
        ]);
        setAppointments(apptData);
        setRecords(recordData);
      } catch (_) {
        // fallback to mock
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [doctorId]);

  const myAppointments = appointments.filter((a) => a.doctorId === doctorId);
  const myRecords = records.filter((r) => r.doctorId === doctorId);
  const today = new Date().toISOString().slice(0, 10);
  const upcomingAppointments = myAppointments
    .filter((a) => a.status === 'booked')
    .sort((a, b) => `${a.appointmentDate} ${a.appointmentTime}`.localeCompare(`${b.appointmentDate} ${b.appointmentTime}`));

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

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Upcoming visits">
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : (
              <>
                {upcomingAppointments.slice(0, 4).map((appt) => (
                  <AppointmentCard key={appt.id} appointment={appt} />
                ))}
                {upcomingAppointments.length === 0 && <p className="text-sm text-slate-500">No visits scheduled.</p>}
              </>
            )}
          </div>
        </SectionCard>
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
