import React, { useState } from 'react';
import { Search, Trash2, Printer, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { subscriptions, deleteSubscription, getMetrics } = useData();
  const metrics = getMetrics();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const filteredData = subscriptions.filter(item => 
    item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredData.map(item => item.id));
    }
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} subscription(s)?`)) {
      selectedIds.forEach(id => deleteSubscription(id));
      setSelectedIds([]);
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-700',
      'Draft': 'bg-gray-100 text-gray-700',
      'Quotation': 'bg-blue-100 text-blue-700',
      'Confirmed': 'bg-purple-100 text-purple-700',
      'Closed': 'bg-red-100 text-red-700',
    };
    return colors[status] || colors['Draft'];
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard label="Active Subscriptions" value={metrics.activeSubscriptions} color="text-green-600" />
        <MetricCard label="Total Revenue" value={`$${metrics.totalRevenue}`} color="text-blue-600" />
        <MetricCard label="Paid Invoices" value={metrics.paidInvoices} color="text-purple-600" />
        <MetricCard label="Overdue Invoices" value={metrics.overdueInvoices} color="text-red-600" />
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Subscriptions</h2>
          <button onClick={() => navigate('/app/subscriptions')} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"><PlusCircle size={18} /> New</button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <button onClick={handleDelete} disabled={selectedIds.length === 0} className={`p-2 rounded transition-colors ${selectedIds.length > 0 ? 'bg-red-100 hover:bg-red-200 text-red-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
            <Trash2 size={18} />
          </button>
          <button className="p-2 bg-gray-100 rounded hover:bg-gray-200">
            <Printer size={18} className="text-gray-600" />
          </button>
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Search..." />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3"><input type="checkbox" onChange={toggleSelectAll} checked={filteredData.length > 0 && selectedIds.length === filteredData.length} /></th>
                <th className="p-3 font-semibold">ID</th>
                <th className="p-3 font-semibold">Customer</th>
                <th className="p-3 font-semibold">Amount</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Start Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.id} className={`border-b hover:bg-gray-50 ${selectedIds.includes(row.id) ? 'bg-blue-50' : ''}`}>
                  <td className="p-3"><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleSelect(row.id)} /></td>
                  <td className="p-3 font-medium text-primary cursor-pointer" onClick={() => navigate(`/app/subscriptions/${row.id}`)}>{row.id}</td>
                  <td className="p-3">{row.customer}</td>
                  <td className="p-3">${row.amount}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(row.status)}`}>{row.status}</span></td>
                  <td className="p-3">{row.startDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color }) {
  return (
    <div className="bg-white p-6 rounded shadow-sm border">
      <p className="text-gray-600 text-sm mb-2">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
