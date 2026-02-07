import React, { useState, useEffect } from 'react';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { useParams, useNavigate } from 'react-router-dom';

const SubscriptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [renewLoading, setRenewLoading] = useState(false);
  const [upsellLoading, setUpsellLoading] = useState(false);

  // 1. Fetch Data on Load
  useEffect(() => {
    fetchSubscription();
  }, [id]);

  const fetchSubscription = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/subscriptions/${id}`);
      let data;
      try {
        data = await res.json();
      } catch (e) {
        const text = await res.text();
        throw new Error(text || 'Invalid response from server');
      }
      if (!res.ok) throw new Error(data.error || data.message || JSON.stringify(data));
      setSub(data);
    } catch (err) {
      console.error("Error fetching subscription:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse error bodies safely (JSON or text)
  const parseError = async (res) => {
    try {
      const d = await res.json();
      return d;
    } catch (e) {
      try {
        return await res.text();
      } catch (e2) {
        return { error: 'Unknown error' };
      }
    }
  };

  // Preview PDF for quotation/subscription without creating an invoice
  const handlePreviewPdf = async () => {
    if (!sub) return;
    try {
      const reference = sub.id || sub.subscription_number || `SUB-${Date.now()}`;
      const customer = { name: sub.customer_name || 'Customer', email: sub.customer_email || '' };
      const items = [
        {
          name: sub.plan_name || `Subscription ${sub.id}`,
          qty: 1,
          salePrice: parseFloat(sub.total_amount) || 0,
        }
      ];
      const subtotal = parseFloat(sub.total_amount) || 0;
      const tax = 0; // if tax exists, compute here
      const total = subtotal + tax;
      await generateInvoicePDF(reference, customer, items, subtotal, tax, total, { preview: true });
    } catch (err) {
      console.error('Failed to generate preview PDF', err);
      setActionError(err.message || 'Failed to generate preview');
    }
  };

  // --- ACTIONS ---

  // 2. Action: Send Quotation
  const handleSendQuote = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      console.log('Sending quotation for subscription:', id);
      const res = await fetch(`http://localhost:5000/api/subscriptions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_quotation' })
      });
      console.log('Response status:', res.status);
      const data = await parseError(res);
      if (!res.ok) {
        const msg = typeof data === 'string' ? data : (data.error || data.message || JSON.stringify(data));
        throw new Error(msg || 'Failed to send quotation');
      }
      await fetchSubscription(); // Refresh data to see new status
    } catch (err) {
      console.error('Error sending quotation:', err);
      setActionError(err.message || 'Failed to send quotation');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Action: Confirm Subscription
  const handleConfirm = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      console.log('Confirming subscription:', id);
      const res = await fetch(`http://localhost:5000/api/subscriptions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm' })
      });
      console.log('Response status:', res.status);
      const data = await parseError(res);
      if (!res.ok) {
        const msg = typeof data === 'string' ? data : (data.error || data.message || JSON.stringify(data));
        throw new Error(msg || 'Failed to confirm subscription');
      }
      await fetchSubscription();
    } catch (err) {
      console.error('Error confirming subscription:', err);
      setActionError(err.message || 'Failed to confirm subscription');
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Action: Create Invoice
  const handleCreateInvoice = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch('http://localhost:5000/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: id })
      });
      const data = await parseError(res);
      if (res.ok) {
        // Instead of just alerting, generate and show the invoice PDF preview
        const created = data.invoice || data;
        const reference = created.invoice_number || `INV-${created.id || Date.now()}`;
        const customer = { name: sub.customer_name || 'Customer', email: sub.customer_email || '' };
        const amount = parseFloat(created.amount || created.total_amount || sub.total_amount || 0);
        const items = [
          { name: sub.plan_name || `Subscription ${sub.id}`, qty: 1, salePrice: amount }
        ];

        // Redirect user to draft invoice page so they can confirm/cancel
        // The backend returns redirectUrl like /invoices/draft/:id — map to front-end route
        const invoiceId = created.id || created.invoice?.id || created.invoice_id;
        if (invoiceId) {
          navigate(`/app/invoices/draft/${invoiceId}`);
          return;
        }

        // Fallback: open preview
        await generateInvoicePDF(reference, customer, items, amount, 0, amount, { preview: true });

        // Refresh subscription data
        await fetchSubscription();
      } else {
        const msg = typeof data === 'string' ? data : (data.error || data.message || JSON.stringify(data));
        throw new Error(msg || 'Failed to create invoice');
      }
    } catch (err) {
      console.error('Error creating invoice:', err);
      setActionError(err.message || 'Failed to create invoice');
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Action: Cancel Subscription
  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel this subscription? This action cannot be undone.')) {
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      console.log('Cancelling subscription:', id);
      const res = await fetch(`http://localhost:5000/api/subscriptions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' })
      });
      const data = await parseError(res);
      if (!res.ok) {
        const msg = typeof data === 'string' ? data : (data.error || data.message || JSON.stringify(data));
        throw new Error(msg || 'Failed to cancel subscription');
      }
      await fetchSubscription();
      alert('✅ Subscription cancelled successfully');
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setActionError(err.message || 'Failed to cancel subscription');
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Action: Renew Subscription
  const handleRenew = async () => {
    setRenewLoading(true);
    setActionError(null);
    try {
      console.log('Renewing subscription:', id);
      // Calculate new start date (30 days from today or from current subscription end)
      const newStartDate = new Date();
      newStartDate.setDate(newStartDate.getDate() + 1);
      
      const renewalPayload = {
        customer_name: sub.customer_name,
        billing_cycle: sub.billing_cycle,
        start_date: newStartDate.toISOString().split('T')[0],
        total_amount: sub.total_amount,
        // Parent subscription reference (optional)
        parent_subscription_id: id
      };

      const res = await fetch('http://localhost:5000/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(renewalPayload)
      });

      const data = await parseError(res);
      if (!res.ok) {
        const msg = typeof data === 'string' ? data : (data.error || data.message || JSON.stringify(data));
        throw new Error(msg || 'Failed to renew subscription');
      }

      const newSub = data;
      alert(`✅ Subscription renewed! New subscription ID: ${newSub.id}`);
      setShowRenewModal(false);
      await fetchSubscription();
      // Navigate to the new subscription
      navigate(`/app/subscriptions/${newSub.id}`);
    } catch (err) {
      console.error('Error renewing subscription:', err);
      setActionError(err.message || 'Failed to renew subscription');
    } finally {
      setRenewLoading(false);
    }
  };

  // 7. Action: Upsell (Create higher-tier subscription)
  const handleUpsell = async () => {
    setUpsellLoading(true);
    setActionError(null);
    try {
      console.log('Creating upsell subscription:', id);
      const newStartDate = new Date();
      newStartDate.setDate(newStartDate.getDate() + 1);

      // Calculate upsell amount (typically 30% increase)
      const upsellAmount = Math.round(sub.total_amount * 1.3 * 100) / 100;

      const upsellPayload = {
        customer_name: sub.customer_name,
        billing_cycle: sub.billing_cycle,
        start_date: newStartDate.toISOString().split('T')[0],
        total_amount: upsellAmount,
        parent_subscription_id: id
      };

      const res = await fetch('http://localhost:5000/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(upsellPayload)
      });

      const data = await parseError(res);
      if (!res.ok) {
        const msg = typeof data === 'string' ? data : (data.error || data.message || JSON.stringify(data));
        throw new Error(msg || 'Failed to create upsell');
      }

      const newSub = data;
      alert(`✅ Upsell subscription created! Amount increased to $${upsellAmount}`);
      setShowUpsellModal(false);
      await fetchSubscription();
      navigate(`/app/subscriptions/${newSub.id}`);
    } catch (err) {
      console.error('Error with upsell:', err);
      setActionError(err.message || 'Failed to create upsell');
    } finally {
      setUpsellLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!sub) return <div className="p-8">Subscription not found</div>;

  return (
    <div className="p-4">
      {/* --- HEADER --- */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{sub.customer_name}</h1>
          <p className="text-gray-500">Subscription #{sub.id}</p>
        </div>
        
        {/* STATUS BADGE */}
        <div className={`px-4 py-2 rounded-full font-bold text-sm ${
          sub.status === 'draft' ? 'bg-gray-100 text-gray-700' :
          sub.status === 'quotation_sent' ? 'bg-blue-100 text-blue-700' :
          sub.status === 'confirmed' ? 'bg-green-100 text-green-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {(sub.status || '').toUpperCase()}
        </div>
      </div>

      {/* --- ACTION BAR (IMPROVED LAYOUT) --- */}
      {actionError && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 border border-red-300">{actionError}</div>}
      
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Actions</h2>
        
        {/* STATE: DRAFT */}
        {sub.status === 'draft' && (
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleSendQuote}
              disabled={actionLoading}
              className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
            >
              {actionLoading ? '⏳ Sending...' : '📨 Send Quotation'}
            </button>
          </div>
        )}

        {/* STATE: QUOTATION SENT */}
        {sub.status === 'quotation_sent' && (
          <div className="flex flex-wrap gap-3">
            <button onClick={handlePreviewPdf} className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 font-medium transition">
              📄 Preview PDF
            </button>
            <button 
              onClick={handleConfirm}
              disabled={actionLoading}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
            >
              {actionLoading ? '⏳ Confirming...' : '✓ Confirm Quotation'}
            </button>
          </div>
        )}

        {/* STATE: CONFIRMED */}
        {sub.status === 'confirmed' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button 
              onClick={handleCreateInvoice}
              disabled={actionLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition text-sm"
            >
              {actionLoading ? '⏳...' : '💰 Create Invoice'}
            </button>
            
            <button 
              onClick={() => setShowRenewModal(true)}
              className="bg-green-100 text-green-700 border border-green-300 px-4 py-2 rounded hover:bg-green-200 font-medium transition text-sm"
            >
              🔄 Renew
            </button>
            
            <button 
              onClick={() => setShowUpsellModal(true)}
              className="bg-yellow-100 text-yellow-700 border border-yellow-300 px-4 py-2 rounded hover:bg-yellow-200 font-medium transition text-sm"
            >
              📈 Upsell
            </button>
            
            <button 
              onClick={handleCancelSubscription}
              disabled={actionLoading}
              className="bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition text-sm"
            >
              {actionLoading ? '⏳...' : '❌ Cancel'}
            </button>
          </div>
        )}

        {/* STATE: CANCELLED */}
        {sub.status === 'cancelled' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700 font-medium">🛑 This subscription has been cancelled</p>
            <p className="text-red-600 text-sm mt-1">No further actions are available. Contact support if you need to reactivate.</p>
          </div>
        )}
      </div>

      {/* --- DETAILS SECTION --- */}
      <div className="bg-white rounded-lg shadow-sm border p-6 grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-uppercase text-gray-500 mb-1">Billing Cycle</h3>
          <p className="font-medium text-lg">{sub.billing_cycle}</p>
        </div>
        <div>
          <h3 className="text-sm font-uppercase text-gray-500 mb-1">Total Amount</h3>
          <p className="font-medium text-lg">${sub.total_amount}</p>
        </div>
        <div>
          <h3 className="text-sm font-uppercase text-gray-500 mb-1">Start Date</h3>
          <p className="font-medium text-lg">{sub.start_date ? new Date(sub.start_date).toLocaleDateString() : '-'}</p>
        </div>
        <div>
          <h3 className="text-sm font-uppercase text-gray-500 mb-1">Next Billing</h3>
          <p className="font-medium text-lg">{sub.next_billing_date ? new Date(sub.next_billing_date).toLocaleDateString() : '-'}</p>
        </div>
      </div>

      {/* --- RENEW MODAL --- */}
      {showRenewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Renew Subscription</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <p className="text-gray-900">{sub.customer_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Amount</label>
                <p className="text-gray-900">${sub.total_amount}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
                <p className="text-gray-900">{sub.billing_cycle}</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-700">
                  ℹ️ A new subscription will be created starting from tomorrow with the same details.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowRenewModal(false)}
                className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleRenew}
                disabled={renewLoading}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {renewLoading ? '⏳ Processing...' : '✓ Confirm Renewal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- UPSELL MODAL --- */}
      {showUpsellModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Create Upsell</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <p className="text-gray-900">{sub.customer_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Amount</label>
                <p className="text-gray-900">${sub.total_amount}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upsell Amount (30% increase)</label>
                <p className="text-lg font-bold text-green-600">${Math.round(sub.total_amount * 1.3 * 100) / 100}</p>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-700">
                  ℹ️ A new subscription with 30% higher amount will be created for the next billing period.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowUpsellModal(false)}
                className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpsell}
                disabled={upsellLoading}
                className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {upsellLoading ? '⏳ Processing...' : '✓ Create Upsell'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionDetail;