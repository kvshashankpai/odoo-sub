import React, { useEffect, useState } from 'react';
import api from '../../api';
import { Bell, Check } from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      const raw = res.data || [];
      // Aggregate broadcasts for admin view: show a single broadcast message instead of N duplicates
      const broadcastGroups = {};
      const nonBroadcasts = [];

      for (const r of raw) {
        if (r.type === 'broadcast') {
          const key = String(r.message || '').trim();
          if (!broadcastGroups[key]) broadcastGroups[key] = { count: 0, latest: r.created_at, message: r.message };
          broadcastGroups[key].count += 1;
          if (new Date(r.created_at) > new Date(broadcastGroups[key].latest)) broadcastGroups[key].latest = r.created_at;
        } else {
          nonBroadcasts.push(r);
        }
      }

      const aggregatedBroadcasts = Object.keys(broadcastGroups).map((k, idx) => ({
        id: `broadcast-agg-${idx}`,
        message: broadcastGroups[k].message,
        type: 'broadcast',
        is_aggregated: true,
        recipients: broadcastGroups[k].count,
        created_at: broadcastGroups[k].latest,
      }));

      // Merge and sort by created_at desc
      const merged = [...nonBroadcasts, ...aggregatedBroadcasts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNotifications(merged);
    } catch (err) {
      console.error('Error fetching notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      // If aggregated broadcast item, do nothing (admin view aggregation).
      if (String(id).startsWith('broadcast-agg')) return;
      await api.patch(`/notifications/${id}/read`);
      const raw = (await api.get('/notifications')).data || [];
      // Re-run aggregation logic to update UI
      const broadcastGroups = {};
      const nonBroadcasts = [];
      for (const r of raw) {
        if (r.type === 'broadcast') {
          const key = String(r.message || '').trim();
          if (!broadcastGroups[key]) broadcastGroups[key] = { count: 0, latest: r.created_at, message: r.message };
          broadcastGroups[key].count += 1;
          if (new Date(r.created_at) > new Date(broadcastGroups[key].latest)) broadcastGroups[key].latest = r.created_at;
        } else {
          nonBroadcasts.push(r);
        }
      }
      const aggregatedBroadcasts = Object.keys(broadcastGroups).map((k, idx) => ({
        id: `broadcast-agg-${idx}`,
        message: broadcastGroups[k].message,
        type: 'broadcast',
        is_aggregated: true,
        recipients: broadcastGroups[k].count,
        created_at: broadcastGroups[k].latest,
      }));
      const merged = [...nonBroadcasts, ...aggregatedBroadcasts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNotifications(merged);

      // Update global unread count (portal header)
      const userNotifications = (await api.get('/notifications/user')).data || [];
      const unread = userNotifications.filter(r => !r.is_read).length;
      window.dispatchEvent(new CustomEvent('notifications:updated', { detail: { unread } }));
    } catch (err) {
      console.error('Error marking notification read', err);
    }
  };

  const generate = async () => {
    try {
      // generate renewal-based notifications (requires auth)
      await api.post('/notifications/generate');
      await fetchNotifications();
    } catch (err) {
      console.error('Error generating notifications', err);
    }
  };

  const [broadcastMessage, setBroadcastMessage] = useState('');
  const broadcast = async () => {
    try {
      if (!broadcastMessage || broadcastMessage.trim().length === 0) return;
      await api.post('/notifications/broadcast', { message: broadcastMessage });
      setBroadcastMessage('');
      await fetchNotifications();
    } catch (err) {
      console.error('Error broadcasting notifications', err);
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

      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Broadcast to all users</h2>
        <div className="flex gap-2">
          <input value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} placeholder="Message to broadcast" className="flex-1 px-3 py-2 border rounded" />
          <button onClick={broadcast} className="px-3 py-2 bg-indigo-600 text-white rounded">Broadcast</button>
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
