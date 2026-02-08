import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import axios from 'axios';

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { products, addProduct, updateProduct } = useData();

  // Logic: Determine if New or Edit
  const product = id ? products.find(p => String(p.id) === String(id)) : undefined;
  const isNew = !product;

  // Logic: State Management
  const [formData, setFormData] = useState({
    name: '',
    type: 'Service',
    salePrice: '',
    costPrice: '',
    tax: '',
    notes: '',
    ...product
  });

  const [activeTab, setActiveTab] = useState('recurring'); // 'recurring' or 'variants'
  const [variants, setVariants] = useState([]);
  const [recurringPrices, setRecurringPrices] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // New variant/recurring price form states
  const [newVariant, setNewVariant] = useState({ name: '', description: '', additional_price: '' });
  const [newRecurring, setNewRecurring] = useState({ payment_mode: 'EMI', amount: '', interval: 'Monthly', min_qty: '', start_date: '', end_date: '' });

  // Fetch variants and recurring prices when product exists
  useEffect(() => {
    if (!isNew && id) {
      fetchVariants();
      fetchRecurringPrices();
    }
  }, [id, isNew]);

  const fetchVariants = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/variants/product/${id}`);
      setVariants(res.data);
    } catch (err) {
      console.error('Error fetching variants:', err);
    }
  };

  const fetchRecurringPrices = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/recurring-prices/product/${id}`);
      setRecurringPrices(res.data);
    } catch (err) {
      console.error('Error fetching recurring prices:', err);
    }
  };

  // Logic: Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Add variant
  const handleAddVariant = async () => {
    if (!newVariant.name) {
      setMessage('Variant name is required');
      return;
    }

    try {
      const res = await axios.post(`http://localhost:5000/api/variants/product/${id}`, {
        name: newVariant.name,
        description: newVariant.description,
        additional_price: parseFloat(newVariant.additional_price) || 0
      });
      setVariants([...variants, res.data]);
      setNewVariant({ name: '', description: '', additional_price: '' });
      setMessage('Variant added successfully!');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to add variant');
    }
  };

  // Delete variant
  const handleDeleteVariant = async (variantId) => {
    try {
      await axios.delete(`http://localhost:5000/api/variants/${variantId}`);
      setVariants(variants.filter(v => v.id !== variantId));
      setMessage('Variant deleted successfully!');
    } catch (err) {
      setMessage('Failed to delete variant');
    }
  };

  // Add recurring price
  const handleAddRecurring = async () => {
    if (!newRecurring.payment_mode || !newRecurring.amount) {
      setMessage('Payment mode and amount are required');
      return;
    }

    try {
      const res = await axios.post(`http://localhost:5000/api/recurring-prices/product/${id}`, {
        payment_mode: newRecurring.payment_mode,
        amount: parseFloat(newRecurring.amount),
        interval: newRecurring.interval,
        min_qty: newRecurring.min_qty ? parseInt(newRecurring.min_qty) : null,
        start_date: newRecurring.start_date || null,
        end_date: newRecurring.end_date || null
      });
      setRecurringPrices([...recurringPrices, res.data]);
      setNewRecurring({ payment_mode: 'EMI', amount: '', interval: 'Monthly', min_qty: '', start_date: '', end_date: '' });
      setMessage('Recurring price added successfully!');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to add recurring price');
    }
  };

  // Delete recurring price
  const handleDeleteRecurring = async (priceId) => {
    try {
      await axios.delete(`http://localhost:5000/api/recurring-prices/${priceId}`);
      setRecurringPrices(recurringPrices.filter(p => p.id !== priceId));
      setMessage('Recurring price deleted successfully!');
    } catch (err) {
      setMessage('Failed to delete recurring price');
    }
  };

  // Logic: Save Function
  const handleSave = () => {
    if (!formData.name || !formData.salePrice || !formData.costPrice) {
      setMessage('Please fill all required fields');
      return;
    }

    const productData = {
      name: formData.name,
      type: formData.type,
      salePrice: parseFloat(formData.salePrice),
      costPrice: parseFloat(formData.costPrice),
      tax: formData.tax,
      notes: formData.notes,
    };

    setLoading(true);
    (async () => {
      try {
        if (isNew) {
          await addProduct(productData);
          setMessage('Product created successfully!');
        } else {
          await updateProduct(id, productData);
          setMessage('Product updated successfully!');
        }
        setTimeout(() => navigate('/app/products'), 1000);
      } catch (err) {
        setMessage(err?.response?.data?.error || err.message || 'Failed to save product');
      } finally {
        setLoading(false);
      }
    })();
  };

  // Layout Styles
  const tabBase = 'px-4 py-2 rounded-lg border text-sm transition-all hover:shadow-md hover:-translate-y-[1px] cursor-pointer';
  const tabActive = 'bg-primary/10 text-primary border-primary shadow-sm';

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* Control Bar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isNew ? 'New Product' : 'Edit Product'}
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/app/products')}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:shadow-md transition-all text-gray-600 bg-white"
          >
            <X size={18} /> Discard
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:shadow-md transition-all hover:bg-opacity-90 disabled:opacity-50"
          >
            <Save size={18} /> {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Feedback Message */}
      {message && (
        <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-lg flex items-center gap-2 border border-green-200">
          <CheckCircle size={18} /> {message}
        </div>
      )}

      <div className="bg-white p-8 rounded-xl border shadow-sm">

        {/* Product Name */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-gray-700 mb-1">Product Name *</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full text-2xl font-semibold p-2 border-b-2 outline-none focus:border-primary transition-colors placeholder-gray-300"
            placeholder="e.g. Gold Subscription Plan"
          />
        </div>

        {/* Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option>Service</option>
                <option>Consumable</option>
                <option>Product</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sales Price *</label>
              <input
                type="number"
                step="0.01"
                name="salePrice"
                value={formData.salePrice}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price *</label>
              <input
                type="number"
                step="0.01"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax</label>
              <input
                type="text"
                name="tax"
                value={formData.tax}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. 15%"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                placeholder="Internal notes..."
              />
            </div>
          </div>
        </div>

        {/* Tabs - Only show if not new product */}
        {!isNew && (
          <>
            <div className="flex gap-4 mb-4 border-b">
              <button
                type="button"
                onClick={() => setActiveTab('recurring')}
                className={`${tabBase} ${activeTab === 'recurring' ? tabActive : ''}`}
              >
                Recurring Prices
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('variants')}
                className={`${tabBase} ${activeTab === 'variants' ? tabActive : ''}`}
              >
                Variants
              </button>
            </div>

            {/* Recurring Prices Section */}
            {activeTab === 'recurring' && (
              <div className="space-y-4 mb-8">
                <div className="border rounded-xl p-4">
                  <h3 className="font-bold text-lg mb-4">Recurring Payment Modes</h3>

                  {/* Add New Recurring Price Form */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Payment Mode</label>
                        <select
                          value={newRecurring.payment_mode}
                          onChange={(e) => setNewRecurring({ ...newRecurring, payment_mode: e.target.value })}
                          className="w-full p-2 border rounded text-sm"
                        >
                          <option>EMI</option>
                          <option>Monthly</option>
                          <option>Yearly</option>
                          <option>One-time</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Amount (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newRecurring.amount}
                          onChange={(e) => setNewRecurring({ ...newRecurring, amount: e.target.value })}
                          className="w-full p-2 border rounded text-sm"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Interval</label>
                        <select
                          value={newRecurring.interval}
                          onChange={(e) => setNewRecurring({ ...newRecurring, interval: e.target.value })}
                          className="w-full p-2 border rounded text-sm"
                        >
                          <option>Monthly</option>
                          <option>Quarterly</option>
                          <option>Yearly</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Min Qty</label>
                        <input
                          type="number"
                          value={newRecurring.min_qty}
                          onChange={(e) => setNewRecurring({ ...newRecurring, min_qty: e.target.value })}
                          className="w-full p-2 border rounded text-sm"
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={newRecurring.start_date}
                          onChange={(e) => setNewRecurring({ ...newRecurring, start_date: e.target.value })}
                          className="w-full p-2 border rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={newRecurring.end_date}
                          onChange={(e) => setNewRecurring({ ...newRecurring, end_date: e.target.value })}
                          className="w-full p-2 border rounded text-sm"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddRecurring}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Plus size={16} /> Add Payment Mode
                    </button>
                  </div>

                  {/* Recurring Prices Table */}
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="p-3 text-left font-medium text-gray-600">Payment Mode</th>
                        <th className="p-3 text-left font-medium text-gray-600">Amount</th>
                        <th className="p-3 text-left font-medium text-gray-600">Interval</th>
                        <th className="p-3 text-left font-medium text-gray-600">Min Qty</th>
                        <th className="p-3 text-left font-medium text-gray-600">Dates</th>
                        <th className="p-3 text-left font-medium text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recurringPrices.length === 0 ? (
                        <tr className="h-12 border-b hover:bg-gray-50">
                          <td colSpan="6" className="text-center text-gray-400 italic">No recurring payment modes</td>
                        </tr>
                      ) : (
                        recurringPrices.map(rp => (
                          <tr key={rp.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">{rp.payment_mode}</td>
                            <td className="p-3">₹{parseFloat(rp.amount).toFixed(2)}</td>
                            <td className="p-3">{rp.interval}</td>
                            <td className="p-3">{rp.min_qty || '-'}</td>
                            <td className="p-3 text-xs">{rp.start_date ? new Date(rp.start_date).toLocaleDateString() : '-'} to {rp.end_date ? new Date(rp.end_date).toLocaleDateString() : '-'}</td>
                            <td className="p-3">
                              <button
                                onClick={() => handleDeleteRecurring(rp.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Variants Section */}
            {activeTab === 'variants' && (
              <div className="space-y-4 mb-8">
                <div className="border rounded-xl p-4">
                  <h3 className="font-bold text-lg mb-4">Product Variants</h3>

                  {/* Add New Variant Form */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Variant Name *</label>
                        <input
                          type="text"
                          value={newVariant.name}
                          onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                          className="w-full p-2 border rounded text-sm"
                          placeholder="e.g. Red, Large"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                        <input
                          type="text"
                          value={newVariant.description}
                          onChange={(e) => setNewVariant({ ...newVariant, description: e.target.value })}
                          className="w-full p-2 border rounded text-sm"
                          placeholder="Optional description"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Additional Price (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newVariant.additional_price}
                          onChange={(e) => setNewVariant({ ...newVariant, additional_price: e.target.value })}
                          className="w-full p-2 border rounded text-sm"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Plus size={16} /> Add Variant
                    </button>
                  </div>

                  {/* Variants Table */}
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="p-3 text-left font-medium text-gray-600">Variant Name</th>
                        <th className="p-3 text-left font-medium text-gray-600">Description</th>
                        <th className="p-3 text-left font-medium text-gray-600">Additional Price</th>
                        <th className="p-3 text-left font-medium text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.length === 0 ? (
                        <tr className="h-12 border-b hover:bg-gray-50">
                          <td colSpan="4" className="text-center text-gray-400 italic">No variants added yet</td>
                        </tr>
                      ) : (
                        variants.map(v => (
                          <tr key={v.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{v.name}</td>
                            <td className="p-3 text-gray-600">{v.description || '-'}</td>
                            <td className="p-3">₹{parseFloat(v.additional_price).toFixed(2)}</td>
                            <td className="p-3">
                              <button
                                onClick={() => handleDeleteVariant(v.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}