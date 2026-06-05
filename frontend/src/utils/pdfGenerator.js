import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Generate Class Report PDF
export const exportClassPDF = (classObj) => {
  const doc = new jsPDF();
  const title = `Class Report: ${classObj.name}`;
  
  // Header Style
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(79, 70, 229); // Indigo 600
  doc.text(title, 14, 20);

  // Metadata
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(`Academic Year: ${classObj.year}`, 14, 28);
  doc.text(`Assigned Teacher: ${classObj.teacher?.name || 'Unassigned'} (${classObj.teacher?.email || 'N/A'})`, 14, 34);
  doc.text(`Student Count: ${classObj.students?.length || 0} / Limit: ${classObj.studentLimit}`, 14, 40);
  doc.text(`Class Fee: $${classObj.fees}`, 14, 46);
  doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 14, 52);

  // Divider Line
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.line(14, 58, 196, 58);

  // Student Table
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text('Student Roster', 14, 68);

  const tableHeaders = [['#', 'Name', 'Gender', 'D.O.B.', 'Contact Phone', 'Fees Paid']];
  const tableData = classObj.students?.map((s, idx) => [
    idx + 1,
    s.name,
    s.gender,
    new Date(s.dob).toLocaleDateString(),
    s.phone,
    `$${s.feesPaid || 0}`
  ]) || [];

  doc.autoTable({
    startY: 74,
    head: tableHeaders,
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229], // Indigo 600
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [51, 65, 85]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // Slate 50
    }
  });

  // Save the PDF
  const filename = `${classObj.name.toLowerCase().replace(/\s+/g, '_')}_report.pdf`;
  doc.save(filename);
};

// Generate Fee History Report PDF
export const exportFeesPDF = (payments, filterText = '') => {
  const doc = new jsPDF();
  
  // Header Style
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(79, 70, 229);
  doc.text('Financial Fees Ledger', 14, 20);

  // Metadata
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  if (filterText) {
    doc.text(`Search Filter: "${filterText}"`, 14, 28);
  }
  doc.text(`Total Payments Count: ${payments.length}`, 14, 34);
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  doc.text(`Aggregate Fees Collected: $${totalAmount}`, 14, 40);
  doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 14, 46);

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 52, 196, 52);

  // Payment Table
  const tableHeaders = [['Receipt #', 'Student Name', 'Class Name', 'Payment Date', 'Payment Method', 'Amount', 'Remarks']];
  const tableData = payments.map((p) => [
    p._id.substring(18).toUpperCase(), // Short receipt ID
    p.student?.name || 'N/A',
    p.student?.class?.name || 'Unlinked',
    new Date(p.date).toLocaleDateString(),
    p.paymentMethod,
    `$${p.amount}`,
    p.remarks || '-'
  ]);

  doc.autoTable({
    startY: 58,
    head: tableHeaders,
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [51, 65, 85]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  doc.save('fees_ledger_report.pdf');
};
