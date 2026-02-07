import React, { useState } from 'react';
import { Download, Search } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function PaymentList() {
  const { payments, invoices, subscriptions } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  // Enrich payments with subscription/invoice/customer info
  const enrichedPayments = payments.map(p => {
    const invoice = invoices.find(inv => inv.id === p.invoiceId);
    const subscription = invoice ? subscriptions.find(s => s.id === invoice.subscriptionId) : null;
    return {
      ...p,
      customer: subscription?.customer || 'Unknown',
      invoiceAmount: invoice?.total || p.amount,
    };
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Payments Received</h1>
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
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-50">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-sm text-gray-600">
            <tr>
              <th className="px-6 py-4">Payment ID</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Invoice Ref</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {enrichedPayments
              .filter(p => p.customer.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-bold text-primary">{p.id}</td>
                <td className="px-6 py-4">{p.date}</td>
                <td className="px-6 py-4">{p.customer}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{p.invoiceId}</td>
                <td className="px-6 py-4 text-sm capitalize">{p.method}</td>
                <td className="px-6 py-4 text-right font-medium">${p.amount.toFixed(2)}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.status === 'Posted' ? 'bg-green-100 text-green-700' : p.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}