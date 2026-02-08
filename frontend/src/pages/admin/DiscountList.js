import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function DiscountList() {
  const navigate = useNavigate();
  const { discounts, deleteDiscount } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Discount Rules</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 w-48"
            />
          </div>
          <button 
            onClick={() => navigate('/app/discounts/new')}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition shadow-sm"
          >
            <Plus size={18} /> New Discount
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-sm text-gray-600">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Value</th>
              <th className="px-6 py-4">Min Purchase</th>
              <th className="px-6 py-4">Date Range</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {discounts
              .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((d) => (
              <tr key={d.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-primary">{d.name}</td>
                <td className="px-6 py-4">{d.type}</td>
                <td className="px-6 py-4 font-bold">{d.type === 'Percentage' ? `${d.value}%` : `$${d.value}`}</td>
                <td className="px-6 py-4 text-gray-600">${d.minPurchase || '-'}</td>
                <td className="px-6 py-4 text-gray-600 text-sm">{d.startDate} to {d.endDate}</td>
                <td className="px-6 py-4 flex gap-2">
                  <button 
                    onClick={() => navigate(`/app/discounts/${d.id}`)}
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={async () => {
                      if (!window.confirm('Delete this discount?')) return;
                      try {
                        await deleteDiscount(d.id);
                        alert('Discount deleted');
                      } catch (err) {
                        alert(err?.response?.data?.error || err.message || 'Failed to delete');
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