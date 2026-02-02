import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateTimetablePDF(
  timetable,
  userName,
  userRole,
  userId
) {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('Weekly Timetable', 105, 20, { align: 'center' });
  
  // Add user info
  doc.setFontSize(11);
  doc.text(`Name: ${userName}`, 20, 35);
  doc.text(`${userRole === 'student' ? 'Matric Number' : 'Staff ID'}: ${userId}`, 20, 42);
  doc.text(`Role: ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`, 20, 49);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 56);
  
  // Add verification badge
  doc.setFontSize(10);
  doc.setTextColor(34, 197, 94); // Green color
  doc.text('✓ Conflict-Free and Approved', 150, 40);
  doc.setTextColor(0, 0, 0); // Reset to black
  
  // Group by days
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  let yPosition = 70;
  
  days.forEach((day) => {
    const dayEntries = timetable.filter(entry => entry.day === day);
    
    if (dayEntries.length > 0) {
      // Add day header
      doc.setFontSize(14);
      doc.setFillColor(3, 2, 19); // Primary color
      doc.rect(20, yPosition - 7, 170, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text(day, 25, yPosition);
      doc.setTextColor(0, 0, 0);
      
      yPosition += 10;
      
      // Create table data
      const tableData = dayEntries.map(entry => [
        entry.courseCode,
        entry.courseName,
        `${entry.startTime} - ${entry.endTime}`,
        entry.venue,
        entry.lecturer,
      ]);
      
      // Add table
      autoTable(doc, {
        startY: yPosition,
        head: [['Code', 'Course', 'Time', 'Venue', userRole === 'student' ? 'Lecturer' : 'Class']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [241, 245, 249], // slate-100
          textColor: [0, 0, 0],
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 50 },
          2: { cellWidth: 35 },
          3: { cellWidth: 40 },
          4: { cellWidth: 40 },
        },
        margin: { left: 20, right: 20 },
      });
      
      yPosition = doc.lastAutoTable.finalY + 15;
      
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
    }
  });
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount} | Computer-Aided Timetable Generation System`,
      105,
      285,
      { align: 'center' }
    );
  }
  
  // Save the PDF
  doc.save(`timetable-${userName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`);
}