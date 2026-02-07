import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function SubscriptionDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { subscriptions, addSubscription, updateSubscription, updateSubscriptionStatus, generateInvoice } = useData();
  
  const subscription = subscriptions.find(s => s.id === id);
  const isNew = !subscription;
  
  const [formData, setFormData] = useState({
    customer: '',
    planId: '',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    amount: '',
    paymentTerms: 'Monthly',
    ...subscription
  });

  const [message, setMessage] = useState('');

  const [orderLines, setOrderLines] = useState(formData.orderLines || []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.customer || !formData.planId || !formData.amount) {
      setMessage('Please fill all required fields');
      return;
    }

    if (isNew) {
      const newSub = addSubscription({
        customer: formData.customer,
        planId: formData.planId,
        startDate: formData.startDate,
        expiryDate: formData.expiryDate,
        amount: parseFloat(formData.amount),
        paymentTerms: formData.paymentTerms,
        orderLines,
      });
      setMessage('Subscription created successfully!');
      setTimeout(() => navigate(`/app/subscriptions/${newSub.id}`), 1000);
    } else {
      updateSubscription(id, { ...formData, orderLines });
      setMessage('Subscription updated successfully!');
    }
  };

  const handleStatusTransition = (newStatus) => {
    try {
      updateSubscriptionStatus(id, newStatus);
      setFormData(prev => ({ ...prev, status: newStatus }));
      setMessage(`Status changed to ${newStatus}`);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleGenerateInvoice = () => {
    const invoice = generateInvoice(id);
    if (invoice) {
      setMessage(`Invoice ${invoice.id} generated successfully!`);
    } else {
      setMessage('Failed to generate invoice');
    }
  };

  const statusFlow = {
    'Draft': ['Quotation'],
    'Quotation': ['Confirmed'],
    'Confirmed': ['Active'],
    'Active': ['Closed'],
    'Closed': []
  };

  const statusColors = {
    'Draft': 'bg-yellow-100 text-yellow-700',
    'Quotation': 'bg-blue-100 text-blue-700',
    'Confirmed': 'bg-purple-100 text-purple-700',
    'Active': 'bg-green-100 text-green-700',
    'Closed': 'bg-gray-200 text-gray-600'
  };

  // Logic: Default start date on confirmation
  useEffect(() => {
    if (formData.status === 'Confirmed' && !formData.startDate) {
      setFormData(prev => ({ ...prev, startDate: new Date().toISOString().split('T')[0] }));
    }
  }, [formData.status]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const updateLine = (id, field, value) => {
    if (formData.status === 'Confirmed') return; // Logic: No changes after confirmation
    setOrderLines(prev => prev.map(line => 
      line.id === id ? { ...line, [field]: value } : line
    ));
  };

  const calculateAmount = (line) => {
    const subtotal = line.quantity * line.unitPrice;
    return (subtotal - (subtotal * (line.discount / 100))).toFixed(2);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate('/app/subscriptions')} className="flex items-center gap-2 text-primary mb-6 hover:underline">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="bg-white rounded-lg shadow-sm border p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{isNew ? 'New Subscription' : formData.id}</h1>
        
        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
            <CheckCircle size={18} /> {message}
          </div>
        )}

        {/* Status Badge & Transitions */}
        {!isNew && (
          <div className="mb-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusColors[formData.status] || 'bg-gray-100'}`}>
                  {formData.status}
                </span>
              </div>
              {statusFlow[formData.status] && statusFlow[formData.status].length > 0 && (
                <div className="flex gap-2">
                  {statusFlow[formData.status].map(nextStatus => (
                    <button
                      key={nextStatus}
                      onClick={() => handleStatusTransition(nextStatus)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition text-sm"
                    >
                      Move to {nextStatus}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
            <input
              type="text"
              name="customer"
              value={formData.customer}
              onChange={handleChange}
              disabled={!isNew}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Enter customer name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plan ID *</label>
            <input
              type="text"
              name="planId"
              value={formData.planId}
              onChange={handleChange}
              disabled={!isNew}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g., PLAN001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Amount (USD) *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="e.g., 99.99"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
            <select
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Annually</option>
              <option>Immediate Payment</option>
            </select>
          </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-between">
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition font-medium"
            >
              {isNew ? 'Create Subscription' : 'Save Changes'}
            </button>
            <button
              onClick={() => setFormData(sub => ({ ...sub }))}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Reset
            </button>
          </div>
          {!isNew && formData.status === 'Active' && (
            <button
              onClick={handleGenerateInvoice}
              className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-opacity-90 transition font-medium"
            >
              Generate Invoice
            </button>
          )}
        </div>
      </div>
    </div>
  );
}