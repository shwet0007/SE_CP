import React from 'react';
import { Bell, LogOut, Search } from 'lucide-react';
import { useAuth } from '../state/AuthContext';

export default function TopBar({ title, subtitle }) {
  const { user, logout } = useAuth();
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const greeting = (() => {
    const h = time.getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();
  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="flex items-center justify-between rounded-3xl bg-white px-4 py-3 shadow-soft">
      <div>
        <h1 className="font-display text-xl text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        <p className="text-xs text-brand-700 font-semibold mt-1">
          {greeting}, {user?.name?.split(' ')[0] || 'there'} • {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <div className="hidden md:flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            className="w-56 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-brand-400 focus:outline-none"
            placeholder="Search"
          />
        </div>
        <button className="relative rounded-full bg-slate-100 p-2 text-slate-600">
          <Bell size={18} />
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-amber-400" />
        </button>
        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
          {user?.avatar ? (
            <img className="h-8 w-8 rounded-full object-cover" src={user.avatar} alt={user?.name} />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
              {initials || 'U'}
            </span>
          )}
          <div className="text-xs">
            <p className="font-medium text-slate-800">{user?.name}</p>
            <p className="text-slate-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </header>
  );
}
