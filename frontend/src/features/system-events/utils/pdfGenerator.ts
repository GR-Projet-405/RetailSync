import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { SystemEvent } from '../types';

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function exportSystemEventsToPDF(
  events: SystemEvent[],
  severityFilter: string,
  eventTypeFilter: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();

  // Draw a subtle header accent bar
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, pageWidth, 4, 'F');

  // Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('RetailSync - Systems Event Logs', 14, 18);

  // Metadata block
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500

  const generatedAt = `Generated on: ${new Date().toLocaleString()}`;
  const filtersApplied = `Filters: Severity = ${severityFilter === 'ALL' ? 'All Levels' : severityFilter} | Event Type = ${eventTypeFilter === 'ALL' ? 'All Types' : eventTypeFilter}`;
  const totalRecords = `Total Events Exported: ${events.length}`;

  doc.text(generatedAt, 14, 25);
  doc.text(filtersApplied, 14, 30);
  doc.text(totalRecords, 14, 35);

  // Table Columns
  const headers = ['Timestamp', 'Severity', 'Event ID', 'Source', 'Message', 'Action'];

  // Table Data mapping
  const data = events.map((event) => {
    const messageText = event.subtitle
      ? `${event.message}\n(${event.subtitle})`
      : event.message;

    return [
      formatTimestamp(event.timestamp),
      event.severity,
      event.eventId,
      event.source,
      messageText,
      event.action,
    ];
  });

  // Render Table
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 42,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59], // Slate-800
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85], // Slate-700
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Slate-50
    },
    columnStyles: {
      0: { cellWidth: 32 }, // Timestamp (mono-friendly spacing)
      1: { cellWidth: 18 }, // Severity
      2: { cellWidth: 18 }, // Event ID
      3: { cellWidth: 26 }, // Source
      4: { cellWidth: 'auto' }, // Message (variable width)
      5: { cellWidth: 20 }, // Action
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body') {
        // Render mono-style font for Timestamp and Event ID
        if (hookData.column.index === 0 || hookData.column.index === 2) {
          hookData.cell.styles.font = 'Courier';
        }

        // Color code severity levels
        if (hookData.column.index === 1) {
          const val = hookData.cell.raw;
          if (val === 'CRITICAL') {
            hookData.cell.styles.textColor = [185, 28, 28]; // red-700
            hookData.cell.styles.fontStyle = 'bold';
          } else if (val === 'ERROR') {
            hookData.cell.styles.textColor = [220, 38, 38]; // red-600
            hookData.cell.styles.fontStyle = 'bold';
          } else if (val === 'WARNING') {
            hookData.cell.styles.textColor = [217, 119, 6]; // amber-600
            hookData.cell.styles.fontStyle = 'bold';
          } else if (val === 'INFO') {
            hookData.cell.styles.textColor = [37, 99, 235]; // blue-600
          }
        }
      }
    },
    margin: { top: 40, bottom: 15 },
    styles: {
      overflow: 'linebreak',
    },
    didDrawPage: (drawData) => {
      // Footer page numbering
      const totalPages = doc.internal.pages.length - 1; // getNumberOfPages() equivalent
      const currentPage = drawData.pageNumber;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      
      const footerText = `Page ${currentPage} of ${totalPages}`;
      doc.text(
        footerText,
        pageWidth - doc.getTextWidth(footerText) - 14,
        doc.internal.pageSize.getHeight() - 10
      );
      doc.text(
        'RetailSync System Monitor',
        14,
        doc.internal.pageSize.getHeight() - 10
      );
    },
  });

  // Save the document
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileSeverity = severityFilter.toLowerCase();
  const fileType = eventTypeFilter.toLowerCase().replace(/\s+/g, '-');
  doc.save(`system-events-${fileSeverity}-${fileType}-${dateStr}.pdf`);
}
