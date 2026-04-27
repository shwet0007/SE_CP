import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import SectionCard from '../components/SectionCard';
import { notifications as mockNotifications } from '../data/mockData';
import { fetchNotifications, markNotification } from '../api/notifications';
import { useAuth } from '../state/AuthContext';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState(mockNotifications.filter((note) => note.userId === user?.id));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchNotifications();
        setItems(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Showing sample notifications because the server is unavailable');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleMarkRead = async (id) => {
    setItems((list) => list.map((item) => (item.id === id ? { ...item, isRead: true } : item)));
    try {
      await markNotification(id);
    } catch (_) {
      setError('Notification was updated locally, but the server could not be reached');
    }
  };

  const unreadCount = items.filter((item) => !item.isRead).length;

  return (
    <DashboardLayout role={user?.role || 'patient'} title="Notifications" subtitle="Appointment and record updates">
      <SectionCard
        title="Inbox"
        action={<span className="text-xs font-semibold text-slate-500">{unreadCount} unread</span>}
      >
        {loading ? (
          <p className="text-sm text-slate-500">Loading notifications...</p>
        ) : (
          <div className="space-y-3">
            {error && <p className="text-sm text-amber-700">{error}</p>}
            {items.map((note) => (
              <div key={note.id} className="flex items-start justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex gap-3">
                  <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Bell size={18} />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">{note.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{note.message}</p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">{note.type}</p>
                  </div>
                </div>
                {note.isRead ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                    <CheckCircle2 size={14} /> Read
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(note.id)}
                    className="rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
            {items.length === 0 && <p className="text-sm text-slate-500">No notifications yet.</p>}
          </div>
        )}
      </SectionCard>
    </DashboardLayout>
  );
}
