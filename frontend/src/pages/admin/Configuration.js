import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function Configuration() {
  const { taxConfig, updateTaxConfig } = useData();
  const [formData, setFormData] = useState({
    ...taxConfig[0] // Use first tax config as default
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.percentage) {
      setMessage('Please fill all fields');
      return;
    }
    updateTaxConfig(formData.id, {
      ...formData,
      percentage: parseFloat(formData.percentage)
    });
    setMessage('Tax configuration saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">System Configuration</h1>
      
      {message && (
        <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
          <CheckCircle size={18} /> {message}
        </div>
      )}

      {/* General Settings */}
      <div className="bg-white p-8 rounded-lg shadow-sm border mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-4 border-b">General Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded">
            <span className="text-gray-700 font-medium">Enable Automatic Invoice Generation</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 text-primary" />
          </div>
          <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded">
            <span className="text-gray-700 font-medium">Send Welcome Email on Sign Up</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 text-primary" />
          </div>
          <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded">
            <span className="text-gray-700 font-medium">Enable Payment Reminders</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Tax Configuration */}
      <div className="bg-white p-8 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-4 border-b">Tax Configuration</h2>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tax Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" 
              placeholder="e.g., VAT, GST, Sales Tax"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
            <input 
              type="number" 
              name="percentage"
              value={formData.percentage}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" 
              placeholder="e.g., 15"
              step="0.01"
              min="0"
              max="100"
            />
          </div>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            This tax rate will be automatically applied to all invoices generated from subscriptions.
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition font-medium"
          >
            Save Configuration
          </button>
          <button 
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}