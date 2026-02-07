import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Outlet } from 'react-router-dom';

const SubscriptionList = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/subscriptions');
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const filtered = subscriptions.filter(sub =>
    sub.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.subscription_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Subscriptions</h1>
        <button
          onClick={() => navigate('/app/subscriptions/new')}
          className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700 transition"
        >
          Create New
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search customer or subscription #..."
          className="w-full p-2 border rounded shadow-sm focus:ring-2 focus:ring-purple-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Two-column layout: list on left, nested route (form/detail) on right */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: list (7/12) */}
        <div className="col-span-7 bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Number</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Next Invoice</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((sub) => (
                <tr key={sub.id} onClick={() => navigate(`/app/subscriptions/${sub.id}`)} className="hover:bg-gray-50 cursor-pointer transition">
                  <td className="px-6 py-4 text-sm font-medium text-purple-600">{sub.subscription_number || `SUB/00${sub.id}`}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{sub.customer_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{sub.plan_name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${sub.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{sub.next_invoice_date || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: nested route content (form / detail) (5/12) */}
        <div className="col-span-5">
          <div className="bg-white rounded-lg shadow p-6 min-h-[400px]">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionList;