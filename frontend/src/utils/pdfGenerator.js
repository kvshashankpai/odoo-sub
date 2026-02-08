import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generateInvoicePDF(reference, customer, items, subtotal, tax, total, opts = { preview: false, discount: 0, taxLabel: 'Tax' }) {
  try {
    const wrapper = document.createElement('div');
    wrapper.style.width = '800px';
    wrapper.style.padding = '32px';
    wrapper.style.background = '#ffffff';
    wrapper.style.fontFamily = 'Arial, Helvetica, sans-serif';

    wrapper.innerHTML = `
      <div style="width:100%;color:#222">
        <h2 style="text-align:center;margin:0 0 8px 0">INVOICE</h2>
        <p style="text-align:center;margin:0 0 16px 0;color:#666">Subscription Management System</p>

        <div style="display:flex;justify-content:space-between;margin-bottom:18px">
          <div>
            <strong>Bill To:</strong>
            <div>${customer?.name || ''}</div>
            <div style="color:#555">${customer?.email || ''}</div>
            <div style="color:#555">${customer?.company || ''}</div>
          </div>
          <div style="text-align:right;color:#333">
            <div><strong>Invoice #:</strong> ${reference || ''}</div>
            <div><strong>Issue Date:</strong> ${new Date().toLocaleDateString()}</div>
            <div><strong>Due Date:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
          </div>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
          <thead>
            <tr style="background:#f3f3f3">
              <th style="padding:8px;border:1px solid #e1e1e1;text-align:left">Product</th>
              <th style="padding:8px;border:1px solid #e1e1e1;text-align:center">Qty</th>
              <th style="padding:8px;border:1px solid #e1e1e1;text-align:right">Unit Price</th>
              <th style="padding:8px;border:1px solid #e1e1e1;text-align:right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(it => {
      const qty = parseInt(it.qty || it.quantity || 1, 10) || 1;
      const unit = parseFloat(it.salePrice || it.price) || 0;
      const additional = parseFloat(it.additionalPrice) || 0;
      const base = (typeof it.basePrice !== 'undefined') ? (parseFloat(it.basePrice) || 0) : Math.max(unit - additional, 0);
      const unitDisplay = unit.toFixed(2);
      const amount = (unit * qty).toFixed(2);
      const productLabel = `${it.name || it.title || 'Item'}${it.variantName ? ' — ' + it.variantName : ''}`;

      // Show base + variant breakdown when available
      const breakdown = additional > 0 ? `<div style="color:#666;font-size:12px;margin-top:4px">Base: ₹${base.toFixed(2)} &nbsp; | &nbsp; Variant: ₹${additional.toFixed(2)}</div>` : '';

      return `
                <tr>
                  <td style="padding:8px;border:1px solid #e1e1e1">
                    <div style="font-weight:600">${productLabel}</div>
                    ${it.description ? `<div style="color:#666;font-size:12px;margin-top:6px">${it.description}</div>` : ''}
                    ${breakdown}
                  </td>
                  <td style="padding:8px;border:1px solid #e1e1e1;text-align:center">${qty}</td>
                  <td style="padding:8px;border:1px solid #e1e1e1;text-align:right">₹${unitDisplay}</td>
                  <td style="padding:8px;border:1px solid #e1e1e1;text-align:right">₹${amount}</td>
                </tr>
              `;
    }).join('')}
          </tbody>
        </table>

        <div style="display:flex;justify-content:flex-end">
          <div style="width:320px">
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-top:1px solid #eaeaea">
              <div>Subtotal</div><div>₹${(subtotal || 0).toFixed(2)}</div>
            </div>
            ${opts.discount && opts.discount > 0 ? `<div style="display:flex;justify-content:space-between;padding:6px 0"><div>Discount</div><div>-₹${(opts.discount || 0).toFixed(2)}</div></div>` : ''}
            <div style="display:flex;justify-content:space-between;padding:6px 0">
              <div>${opts.taxLabel || 'Tax'}</div><div>₹${(tax || 0).toFixed(2)}</div>
            </div>
            <div style="display:flex;justify-content:space-between;padding:10px 0;font-weight:700">
              <div>Total</div><div>₹${(total || 0).toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div style="margin-top:18px;color:#777;font-size:12px;text-align:center">Thank you for your purchase.</div>
      </div>
    `;

    document.body.appendChild(wrapper);

    const canvas = await html2canvas(wrapper, { scale: 2, backgroundColor: '#ffffff' });
    document.body.removeChild(wrapper);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const imgWidth = pageWidth - 16;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 8, 8, imgWidth, imgHeight);

    if (opts && opts.preview) {
      // return a blob URL and open in new tab with an iframe for preview
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const w = window.open('about:blank');
      if (w) {
        // Write a minimal HTML to host the PDF in an iframe
        w.document.write(`<!DOCTYPE html><html><head><title>Invoice Preview</title></head><body style="margin:0">` +
          `<iframe src="${url}" style="border:none;width:100%;height:100vh"></iframe>` +
          `</body></html>`);
        w.document.close();
      } else {
        // Fallback: navigate current window
        window.location.href = url;
      }
      return url;
    } else {
      pdf.save(`Invoice_${reference || Date.now()}.pdf`);
    }
  } catch (err) {
    console.error('generateInvoicePDF error', err);
    throw err;
  }
}
