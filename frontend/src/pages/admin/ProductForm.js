import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, CheckCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { products, addProduct, updateProduct } = useData();

  // Logic: Determine if New or Edit
  const product = id ? products.find(p => String(p.id) === String(id)) : undefined;
  const isNew = !product;

  // Logic: State Management
  // Added 'tax' to state to accommodate the field present in the second layout
  const [formData, setFormData] = useState({
    name: '',
    type: 'Service',
    salePrice: '',
    costPrice: '',
    tax: '', 
    notes: '', // Kept in state, though not explicitly in Layout 2's visual grid (could be added if needed)
    ...product
  });

  const [message, setMessage] = useState('');

  // Logic: Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      tax: formData.tax, // Persisting the tax field from Layout 2
      notes: formData.notes,
    };

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
      }
    })();
  };

  // Layout Styles
  const tabBase =
    'px-4 py-2 rounded-lg border text-sm transition-all hover:shadow-md hover:-translate-y-[1px]';
  const tabActive =
    'bg-primary/10 text-primary border-primary shadow-sm';

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* Control Bar (Layout 2) */}
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
            className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:shadow-md transition-all hover:bg-opacity-90"
          >
            <Save size={18} /> Save
          </button>
        </div>
      </div>

      {/* Feedback Message (Logic 1) injected into Layout */}
      {message && (
        <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-lg flex items-center gap-2 border border-green-200">
          <CheckCircle size={18} /> {message}
        </div>
      )}

      <div className="bg-white p-8 rounded-xl border shadow-sm">

        {/* Product Name (Layout 2 Style) */}
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

        {/* Fields Grid (Layout 2 Structure) */}
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
            
            {/* Added Notes here to ensure Logic 1 data is preserved, adapting Layout 2 slightly to fit it */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                placeholder="Internal notes..."
              />
            </div>
          </div>
        </div>

        {/* Tabs (Layout 2 Visuals) */}
        <div className="flex gap-4 mb-4">
          <button type="button" className={`${tabBase} ${tabActive}`}>Recurring Prices</button>
          <button type="button" className={tabBase}>Variants</button>
        </div>

        {/* Recurring Prices Table (Layout 2 Visual Placeholder) */}
        <div className="border rounded-xl p-4 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left font-medium text-gray-600">Recurring Plan</th>
                <th className="p-3 text-left font-medium text-gray-600">Price</th>
                <th className="p-3 text-left font-medium text-gray-600">Min Qty</th>
                <th className="p-3 text-left font-medium text-gray-600">Start Date</th>
                <th className="p-3 text-left font-medium text-gray-600">End Date</th>
              </tr>
            </thead>
            <tbody>
              {/* Placeholder rows to match design */}
              <tr className="h-12 border-b hover:bg-gray-50">
                <td colSpan="5" className="text-center text-gray-400 italic">No recurring plans configured</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}