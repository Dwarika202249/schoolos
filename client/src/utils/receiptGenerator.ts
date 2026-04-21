import jsPDF from 'jspdf';

interface ReceiptData {
  invoice: any;
  transactions: any[];
  schoolName: string;
}

const formatCurrency = (paise: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(paise / 100);

/**
 * Generates a clean, branded PDF receipt for a fee payment.
 * Uses jsPDF directly (no autoTable) to avoid dependency issues.
 */
export const generateFeeReceipt = ({ invoice, transactions, schoolName }: ReceiptData) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });

  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentW = pageW - margin * 2;
  let y = margin;

  // ── Header Block ─────────────────────────────────────────────────────────
  // School name (top center)
  doc.setFillColor(30, 30, 50);
  doc.rect(0, 0, pageW, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(schoolName || 'School', pageW / 2, 11, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 200);
  doc.text('FEE PAYMENT RECEIPT', pageW / 2, 18, { align: 'center' });

  // Invoice # and date
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`#${invoice.invoiceNumber}`, pageW / 2, 24, { align: 'center' });

  y = 36;

  // ── Student Info Block ────────────────────────────────────────────────────
  const student = invoice.studentId;
  const studentName = `${student?.userId?.firstName || ''} ${student?.userId?.lastName || ''}`.trim() || 'Unknown';
  const admNo = student?.admissionNumber || '—';
  const className = student?.classId?.displayName || student?.classId?.grade ? `Class ${student?.classId?.grade}` : '—';

  doc.setFillColor(245, 245, 252);
  doc.setDrawColor(220, 220, 240);
  doc.roundedRect(margin, y, contentW, 22, 3, 3, 'FD');

  doc.setTextColor(80, 80, 100);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('STUDENT', margin + 4, y + 5);
  doc.text('ADM. NO.', margin + contentW / 2, y + 5);
  doc.text('CLASS', margin + (contentW * 3) / 4, y + 5);

  doc.setTextColor(20, 20, 40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(studentName, margin + 4, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(admNo, margin + contentW / 2, y + 13);
  doc.text(className, margin + (contentW * 3) / 4, y + 13);

  // Issue date
  doc.setTextColor(120, 120, 140);
  doc.setFontSize(7);
  doc.text(
    `Issued: ${new Date(invoice.issuedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
    margin + 4, y + 19
  );

  y += 28;

  // ── Fee Items Table ────────────────────────────────────────────────────────
  doc.setFillColor(30, 30, 50);
  doc.rect(margin, y, contentW, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('DESCRIPTION', margin + 4, y + 5);
  doc.text('AMOUNT', margin + contentW - 4, y + 5, { align: 'right' });

  y += 7;
  doc.setFont('helvetica', 'normal');

  (invoice.items || []).forEach((item: any, i: number) => {
    const bgColor = i % 2 === 0 ? [252, 252, 255] : [245, 245, 250];
    doc.setFillColor(...(bgColor as [number, number, number]));
    doc.rect(margin, y, contentW, 7, 'F');

    doc.setTextColor(30, 30, 50);
    doc.setFontSize(8);
    doc.text(item.name || 'Fee', margin + 4, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(item.amount), margin + contentW - 4, y + 5, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    y += 7;
  });

  // Totals
  y += 3;
  doc.setDrawColor(200, 200, 220);
  doc.line(margin, y, margin + contentW, y);
  y += 4;

  const totalsY = y;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 100);
  doc.text('Total Invoice', margin + 4, totalsY + 5);
  doc.text(formatCurrency(invoice.totalAmount), margin + contentW - 4, totalsY + 5, { align: 'right' });

  doc.text('Amount Paid', margin + 4, totalsY + 12);
  doc.setTextColor(34, 197, 94);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(invoice.paidAmount), margin + contentW - 4, totalsY + 12, { align: 'right' });

  doc.setTextColor(239, 68, 68);
  doc.setFont('helvetica', 'normal');
  doc.text('Balance Due', margin + 4, totalsY + 19);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(Math.max(0, invoice.dueAmount)), margin + contentW - 4, totalsY + 19, { align: 'right' });

  y = totalsY + 26;

  // ── Payment History ────────────────────────────────────────────────────────
  if (transactions.length > 0) {
    y += 3;
    doc.setFillColor(30, 30, 50);
    doc.rect(margin, y, contentW, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('PAYMENT TRANSACTIONS', margin + 4, y + 5);
    doc.text('DATE', margin + contentW * 0.42, y + 5);
    doc.text('METHOD', margin + contentW * 0.66, y + 5);
    doc.text('AMOUNT', margin + contentW - 4, y + 5, { align: 'right' });
    y += 7;

    transactions.forEach((tx: any, i: number) => {
      const bgColor = i % 2 === 0 ? [252, 252, 255] : [245, 245, 250];
      doc.setFillColor(...(bgColor as [number, number, number]));
      doc.rect(margin, y, contentW, 7, 'F');

      doc.setTextColor(30, 30, 50);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(tx.notes || 'Payment', margin + 4, y + 5);
      doc.text(
        new Date(tx.transactionDate || tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }),
        margin + contentW * 0.42, y + 5
      );
      doc.text((tx.paymentMethod || '').replace('_', ' '), margin + contentW * 0.66, y + 5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 197, 94);
      doc.text(formatCurrency(tx.amount), margin + contentW - 4, y + 5, { align: 'right' });

      y += 7;
    });
  }

  // ── Status Badge ────────────────────────────────────────────────────────────
  y += 6;
  const statusColor = invoice.status === 'PAID' ? [34, 197, 94] : invoice.status === 'PARTIAL' ? [234, 179, 8] : [239, 68, 68];
  doc.setFillColor(...(statusColor as [number, number, number]));
  doc.roundedRect(pageW / 2 - 15, y, 30, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text(invoice.status, pageW / 2, y + 5.5, { align: 'center' });

  // ── Footer ──────────────────────────────────────────────────────────────────
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setDrawColor(200, 200, 220);
  doc.line(margin, footerY - 4, pageW - margin, footerY - 4);
  doc.setTextColor(150, 150, 170);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.text('This is a computer-generated receipt and does not require a signature.', pageW / 2, footerY, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleString('en-IN')}`, pageW / 2, footerY + 4, { align: 'center' });

  // Save
  doc.save(`Receipt-${invoice.invoiceNumber}.pdf`);
};
