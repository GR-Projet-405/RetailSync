const sendEmail = require('../../config/email');

/**
 * Build a currency string (LKR)
 */
const fmt = (n) =>
  new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

/**
 * Build the HTML receipt that is sent as the email body.
 */
const buildReceiptHtml = ({
  invoiceNumber, date, time,
  storeName, storeAddress, storePhone, storeEmail, storeBranch,
  cashierName, counterNumber,
  paymentMethod, amountReceived, changeDue,
  cart = [], subtotal = 0, discounts = 0, tax = 0, total = 0,
  customer,
}) => {
  const itemRows = (cart || []).map((item) => `
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px 8px;color:#1e293b;font-weight:500;font-size:13px;">${item.name || '—'}</td>
      <td style="padding:10px 8px;text-align:center;color:#475569;font-size:13px;">${item.quantity}</td>
      <td style="padding:10px 8px;text-align:right;color:#1e293b;font-weight:600;font-size:13px;">${fmt(item.price * item.quantity)}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Digital Receipt – ${invoiceNumber}</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1d4ed8,#2563eb);padding:32px 36px;color:#fff;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <div style="font-size:22px;font-weight:800;letter-spacing:-.3px;">🛒 ${storeName}</div>
          <div style="font-size:12px;margin-top:6px;opacity:.85;">${storeAddress}</div>
          <div style="font-size:12px;opacity:.85;">Tel: ${storePhone} | ${storeEmail}</div>
          <div style="font-size:12px;opacity:.85;">Branch: ${storeBranch}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px;opacity:.7;text-transform:uppercase;letter-spacing:.05em;">Invoice</div>
          <div style="font-size:16px;font-weight:700;">#${invoiceNumber}</div>
          <div style="font-size:12px;opacity:.8;margin-top:4px;">${date} ${time}</div>
        </div>
      </div>
      <div style="margin-top:24px;background:rgba(255,255,255,.15);border-radius:12px;padding:16px 20px;display:inline-block;">
        <div style="font-size:11px;opacity:.8;text-transform:uppercase;letter-spacing:.05em;">Total Paid</div>
        <div style="font-size:32px;font-weight:800;line-height:1.1;">${fmt(total)}</div>
      </div>
    </div>

    <div style="padding:28px 36px;">

      <!-- Meta -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="width:50%;padding:8px 12px;background:#f8fafc;border-radius:8px;">
            <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;">Cashier</div>
            <div style="font-size:14px;font-weight:600;color:#1e293b;">${cashierName}</div>
            <div style="font-size:12px;color:#64748b;">Counter #${counterNumber}</div>
          </td>
          <td style="width:50%;padding:8px 12px;background:#f8fafc;border-radius:8px;">
            <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;">Payment</div>
            <div style="font-size:14px;font-weight:600;color:#1e293b;text-transform:capitalize;">${paymentMethod}</div>
            <div style="font-size:12px;color:#10b981;font-weight:600;">✓ Paid</div>
          </td>
        </tr>
        ${customer ? `<tr><td colspan="2" style="padding:8px 12px;background:#eff6ff;border-radius:8px;margin-top:8px;">
          <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;">Customer</div>
          <div style="font-size:14px;font-weight:600;color:#1e293b;">${customer.name || '—'}</div>
        </td></tr>` : ''}
      </table>

      <!-- Items -->
      <h3 style="font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.07em;margin:0 0 10px;">Purchased Items</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;">
            <th style="padding:10px 8px;text-align:left;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;">Item</th>
            <th style="padding:10px 8px;text-align:center;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;">Qty</th>
            <th style="padding:10px 8px;text-align:right;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <!-- Totals -->
      <div style="background:#f8fafc;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:5px 0;color:#64748b;font-size:13px;">Subtotal</td>
            <td style="padding:5px 0;text-align:right;color:#1e293b;font-weight:600;font-size:13px;">${fmt(subtotal)}</td>
          </tr>
          ${discounts > 0 ? `<tr>
            <td style="padding:5px 0;color:#10b981;font-size:13px;">Discounts</td>
            <td style="padding:5px 0;text-align:right;color:#10b981;font-weight:600;font-size:13px;">−${fmt(discounts)}</td>
          </tr>` : ''}
          <tr>
            <td style="padding:5px 0;color:#64748b;font-size:13px;">Tax (VAT)</td>
            <td style="padding:5px 0;text-align:right;color:#1e293b;font-weight:600;font-size:13px;">${fmt(tax)}</td>
          </tr>
          <tr style="border-top:2px solid #e2e8f0;">
            <td style="padding:12px 0 4px;color:#1d4ed8;font-size:17px;font-weight:800;">Grand Total</td>
            <td style="padding:12px 0 4px;text-align:right;color:#1d4ed8;font-size:17px;font-weight:800;">${fmt(total)}</td>
          </tr>
          ${(paymentMethod === 'cash' && amountReceived > 0) ? `<tr>
            <td style="padding:3px 0;color:#64748b;font-size:12px;">Cash Tendered</td>
            <td style="padding:3px 0;text-align:right;color:#64748b;font-size:12px;">${fmt(amountReceived)}</td>
          </tr>
          ${changeDue > 0 ? `<tr>
            <td style="padding:3px 0;color:#64748b;font-size:12px;">Change Due</td>
            <td style="padding:3px 0;text-align:right;color:#64748b;font-size:12px;">${fmt(changeDue)}</td>
          </tr>` : ''}` : ''}
        </table>
      </div>

      <!-- Footer -->
      <div style="text-align:center;border-top:1px solid #e2e8f0;padding-top:20px;color:#94a3b8;font-size:12px;line-height:1.7;">
        <p style="margin:0;font-weight:700;color:#1e293b;font-size:14px;">${storeName}</p>
        <p style="margin:0;">${storeAddress}</p>
        <p style="margin:0;">Tel: ${storePhone} | ${storeEmail}</p>
        <p style="margin:8px 0 0;font-weight:700;color:#2563eb;font-size:14px;">Thank you for shopping with us! 🎉</p>
        <p style="margin:16px 0 0;font-size:10px;color:#cbd5e1;">Powered by RetailSync POS</p>
      </div>

    </div>
  </div>
</body>
</html>`;
};

/**
 * Build a plain-text SMS receipt body.
 */
const buildSmsText = ({
  storeName, storeBranch, invoiceNumber, date, time, cart = [], total,
}) =>
  [
    `--- ${storeName} Receipt ---`,
    `Branch : ${storeBranch}`,
    `Invoice: #${invoiceNumber}`,
    `Date   : ${date} ${time}`,
    `Items  : ${(cart || []).length}`,
    `Total  : ${fmt(total)}`,
    `Thank you for shopping with us!`,
    `Verify: https://retailsync.lk/invoice/${invoiceNumber}`,
  ].join('\n');

class POSBillingService {
  /**
   * Send a digital receipt via Email and/or SMS (WhatsApp link).
   *
   * @param {Object} payload  – all invoice fields from the frontend
   * @returns {Object} result – { emailSent, emailMessage, emailPreviewUrl, smsSent, smsMessage, smsWhatsappUrl }
   */
  async sendReceipt(payload) {
    const {
      sendVia = 'email',        // 'email' | 'sms' | 'both'
      recipientEmail,
      recipientPhone,
      invoiceNumber, date, time,
      storeName = 'RetailSync', storeAddress = '', storePhone = '',
      storeEmail = '', storeBranch = 'Main',
      cashierName = 'Cashier', counterNumber = '01',
      paymentMethod = 'cash', amountReceived = 0, changeDue = 0,
      cart = [], subtotal = 0, discounts = 0, tax = 0, total = 0,
      customer,
    } = payload;

    const result = {
      emailSent: false,
      emailMessage: null,
      emailPreviewUrl: null,
      smsSent: false,
      smsMessage: null,
      smsWhatsappUrl: null,
    };

    /* ── EMAIL ──────────────────────────────────────────────── */
    if (sendVia === 'email' || sendVia === 'both') {
      if (!recipientEmail) throw new Error('recipientEmail is required for email delivery.');

      const html = buildReceiptHtml({
        invoiceNumber, date, time,
        storeName, storeAddress, storePhone, storeEmail, storeBranch,
        cashierName, counterNumber,
        paymentMethod, amountReceived, changeDue,
        cart, subtotal, discounts, tax, total, customer,
      });

      const previewUrl = await sendEmail({
        to: recipientEmail,
        subject: `Your Receipt from ${storeName} – #${invoiceNumber}`,
        html,
      });

      result.emailSent = true;
      result.emailPreviewUrl = previewUrl || null;
      result.emailMessage = previewUrl
        ? `Test email delivered. Open the preview link to view it.`
        : `Email sent successfully to ${recipientEmail}.`;
    }

    /* ── SMS (Native SMS App deep-link) ───────────────────────────── */
    if (sendVia === 'sms' || sendVia === 'both') {
      if (!recipientPhone) throw new Error('recipientPhone is required for SMS delivery.');

      const text = buildSmsText({ storeName, storeBranch, invoiceNumber, date, time, cart, total });
      const cleanPhone = recipientPhone.replace(/[^0-9+]/g, '');
      const smsLocalUrl = `sms:${cleanPhone}?body=${encodeURIComponent(text)}`;

      // Log the simulated SMS to the backend console
      console.log('\n── [SMS RECEIPT] ──────────────────────────────────');
      console.log(`To      : ${recipientPhone}`);
      console.log(text);
      console.log('───────────────────────────────────────────────────\n');

      result.smsSent = true;
      result.smsLocalUrl = smsLocalUrl;
      result.smsMessage = `SMS receipt prepared for ${recipientPhone}. Open the Messages app to deliver.`;
    }

    return result;
  }

  /**
   * Adjust stock levels for a single product in the database.
   */
  async adjustStock({ productId, delta, branchId }) {
    const mongoose = require('mongoose');
    const Product = require('../product-management/model');
    const Inventory = require('../inventory-management/model');
    const InventoryItem = require('../inventory-management/inventoryItem.model');
    const Warehouse = require('../warehouse-management/model');

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error('Invalid product ID.');
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found.');
    }

    // Find the warehouse for this branch
    let warehouse = await Warehouse.findOne({ branchId });
    if (!warehouse) {
      warehouse = await Warehouse.findOne({ status: 'ACTIVE' });
    }
    const warehouseId = warehouse ? warehouse._id : null;

    // 1. Adjust product variants stock
    if (!product.variants || product.variants.length === 0) {
      product.variants = [{
        size: 'Default',
        sku: product.sku,
        quantity: 0,
        warehouse: warehouseId
      }];
    }

    let variant = product.variants.find(v => 
      (warehouseId && v.warehouse && v.warehouse.toString() === warehouseId.toString()) || 
      v.size === 'Default'
    );
    if (!variant) {
      variant = product.variants[0];
    }

    const nextQty = variant.quantity + delta;
    if (nextQty < 0) {
      throw new Error(`Insufficient stock for product "${product.name}". Available: ${variant.quantity}`);
    }
    variant.quantity = nextQty;
    await product.save();

    // 2. Adjust legacy Inventory
    if (branchId) {
      const inv = await Inventory.findOne({ productId, branchId });
      if (inv) {
        inv.quantity = Math.max(0, inv.quantity + delta);
        await inv.save();
      } else {
        await Inventory.create({ productId, branchId, quantity: Math.max(0, delta) });
      }
    }

    // 3. Adjust modern InventoryItem
    if (warehouseId) {
      const item = await InventoryItem.findOne({ productId, warehouseId });
      if (item) {
        item.currentStock = Math.max(0, item.currentStock + delta);
        await item.save();
      } else {
        await InventoryItem.create({ productId, warehouseId, currentStock: Math.max(0, delta) });
      }
    }

    return {
      productId,
      newStock: variant.quantity
    };
  }

  /**
   * Adjust stock levels for multiple products or a single product based on payload.
   */
  async adjustStocks(payload, branchId) {
    const { productId, delta, adjustments } = payload;
    const results = [];

    if (Array.isArray(adjustments)) {
      for (const adj of adjustments) {
        const res = await this.adjustStock({
          productId: adj.productId,
          delta: adj.delta,
          branchId
        });
        results.push(res);
      }
    } else if (productId && delta !== undefined) {
      const res = await this.adjustStock({ productId, delta, branchId });
      results.push(res);
    } else {
      throw new Error('Invalid payload: specify either adjustments array or productId and delta.');
    }

    return results;
  }
}

module.exports = new POSBillingService();
