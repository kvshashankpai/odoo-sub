import React, { useEffect, useState } from 'react';
import { Calendar, AlertCircle, Package, X } from 'lucide-react';
import axios from 'axios';

export default function MySubscription() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [variants, setVariants] = useState({});
  const [products, setProducts] = useState({});
  const [selectedSub, setSelectedSub] = useState(null);
  const [subToCancel, setSubToCancel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Robust Currency Formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const handleCancelClick = (sub) => {
    setSubToCancel(sub);
  };

  const confirmCancel = async () => {
    if (!subToCancel) return;
    try {
      await axios.patch(`http://localhost:5000/api/subscriptions/${subToCancel.id}/status`, {
        action: 'cancel'
      });

      // Update local state
      setSubscriptions(subscriptions.map(s =>
        s.id === subToCancel.id ? { ...s, status: 'cancelled' } : s
      ));

      setSubToCancel(null);
      // Optional: Show success message
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      alert('Failed to cancel subscription. Please try again.');
    }
  };

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/subscriptions');
        const subsData = res.data || [];
        setSubscriptions(subsData);

        const variantIds = new Set();
        subsData.forEach(sub => {
          if (sub.variant_id) variantIds.add(sub.variant_id);
        });

        if (variantIds.size > 0 || subsData.length > 0) {
          const variantMap = {};
          const productMap = {};

          // Fetch products always to show product details
          let productsList = [];
          try {
            const productsRes = await axios.get('http://localhost:5000/api/products');
            productsList = productsRes.data || [];
            productsList.forEach(p => {
              productMap[p.id] = p;
            });
            setProducts(productMap);
          } catch (e) {
            console.error('Failed to fetch products', e);
          }

          // Optimized: Fetch all variants in parallel instead of one-by-one
          if (productsList.length > 0) {
            await Promise.all(
              productsList.map(async (product) => {
                try {
                  const variantRes = await axios.get(`http://localhost:5000/api/variants/product/${product.id}`);
                  (variantRes.data || []).forEach(variant => {
                    variantMap[variant.id] = variant;
                  });
                } catch (e) {
                  // console.warn(`Could not fetch variants for product ${product.id}`);
                }
              })
            );
            setVariants(variantMap);
          }
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
                  {/* Robust Fix Applied Here */}
                  <p className="text-3xl font-extrabold text-primary">
                    {formatCurrency(sub.total_amount)}
                  </p>
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
                <button onClick={() => setSelectedSub(sub)} className="text-sm text-primary hover:underline font-medium">View Details</button>
                <button onClick={() => handleCancelClick(sub)} className="text-sm text-red-500 hover:underline font-medium">Cancel</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedSub && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in text-left">
            <div className="flex justify-between items-center p-6 border-b bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Subscription Details</h3>
              <button onClick={() => setSelectedSub(null)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Product Info */}
              <div>
                <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Product</label>
                <div className="flex items-center gap-3 mt-1">
                  <Package className="text-primary" size={24} />
                  <div>
                    <p className="font-bold text-lg text-gray-900">
                      {products[selectedSub.product_id]?.name || 'Unknown Product'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {products[selectedSub.product_id]?.type || 'Subscription Service'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Variant Info */}
              {selectedSub.variant_id && variants[selectedSub.variant_id] && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Configuration</label>
                  <p className="font-medium text-gray-800 mt-1">{variants[selectedSub.variant_id].name}</p>
                  {variants[selectedSub.variant_id].description && (
                    <p className="text-sm text-gray-600 mt-1">{variants[selectedSub.variant_id].description}</p>
                  )}
                </div>
              )}

              {/* Financials */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Total Amount</label>
                  <p className="font-bold text-xl text-gray-900">{formatCurrency(selectedSub.total_amount)}</p>
                </div>
                <div>
                  <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Billing Cycle</label>
                  <p className="font-medium text-gray-800">{selectedSub.billing_cycle || 'Monthly'}</p>
                </div>
              </div>

              {/* Payment Method (Static for now) */}
              <div>
                <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Payment Method</label>
                <div className="flex items-center gap-2 mt-1 text-gray-700">
                  <div className="w-8 h-5 bg-gray-200 rounded flex items-center justify-center text-[10px] font-bold text-gray-500">
                    CARD
                  </div>
                  <span>Credit Card (via Stripe)</span>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">Status</label>
                <div className="mt-1">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase inline-block">
                    {selectedSub.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t flex justify-end">
              <button
                onClick={() => setSelectedSub(null)}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {subToCancel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-fade-in text-left">
            <div className="p-6">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <AlertCircle size={32} />
                <h3 className="text-xl font-bold">Cancel Subscription?</h3>
              </div>
              <p className="text-gray-600">
                Are you sure you want to cancel your subscription for <strong>{products[subToCancel.product_id]?.name || 'this product'}</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone immediately. You may need to resubscribe.
              </p>
            </div>
            <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
              <button
                onClick={() => setSubToCancel(null)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
              >
                Keep It
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition shadow-sm"
              >
                Yes, Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}