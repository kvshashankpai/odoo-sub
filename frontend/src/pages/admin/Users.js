import React, { useState } from 'react';
import api from '../../api';

export default function Users() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleCreateInternal = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await api.post('/admin/users', { name, email, password });
      if (res.data && res.data.user) {
        setMessage({ type: 'success', text: `Created internal user ${res.data.user.email}` });
        setName(''); setEmail(''); setPassword('');
      } else {
        setMessage({ type: 'error', text: 'Unexpected response from server' });
      }
    } catch (err) {
      const txt = err?.response?.data?.error || err.message || 'Failed to create user';
      setMessage({ type: 'error', text: txt });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Users / Contacts</h2>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-2">Create Internal User (Admin only)</h3>
        <form onSubmit={handleCreateInternal} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700">Name (optional)</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full border p-2 rounded" required />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border p-2 rounded" required />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>{loading ? 'Creating...' : 'Create Internal User'}</button>
            <button type="button" onClick={()=>{setName('');setEmail('');setPassword('');setMessage(null);}} className="px-4 py-2 bg-gray-100 rounded">Reset</button>
          </div>
        </form>
        {message && (
          <div className={`mt-3 p-2 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message.text}</div>
        )}
      </div>

      <div className="bg-white p-4 rounded shadow">
        <p className="text-sm text-gray-600">Note: Only an admin (role 'admin') can create internal users. When created, the internal user's credentials are the email and password you provide here. Internal users have limited rights compared to admins.</p>
      </div>
    </div>
  );
}
