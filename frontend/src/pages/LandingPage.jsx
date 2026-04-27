import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CalendarClock,
  ClipboardList,
  FileText,
  LineChart,
  Pill,
  ShieldCheck,
  Stethoscope,
  Users
} from 'lucide-react';
import Brand from '../components/Brand';

const operatingCounters = [
  { label: 'OPD tokens', value: '128', note: 'issued till 1:30 PM' },
  { label: 'Doctors on duty', value: '34', note: 'across 9 departments' },
  { label: 'Avg. wait', value: '18 min', note: 'current queue load' },
  { label: 'Reports ready', value: '76', note: 'lab and radiology' }
];

const departments = [
  {
    name: 'General Medicine OPD',
    doctor: 'Dr. Meera Iyer',
    room: 'Room 204',
    token: 'A-42',
    wait: '18 min',
    status: 'Running'
  },
  {
    name: 'Orthopaedics',
    doctor: 'Dr. R. Kulkarni',
    room: 'Room 118',
    token: 'C-16',
    wait: '24 min',
    status: 'New consult'
  },
  {
    name: 'Paediatrics',
    doctor: 'Dr. Farah Khan',
    room: 'Room 306',
    token: 'P-09',
    wait: '12 min',
    status: 'On time'
  }
];

const workAreas = [
  {
    icon: CalendarClock,
    title: 'OPD appointment desk',
    text: 'Handle walk-ins, online slots, doctor rooms, and token queues from the same screen.'
  },
  {
    icon: Stethoscope,
    title: 'Doctor consultation flow',
    text: "Show today's patients, visit reasons, notes, prescriptions, and follow-up dates."
  },
  {
    icon: FileText,
    title: 'MRD and records',
    text: 'Keep diagnosis, treatment, prescriptions, and patient history attached to each visit.'
  },
  {
    icon: Pill,
    title: 'Pharmacy and billing handoff',
    text: 'Move patients from consultation to reports, medicines, UPI/cash billing, and discharge.'
  }
];

const shiftFlow = [
  { title: 'Registration', detail: 'UHID lookup, token issue, counter assignment' },
  { title: 'Consultation', detail: 'Doctor queue, notes, diagnosis, prescription' },
  { title: 'Diagnostics', detail: 'Lab sample, radiology status, report collection' },
  { title: 'Billing', detail: 'UPI/cash payment, pharmacy, follow-up reminder' }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f5f7f8] text-slate-900">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Brand />
        <nav className="flex items-center gap-2 text-sm">
          <Link to="/login" className="px-3 py-2 font-semibold text-slate-700 hover:text-slate-950">
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-md bg-[#146c5f] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0f554b]"
          >
            Create account
          </Link>
        </nav>
      </header>

      <main>
        <section
          className="relative min-h-[78vh] overflow-hidden bg-slate-950 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(5, 15, 23, 0.88) 0%, rgba(5, 15, 23, 0.7) 42%, rgba(5, 15, 23, 0.28) 100%), url('https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1800&q=80')"
          }}
        >
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-14">
            <div className="flex min-h-[56vh] flex-col justify-center text-white">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-[#f6c453]">
                Pune multi-speciality hospital desk
              </p>
              <h1 className="max-w-3xl font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
                Indian Hospital Operations Desk
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-100 sm:text-lg">
                Manage OPD appointments, token queues, doctor rooms, medical records, prescriptions, reports, and
                billing handoffs for a busy Indian hospital.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="rounded-md bg-[#f6c453] px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm hover:bg-[#e9b53e]"
                >
                  Start hospital desk
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-md border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/15"
                >
                  View role dashboards <ArrowRight size={16} />
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-200">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck size={16} /> Role-based access
                </span>
                <span className="inline-flex items-center gap-2">
                  <Building2 size={16} /> OPD, wards, lab, pharmacy
                </span>
                <span className="inline-flex items-center gap-2">
                  <Users size={16} /> Patient, doctor, admin views
                </span>
              </div>
            </div>

            <aside className="self-center rounded-lg border border-white/20 bg-white/95 p-4 shadow-2xl">
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#146c5f]">Live OPD board</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-950">Monday shift status</h2>
                  <p className="text-sm text-slate-500">Main block, ground floor counters</p>
                </div>
                <span className="w-fit rounded-full bg-[#e6f4ef] px-3 py-1 text-xs font-semibold text-[#146c5f]">
                  Queue active
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {operatingCounters.map((item) => (
                  <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-500">{item.label}</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-950">{item.value}</p>
                    <p className="text-xs text-slate-500">{item.note}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-3">
                {departments.map((dept) => (
                  <div key={dept.name} className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{dept.name}</p>
                        <p className="text-sm text-slate-500">
                          {dept.doctor} - {dept.room}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#fff4d8] px-2.5 py-1 text-xs font-semibold text-[#795400]">
                        {dept.status}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="font-semibold text-[#146c5f]">Now serving {dept.token}</span>
                      <span className="text-slate-500">Wait {dept.wait}</span>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
            {shiftFlow.map((step, index) => (
              <div key={step.title} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#146c5f] text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold text-slate-950">{step.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#146c5f]">Operations modules</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Built around the actual work of an Indian hospital day
            </h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {workAreas.map((item) => (
              <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-[#e6f4ef] text-[#146c5f]">
                  <item.icon size={20} />
                </span>
                <p className="font-semibold text-slate-950">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#102b2a] text-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f6c453]">Admin view</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Keep hospital load visible before it becomes a problem
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-200">
                Admins can track appointment counts, cancellations, doctor utilization, and department-wise work without
                waiting for end-of-day spreadsheets.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: ClipboardList, label: 'Appointments', value: 'Booked, cancelled, completed' },
                { icon: LineChart, label: 'Reports', value: 'Department and status summary' },
                { icon: ShieldCheck, label: 'Access', value: 'Patient, doctor, admin permissions' }
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-white/15 bg-white/10 p-4">
                  <item.icon className="text-[#f6c453]" size={22} />
                  <p className="mt-4 font-semibold">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-sm text-slate-500">
        Smart Hospital Appointment &amp; Record Management System - built for Indian hospital operations.
      </footer>
    </div>
  );
}
