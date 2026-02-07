import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ShoppingBag, CreditCard } from 'lucide-react';

export default function PortalHome() {
  const navigate = useNavigate();

  const tiles = [
    { title: 'Shop Plans', icon: ShoppingBag, path: '/portal/shop', count: null, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'My Quotations', icon: FileText, path: '/portal/orders', count: '1', color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'My Subscription', icon: CreditCard, path: '/portal/subscription', count: 'Active', color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="py-8">
      <div className="app-container">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Welcome to Your Portal</h1>
          <p className="text-gray-500">Manage billing, subscriptions, and invoices — all in one place.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiles.map((tile) => (
            <div 
              key={tile.title}
              onClick={() => navigate(tile.path)}
              className="bg-white p-6 rounded-xl shadow hover:shadow-md transition cursor-pointer flex flex-col items-center justify-center h-48 group border border-gray-100"
            >
              <div className={`p-4 rounded-full ${tile.bg} mb-4 group-hover:scale-110 transition`}>
                <tile.icon size={34} className={`${tile.color} stroke-1`} />
              </div>
              <h3 className="font-semibold text-gray-700">{tile.title}</h3>
              {tile.count && <span className="text-2xl font-bold mt-2 text-gray-900">{tile.count}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}