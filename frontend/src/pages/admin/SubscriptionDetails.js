import React, { useState } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';

export default function SubscriptionDetail() {
  const [status, setStatus] = useState('Draft'); 
  const stages = ['Draft', 'Sent', 'Active', 'Closed'];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded shadow-sm border-l-4 border-primary">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">SUB/2023/001</h1>
          <span className="px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800">
            {status}
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setStatus('Active')} className="px-4 py-2 bg-primary text-white rounded">
            Confirm
          </button>
          <button onClick={() => setStatus('Closed')} className="px-4 py-2 bg-gray-200 text-gray-700 rounded">
            Close
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex mb-8 border-b pb-4">
        {stages.map((stage, idx) => (
          <div key={stage} className="flex items-center">
            <span className={`mx-2 ${status === stage ? 'text-primary font-bold' : 'text-gray-400'}`}>{stage}</span>
            {idx !== stages.length - 1 && <ArrowRight size={16} className="text-gray-300" />}
          </div>
        ))}
      </div>
      
      <div className="bg-white p-6 rounded shadow-sm">
        <h3 className="text-lg font-bold mb-4">Invoice Lines</h3>
        <table className="w-full text-left">
            <thead><tr className="border-b"><th className="pb-2">Product</th><th className="pb-2 text-right">Total</th></tr></thead>
            <tbody>
                <tr><td className="py-2">Monthly SaaS Plan</td><td className="py-2 text-right">$99.00</td></tr>
            </tbody>
        </table>
      </div>
    </div>
  );
}