import { Sale } from "../sales/entities";

export function buildInvoiceHtml(sale: Sale): string {
  const items = sale.items.map(item => `
    <tr>
      <td>${item.product.name}</td>
      <td class="center">${item.quantity}</td>
      <td class="right">Rs. ${Number(item.unitPrice).toFixed(2)}</td>
      <td class="right">Rs. ${Number(item.subtotal).toFixed(2)}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Segoe UI', sans-serif;
      font-size: 13px;
      color: #1a1a2e;
      background: #fff;
      padding: 48px;
    }

    /* ── HEADER ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 24px;
      border-bottom: 2px solid #e5e7eb;
    }

    .shop-name {
      font-size: 26px;
      font-weight: 700;
      color: #111827;
    }

    .shop-tagline {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }

    .invoice-badge {
      text-align: right;
    }

    .invoice-badge .label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #6b7280;
    }

    .invoice-badge .number {
      font-size: 20px;
      font-weight: 700;
      color: #4f46e5;
      margin-top: 2px;
    }

    /* ── META ROW ── */
    .meta {
      display: flex;
      gap: 32px;
      margin-bottom: 36px;
    }

    .meta-block .meta-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #9ca3af;
      margin-bottom: 4px;
    }

    .meta-block .meta-value {
      font-size: 13px;
      font-weight: 600;
      color: #111827;
    }

    /* ── TABLE ── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 32px;
    }

    thead tr {
      background: #f3f4f6;
    }

    thead th {
      padding: 10px 14px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #6b7280;
      font-weight: 600;
    }

    thead th.right { text-align: right; }
    thead th.center { text-align: center; }

    tbody tr {
      border-bottom: 1px solid #f3f4f6;
    }

    tbody tr:last-child { border-bottom: none; }

    tbody td {
      padding: 12px 14px;
      color: #374151;
    }

    td.right { text-align: right; }
    td.center { text-align: center; }

    /* ── TOTALS ── */
    .totals-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 40px;
    }

    .totals {
      width: 280px;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 16px;
      font-size: 13px;
      border-bottom: 1px solid #f3f4f6;
      color: #6b7280;
    }

    .totals-row span:last-child { color: #111827; font-weight: 500; }

    .totals-row.grand {
      background: #4f46e5;
      color: #fff;
      font-size: 15px;
      font-weight: 700;
      border: none;
    }

    .totals-row.grand span:last-child { color: #fff; }

    /* ── FOOTER ── */
    .footer {
      text-align: center;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 12px;
    }

    .footer strong { color: #4f46e5; }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <div class="shop-name">${sale.shop.name}</div>
      <div class="shop-tagline">Tax Invoice</div>
    </div>
    <div class="invoice-badge">
      <div class="label">Invoice No.</div>
      <div class="number">${sale.invoiceNumber}</div>
    </div>
  </div>

  <div class="meta">
    <div class="meta-block">
      <div class="meta-label">Date</div>
      <div class="meta-value">${sale.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
    </div>
    ${sale.customer ? `
    <div class="meta-block">
      <div class="meta-label">Customer</div>
      <div class="meta-value">${sale.customer.name}</div>
    </div>` : ""}
    <div class="meta-block">
      <div class="meta-label">Payment</div>
      <div class="meta-value" style="text-transform: capitalize">${sale.paymentMethod ?? "—"}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th class="center">Qty</th>
        <th class="right">Unit Price</th>
        <th class="right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${items}
    </tbody>
  </table>

  <div class="totals-wrapper">
    <div class="totals">
      <div class="totals-row"><span>Subtotal</span><span>Rs. ${Number(sale.subtotal).toFixed(2)}</span></div>
      <div class="totals-row"><span>Discount</span><span>- Rs. ${Number(sale.discount).toFixed(2)}</span></div>
      <div class="totals-row"><span>Tax</span><span>Rs. ${Number(sale.tax).toFixed(2)}</span></div>
      <div class="totals-row grand"><span>Grand Total</span><span>Rs. ${Number(sale.totalAmount).toFixed(2)}</span></div>
      <div class="totals-row"><span>Paid</span><span>Rs. ${Number(sale.paidAmount).toFixed(2)}</span></div>
      <div class="totals-row"><span>Due</span><span>Rs. ${Number(sale.dueAmount).toFixed(2)}</span></div>
    </div>
  </div>

  <div class="footer">
    Thank you for shopping at <strong>${sale.shop.name}</strong>. We appreciate your business!
  </div>

</body>
</html>`;
}