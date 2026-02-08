import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import { useData } from '../../context/DataContext';
import { generateInvoicePDF } from '../../utils/pdfGenerator';

export default function OrderDetail() {
  const navigate = useNavigate();
  const { lastOrder } = useCart();
  const { products, taxConfig } = useData();
  const [savingSubscriptions, setSavingSubscriptions] = useState(false);
  const [message, setMessage] = useState(null);

  // Enrich cart items with product details and calculate totals
  const orderData = useMemo(() => {
    if (!lastOrder) return null;

    // Enrich items with product names from DataContext
    const enrichedItems = lastOrder.items.map(item => {
      const product = products.find(p => p.id === item.id);
      return {
        ...item,
        name: product?.name || item.name || 'Product',
        description: product?.description || item.description || '',
        salePrice: product?.salePrice || item.price || 0,
        basePrice: (typeof item.basePrice !== 'undefined') ? item.basePrice : product?.salePrice || item.price || 0,
        additionalPrice: (typeof item.additionalPrice !== 'undefined') ? item.additionalPrice : 0,
      };
    });

    const subtotal = lastOrder.subtotal || 0;
    const taxRate = (taxConfig?.[0]?.percentage || 15) / 100;
    const tax = parseFloat((subtotal * taxRate).toFixed(2));
    const total = parseFloat((subtotal + tax).toFixed(2));

    return {
      reference: lastOrder.reference,
      date: lastOrder.date ? new Date(lastOrder.date).toLocaleDateString() : new Date().toLocaleDateString(),
      items: enrichedItems,
      subtotal,
      tax,
      total,
      taxRate: taxConfig?.[0]?.name || 'Standard Tax',
      discount: lastOrder.discount || 0,
    };
  }, [lastOrder, products, taxConfig]);

  const handleDownload = async () => {
    if (!orderData) {
      console.error('No order data to download');
      return;
    }
    const customer = { name: 'Portal User', email: 'user@example.com', company: '' };
    try {
      await generateInvoicePDF(orderData.reference, customer, orderData.items, orderData.subtotal, orderData.tax, orderData.total, { preview: false, discount: orderData.discount, taxLabel: orderData.taxRate });
    } catch (err) {
      console.error('Failed to generate PDF', err);
    }
  };

  const handleSaveSubscriptions = async () => {
    if (!lastOrder || !lastOrder.items || lastOrder.items.length === 0) {
      setMessage({ type: 'error', text: 'No items in order to save' });
      return;
    }

    setSavingSubscriptions(true);
    try {
      // Logic: Extract billing cycle from the first item, or default to Monthly.
      // Since the requirement says we don't need mixed cycles, this is sufficient.
      const firstItem = lastOrder.items[0];
      const selectedCycle = firstItem.billingCycle || 'Monthly';

      const response = await axios.post('http://localhost:5000/api/subscriptions/from-cart', {
        items: lastOrder.items,
        customer_name: 'Portal User', // In production, get from user auth
        billing_cycle: selectedCycle,
        start_date: new Date().toISOString().split('T')[0]
      });

      setMessage({
        type: 'success',
        text: `✅ Created ${response.data.count} subscription(s) successfully!`
      });

      // Redirect to subscriptions list after 2 seconds
      setTimeout(() => {
        navigate('/portal/my-subscriptions');
      }, 2000);
    } catch (err) {
      console.error('Failed to save subscriptions:', err);
      setMessage({
        type: 'error',
        text: `❌ Failed to save subscriptions: ${err.response?.data?.error || err.message}`
      });
    } finally {
      setSavingSubscriptions(false);
    }
  };

  const handlePrint = handleDownload;

  // Fallback if no order
  if (!orderData) {
    return (
      <div className="py-8">
        <div className="app-container max-w-5xl">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-primary mb-6">
            <ArrowLeft size={16} className="mr-2" /> Back
          </button>
          <div className="bg-white p-8 rounded shadow-lg border border-gray-200">
            <p className="text-gray-600">No order found. Please place an order first.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="app-container max-w-5xl">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-primary">
            <ArrowLeft size={16} className="mr-2" /> Back
          </button>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50 text-sm">
              <Printer size={16} /> Print
            </button>
            <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 text-sm">
              <Download size={16} /> Download
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white p-8 rounded shadow-lg border border-gray-200">
          <div className="border-b pb-6 mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-800">Invoice {orderData.reference}</h1>
              <p className="text-gray-500 mt-2">Date: {orderData.date}</p>
            </div>
            <div className="text-right">
              <span className="bg-green-100 text-green-700 px-4 py-2 rounded text-sm font-bold border border-green-200">
                PAID / ACTIVE
              </span>
            </div>
          </div>

          {/* Address Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-3">Invoicing & Shipping Address</h3>
              <div className="text-gray-700 leading-relaxed">
                <p className="font-bold text-black">Portal User</p>
                <p>Contact: user@example.com</p>
              </div>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-3">Invoice Details</h3>
              <div>
                <p><strong>Reference:</strong> {orderData.reference}</p>
                <p><strong>Tax Type:</strong> {orderData.taxRate}</p>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-3 font-semibold text-gray-600">Product</th>
                  <th className="py-3 font-semibold text-gray-600 text-center">Variant</th>
                  <th className="py-3 font-semibold text-gray-600 text-center">Quantity</th>
                  <th className="py-3 font-semibold text-gray-600 text-right">Unit Price</th>
                  <th className="py-3 font-semibold text-gray-600 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {orderData.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-4">
                      <span className="font-medium">{item.name}</span>
                    </td>
                    <td className="py-4 text-center text-sm">{item.variantName || 'Standard'}</td>
                    <td className="py-4 text-center">{item.qty || 1}</td>
                    <td className="py-4 text-right">${(item.salePrice || item.price).toFixed(2)}</td>
                    <td className="py-4 text-right font-medium">${((item.salePrice || item.price) * (item.qty || 1)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${orderData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 border-b pb-3">
                <span>Tax ({orderData.taxRate})</span>
                <span>${orderData.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-xl text-gray-900">
                <span>Total</span>
                <span>${orderData.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleSaveSubscriptions}
              disabled={savingSubscriptions}
              className="flex-1 py-3 bg-primary text-white rounded font-semibold hover:bg-opacity-90 transition disabled:opacity-60"
            >
              {savingSubscriptions ? 'Saving...' : 'Save Subscriptions'}
            </button>
            <button
              onClick={() => navigate('/portal/shop')}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-50 transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}