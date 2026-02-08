import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function DiscountForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { discounts, addDiscount, updateDiscount } = useData();
  
  const discount = discounts.find(d => String(d.id) === String(id));
  const isNew = !discount;

  const [formData, setFormData] = useState({
    name: '',
    type: 'Percentage',
    value: '',
    minPurchase: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  // When editing an existing discount, populate the form fields
  useEffect(() => {
    if (discount) {
      setFormData({
        name: discount.name || '',
        type: discount.type || 'Percentage',
        value: discount.value !== undefined ? String(discount.value) : '',
        minPurchase: discount.minPurchase !== undefined ? String(discount.minPurchase) : '',
        startDate: discount.startDate || new Date().toISOString().split('T')[0],
        endDate: discount.endDate || '',
      });
    }
  }, [discount]);

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.value) {
      setMessage('Please fill all required fields');
      return;
    }
    (async () => {
      try {
        if (isNew) {
          await addDiscount({
            name: formData.name,
            type: formData.type,
            value: parseFloat(formData.value),
            minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : 0,
            startDate: formData.startDate,
            endDate: formData.endDate,
          });
          setMessage('Discount created successfully!');
        } else {
          await updateDiscount(id, {
            name: formData.name,
            type: formData.type,
            value: parseFloat(formData.value),
            minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : 0,
            startDate: formData.startDate,
            endDate: formData.endDate,
          });
          setMessage('Discount updated successfully!');
        }
        setTimeout(() => navigate('/app/discounts'), 1200);
      } catch (err) {
        setMessage(err?.response?.data?.error || err.message || 'Failed to save discount');
      }
    })();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate('/app/discounts')} className="flex items-center gap-2 text-primary mb-6 hover:underline">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="bg-white rounded-lg shadow-sm border p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{isNew ? 'New Discount Rule' : 'Edit Discount'}</h1>
        
        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
            <CheckCircle size={18} /> {message}
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g., Summer Sale 2024"
            />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option>Percentage</option>
                <option>Fixed Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Value *</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="0"
                  step="0.01"
                />
                <span className="text-gray-600 min-w-8">{formData.type === 'Percentage' ? '%' : '$'}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Purchase (USD)</label>
              <input
                type="number"
                name="minPurchase"
                value={formData.minPurchase}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition font-medium"
          >
            {isNew ? 'Create Discount' : 'Save Changes'}
          </button>
          <button
            onClick={() => navigate('/app/discounts')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}