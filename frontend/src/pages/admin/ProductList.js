import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Plus, Search, Trash2, Printer } from 'lucide-react';

export default function ProductList() {
  const navigate = useNavigate();
  const { products, deleteProduct } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  // Styles from the "Correct Layout" example
  const tabBase =
    'px-4 py-2 rounded-lg border text-sm transition-all hover:shadow-md hover:-translate-y-[1px]';
  const tabActive =
    'bg-primary/10 text-primary border-primary shadow-sm';

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Top Tabs (Visual Layout from Code 2) */}
      <div className="flex justify-between items-center border rounded-xl p-4 bg-white mb-4">
        <div className="flex gap-3 overflow-x-auto">
          <button className={tabBase}>Subscriptions</button>
          <button className={`${tabBase} ${tabActive}`}>Products</button>
          <button className={tabBase}>Reporting</button>
          <button className={tabBase}>Users/Contacts</button>
          <button className={tabBase}>Configuration</button>
        </div>
        <button className={`${tabBase} hidden md:block`}>My Profile</button>
      </div>

      {/* Action Bar (Layout from Code 2, Functionality from Code 1) */}
      <div className="flex flex-col md:flex-row justify-between items-center border rounded-xl p-4 bg-white mb-4 gap-4">
        <div className="flex gap-2 items-center w-full md:w-auto">
          <button
            onClick={() => navigate('/app/products/new')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white transition-all hover:shadow-md hover:-translate-y-[1px] whitespace-nowrap"
          >
            <Plus size={16} />
            New Product
          </button>

          {/* Visual placeholders from Layout 2 (Non-functional as per Code 1 logic) */}
          <button className="p-2 rounded-lg border transition-all hover:shadow-md hover:-translate-y-[1px] text-gray-500">
            <Trash2 size={16} />
          </button>
          <button className="p-2 rounded-lg border transition-all hover:shadow-md hover:-translate-y-[1px] text-gray-500">
            <Printer size={16} />
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Table (Layout from Code 2, Data Columns from Code 1) */}
      <div className="border rounded-xl bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50 text-gray-600 font-semibold text-sm">
              <tr>
                <th className="p-4 whitespace-nowrap">Product Name</th>
                <th className="p-4 whitespace-nowrap">Type</th>
                <th className="p-4 whitespace-nowrap">Sale Price</th>
                <th className="p-4 whitespace-nowrap">Cost Price</th>
                <th className="p-4 whitespace-nowrap">Notes</th>
                <th className="p-4 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products
                .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition group">
                    <td className="p-4 font-medium text-primary">{p.name}</td>
                    <td className="p-4 text-gray-600">{p.type}</td>
                    <td className="p-4 text-gray-800">₹{p.salePrice.toFixed(2)}</td>
                    <td className="p-4 text-gray-500">₹{p.costPrice.toFixed(2)}</td>
                    <td className="p-4 text-gray-500 text-sm max-w-xs truncate">{p.notes}</td>
                    <td className="p-4 flex gap-3">
                      <button
                        onClick={() => navigate(`/app/products/${p.id}`)}
                        className="text-primary hover:text-primary/80 text-sm font-medium hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          if (!window.confirm('Delete this product?')) return;
                          try {
                            await deleteProduct(p.id);
                            alert('Product deleted');
                          } catch (err) {
                            alert(err?.response?.data?.error || err.message || 'Failed to delete');
                          }
                        }}
                        className="text-red-500 hover:text-red-700 text-sm font-medium hover:underline flex items-center gap-1"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}