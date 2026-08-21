const mongoose = require('mongoose');
const PurchaseOrderPage = require('./model');
const Supplier = require('../supplier-management/model');
// ADAPT: point this at your actual product model / path
const ProductPage = require('../product-management/model');
const Category = require('../category-management/model');
// ADAPT: path to your mailer util
const mailer = require('../../utils/mailer');

class PurchaseOrderPageService {
  // ── List all POs (with optional search/status/supplier/orderDate filter + pagination) ──
  async fetchDetails(query = {}) {
    const { status, supplier, search, orderDate, page = 1, limit = 20 } = query;

    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (supplier) filter.supplierNameSnapshot = supplier;
    if (search) {
      filter.$or = [
        { poNumber: { $regex: search, $options: 'i' } },
        { supplierNameSnapshot: { $regex: search, $options: 'i' } },
      ];
    }
    if (orderDate) {
      // orderDate comes in as "YYYY-MM-DD" from the date input — match the whole day
      const start = new Date(orderDate);
      if (!isNaN(start)) {
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        filter.orderDate = { $gte: start, $lt: end };
      }
    }

    const [orders, total] = await Promise.all([
      PurchaseOrderPage.find(filter)
        .populate('supplier', 'name supplierId')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      PurchaseOrderPage.countDocuments(filter),
    ]);

    return {
      module: 'Purchase Orders',
      status: 'Active',
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.max(1, Math.ceil(total / Number(limit))),
      orders,
    };
  }

  // ── Get a single PO by id (used by the workflow/review/detail screens) ──
  async fetchById(id) {
    const order = await PurchaseOrderPage.findById(id)
      .populate('supplier')
      .populate('items.product')
      .populate('createdBy', 'firstName lastName username email');
    if (!order) {
      const err = new Error('Purchase order not found');
      err.statusCode = 404;
      throw err;
    }
    return order;
  }

  // ── Step 1: supplier typeahead search ──
  async searchSuppliers(search = '') {
    const filter = {
      status: { $ne: 'Inactive' },
    };

    if (search && search.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { supplierId: { $regex: safeSearch, $options: 'i' } },
      ];
    }
    const suppliers = await Supplier.find(filter).select('name supplierId').limit(20);

