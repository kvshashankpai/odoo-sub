import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQty, subtotal, discountAmount, placeOrder } = useCart();

  return (
    <div className="py-8">
      <div className="app-container max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1 bg-white rounded shadow-sm overflow-hidden border">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-gray-600">Product</th>
                  <th className="p-4 font-semibold text-gray-600 text-center">Qty</th>
                  <th className="p-4 font-semibold text-gray-600 text-right">Price</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-gray-500">Your cart is empty.</td>
                  </tr>
                )}
                {items.map((it) => {
                  const compositeId = `${it.id}-${it.variantId || 'standard'}`;
                  const additional = parseFloat(it.additionalPrice) || 0;
                  const base = (typeof it.basePrice !== 'undefined') ? (parseFloat(it.basePrice) || 0) : (parseFloat(it.price) - additional) || 0;
                  const unitPrice = parseFloat(it.price) || base + additional;
                  return (
                    <tr key={compositeId} className="border-b hover:bg-gray-50 transition">
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{it.name}</div>
                        <div className="text-sm text-gray-600">
                          <span className="block">Variant: <span className="font-medium">{it.variantName || 'Standard'}</span></span>
                          {additional > 0 && (
                            <span className="block text-xs text-gray-500">Base: ${base.toFixed(2)} + Variant: ${additional.toFixed(2)}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <input type="number" value={it.qty} onChange={(e) => updateQty(compositeId, parseInt(e.target.value || '1', 10))} className="w-16 border rounded p-1 text-center" />
                      </td>
                      <td className="p-4 text-right font-medium">${(unitPrice * (it.qty || 1)).toFixed(2)}</td>
                      <td className="p-4 text-center text-red-500 cursor-pointer hover:bg-red-50 rounded">
                        <button onClick={() => removeFromCart(compositeId)} aria-label="remove">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Order Summary */}
          <div className="w-full md:w-80 h-fit bg-white p-6 rounded shadow-sm border">
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>
            <div className="space-y-3 border-b pb-4 mb-4 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount</span>
                  <span>- ${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Taxes (15%)</span>
                <span>${(Math.max(subtotal - discountAmount, 0) * 0.15).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-xl mb-6">
              <span>Total</span>
              <span>${(Math.max(subtotal - discountAmount, 0) * 1.15).toFixed(2)}</span>
            </div>
            <button 
              onClick={() => {
                if (items.length === 0) return;
                const order = placeOrder();
                navigate(`/portal/orders/${order.reference}`);
              }} 
              disabled={items.length === 0}
              className="w-full bg-primary text-white py-3 rounded flex items-center justify-center gap-2 hover:bg-opacity-90 transition disabled:opacity-60"
            >
              Pay Now <ArrowRight size={18} />
            </button>
            <p className="text-xs text-center text-gray-400 mt-4">Secure Checkout via Stripe/PayPal</p>
          </div>
        </div>
      </div>
    </div>
  );
}