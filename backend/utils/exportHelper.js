const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const FIELD_DEFINITIONS = {
  orderId: { label: 'Order ID', getValue: (sale) => sale.transactionId || sale._id || '-' },
  dateTime: {
    label: 'Date & Time',
    getValue: (sale) => (sale.createdAt ? new Date(sale.createdAt).toLocaleString('en-US') : '-'),
  },
  customer: {
    label: 'Customer',
    getValue: (sale) =>
      sale.customer?.name ||
      sale.customer?.fullName ||
      [sale.customer?.firstName, sale.customer?.lastName].filter(Boolean).join(' ').trim() ||
      'Walk-in Customer',
  },
  items: {
    label: 'Items',
    getValue: (sale) =>
      (sale.items || [])
        .map((item) => {
          const productName = item.product?.name || item.productName || 'Item';
          const quantity = item.quantity || 1;
          return `${productName} x${quantity}`;
        })
        .join(', '),
  },
  totalAmount: {
    label: 'Total Amount',
    getValue: (sale) => Number(sale.totalAmount || 0),
  },
  paymentMethod: {
    label: 'Payment Method',
    getValue: (sale) => sale.paymentMethod || '-',
  },
  status: {
    label: 'Status',
    getValue: (sale) => sale.status || '-',
  },
  cashier: {
    label: 'Cashier',
    getValue: (sale) =>
      sale.cashier?.name ||
      sale.cashier?.fullName ||
      [sale.cashier?.firstName, sale.cashier?.lastName].filter(Boolean).join(' ').trim() ||
      sale.cashier?.username ||
      '-',
  },
  discount: {
    label: 'Discount',
    getValue: (sale) => Number(sale.discountTotal || 0),
  },
  branch: {
    label: 'Branch',
    getValue: (sale) => sale.branch?.name || '-',
  },
};

const DEFAULT_FIELDS = [
  'orderId',
  'dateTime',
  'customer',
  'items',
  'totalAmount',
  'paymentMethod',
  'status',
  'cashier',
  'discount',
  'branch',
];

const normalizeFields = (fields = []) => {
  const requested = Array.isArray(fields)
    ? fields
    : String(fields || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

  const validFields = requested.filter((field) => FIELD_DEFINITIONS[field]);
  return validFields.length ? validFields : DEFAULT_FIELDS;
};

const buildRows = (data = [], fields = []) => {
  const selectedFields = normalizeFields(fields);

  return data.map((sale) => {
    const row = {};

    selectedFields.forEach((field) => {
      row[field] = FIELD_DEFINITIONS[field].getValue(sale);
    });

    return row;
  });
};

const generateExcel = async (data = [], fields = []) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'RetailSync';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Sales Report');
  const selectedFields = normalizeFields(fields);
  const rows = buildRows(data, selectedFields);
  const headers = selectedFields.map((field) => FIELD_DEFINITIONS[field].label);

  worksheet.addRow(headers);

  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' },
    };
    cell.font = {
      color: { argb: 'FFFFFFFF' },
      bold: true,
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
    };
  });

  rows.forEach((row) => {
    const record = selectedFields.map((field) => row[field]);
    worksheet.addRow(record);
  });

  worksheet.columns = selectedFields.map((field) => ({
    key: field,
    width: Math.max(FIELD_DEFINITIONS[field].label.length + 2, 16),
  }));

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    });
  });

  worksheet.columns.forEach((column, index) => {
    const maxLength = Math.max(
      FIELD_DEFINITIONS[selectedFields[index]].label.length,
      ...rows.map((row) => String(row[selectedFields[index]] ?? '').length)
    );

    column.width = Math.min(Math.max(maxLength + 2, 14), 42);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

const addTableHeader = (doc, columns, startX, startY, columnWidths, rowHeight) => {
  doc.save();
  doc.fillColor('#2563EB').rect(startX, startY, columnWidths.reduce((sum, width) => sum + width, 0), rowHeight).fill();
  doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(10);

  let cursorX = startX;

  columns.forEach((column, index) => {
    doc.text(column, cursorX + 6, startY + 6, {
      width: columnWidths[index] - 12,
      align: 'left',
      lineBreak: false,
    });
    cursorX += columnWidths[index];
  });

  doc.restore();
};

const generatePDF = async (data = [], fields = []) => {
  const records = Array.isArray(data) ? data : data.records || [];
  const meta = Array.isArray(data) ? {} : data.meta || {};
  const selectedFields = normalizeFields(fields);
  const columns = selectedFields.map((field) => FIELD_DEFINITIONS[field].label);
  const pageWidth = 842;
  const pageHeight = 595;
  const margin = 36;
  const rowHeight = 22;
  const columnWidths = selectedFields.map((field) => {
    const base = FIELD_DEFINITIONS[field].label.length;
    if (field === 'items') return 170;
    if (field === 'customer' || field === 'cashier' || field === 'branch') return 100;
    if (field === 'dateTime') return 110;
    if (field === 'totalAmount' || field === 'discount') return 85;
    return Math.max(70, Math.min(base * 8 + 24, 120));
  });

  return await new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin,
      bufferPages: true,
    });

    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const startX = margin;
    let cursorY = margin;

    doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(20).text('RetailSync', startX, cursorY);
    cursorY += 24;
    doc.fillColor('#64748B').font('Helvetica').fontSize(11).text('Sales Report', startX, cursorY);
    cursorY += 14;
    doc.text(meta.dateRangeLabel || 'All available records', startX, cursorY);
    cursorY += 22;

    doc.moveTo(startX, cursorY).lineTo(pageWidth - margin, cursorY).strokeColor('#E2E8F0').stroke();
    cursorY += 12;

    addTableHeader(doc, columns, startX, cursorY, columnWidths, rowHeight);
    cursorY += rowHeight;

    records.forEach((sale, index) => {
      if (cursorY + rowHeight > pageHeight - margin - 30) {
        doc.addPage();
        cursorY = margin;
        addTableHeader(doc, columns, startX, cursorY, columnWidths, rowHeight);
        cursorY += rowHeight;
      }

      const rowValues = selectedFields.map((field) => String(FIELD_DEFINITIONS[field].getValue(sale) ?? ''));
      let cursorX = startX;

      doc.fillColor(index % 2 === 0 ? '#FFFFFF' : '#F8FAFC');
      doc.rect(startX, cursorY, columnWidths.reduce((sum, width) => sum + width, 0), rowHeight).fill();
      doc.fillColor('#0F172A').font('Helvetica').fontSize(9);

      rowValues.forEach((value, valueIndex) => {
        doc.text(value, cursorX + 6, cursorY + 6, {
          width: columnWidths[valueIndex] - 12,
          ellipsis: true,
          lineBreak: false,
        });
        cursorX += columnWidths[valueIndex];
      });

      cursorY += rowHeight;
    });

    const range = doc.bufferedPageRange();
    for (let pageIndex = 0; pageIndex < range.count; pageIndex += 1) {
      doc.switchToPage(pageIndex);
      doc.fillColor('#94A3B8').fontSize(9).font('Helvetica');
      doc.text(`Page ${pageIndex + 1} of ${range.count}`, margin, pageHeight - margin + 10, {
        align: 'right',
        width: pageWidth - margin * 2,
      });
    }

    doc.end();
  });
};

module.exports = {
  generateExcel,
  generatePDF,
  normalizeFields,
  FIELD_DEFINITIONS,
};