    return suppliers.map((s) => ({
      _id: s._id,
      name: s.name,
      supplierId: s.supplierId,
    }));
  }

  // ── Step 1: supplier detail for contact autofill ──
  async getSupplierDetail(id) {
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      const err = new Error('Supplier not found');
      err.statusCode = 404;
      throw err;
    }
    const primaryContact = supplier.contacts?.find((c) => c.isPrimary) || supplier.contacts?.[0];

    return {
      supplierId: supplier._id,
      supplierCode: supplier.supplierId,
      name: supplier.name,
      contact: primaryContact
        ? {
            name: primaryContact.name,
            role: primaryContact.role,
            email: primaryContact.email,
            phone: primaryContact.phone,
          }
        : null,
    };
  }

  // ── Step 2: product catalog search with live stock ──
  async searchCatalog(search = '', supplierId = '') {
    const filter = {};

    if (supplierId && mongoose.Types.ObjectId.isValid(supplierId)) {
      filter.supplier = supplierId;
    }

    if (search && search.trim()) {
      const trimmedSearch = search.trim();
      const safeSearch = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const matchingCategories = await Category.find({
        $or: [
          { name: { $regex: safeSearch, $options: 'i' } },
          { code: { $regex: safeSearch, $options: 'i' } },
        ],
      }).select('_id');
      const categoryIds = matchingCategories.map((c) => c._id);

      const searchOr = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { sku: { $regex: safeSearch, $options: 'i' } },
        { brand: { $regex: safeSearch, $options: 'i' } },
      ];

      if (categoryIds.length > 0) {
        searchOr.push({ category: { $in: categoryIds } });
      }

      if (mongoose.Types.ObjectId.isValid(trimmedSearch)) {
        searchOr.push({ category: new mongoose.Types.ObjectId(trimmedSearch) });
        searchOr.push({ _id: new mongoose.Types.ObjectId(trimmedSearch) });
      }

      filter.$or = searchOr;
    }

    const products = await ProductPage.find(filter).limit(50);

    return products.map((p) => {
      // FIXED: real schema stores price at pricing.sellingPrice (nested),
      // not as a top-level sellingPrice/unitPrice/price field.
      const unitPrice = p.pricing?.sellingPrice ?? 0;

      // FIXED: real schema has no top-level stock field — total stock is
      // the sum of quantity across all variants (mirrors the totalStock
      // virtual on the Product model).
      const stock = Array.isArray(p.variants)
        ? p.variants.reduce((sum, v) => sum + (v.quantity || 0), 0)
        : 0;

      // Pick the image flagged isPrimary; fall back to the first image
      // if none is flagged, or null if there are no images at all.
      const images = Array.isArray(p.images) ? p.images : [];
      const primaryImage = images.find((img) => img.isPrimary) || images[0] || null;

      return {
        productId: p._id,
        sku: p.sku,
        name: p.name,
        unitPrice,
        availableStock: stock,
        stockLabel: stock > 0 ? `${stock} in stock` : 'Out of stock',
        imageUrl: primaryImage?.url || null,
      };
    });
  }

  // ── Optional helper: pre-fill Step 1 defaults from a chosen supplier ──
  async initFromSupplier(supplierId) {
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      const err = new Error('Supplier not found');
      err.statusCode = 404;
      throw err;
    }

    const primaryContact = supplier.contacts?.find((c) => c.isPrimary) || supplier.contacts?.[0];

    return {
      supplier: supplier._id,
      supplierNameSnapshot: supplier.name,
      supplierContact: primaryContact
        ? {
            name: primaryContact.name,
            role: primaryContact.role,
            email: primaryContact.email,
            phone: primaryContact.phone,
          }
        : undefined,
      shippingAddress: supplier.address
        ? [supplier.address.street, supplier.address.city, supplier.address.state, supplier.address.zip]
            .filter(Boolean)
            .join(', ')
        : '',
    };
  }

  // ── Translate the wizard's flat payload into the schema's nested shape ──
  // Used by both create() and update() so editing a draft goes through the
  // exact same validation / snapshot logic as creating a new order.
  async _buildOrderPayload(body) {
    const {
      supplierId,
      expectedDeliveryDate,
      shippingAddress,
      items = [],
      taxRate,
      shippingHandling,
      internalNotes,
      asDraft,
    } = body;

    if (!supplierId) {
      const err = new Error('supplierId is required');
      err.statusCode = 400;
      throw err;
    }

    if (!expectedDeliveryDate || isNaN(new Date(expectedDeliveryDate).getTime())) {
      const err = new Error('expectedDeliveryDate is required and must be a valid date');
      err.statusCode = 400;
      throw err;
    }

    if (!shippingAddress || typeof shippingAddress !== 'string' || !shippingAddress.trim()) {
      const err = new Error('shippingAddress is required');
      err.statusCode = 400;
      throw err;
    }

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      const err = new Error('Supplier not found');
      err.statusCode = 404;
      throw err;
    }
    const primaryContact = supplier.contacts?.find((c) => c.isPrimary) || supplier.contacts?.[0];
    if (!primaryContact?.email) {
      const err = new Error('Selected supplier has no contact email on file');
      err.statusCode = 400;
      throw err;
    }

    const productIds = items
      .map((i) => i.productId || i.product?._id || i.product)
      .filter(Boolean);
    const products = await ProductPage.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    if (items.length === 0) {
      const err = new Error('Cannot save a purchase order with no line items');
      err.statusCode = 400;
      throw err;
    }

    const lineItems = items.map((i) => {
      const pId = String(i.productId || i.product?._id || i.product);
      const product = productMap.get(pId);
      if (!product) {
        const err = new Error(`Product ${pId} not found`);
        err.statusCode = 400;
        throw err;
      }
      const prodSupplierId = product.supplier?._id ? String(product.supplier._id) : (product.supplier ? String(product.supplier) : null);
      if (!prodSupplierId || prodSupplierId !== String(supplier._id)) {
        const err = new Error(`Product "${product.name}" does not belong to the selected supplier`);
        err.statusCode = 400;
        throw err;
      }
      const rawQty = i.quantity !== undefined ? i.quantity : i.qty;
      const quantity = Number(rawQty);
      if (isNaN(quantity) || quantity <= 0) {
        const err = new Error(`Quantity for item "${product.name}" must be at least 1`);
        err.statusCode = 400;
        throw err;
      }
      // FIXED: fall back to the real nested pricing.sellingPrice field
      // instead of the non-existent top-level sellingPrice/unitPrice/price.
      const unitPrice = i.unitPrice ?? product.pricing?.sellingPrice ?? 0;
      return {
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity,
        unitPrice,
        lineTotal: quantity * unitPrice,
      };
    });

    return {
      supplier: supplier._id,
      supplierNameSnapshot: supplier.name,
      supplierContact: {
        name: primaryContact.name,
        role: primaryContact.role,
        email: primaryContact.email,
        phone: primaryContact.phone,
      },
      expectedDeliveryDate,
      shippingAddress,
      items: lineItems,
      taxRate: taxRate ?? 8,
      shippingHandling: shippingHandling ?? 0,
      internalNotes: internalNotes ?? '',
      status: asDraft ? 'DRAFT' : 'SENT',
      submittedAt: asDraft ? undefined : new Date(),
    };
  }

  // ── Create (handles both "Save as Draft" and "Send to Supplier") ──
  async create(body, userId) {
    try {
      const payload = await this._buildOrderPayload(body);
      const order = new PurchaseOrderPage({
        ...payload,
        orderDate: new Date(),
        createdBy: userId || null,
      });
      await order.save();
      return order;
    } catch (err) {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        err.statusCode = 400;
      }
      throw err;
    }
  }

  // ── Update an existing draft ──
  // Accepts either:
  //  (a) a wizard payload (has `supplierId` + `items[]`) — e.g. the Review &
  //      Submit step editing a draft, or submitting it ("Send to Supplier").
  //      Runs through the same _buildOrderPayload transform as create().
  //  (b) a raw partial patch of schema fields — e.g. status-only updates
  //      used by simpler workflow actions.
  async update(id, body) {
    const order = await PurchaseOrderPage.findById(id);
    if (!order) {
      const err = new Error('Purchase order not found');
      err.statusCode = 404;
      throw err;
    }
    if (['PARTIALLY_RECEIVED', 'FULLY_RECEIVED'].includes(order.status)) {
      const err = new Error(`Cannot edit a purchase order with status "${order.status}"`);
      err.statusCode = 409;
      throw err;
    }

    try {
      const currentSupplierId = order.supplier?._id ? String(order.supplier._id) : String(order.supplier);
      const mergedBody = {
        supplierId: body.supplierId || currentSupplierId,
        expectedDeliveryDate: body.expectedDeliveryDate || order.expectedDeliveryDate,
        shippingAddress: body.shippingAddress || order.shippingAddress,
        items: body.items !== undefined ? body.items : order.items,
        taxRate: body.taxRate !== undefined ? body.taxRate : order.taxRate,
        shippingHandling: body.shippingHandling !== undefined ? body.shippingHandling : order.shippingHandling,
        internalNotes: body.internalNotes !== undefined ? body.internalNotes : order.internalNotes,
        asDraft: body.asDraft !== undefined ? body.asDraft : (order.status === 'DRAFT'),
      };

      const payload = await this._buildOrderPayload(mergedBody);

      Object.assign(order, payload);
      await order.save(); // pre-save hook recalculates totals
      return order;
    } catch (err) {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        err.statusCode = 400;
      }
      throw err;
    }
  }

  // ── "Send" action — moves a Draft PO to the supplier ──
  async send(id) {
    const order = await PurchaseOrderPage.findById(id);
    if (!order) {
      const err = new Error('Purchase order not found');
      err.statusCode = 404;
      throw err;
    }
    if (order.status !== 'DRAFT') {
      const err = new Error(`Only draft purchase orders can be sent (current status: "${order.status}")`);
      err.statusCode = 409;
      throw err;
    }
    if (!order.items || order.items.length === 0) {
      const err = new Error('Cannot send a purchase order with no line items');
      err.statusCode = 400;
      throw err;
    }

    order.status = 'SENT';
    order.submittedAt = new Date();
    await order.save();

    // Best-effort notification — a failed send shouldn't roll back the
    // status change, since the PO is still validly "sent" from the
    // business's point of view; the approver can use Resend Email if it
    // bounced.
    try {
      const { to, subject, html } = this._buildEmailContent(order);
      if (to) {
        await mailer.send({ to, subject, html });
        order.lastEmailSentAt = new Date();
        order.emailSendCount = (order.emailSendCount || 0) + 1;
        await order.save();
      }
    } catch (err) {
      console.error(`Failed to email supplier for PO ${order.poNumber}:`, err.message);
    }

    return order;
  }

  // ── "Withdraw" action — moves a Sent PO back to Draft ──
  // Used by the Approval Workflow page's "Withdraw Request" button.
  async withdraw(id) {
    const order = await PurchaseOrderPage.findById(id);
    if (!order) {
      const err = new Error('Purchase order not found');
      err.statusCode = 404;
      throw err;
    }
    if (order.status !== 'SENT') {
      const err = new Error(`Only purchase orders pending approval can be withdrawn (current status: "${order.status}")`);
      err.statusCode = 409;
      throw err;
    }

    order.status = 'DRAFT';
    order.submittedAt = undefined;
    await order.save();
    return order;
  }

  // ── Receive action — mark items received (partial or full) ──
  async receive(id, { fullyReceived = false } = {}) {
    const order = await PurchaseOrderPage.findById(id);
    if (!order) {
      const err = new Error('Purchase order not found');
      err.statusCode = 404;
      throw err;
    }
    if (!['SENT', 'PARTIALLY_RECEIVED'].includes(order.status)) {
      const err = new Error(`Cannot receive against a purchase order with status "${order.status}"`);
      err.statusCode = 409;
      throw err;
    }

    order.status = fullyReceived ? 'FULLY_RECEIVED' : 'PARTIALLY_RECEIVED';
    await order.save(); // pre-save hook stamps firstReceivedAt/fullyReceivedAt
    return order;
  }

  // ── "Cancel" action — supplier order details page ──
  async cancel(id) {
    const order = await PurchaseOrderPage.findById(id);
    if (!order) {
      const err = new Error('Purchase order not found');
      err.statusCode = 404;
      throw err;
    }
    if (['FULLY_RECEIVED', 'CANCELLED'].includes(order.status)) {
      const err = new Error(`Cannot cancel a purchase order with status "${order.status}"`);
      err.statusCode = 409;
      throw err;
    }
    order.status = 'CANCELLED';
    await order.save();
    return order;
  }

  // ── "Discard Order" — only allowed while still a Draft ──
  async discard(id) {
    const order = await PurchaseOrderPage.findById(id);
    if (!order) {
      const err = new Error('Purchase order not found');
      err.statusCode = 404;
      throw err;
    }
    if (order.status !== 'DRAFT') {
      const err = new Error('Only draft purchase orders can be discarded');
      err.statusCode = 409;
      throw err;
    }
    await order.deleteOne();
    return { deleted: true, id };
  }

  // ── Shared: build the supplier email subject/body ──
  // Used by both the preview endpoint and the actual send/resend actions,
  // so what the user previews is exactly what gets sent.
  _buildEmailContent(order) {
    const contact = order.supplierContact || {};
    const items = order.items || [];

    const escapeHtml = (str = '') =>
      String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const rows = items
      .map(
        (i) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(i.name)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(i.sku)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${i.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">Rs. ${i.unitPrice.toFixed(2)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">Rs. ${i.lineTotal.toFixed(2)}</td>
        </tr>`
      )
      .join('');

    // Configurable via .env so the subject line reflects your company name
    // instead of a generic default. Falls back to "Purchasing Team" if unset.
    const companyName = process.env.COMPANY_NAME || 'Purchasing Team';
    const subject = `Purchase Order #${order.poNumber} — ${companyName}`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;">
        <h2 style="margin-bottom:4px;">Purchase Order #${order.poNumber}</h2>
        <p>Dear ${escapeHtml(contact.name) || 'Supplier'},</p>
        <p>Please find the details of our purchase order below. Kindly confirm receipt and the expected delivery date.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:8px;text-align:left;">Item</th>
              <th style="padding:8px;text-align:left;">SKU</th>
              <th style="padding:8px;text-align:center;">Qty</th>
              <th style="padding:8px;text-align:right;">Unit Price</th>
              <th style="padding:8px;text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="text-align:right;margin:0;">
          Subtotal: Rs. ${order.subtotal.toFixed(2)}<br/>
          Tax (${order.taxRate}%): Rs. ${order.taxAmount.toFixed(2)}<br/>
          Shipping: Rs. ${order.shippingHandling.toFixed(2)}<br/>
          <strong>Grand Total: Rs. ${order.grandTotal.toFixed(2)}</strong>
        </p>
        <p>Expected Delivery Date: ${
          order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toDateString() : '—'
        }</p>
        <p>Shipping Address:<br/>${escapeHtml(order.shippingAddress) || '—'}</p>
        ${order.internalNotes ? `<p><em>Notes: ${escapeHtml(order.internalNotes)}</em></p>` : ''}
        <p>Thank you,<br/>${escapeHtml(companyName)}</p>
      </div>
    `;

    return { to: contact.email, subject, html };
  }

  // ── Email preview (Step 3 card + Approval Workflow "preview full email body") ──
  async getEmailPreview(id) {
    const order = await PurchaseOrderPage.findById(id);
    if (!order) {
      const err = new Error('Purchase order not found');
      err.statusCode = 404;
      throw err;
    }
    return this._buildEmailContent(order);
  }

  // ── Resend Email action (Supplier Order Details page) ──
  async resendEmail(id) {
    const order = await PurchaseOrderPage.findById(id);
    if (!order) {
      const err = new Error('Purchase order not found');
      err.statusCode = 404;
      throw err;
    }
    if (order.status === 'DRAFT') {
      const err = new Error('Cannot resend email for a purchase order still in draft');
      err.statusCode = 409;
      throw err;
    }

    const { to, subject, html } = this._buildEmailContent(order);
    if (!to) {
      const err = new Error('Supplier has no contact email on file');
      err.statusCode = 400;
      throw err;
    }

    try {
      await mailer.send({ to, subject, html });
    } catch (sendErr) {
      console.error(`Failed to resend email for PO ${order.poNumber}:`, sendErr.message);
    }

    order.lastEmailSentAt = new Date();
    order.emailSendCount = (order.emailSendCount || 0) + 1;
    await order.save();
    return order;
  }

  // ── PDF generation (Download PDF button) ──
  // Returns a PDFKit document stream; the controller pipes it to the response.
  // Requires: npm install pdfkit
  async generatePdf(id) {
    const order = await PurchaseOrderPage.findById(id);
    if (!order) {
      const err = new Error('Purchase order not found');
      err.statusCode = 404;
      throw err;
    }

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });

    // ── Palette (matches the app's blue/gray UI) ──
    const COLORS = {
      brand: '#2563eb',      // blue-600
      brandDark: '#1d4ed8',  // blue-700
      text: '#111827',       // gray-900
      subtext: '#6b7280',    // gray-500
      muted: '#9ca3af',      // gray-400
      border: '#e5e7eb',     // gray-200
      rowAlt: '#f9fafb',     // gray-50
      headerBg: '#f3f4f6',   // gray-100
      white: '#ffffff',
      danger: '#dc2626',
      success: '#16a34a',
      warning: '#d97706',
    };

    const STATUS_COLORS = {
      DRAFT: COLORS.muted,
      SENT: COLORS.brand,
      PARTIALLY_RECEIVED: COLORS.warning,
      FULLY_RECEIVED: COLORS.success,
      CANCELLED: COLORS.danger,
    };

    const PAGE_W = doc.page.width;
    const MARGIN = 40;
    const CONTENT_W = PAGE_W - MARGIN * 2;
    const companyName = process.env.COMPANY_NAME || 'Purchasing Team';

    const money = (n) => `Rs. ${(Number(n) || 0).toFixed(2)}`;
    const dateStr = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');

    // ── Reusable: footer with page number, drawn once per page at the end ──
    const drawFooter = (pageIndex, pageCount) => {
      const footerY = doc.page.height - 36;
      doc
        .save()
        .fontSize(8)
        .fillColor(COLORS.muted)
        .text(
          `Generated ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`,
          MARGIN,
          footerY,
          { width: CONTENT_W / 2, align: 'left' }
        )
        .text(`Page ${pageIndex + 1} of ${pageCount}`, MARGIN, footerY, { width: CONTENT_W, align: 'right' })
        .restore();
    };

    // ── Header band ──
    doc.rect(0, 0, PAGE_W, 90).fill(COLORS.brand);
    doc
      .fillColor(COLORS.white)
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('PURCHASE ORDER', MARGIN, 28);
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#dbeafe')
      .text(companyName, MARGIN, 54);

    // PO number + status, right-aligned in the header band
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor(COLORS.white)
      .text(`#${order.poNumber}`, PAGE_W - MARGIN - 200, 28, { width: 200, align: 'right' });

    const statusColor = STATUS_COLORS[order.status] || COLORS.muted;
    const statusLabel = String(order.status || '').replace(/_/g, ' ');
    const badgeW = doc.widthOfString(statusLabel, { font: 'Helvetica-Bold', size: 9 }) + 20;
    const badgeX = PAGE_W - MARGIN - badgeW;
    doc.roundedRect(badgeX, 52, badgeW, 18, 9).fill(COLORS.white);
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(statusColor)
      .text(statusLabel, badgeX, 57, { width: badgeW, align: 'center' });

    let y = 116;

    // ── Order meta strip: Order Date / Expected Delivery ──
    const metaColW = CONTENT_W / 2;
    doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.subtext)
      .text('ORDER DATE', MARGIN, y, { width: metaColW });
    doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.subtext)
      .text('EXPECTED DELIVERY', MARGIN + metaColW, y, { width: metaColW });
    y += 13;
    doc.fontSize(11).font('Helvetica').fillColor(COLORS.text)
      .text(dateStr(order.orderDate), MARGIN, y, { width: metaColW });
    doc.fontSize(11).font('Helvetica').fillColor(COLORS.brandDark)
      .text(dateStr(order.expectedDeliveryDate), MARGIN + metaColW, y, { width: metaColW });
    y += 28;

    doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).strokeColor(COLORS.border).lineWidth(1).stroke();
    y += 20;

    // ── Two-column info: Supplier | Shipping Address ──
    const colW = (CONTENT_W - 20) / 2;
    const col1X = MARGIN;
    const col2X = MARGIN + colW + 20;
    const infoTop = y;

    doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.subtext).text('SUPPLIER', col1X, y);
    doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.subtext).text('SHIPPING ADDRESS', col2X, y);
    y += 14;

    let y1 = y;
    doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.text)
      .text(order.supplierNameSnapshot || '—', col1X, y1, { width: colW });
    y1 = doc.y + 4;
    if (order.supplierContact) {
      const c = order.supplierContact;
      doc.fontSize(9).font('Helvetica').fillColor(COLORS.subtext);
      if (c.name) { doc.text(`${c.name}${c.role ? ' (' + c.role + ')' : ''}`, col1X, y1, { width: colW }); y1 = doc.y + 2; }
      if (c.email) { doc.text(c.email, col1X, y1, { width: colW }); y1 = doc.y + 2; }
      if (c.phone) { doc.text(c.phone, col1X, y1, { width: colW }); y1 = doc.y + 2; }
    }

    let y2 = y;
    doc.fontSize(10).font('Helvetica').fillColor(COLORS.text)
      .text(order.shippingAddress || '—', col2X, y2, { width: colW });
    y2 = doc.y;

    y = Math.max(y1, y2) + 20;

    doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).strokeColor(COLORS.border).lineWidth(1).stroke();
    y += 20;

    // ── Items table ──
    const items = order.items || [];
    const cols = [
      { key: 'name', label: 'ITEM', x: MARGIN, width: 190, align: 'left' },
      { key: 'sku', label: 'SKU', x: MARGIN + 190, width: 80, align: 'left' },
      { key: 'quantity', label: 'QTY', x: MARGIN + 270, width: 50, align: 'right' },
      { key: 'unitPrice', label: 'UNIT PRICE', x: MARGIN + 320, width: 85, align: 'right' },
      { key: 'lineTotal', label: 'TOTAL', x: MARGIN + 405, width: CONTENT_W - 405, align: 'right' },
    ];
    const ROW_H = 26;
    const HEADER_H = 24;

    const drawTableHeader = (yy) => {
      doc.rect(MARGIN, yy, CONTENT_W, HEADER_H).fill(COLORS.headerBg);
      cols.forEach((c) => {
        doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.subtext)
          .text(c.label, c.x + 8, yy + 8, { width: c.width - 16, align: c.align });
      });
      return yy + HEADER_H;
    };

    const pageBottomLimit = doc.page.height - 60; // leave room for footer

    y = drawTableHeader(y);

    if (items.length === 0) {
      doc.fontSize(10).font('Helvetica').fillColor(COLORS.muted)
        .text('No line items on this purchase order.', MARGIN, y + 10, { width: CONTENT_W, align: 'center' });
      y += 40;
    } else {
      items.forEach((item, idx) => {
        if (y + ROW_H > pageBottomLimit) {
          doc.addPage();
          y = MARGIN;
          y = drawTableHeader(y);
        }
        if (idx % 2 === 1) {
          doc.rect(MARGIN, y, CONTENT_W, ROW_H).fill(COLORS.rowAlt);
        }
        doc.fontSize(9.5).font('Helvetica').fillColor(COLORS.text);
        doc.text(item.name || '', cols[0].x + 8, y + 7, { width: cols[0].width - 16 });
        doc.fillColor(COLORS.subtext).text(item.sku || '', cols[1].x + 8, y + 7, { width: cols[1].width - 16 });
        doc.fillColor(COLORS.text).text(String(item.quantity ?? ''), cols[2].x, y + 7, { width: cols[2].width - 8, align: 'right' });
        doc.text(money(item.unitPrice), cols[3].x, y + 7, { width: cols[3].width - 8, align: 'right' });
        doc.font('Helvetica-Bold').fillColor(COLORS.brandDark)
          .text(money(item.lineTotal ?? (item.unitPrice || 0) * (item.quantity || 0)), cols[4].x, y + 7, { width: cols[4].width - 8, align: 'right' });

        doc.moveTo(MARGIN, y + ROW_H).lineTo(PAGE_W - MARGIN, y + ROW_H).strokeColor(COLORS.border).lineWidth(0.5).stroke();
        y += ROW_H;
      });
    }

    y += 16;

    // ── Totals box (boxed, right-aligned) ──
    const boxW = 220;
    const boxX = PAGE_W - MARGIN - boxW;
    if (y + 110 > pageBottomLimit) {
      doc.addPage();
      y = MARGIN;
    }
    const totalsRows = [
      ['Subtotal', money(order.subtotal)],
      [`Tax (${order.taxRate ?? 0}%)`, money(order.taxAmount)],
      ['Shipping & Handling', money(order.shippingHandling)],
    ];
    let ty = y;
    doc.fontSize(9.5).font('Helvetica');
    totalsRows.forEach(([label, value]) => {
      doc.fillColor(COLORS.subtext).text(label, boxX, ty, { width: boxW - 90 });
      doc.fillColor(COLORS.text).text(value, boxX + boxW - 90, ty, { width: 90, align: 'right' });
      ty += 16;
    });
    ty += 4;
    doc.moveTo(boxX, ty).lineTo(boxX + boxW, ty).strokeColor(COLORS.border).lineWidth(1).stroke();
    ty += 10;
    doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.text).text('Grand Total', boxX, ty, { width: boxW - 100 });
    doc.fontSize(13).font('Helvetica-Bold').fillColor(COLORS.brand)
      .text(money(order.grandTotal), boxX + boxW - 100, ty - 2, { width: 100, align: 'right' });
    y = ty + 30;

    // ── Internal notes ──
    if (order.internalNotes) {
      if (y + 60 > pageBottomLimit) {
        doc.addPage();
        y = MARGIN;
      }
      doc.moveTo(MARGIN, y).lineTo(PAGE_W - MARGIN, y).strokeColor(COLORS.border).lineWidth(1).stroke();
      y += 16;
      doc.fontSize(8).font('Helvetica-Bold').fillColor(COLORS.subtext).text('NOTES', MARGIN, y);
      y += 14;
      doc.fontSize(9.5).font('Helvetica').fillColor(COLORS.text)
        .text(order.internalNotes, MARGIN, y, { width: CONTENT_W });
    }

    // ── Footer + page numbers on every page ──
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      drawFooter(i, range.count);
    }

    doc.end();
    return doc;
  }
}

module.exports = new PurchaseOrderPageService();