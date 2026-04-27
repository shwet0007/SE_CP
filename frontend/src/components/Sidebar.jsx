import React from 'react';
import { NavLink } from 'react-router-dom';
import { CalendarDays, ClipboardList, Home, LayoutDashboard, Bell } from 'lucide-react';
import Brand from './Brand';

const linkBase =
  'flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition hover:bg-white hover:shadow-sm';

const icons = {
  home: Home,
  dashboard: LayoutDashboard,
  appointments: CalendarDays,
  records: ClipboardList,
  notifications: Bell
};

export default function Sidebar({ role }) {
  const navItems = {
    patient: [
      { to: '/patient', label: 'Dashboard', icon: 'dashboard' },
      { to: '/appointments', label: 'Appointments', icon: 'appointments' },
      { to: '/records', label: 'Medical Records', icon: 'records' },
      { to: '/notifications', label: 'Notifications', icon: 'notifications' }
    ],
    doctor: [
      { to: '/doctor', label: 'Dashboard', icon: 'dashboard' },
      { to: '/appointments', label: 'Appointments', icon: 'appointments' },
      { to: '/records', label: 'Patient Records', icon: 'records' },
      { to: '/notifications', label: 'Notifications', icon: 'notifications' }
    ],
    admin: [
      { to: '/admin', label: 'Dashboard', icon: 'dashboard' },
      { to: '/appointments', label: 'Appointments', icon: 'appointments' },
      { to: '/records', label: 'Records', icon: 'records' },
      { to: '/notifications', label: 'Notifications', icon: 'notifications' }
    ]
  };

  return (
    <aside className="glass h-full w-full max-w-[260px] rounded-3xl p-4 hidden lg:block">
      <div className="flex items-center justify-between">
        <Brand />
      </div>
      <nav className="mt-8 flex flex-col gap-2">
        {(navItems[role] || navItems.patient).map((item) => {
          const Icon = icons[item.icon];
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? 'bg-brand-50 text-brand-700 border border-brand-100' : 'text-slate-700'}`
              }
            >
              <span className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-brand-700">
                <Icon size={18} />
              </span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
