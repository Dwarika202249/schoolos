import jsPDF from 'jspdf';

interface ReportData {
  student: any;
  school: any;
  term: any;
  results: Array<{
    subjectName: string;
    subjectCode: string;
    maxMarks: number;
    passingMarks: number;
    obtainedMarks: number | null;
    percentage: number | null;
    grade: string | null;
    status: string;
  }>;
}

const formatValue = (val: any) => (val === null || val === undefined ? '—' : val);

export const generateReportCard = ({ student, school, term, results }: ReportData) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = margin;

  // ── 1. External Border ──────────────────────────────────────────────────
  doc.setDrawColor(20, 20, 40);
  doc.setLineWidth(0.5);
  doc.rect(5, 5, pageW - 10, pageH - 10);
  doc.setDrawColor(180, 180, 200);
  doc.setLineWidth(0.1);
  doc.rect(6.5, 6.5, pageW - 13, pageH - 13);

  // ── 2. Header Block ─────────────────────────────────────────────────────
  // School Info
  doc.setFillColor(30, 30, 50);
  doc.rect(margin, y, contentW, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(school?.name || 'School Name', pageW / 2, y + 15, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 220);
  doc.text(school?.address || 'School Address Line 1, City, State', pageW / 2, y + 22, { align: 'center' });
  doc.text(`Email: ${school?.email || '—'} | Phone: ${school?.phone || '—'}`, pageW / 2, y + 27, { align: 'center' });
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`ACADEMIC PROGRESS REPORT - ${term?.name || 'TERM'}`, pageW / 2, y + 42, { align: 'center' });
  
  y += 50;

  // ── 3. Student Profile Block ─────────────────────────────────────────────
  doc.setFillColor(248, 250, 255);
  doc.roundedRect(margin, y, contentW, 28, 2, 2, 'F');
  doc.setDrawColor(220, 225, 240);
  doc.roundedRect(margin, y, contentW, 28, 2, 2, 'D');

  const studentName = `${student?.userId?.firstName || ''} ${student?.userId?.lastName || ''}`.trim() || 'Unknown Student';
  const className = student?.classId?.displayName || '—';
  const rollNo = student?.admissionNumber || '—';

  doc.setTextColor(100, 110, 140);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('STUDENT NAME', margin + 5, y + 8);
  doc.text('CLASS / SECTION', margin + contentW / 2, y + 8);
  doc.text('ADMISSION NO.', margin + (contentW * 0.75), y + 8);

  doc.setTextColor(20, 25, 50);
  doc.setFontSize(11);
  doc.text(studentName.toUpperCase(), margin + 5, y + 16);
  doc.text(className, margin + contentW / 2, y + 16);
  doc.text(rollNo, margin + (contentW * 0.75), y + 16);

  y += 40;

  // ── 4. Marks Table ───────────────────────────────────────────────────────
  // Header
  doc.setFillColor(30, 30, 50);
  doc.rect(margin, y, contentW, 10, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('SUBJECT', margin + 5, y + 6.5);
  doc.text('MAX', margin + contentW * 0.45, y + 6.5, { align: 'center' });
  doc.text('PASS', margin + contentW * 0.6, y + 6.5, { align: 'center' });
  doc.text('OBTAINED', margin + contentW * 0.75, y + 6.5, { align: 'center' });
  doc.text('GRADE', margin + contentW - 5, y + 6.5, { align: 'right' });

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  let totalMax = 0;
  let totalObtained = 0;

  results.forEach((res, i) => {
    const bgColor = i % 2 === 0 ? [252, 253, 255] : [245, 248, 255];
    doc.setFillColor(...(bgColor as [number, number, number]));
    doc.rect(margin, y, contentW, 10, 'F');
    
    doc.setTextColor(40, 45, 70);
    doc.text(res.subjectName, margin + 5, y + 6.5);
    
    doc.text(res.maxMarks.toString(), margin + contentW * 0.45, y + 6.5, { align: 'center' });
    doc.text(res.passingMarks.toString(), margin + contentW * 0.6, y + 6.5, { align: 'center' });
    
    const isPass = (res.obtainedMarks || 0) >= res.passingMarks;
    doc.setTextColor(res.status === 'PRESENT' ? (isPass ? 30 : 200) : 150, res.status === 'PRESENT' ? (isPass ? 150 : 30) : 150, 30);
    doc.setFont('helvetica', 'bold');
    doc.text(res.status === 'PRESENT' ? formatValue(res.obtainedMarks) : res.status, margin + contentW * 0.75, y + 6.5, { align: 'center' });
    
    doc.setTextColor(30, 30, 100);
    doc.text(formatValue(res.grade), margin + contentW - 5, y + 6.5, { align: 'right' });

    totalMax += res.maxMarks;
    totalObtained += res.obtainedMarks || 0;
    
    y += 10;
    doc.setFont('helvetica', 'normal');
  });

  // ── 5. Summary & Footer ──────────────────────────────────────────────────
  y += 5;
  const overallPercent = Math.round((totalObtained / (totalMax || 1)) * 100);
  
  doc.setFillColor(30, 30, 50, 0.05);
  doc.roundedRect(margin + contentW / 2, y, contentW / 2, 35, 2, 2, 'F');

  doc.setTextColor(100, 110, 140);
  doc.setFontSize(9);
  doc.text('Grand Total:', margin + contentW / 2 + 5, y + 10);
  doc.text('Percentage:', margin + contentW / 2 + 5, y + 20);
  doc.text('Final Result:', margin + contentW / 2 + 5, y + 30);

  doc.setTextColor(20, 30, 60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`${totalObtained} / ${totalMax}`, margin + contentW - 5, y + 10, { align: 'right' });
  doc.text(`${overallPercent}%`, margin + contentW - 5, y + 20, { align: 'right' });
  
  const isOverallPass = results.every(r => (r.obtainedMarks || 0) >= r.passingMarks);
  doc.setTextColor(isOverallPass ? 34 : 220, isOverallPass ? 150 : 50, isOverallPass ? 94 : 50);
  doc.text(isOverallPass ? 'PROMOTED / PASSED' : 'DETAINED / FAILED', margin + contentW - 5, y + 30, { align: 'right' });

  // Signatures
  y += 55;
  doc.setDrawColor(200, 200, 220);
  doc.setLineWidth(0.3);
  
  doc.line(margin + 10, y, margin + 50, y);
  doc.line(pageW / 2 - 20, y, pageW / 2 + 20, y);
  doc.line(margin + contentW - 50, y, margin + contentW - 10, y);

  doc.setTextColor(100, 110, 140);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Class Teacher', margin + 30, y + 5, { align: 'center' });
  doc.text('Principal', pageW / 2, y + 5, { align: 'center' });
  doc.text('Guardian', margin + contentW - 30, y + 5, { align: 'center' });

  // Footer Branding
  const footerY = pageH - 12;
  doc.setFontSize(7);
  doc.setTextColor(180, 180, 200);
  doc.text('Generated via SchoolOS Alpha | Digital Academic Record', pageW / 2, footerY, { align: 'center' });

  // Save
  doc.save(`Result-${studentName.replace(/\s+/g, '-')}-${term?.name?.replace(/\s+/g, '-')}.pdf`);
};
