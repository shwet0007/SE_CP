import React from 'react';
import { CalendarClock, Stethoscope, UserCircle2 } from 'lucide-react';
import Badge from './Badge';
import { specializations, doctors, patients } from '../data/mockData';

const getDoctor = (appointment) =>
  appointment.Doctor ||
  doctors.find((d) => d.id === appointment.doctorId) || { name: 'Doctor', specializationId: null };

const getPatient = (appointment) =>
  appointment.Patient || patients.find((p) => p.id === appointment.patientId) || { id: appointment.patientId };

const getSpecialization = (appointment, doctor) => {
  const specializationId = appointment.Doctor?.specializationId ?? appointment.specializationId ?? doctor?.specializationId;
  return appointment.Doctor?.Specialization?.name || specializations.find((s) => s.id === specializationId)?.name || 'Specialist';
};

export default function AppointmentCard({ appointment }) {
  const doctor = getDoctor(appointment);
  const patient = getPatient(appointment);
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Stethoscope className="text-brand-600" size={18} />
          <div>
            <p className="font-semibold text-slate-800">{doctor?.User?.name || doctor?.name}</p>
            <p className="text-xs text-slate-500">{getSpecialization(appointment, doctor)}</p>
          </div>
        </div>
        <Badge label={appointment.status} variant={appointment.status} />
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 md:grid-cols-3">
        <div className="flex items-center gap-2">
          <CalendarClock size={16} className="text-slate-500" />
          <span>
            {appointment.appointmentDate} @ {appointment.appointmentTime}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <UserCircle2 size={16} className="text-slate-500" />
          <span>{patient?.User?.name || patient?.name || (patient?.id ? `Patient #${patient.id}` : 'New patient')}</span>
        </div>
        <div className="text-sm text-slate-500 line-clamp-2">{appointment.reason}</div>
      </div>
    </div>
  );
}
