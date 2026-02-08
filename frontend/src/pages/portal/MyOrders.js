import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function MyOrders() {
  const navigate = useNavigate();
  const { lastOrder } = useCart();

  return (
    <div className="py-8">
      <div className="app-container max-w-5xl">
        <h1 className="text-2xl font-bold mb-6">My Quotations & Orders</h1>

        <div className="bg-white rounded shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b text-gray-500 text-sm uppercase tracking-wider">
              <tr>
                <th className="p-4">Reference</th>
                <th className="p-4">Date</th>
                <th className="p-4">Next Activity</th>
                <th className="p-4 text-right">Total</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lastOrder && (
                <tr onClick={() => navigate(`/portal/orders/${lastOrder.reference}`)} className="hover:bg-gray-50 cursor-pointer transition">
                  <td className="p-4 font-bold text-primary">{lastOrder.reference}</td>
                  <td className="p-4 text-gray-600">{new Date(lastOrder.date).toLocaleDateString()}</td>
                  <td className="p-4 text-gray-600">View Order</td>
                  <td className="p-4 text-right font-medium">₹{lastOrder.total.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Sales Order</span>
                  </td>
                </tr>
              )}

              <tr className="hover:bg-gray-50 cursor-pointer transition">
                <td className="p-4 font-bold text-primary">Q0023</td>
                <td className="p-4 text-gray-600">Sep 15, 2023</td>
                <td className="p-4 text-gray-600">Sign Quote</td>
                <td className="p-4 text-right font-medium">₹29.00</td>
                <td className="p-4 text-center">
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Quotation</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}