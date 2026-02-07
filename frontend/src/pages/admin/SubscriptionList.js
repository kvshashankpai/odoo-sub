import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function SubscriptionList() {
  const navigate = useNavigate();
  const { subscriptions, deleteSubscription } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Subscriptions</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
            />
          </div>
          <button 
            onClick={() => navigate('/app/subscriptions/new')}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition shadow-sm"
          >
            <Plus size={18} /> New Subscription
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-sm text-gray-600">
            <tr>
              <th className="px-6 py-4">Reference</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Plan</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Start Date</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {subscriptions
              .filter(s => s.customer.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((s) => (
              <tr 
                key={s.id} 
                className="hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4 font-bold text-primary cursor-pointer hover:underline" onClick={() => navigate(`/app/subscriptions/${s.id}`)}>{s.id}</td>
                <td className="px-6 py-4 font-medium">{s.customer}</td>
                <td className="px-6 py-4 text-gray-600">{s.planId}</td>
                <td className="px-6 py-4 font-medium">${s.amount.toFixed(2)}</td>
                <td className="px-6 py-4 text-gray-600">{s.startDate}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase
                    ${s.status === 'Active' ? 'bg-green-100 text-green-700' : 
                      s.status === 'Quotation' ? 'bg-blue-100 text-blue-700' :
                      s.status === 'Confirmed' ? 'bg-purple-100 text-purple-700' :
                      s.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button 
                    onClick={() => navigate(`/app/subscriptions/${s.id}`)}
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm('Delete this subscription?')) {
                        deleteSubscription(s.id);
                      }
                    }}
                    className="text-red-600 hover:underline text-sm font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}