import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { useData } from '../../context/DataContext';

export default function Reporting() {
  const { subscriptions, invoices, getMetrics } = useData();
  const metrics = getMetrics();

  // Prepare data for revenue trend (mock monthly data)
  const revenueData = [
    { month: 'Jan', revenue: 2000, invoices: 5 },
    { month: 'Feb', revenue: 2500, invoices: 6 },
    { month: 'Mar', revenue: 3200, invoices: 8 },
    { month: 'Apr', revenue: 3800, invoices: 9 },
    { month: 'May', revenue: metrics.totalRevenue, invoices: invoices.length },
  ];

  // Subscription status breakdown
  const statusData = [
    { name: 'Active', value: subscriptions.filter(s => s.status === 'Active').length, color: '#10b981' },
    { name: 'Quotation', value: subscriptions.filter(s => s.status === 'Quotation').length, color: '#3b82f6' },
    { name: 'Confirmed', value: subscriptions.filter(s => s.status === 'Confirmed').length, color: '#a855f7' },
    { name: 'Draft', value: subscriptions.filter(s => s.status === 'Draft').length, color: '#fbbf24' },
    { name: 'Closed', value: subscriptions.filter(s => s.status === 'Closed').length, color: '#9ca3af' },
  ];

  // Invoice status breakdown
  const invoiceData = [
    { name: 'Paid', value: invoices.filter(i => i.status === 'Paid').length, color: '#10b981' },
    { name: 'Draft', value: invoices.filter(i => i.status === 'Draft').length, color: '#fbbf24' },
    { name: 'Overdue', value: invoices.filter(i => new Date(i.dueDate) < new Date()).length, color: '#ef4444' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Reporting & Analytics</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-gray-600 text-sm font-medium">Active Subscriptions</div>
          <div className="text-3xl font-bold text-primary mt-2">{metrics.activeSubscriptions}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-gray-600 text-sm font-medium">Total Revenue</div>
          <div className="text-3xl font-bold text-green-600 mt-2">₹{metrics.totalRevenue.toFixed(2)}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-gray-600 text-sm font-medium">Paid Invoices</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">{metrics.paidInvoices}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-gray-600 text-sm font-medium">Overdue Invoices</div>
          <div className="text-3xl font-bold text-red-600 mt-2">{metrics.overdueInvoices}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#714B67" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Invoice Count Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Invoice Generation Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="invoices" stroke="#017E84" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subscription Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Subscription Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Invoice Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-bold text-lg text-gray-800 mb-4">Invoice Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={invoiceData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                {invoiceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}