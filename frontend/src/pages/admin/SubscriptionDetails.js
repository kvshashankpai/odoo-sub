import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SubscriptionFlow from './SubscriptionFlow';

const SubscriptionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sub, setSub] = useState(null);

  useEffect(() => {
    const fetchSub = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/subscriptions/${id}`);
        setSub(res.data);
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    };
    fetchSub();
  }, [id]);

  if (!sub) return <div className="flex justify-center items-center h-64 text-gray-400 animate-pulse">Loading Subscription Data...</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center p-4 border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="flex space-x-2">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded shadow-sm text-sm font-medium transition">
            Renew
          </button>
          <button className="border border-gray-300 hover:bg-gray-50 bg-white px-4 py-1.5 rounded text-sm font-medium text-gray-600 transition">
            Close
          </button>
          <button className="border border-gray-300 hover:bg-gray-50 bg-white px-4 py-1.5 rounded text-sm font-medium text-gray-600 transition">
            Register Payment
          </button>
        </div>
        
        {/* State Indicator [cite: 97, 118] */}
        <div className="flex border border-gray-200 rounded-sm overflow-hidden text-[10px] font-bold uppercase tracking-widest shadow-inner">
          <span className={`px-4 py-2 ${sub.status === 'Draft' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400 border-r border-gray-200'}`}>Draft</span>
          <span className={`px-4 py-2 ${sub.status === 'Confirmed' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400 border-r border-gray-200'}`}>Confirmed</span>
          <span className={`px-4 py-2 ${sub.status === 'Active' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400'}`}>Active</span>
        </div>
      </div>

      <SubscriptionFlow currentStatus={sub.status} />

      {/* Main Content Card [cite: 83, 108] */}
      <div className="max-w-5xl mx-auto bg-white border border-gray-200 shadow-xl mt-8 p-10 rounded-sm">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            {sub.subscription_number || `Subscription / SUB-00${sub.id}`}
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <section className="space-y-6">
            <div>
              <p className="text-xs font-black text-gray-400 uppercase mb-1">Customer</p>
              <p className="text-xl text-gray-700 font-medium border-b border-gray-100 pb-2">{sub.customer_name || 'Not Assigned'}</p>
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase mb-1">Recurring Plan</p>
              <p className="text-xl text-gray-700 font-medium border-b border-gray-100 pb-2">{sub.plan_name || 'Standard Plan'}</p>
            </div>
          </section>

          <section className="space-y-6">
            <div>
              <p className="text-xs font-black text-gray-400 uppercase mb-1">Next Invoice Date</p>
              <p className="text-xl text-purple-700 font-bold border-b border-gray-100 pb-2">{sub.next_invoice_date || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-black text-gray-400 uppercase mb-1">Start Date</p>
              <p className="text-xl text-gray-700 font-medium border-b border-gray-100 pb-2">{sub.start_date}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetails;