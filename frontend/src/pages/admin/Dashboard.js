import React from 'react';
import { useData } from '../../context/DataContext';

export default function Dashboard() {
  const { getMetrics, refreshDashboardData } = useData();
  const metrics = getMetrics();

  React.useEffect(() => {
    refreshDashboardData();
    const interval = setInterval(() => {
      refreshDashboardData();
    }, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [refreshDashboardData]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <MetricCard label="Active Subscriptions" value={metrics.activeSubscriptions} color="text-green-600" />
        <MetricCard label="Total Revenue" value={`₹${metrics.totalRevenue.toFixed(2)}`} color="text-blue-600" />
        <MetricCard label="Paid Invoices" value={metrics.paidInvoices} color="text-purple-600" />
        <MetricCard label="Overdue Invoices" value={metrics.overdueInvoices} color="text-red-600" />
        <MetricCard label="Total Users" value={metrics.totalUsers} color="text-indigo-600" />
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
