import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateInvoicePDF } from '../../utils/pdfGenerator';

export default function InvoiceDraft() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/invoices/${id}`);
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Failed to load invoice');
      }
      const data = await res.json();
      setInvoice(data);
    } catch (err) {
      setError(err.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (action) => {
    try {
      const res = await fetch(`http://localhost:5000/api/invoices/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (!res.ok) {
        const t = await res.text(); throw new Error(t || 'Failed to update');
      }
      await fetchInvoice();
    } catch (err) {
      setError(err.message || 'Failed to update invoice');
    }
  };

  const handlePreview = async () => {
    if (!invoice) return;
    const reference = invoice.invoice_number || `INV-${invoice.id}`;
    const customer = { name: invoice.customer_name || 'Customer', email: invoice.customer_email || '' };
    const amount = parseFloat(invoice.amount || invoice.total_amount || 0);
    const items = [{ name: invoice.subscription_id ? `Subscription ${invoice.subscription_id}` : 'Item', qty: 1, salePrice: amount }];
    await generateInvoicePDF(reference, customer, items, amount, 0, amount, { preview: true });
  };

  if (loading) return <div>Loading invoice...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!invoice) return <div>Invoice not found</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Invoice Draft #{invoice.invoice_number || invoice.id}</h2>
        <div className="flex gap-2">
          <button onClick={() => updateStatus('confirm')} className="bg-green-600 text-white px-3 py-2 rounded">Confirm</button>
          <button onClick={() => updateStatus('cancel')} className="bg-red-600 text-white px-3 py-2 rounded">Cancel</button>
          <button onClick={() => updateStatus('reset_to_draft')} className="bg-gray-200 px-3 py-2 rounded">Reset to Draft</button>
          <button onClick={handlePreview} className="bg-blue-600 text-white px-3 py-2 rounded">Preview</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <p><strong>Subscription:</strong> {invoice.subscription_id || 'N/A'}</p>
        <p><strong>Status:</strong> {invoice.status}</p>
        <p><strong>Amount:</strong> ${parseFloat(invoice.amount || invoice.total_amount || 0).toFixed(2)}</p>
        <div className="mt-4">
          <h3 className="font-semibold">Actions</h3>
          <div className="flex gap-2 mt-2">
            <button onClick={() => navigate(`/app/subscriptions/${invoice.subscription_id}`)} className="px-3 py-2 bg-purple-600 text-white rounded">Subscription</button>
            <button onClick={handlePreview} className="px-3 py-2 bg-gray-100 rounded">Preview</button>
            <button onClick={() => alert('Send flow not implemented')} className="px-3 py-2 bg-gray-100 rounded">Send</button>
            <button onClick={() => alert('Payment flow not implemented')} className="px-3 py-2 bg-gray-100 rounded">Pay</button>
            <button onClick={handlePreview} className="px-3 py-2 bg-gray-100 rounded">Print</button>
          </div>
        </div>
      </div>
    </div>
  );
}
