import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bell, Check } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Error fetching notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/notifications/${id}/read`);
      setNotifications((prev) => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Error marking notification read', err);
    }
  };

  const generate = async () => {
    try {
      await axios.post('http://localhost:5000/api/notifications/generate');
      await fetchNotifications();
    } catch (err) {
      console.error('Error generating notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Bell /> Notifications</h1>
        <div className="flex items-center gap-2">
          <button onClick={generate} className="px-3 py-2 bg-primary text-white rounded">Generate</button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="text-gray-500">No notifications</div>
      ) : (
        <ul className="space-y-3">
          {notifications.map(n => (
            <li key={n.id} className={`p-4 rounded border ${n.is_read ? 'bg-white' : 'bg-orange-50 border-orange-200'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-gray-700">{n.message}</div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
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
