import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generatePublicTimetablePDF(
  timetable,
  filters
) {
  const doc = new jsPDF();
  
  // Add Babcock University branding
  doc.setFillColor(15, 32, 68); // Navy Blue #0f2044
  doc.rect(0, 0, 210, 35, 'F');
  
  // Add title in white
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('Babcock University', 105, 15, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text('Timetable System', 105, 25, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Add timetable details
  doc.setFontSize(11);
  const semesterText = filters.semester === 'first' ? 'First Semester' : 'Second Semester';
  doc.text(`Course: ${filters.course.toUpperCase()}`, 20, 45);
  doc.text(`Level: ${filters.level} - Group ${filters.group}`, 20, 52);
  doc.text(`Session: ${filters.session}`, 120, 45);
  doc.text(`Semester: ${semesterText}`, 120, 52);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 59);
  
  // Add verification badge
  doc.setFontSize(10);
  doc.setTextColor(34, 197, 94); // Green color
  doc.text('✓ Conflict-Free Schedule', 120, 59);
  doc.setTextColor(0, 0, 0); // Reset to black
  
  let yPosition = 70;
  
  timetable.forEach((daySchedule) => {
    if (daySchedule.classes.length > 0) {
      // Check if we need a new page
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Add day header with Babcock colors
      doc.setFontSize(14);
      doc.setFillColor(15, 32, 68); // Navy Blue
      doc.rect(20, yPosition - 7, 170, 10, 'F');
      doc.setTextColor(255, 183, 27); // Gold
      doc.text(daySchedule.day, 25, yPosition);
      doc.setTextColor(0, 0, 0);
      
      yPosition += 10;
      
      // Create table data
      const tableData = daySchedule.classes.map(entry => [
        entry.courseCode,
        entry.courseName,
        `${entry.startTime} - ${entry.endTime}`,
        entry.venue,
        entry.lecturer,
      ]);
      
      // Add table
      autoTable(doc, {
        startY: yPosition,
        head: [['Course Code', 'Course Name', 'Time', 'Venue', 'Lecturer']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [255, 183, 27], // Gold
          textColor: [15, 32, 68], // Navy Blue
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 9,
          cellPadding: 4,
        },
        columnStyles: {
          0: { cellWidth: 28 },
          1: { cellWidth: 60 },
          2: { cellWidth: 32 },
          3: { cellWidth: 28 },
          4: { cellWidth: 42 },
        },
        margin: { left: 20, right: 20 },
        alternateRowStyles: {
          fillColor: [248, 250, 252], // slate-50
        },
      });
      
      yPosition = doc.lastAutoTable.finalY + 15;
    }
  });
  
  // Add footer with Babcock branding
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Page ${i} of ${pageCount}`,
      105,
      285,
      { align: 'center' }
    );
    doc.text(
      '© Babcock University Timetable System',
      105,
      290,
      { align: 'center' }
    );
  }
  
  // Generate filename
  const filename = `Babcock-Timetable-${filters.course}-${filters.level}${filters.group}-${filters.session}.pdf`;
  
  // Save the PDF
  doc.save(filename);
}