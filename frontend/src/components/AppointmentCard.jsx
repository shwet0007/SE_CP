import React from 'react';
import { CalendarClock, CalendarPlus, CheckCircle2, Stethoscope, Trash2, UserCircle2, XCircle } from 'lucide-react';
import Badge from './Badge';

const getDoctor = (appointment) =>
  appointment.Doctor || { name: appointment.doctorId ? `Doctor #${appointment.doctorId}` : 'Doctor', specializationId: null };

const getPatient = (appointment) =>
  appointment.Patient || { id: appointment.patientId };

const getSpecialization = (appointment, doctor) => {
  return appointment.Doctor?.Specialization?.name || doctor?.Specialization?.name || appointment.specializationName || 'Specialist';
};

export default function AppointmentCard({
  appointment,
  onCancel,
  onComplete,
  onDelete,
  onReschedule,
  deleting = false,
  updating = false
}) {
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
        <div className="flex items-center gap-2">
          <Badge label={appointment.status} variant={appointment.status} />
          {onReschedule && appointment.status === 'booked' && (
            <button
              type="button"
              onClick={() => onReschedule(appointment)}
              disabled={updating}
              title="Reschedule appointment"
              aria-label="Reschedule appointment"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CalendarPlus size={15} />
            </button>
          )}
          {onCancel && appointment.status === 'booked' && (
            <button
              type="button"
              onClick={() => onCancel(appointment)}
              disabled={updating}
              title="Cancel appointment"
              aria-label="Cancel appointment"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-100 text-amber-600 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle size={15} />
            </button>
          )}
          {onComplete && appointment.status === 'booked' && (
            <button
              type="button"
              onClick={() => onComplete(appointment)}
              disabled={updating}
              title="Complete visit"
              aria-label="Complete visit"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-100 text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 size={15} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(appointment)}
              disabled={deleting}
              title="Delete appointment"
              aria-label="Delete appointment"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-100 text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
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
