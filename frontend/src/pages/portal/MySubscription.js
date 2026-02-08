import React, { useEffect, useState } from 'react';
import { Calendar, AlertCircle, Package } from 'lucide-react';
import axios from 'axios';

export default function MySubscription() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [variants, setVariants] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/subscriptions');
        setSubscriptions(res.data || []);
        
        // Fetch variant info for subscriptions that have variant_id
        const variantIds = new Set();
        res.data.forEach(sub => {
          if (sub.variant_id) {
            variantIds.add(sub.variant_id);
          }
        });

        // Fetch all variants to build a map
        if (variantIds.size > 0) {
          const variantMap = {};
          // Fetch variants for all products
          const productsRes = await axios.get('http://localhost:5000/api/products');
          for (const product of (productsRes.data || [])) {
            const variantRes = await axios.get(`http://localhost:5000/api/variants/product/${product.id}`);
            (variantRes.data || []).forEach(variant => {
              variantMap[variant.id] = variant;
            });
          }
          setVariants(variantMap);
        }
      } catch (err) {
        console.error('Failed to fetch subscriptions:', err);
        setError('Failed to load subscriptions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  if (loading) {
    return (
      <div className="py-8">
        <div className="app-container max-w-5xl">
          <p className="text-gray-600">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="app-container max-w-5xl">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="py-8">
        <div className="app-container max-w-5xl">
          <h1 className="text-2xl font-bold mb-6">My Subscriptions</h1>
          <div className="bg-white p-8 rounded shadow-sm border border-gray-200 text-center">
            <Package size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 text-lg">No active subscriptions yet</p>
            <p className="text-gray-500 text-sm mt-2">Create a new subscription by shopping from our catalog</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="app-container max-w-5xl">
        <h1 className="text-2xl font-bold mb-6">My Subscriptions</h1>
        
        {subscriptions.map((sub) => {
          const variant = sub.variant_id ? variants[sub.variant_id] : null;
          const statusColors = {
            draft: 'bg-yellow-100 text-yellow-700',
            quotation_sent: 'bg-blue-100 text-blue-700',
            confirmed: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
          };

          return (
            <div key={sub.id} className="bg-white rounded-lg shadow-sm border border-l-4 border-l-primary p-8 mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-semibold text-gray-800">{sub.customer_name}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColors[sub.status] || 'bg-gray-100 text-gray-700'}`}>
                      {sub.status || 'Draft'}
                    </span>
                  </div>
                  <p className="text-gray-500">
                    Subscription ID: <span className="font-mono text-gray-700">{sub.id}</span>
                  </p>
                  {variant && (
                    <p className="text-gray-500 text-sm mt-1">
                      Variant: <span className="font-medium text-gray-700">{variant.name}</span>
                      {variant.description && <span className="text-gray-600"> - {variant.description}</span>}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-extrabold text-primary">${(sub.total_amount || 0).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{sub.billing_cycle || 'Monthly'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
                <div className="flex items-start gap-3">
                  <Calendar className="text-gray-400" size={20} />
                  <div>
                    <p className="text-xs uppercase font-bold text-gray-400">Start Date</p>
                    <p className="font-medium text-gray-700">
                      {sub.start_date ? new Date(sub.start_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="text-primary" size={20} />
                  <div>
                    <p className="text-xs uppercase font-bold text-gray-400">Next Billing</p>
                    <p className="font-medium text-primary">
                      {sub.next_billing_date ? new Date(sub.next_billing_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-gray-400" size={20} />
                  <div>
                    <p className="text-xs uppercase font-bold text-gray-400">Created</p>
                    <p className="font-medium text-gray-700">
                      {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex gap-4">
                <button className="text-sm text-primary hover:underline font-medium">View Details</button>
                <button className="text-sm text-red-500 hover:underline font-medium">Cancel</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}