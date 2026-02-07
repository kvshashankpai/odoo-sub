import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SubscriptionForm = () => {
  const navigate = useNavigate();
  
  // 1. State for the Form Fields
  const [formData, setFormData] = useState({
    customer_name: '',
    billing_cycle: 'Monthly', // Default value
    start_date: '',
    total_amount: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 2. Handle Input Changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. Connect to Database (The "Save" Action)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // This URL must match your Backend Port (5000)
      const response = await fetch('http://localhost:5000/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }

      const data = await response.json();
      
      // 4. On Success: Redirect to the "Detail" page under admin routes
      // This moves the user from "New" (Blank) -> "Draft" (Created)
      navigate(`/app/subscriptions/${data.id}`);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white">
      {/* Header */}
      <div className="border-b pb-4 mb-6">
        <h1 className="text-xl font-bold text-gray-800">New Subscription</h1>
        <p className="text-gray-500 text-xs">Create a draft subscription</p>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Customer Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Customer Name</label>
          <input
            type="text"
            name="customer_name"
            required
            value={formData.customer_name}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. Acme Corp"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Billing Cycle */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Billing Cycle</label>
            <select
              name="billing_cycle"
              value={formData.billing_cycle}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              name="start_date"
              required
              value={formData.start_date}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>

        {/* Total Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Total Amount ($)</label>
          <input
            type="number"
            name="total_amount"
            required
            min="0"
            step="0.01"
            value={formData.total_amount}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/app/subscriptions')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Draft'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubscriptionForm;