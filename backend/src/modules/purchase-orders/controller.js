const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

// GET /purchase-orders — list (with search/status/supplier filters + pagination)
const getDetails = asyncHandler(async (req, res) => {
  const data = await service.fetchDetails(req.query);
  res.status(200).json({
    success: true,
    message: 'Purchase Orders module active.',
    timestamp: new Date().toISOString(),
    data,
  });
});

// GET /purchase-orders/:id — single PO (workflow / review / detail screen, or reopening a draft)
const getById = asyncHandler(async (req, res) => {
  const data = await service.fetchById(req.params.id);
  res.status(200).json({ success: true, data });
});

// GET /purchase-orders/suppliers?search= — Step 1: supplier typeahead
const searchSuppliers = asyncHandler(async (req, res) => {
  const data = await service.searchSuppliers(req.query.search);
  res.status(200).json({ success: true, data });
});

// GET /purchase-orders/suppliers/:id — Step 1: supplier contact autofill
const getSupplierDetail = asyncHandler(async (req, res) => {
  const data = await service.getSupplierDetail(req.params.id);
  res.status(200).json({ success: true, data });
});

// GET /purchase-orders/catalog?search=&supplierId= — Step 2: product catalog + stock
const searchCatalog = asyncHandler(async (req, res) => {
  const data = await service.searchCatalog(req.query.search, req.query.supplierId);
  res.status(200).json({ success: true, data });
});

// GET /purchase-orders/init/:supplierId — pull supplier + contact defaults
const initFromSupplier = asyncHandler(async (req, res) => {
  const data = await service.initFromSupplier(req.params.supplierId);
  res.status(200).json({ success: true, data });
});

// POST /purchase-orders — create (Step 3: "Save as Draft" or "Send to Supplier")
const create = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const data = await service.create(req.body, userId);
  res.status(201).json({ success: true, message: 'Purchase order created.', data });
});

// PATCH /purchase-orders/:id — update items/notes/addresses (draft edit or resubmit)
const update = asyncHandler(async (req, res) => {
  const data = await service.update(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Purchase order updated.', data });
});

// POST /purchase-orders/:id/send — Draft -> Sent (also emails the supplier)
const send = asyncHandler(async (req, res) => {
  const data = await service.send(req.params.id);
  res.status(200).json({ success: true, message: 'Purchase order sent to supplier.', data });
});

// POST /purchase-orders/:id/withdraw — Sent -> Draft
const withdraw = asyncHandler(async (req, res) => {
  const data = await service.withdraw(req.params.id);
  res.status(200).json({ success: true, message: 'Purchase order withdrawn to drafts.', data });
});

// POST /purchase-orders/:id/receive — Sent/Partially Received -> Partially/Fully Received
//
// Accepts either shape:
//  (a) JSON body { fullyReceived: true|false }  — general API usage
//  (b) ?mode=ALL | ?mode=PARTIAL query string, no body — used by the
//      Order Tracking page's quick "Receive All" / "Receive Partially"
//      buttons, which POST with no request body.
// The query string takes precedence when present.
const receive = asyncHandler(async (req, res) => {
  const mode = req.query.mode;
  const fullyReceived = mode ? mode === 'ALL' : !!req.body?.fullyReceived;
  const data = await service.receive(req.params.id, { fullyReceived });
  res.status(200).json({
    success: true,
    message: `Purchase order marked ${data.status.toLowerCase().replace('_', ' ')}.`,
    data,
  });
});

// POST /purchase-orders/:id/cancel — any non-final status -> Cancelled
const cancel = asyncHandler(async (req, res) => {
  const data = await service.cancel(req.params.id);
  res.status(200).json({ success: true, message: 'Purchase order cancelled.', data });
});

// DELETE /purchase-orders/:id — Discard (Draft only)
const discard = asyncHandler(async (req, res) => {
  const data = await service.discard(req.params.id);
  res.status(200).json({ success: true, message: 'Purchase order discarded.', data });
});

// GET /purchase-orders/:id/pdf — download/inline-view a PDF of the PO
// Used by the "Download PDF" button on the Approval Workflow page.
const downloadPdf = asyncHandler(async (req, res) => {
  const order = await service.fetchById(req.params.id); // 404s consistently if missing
  const doc = await service.generatePdf(req.params.id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${order.poNumber}.pdf"`);
  doc.pipe(res);
});

// GET /purchase-orders/:id/email-preview — HTML preview of the supplier email
// Opened in a new tab by the "Click to preview full email body" link.
const emailPreview = asyncHandler(async (req, res) => {
  const { to, subject, html } = await service.getEmailPreview(req.params.id);
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <div style="padding:24px;font-family:Arial,sans-serif;background:#f9fafb;">
      <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:24px;">
        <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">To: ${to || '—'}</div>
        <div style="font-size:14px;color:#111827;margin-bottom:16px;"><strong>Subject:</strong> ${subject}</div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin-bottom:16px;" />
        ${html}
      </div>
    </div>
  `);
});

// POST /purchase-orders/:id/resend-email — resend the supplier email
// Used by the "Resend Email" button on the Supplier Order Details page.
const resendEmail = asyncHandler(async (req, res) => {
  const data = await service.resendEmail(req.params.id);
  res.status(200).json({ success: true, message: 'Email resent to supplier.', data });
});

module.exports = {
  getDetails,
  getById,
  searchSuppliers,
  getSupplierDetail,
  searchCatalog,
  initFromSupplier,
  create,
  update,
  send,
  withdraw,
  receive,
  cancel,
  discard,
  downloadPdf,
  emailPreview,
  resendEmail,
};