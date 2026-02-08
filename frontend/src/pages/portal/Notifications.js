import React, { useEffect, useState } from 'react';
import api from '../../api';
import { Bell, Check } from 'lucide-react';

export default function PortalNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/user');
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Error fetching user notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      const updated = (await api.get('/notifications/user')).data || [];
      setNotifications(updated);
      // notify other parts of the app (header) about new unread count
      const unread = updated.filter(r => !r.is_read).length;
      window.dispatchEvent(new CustomEvent('notifications:updated', { detail: { unread } }));
    } catch (err) {
      console.error('Error marking notification as read', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bell />
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="text-gray-500">No notifications</div>
      ) : (
        <ul className="space-y-3">
          {notifications.map(n => (
            <li key={n.id} className={`p-4 rounded border ${n.is_read ? 'bg-white' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-gray-800">{n.message}</div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                </div>
                <div>
                  {!n.is_read && (
                    <button onClick={() => markRead(n.id)} className="px-2 py-1 bg-green-600 text-white rounded flex items-center gap-1"><Check size={14}/> Mark read</button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
