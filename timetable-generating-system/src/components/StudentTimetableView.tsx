import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Download, 
  Calendar, 
  Clock, 
  MapPin, 
  BookOpen, 
  User,
  ArrowLeft,
  FileDown,
  Printer
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function StudentTimetableView({
  session,
  semester,
  course,
  level,
  group,
  onBack
}) {
  const [isExporting, setIsExporting] = useState(false);

  // Mock timetable data - in production, this would come from your backend
  const timetableData = [
    {
      day: 'Monday',
      time: '8:00 AM - 10:00 AM',
      courseCode: 'COSC 424',
      courseTitle: 'Advanced Algorithms',
      venue: 'LT 1',
      lecturer: 'Dr. Adeyemi Johnson'
    },
    {
      day: 'Monday',
      time: '10:00 AM - 12:00 PM',
      courseCode: 'SENG 406',
      courseTitle: 'Software Testing',
      venue: 'Bucodel Lab 1',
      lecturer: 'Prof. Grace Okonkwo'
    },
    {
      day: 'Monday',
      time: '2:00 PM - 4:00 PM',
      courseCode: 'GEDS 420',
      courseTitle: 'Research Methodology',
      venue: 'New Horizon',
      lecturer: 'Dr. Oluwaseun Adebayo'
    },
    {
      day: 'Tuesday',
      time: '8:00 AM - 10:00 AM',
      courseCode: 'ITGY 409',
      courseTitle: 'IT Governance',
      venue: 'LT 2',
      lecturer: 'Dr. Michael Eze'
    },
    {
      day: 'Tuesday',
      time: '12:00 PM - 2:00 PM',
      courseCode: 'COSC 422',
      courseTitle: 'Database Systems',
      venue: 'Computing Lab 3',
      lecturer: 'Dr. Sarah Okonkwo'
    },
    {
      day: 'Wednesday',
      time: '8:00 AM - 10:00 AM',
      courseCode: 'SENG 408',
      courseTitle: 'Agile Development',
      venue: 'Bucodel Lab 2',
      lecturer: 'Prof. Grace Okonkwo'
    },
    // Chapel time is blocked 10am-12pm on Wednesday
    {
      day: 'Wednesday',
      time: '10:00 AM - 12:00 PM',
      courseCode: 'CHAPEL',
      courseTitle: 'Chapel Service',
      venue: 'University Chapel',
      lecturer: 'University Chaplain'
    },
    {
      day: 'Wednesday',
      time: '2:00 PM - 4:00 PM',
      courseCode: 'COSC 424',
      courseTitle: 'Advanced Algorithms',
      venue: 'LT 1',
      lecturer: 'Dr. Adeyemi Johnson'
    },
    {
      day: 'Thursday',
      time: '8:00 AM - 10:00 AM',
      courseCode: 'BU-GST 220',
      courseTitle: 'Entrepreneurship',
      venue: 'New Horizon',
      lecturer: 'Prof. Chioma Nwosu'
    },
    {
      day: 'Thursday',
      time: '10:00 AM - 12:00 PM',
      courseCode: 'ITGY 409',
      courseTitle: 'IT Governance',
      venue: 'LT 3',
      lecturer: 'Dr. Michael Eze'
    },
    {
      day: 'Thursday',
      time: '2:00 PM - 4:00 PM',
      courseCode: 'SENG 406',
      courseTitle: 'Software Testing',
      venue: 'Bucodel Lab 1',
      lecturer: 'Prof. Grace Okonkwo'
    },
    {
      day: 'Friday',
      time: '8:00 AM - 10:00 AM',
      courseCode: 'COSC 422',
      courseTitle: 'Database Systems',
      venue: 'Computing Lab 3',
      lecturer: 'Dr. Sarah Okonkwo'
    },
    {
      day: 'Friday',
      time: '10:00 AM - 12:00 PM',
      courseCode: 'BU-SEN 212',
      courseTitle: 'Spiritual Development',
      venue: 'LT 2',
      lecturer: 'Pastor Emmanuel Okafor'
    },
  ];

  // Time slots for the timetable
  const timeSlots = [
    '7:00 AM - 8:00 AM',
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM',
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Get course name from the course code
  const getCourseName = (courseCode: string) => {
    const courseMap: { [key: string]: string } = {
      'computer-science': 'Computer Science',
      'software-engineering': 'Software Engineering',
      'information-technology': 'Information Technology',
      'information-systems': 'Information Systems',
      'cyber-security': 'Cyber Security',
    };
    return courseMap[course] || course;
  };

  // Function to get entry for a specific day and time
  const getEntryForSlot = (day: string, timeSlot: string) => {
    return timetableData.find(entry => 
      entry.day === day && entry.time === timeSlot
    );
  };

  // Export to PDF function
  const exportToPDF = async () => {
    setIsExporting(true);
    
    try {
      // Create new PDF document
      const doc = new jsPDF('landscape');
      
      // Add BUCC branding
      doc.setFillColor(15, 32, 68); // Navy blue
      doc.rect(0, 0, 297, 30, 'F');
      
      // Add title
      doc.setTextColor(255, 183, 27); // Gold
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('BUCC TIMETABLE', 148.5, 12, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Babcock University Computing Consortium', 148.5, 20, { align: 'center' });
      
      // Add student details
      doc.setTextColor(15, 32, 68);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const detailsY = 38;
      doc.text(`Academic Session: ${session}`, 14, detailsY);
      doc.text(`Semester: ${semester}`, 14, detailsY + 6);
      doc.text(`Course: ${getCourseName(course)}`, 14, detailsY + 12);
      doc.text(`Level: ${level}`, 150, detailsY);
      doc.text(`Group: ${group}`, 150, detailsY + 6);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, 150, detailsY + 12);
      
      // Prepare table data
      const tableData = timeSlots.map(timeSlot => {
        const row = [timeSlot];
        days.forEach(day => {
          const entry = getEntryForSlot(day, timeSlot);
          if (entry) {
            if (entry.courseCode === 'CHAPEL') {
              row.push('CHAPEL\nUniversity Chapel');
            } else {
              row.push(`${entry.courseCode}\n${entry.courseTitle}\n${entry.venue}\n${entry.lecturer}`);
            }
          } else {
            row.push('-');
          }
        });
        return row;
      });
      
      // Add table
      autoTable(doc, {
        startY: detailsY + 20,
        head: [['Time', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [15, 32, 68],
          textColor: [255, 183, 27],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center',
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 3,
          valign: 'middle',
        },
        columnStyles: {
          0: { cellWidth: 35, fontStyle: 'bold', halign: 'center' },
          1: { cellWidth: 48 },
          2: { cellWidth: 48 },
          3: { cellWidth: 48 },
          4: { cellWidth: 48 },
          5: { cellWidth: 48 },
        },
        styles: {
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        didParseCell: (data) => {
          // Highlight chapel time
          if (data.row.index !== undefined && data.column.index !== undefined) {
            const cellText = data.cell.text.join(' ');
            if (cellText.includes('CHAPEL')) {
              data.cell.styles.fillColor = [255, 251, 235];
              data.cell.styles.textColor = [15, 32, 68];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        },
      });
      
      // Add footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Page ${i} of ${pageCount} | BUCC Timetable System`,
          148.5,
          205,
          { align: 'center' }
        );
      }
      
      // Save the PDF
      const fileName = `BUCC_Timetable_${getCourseName(course)}_${level}_Group${group}_${semester}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#0f2044] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#ffb71b] rounded-lg p-2">
                <Calendar className="size-6 text-[#0f2044]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">BUCC Timetable</h1>
                <p className="text-xs text-[#ffb71b]">Academic Schedule</p>
              </div>
            </div>
            <Button
              onClick={onBack}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to Search
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Info Card */}
        <Card className="mb-6 shadow-lg border-t-4 border-t-[#ffb71b]">
          <CardHeader className="bg-gradient-to-r from-[#0f2044] to-[#1a3a6b]">
            <CardTitle className="text-white">Your Timetable Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Academic Session</p>
                <p className="text-sm font-semibold text-[#0f2044]">{session}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Semester</p>
                <p className="text-sm font-semibold text-[#0f2044]">{semester} Semester</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Course of Study</p>
                <p className="text-sm font-semibold text-[#0f2044]">{getCourseName(course)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Level</p>
                <p className="text-sm font-semibold text-[#0f2044]">{level} Level</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 font-medium">Group</p>
                <p className="text-sm font-semibold text-[#0f2044]">Group {group}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Buttons */}
        <div className="flex justify-end gap-3 mb-6">
          <Button
            onClick={exportToPDF}
            disabled={isExporting}
            className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
          >
            {isExporting ? (
              <>
                <div className="mr-2 size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 size-4" />
                Export as PDF
              </>
            )}
          </Button>
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="border-[#0f2044] text-[#0f2044] hover:bg-[#0f2044]/5"
          >
            <Printer className="mr-2 size-4" />
            Print
          </Button>
        </div>

        {/* Timetable Grid */}
        <Card className="shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
            <CardTitle className="text-[#0f2044] flex items-center gap-2">
              <Calendar className="size-5 text-[#ffb71b]" />
              Weekly Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#0f2044]">
                    <th className="border border-slate-300 p-3 text-left text-white font-semibold w-32">
                      <Clock className="inline-block mr-2 size-4" />
                      Time
                    </th>
                    {days.map(day => (
                      <th key={day} className="border border-slate-300 p-3 text-center text-white font-semibold">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((timeSlot, index) => (
                    <tr key={timeSlot} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="border border-slate-300 p-3 font-medium text-[#0f2044] text-sm">
                        {timeSlot}
                      </td>
                      {days.map(day => {
                        const entry = getEntryForSlot(day, timeSlot);
                        const isChapel = entry?.courseCode === 'CHAPEL';
                        
                        return (
                          <td 
                            key={day} 
                            className={`border border-slate-300 p-3 ${
                              isChapel 
                                ? 'bg-amber-50' 
                                : entry 
                                ? 'bg-white' 
                                : 'bg-slate-50'
                            }`}
                          >
                            {entry ? (
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <Badge 
                                    className={
                                      isChapel
                                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                                        : 'bg-[#0f2044] text-white'
                                    }
                                  >
                                    {entry.courseCode}
                                  </Badge>
                                </div>
                                <p className="text-sm font-semibold text-[#0f2044] leading-tight">
                                  {entry.courseTitle}
                                </p>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-xs text-slate-600">
                                    <MapPin className="size-3" />
                                    <span>{entry.venue}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-slate-600">
                                    <User className="size-3" />
                                    <span>{entry.lecturer}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center text-slate-400 text-sm">-</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="size-4 bg-amber-50 border border-amber-300 rounded"></div>
            <span className="text-sm text-slate-600">Chapel Time (Wednesday 10-12pm)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-4 bg-white border border-slate-300 rounded"></div>
            <span className="text-sm text-slate-600">Scheduled Class</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-4 bg-slate-50 border border-slate-300 rounded"></div>
            <span className="text-sm text-slate-600">Free Period</span>
          </div>
        </div>

        {/* Course List */}
        <Card className="mt-6 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50">
            <CardTitle className="text-[#0f2044] flex items-center gap-2">
              <BookOpen className="size-5 text-[#ffb71b]" />
              Course Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              {Array.from(new Set(timetableData.map(entry => entry.courseCode)))
                .filter(code => code !== 'CHAPEL')
                .map(courseCode => {
                  const course = timetableData.find(e => e.courseCode === courseCode);
                  return course ? (
                    <div key={courseCode} className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="bg-[#0f2044] rounded-full p-2">
                        <BookOpen className="size-4 text-[#ffb71b]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[#0f2044]">{course.courseCode}</p>
                        <p className="text-sm text-slate-600 mt-1">{course.courseTitle}</p>
                        <p className="text-xs text-slate-500 mt-2">Lecturer: {course.lecturer}</p>
                      </div>
                    </div>
                  ) : null;
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}