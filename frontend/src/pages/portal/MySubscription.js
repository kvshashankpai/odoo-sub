import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

export default function MySubscription() {
  return (
    <div className="py-8">
      <div className="app-container max-w-5xl">
        <h1 className="text-2xl font-bold mb-6">My Subscription</h1>
        
        {/* Active Card */}
        <div className="bg-white rounded-lg shadow-sm border border-l-4 border-l-green-500 p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-semibold text-gray-800">Monthly Pro Plan</h2>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">In Progress</span>
              </div>
              <p className="text-gray-500">Subscription Ref: <span className="font-mono text-gray-700">SUB/2023/001</span></p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold text-primary">$113.85</p>
              <p className="text-sm text-gray-500">Billed Monthly</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
            <div className="flex items-start gap-3">
              <Calendar className="text-gray-400" size={20} />
              <div>
                <p className="text-xs uppercase font-bold text-gray-400">Start Date</p>
                <p className="font-medium text-gray-700">Oct 24, 2023</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
               <Calendar className="text-primary" size={20} />
              <div>
                <p className="text-xs uppercase font-bold text-gray-400">Next Invoice</p>
                <p className="font-medium text-primary">Nov 24, 2023</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
               <AlertCircle className="text-gray-400" size={20} />
              <div>
                <p className="text-xs uppercase font-bold text-gray-400">Auto-Close</p>
                <p className="font-medium text-gray-700">No date set</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex gap-4">
              <button className="text-sm text-primary hover:underline font-medium">Change Plan</button>
              <button className="text-sm text-red-500 hover:underline font-medium">Close Subscription</button>
          </div>
        </div>

        {/* Invoices Table */}
        <h3 className="text-lg font-bold mb-4 text-gray-700">Invoices & Bills</h3>
        <div className="bg-white rounded shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-sm text-gray-500">
              <tr>
                <th className="p-4">Number</th>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="p-4 font-medium">INV/2023/001</td>
                <td className="p-4">Oct 24, 2023</td>
                <td className="p-4">$113.85</td>
                <td className="p-4"><span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">PAID</span></td>
                <td className="p-4"><button className="text-primary hover:underline text-sm">Download</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}