import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, Clock, MapPin, User } from 'lucide-react';
import { Badge } from './ui/badge';

// Mock timetable data
const mockTimetable = [
  {
    day: 'Monday',
    classes: [
      {
        courseCode: 'COSC311',
        courseName: 'Data Structures & Algorithms',
        lecturer: 'Dr. Adeyemi Johnson',
        venue: 'CSC Lab 1',
        startTime: '08:00',
        endTime: '10:00',
      },
      {
        courseCode: 'COSC321',
        courseName: 'Database Management Systems',
        lecturer: 'Prof. Grace Okonkwo',
        venue: 'LT 3',
        startTime: '10:30',
        endTime: '12:30',
      },
    ],
  },
  {
    day: 'Tuesday',
    classes: [
      {
        courseCode: 'COSC331',
        courseName: 'Operating Systems',
        lecturer: 'Dr. Michael Eze',
        venue: 'CSC Lab 2',
        startTime: '09:00',
        endTime: '11:00',
      },
      {
        courseCode: 'COSC341',
        courseName: 'Software Engineering',
        lecturer: 'Engr. Sarah Adebayo',
        venue: 'LT 1',
        startTime: '14:00',
        endTime: '16:00',
      },
    ],
  },
  {
    day: 'Wednesday',
    classes: [
      {
        courseCode: 'COSC311',
        courseName: 'Data Structures & Algorithms',
        lecturer: 'Dr. Adeyemi Johnson',
        venue: 'LT 2',
        startTime: '08:00',
        endTime: '10:00',
      },
    ],
  },
  {
    day: 'Thursday',
    classes: [
      {
        courseCode: 'COSC351',
        courseName: 'Computer Networks',
        lecturer: 'Dr. Emmanuel Okoro',
        venue: 'CSC Lab 3',
        startTime: '10:00',
        endTime: '12:00',
      },
      {
        courseCode: 'COSC321',
        courseName: 'Database Management Systems',
        lecturer: 'Prof. Grace Okonkwo',
        venue: 'CSC Lab 1',
        startTime: '13:00',
        endTime: '15:00',
      },
    ],
  },
  {
    day: 'Friday',
    classes: [
      {
        courseCode: 'COSC331',
        courseName: 'Operating Systems',
        lecturer: 'Dr. Michael Eze',
        venue: 'LT 4',
        startTime: '09:00',
        endTime: '11:00',
      },
    ],
  },
];

export function PublicTimetableGrid({ filters, onDownloadPDF }: PublicTimetableGridProps) {
  return (
    <div className="bg-slate-50 py-8 pb-16">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[#0f2044] mb-2">Your Weekly Timetable</h2>
            <p className="text-slate-600">
              {filters.course.toUpperCase()} • {filters.level} Level - Group {filters.group} • {filters.semester === 'first' ? 'First' : 'Second'} Semester {filters.session}
            </p>
          </div>
          <Button
            onClick={onDownloadPDF}
            className="bg-[#ffb71b] hover:bg-[#ffb71b]/90 text-[#0f2044] font-semibold px-6"
            size="lg"
          >
            <Download className="mr-2 size-5" />
            Download PDF
          </Button>
        </div>

        {/* Conflict-Free Badge */}
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="bg-green-500 rounded-full p-2">
              <svg
                className="size-5 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">Conflict-Free Schedule</h3>
              <p className="text-sm text-green-700">
                This timetable has been verified and approved with no time conflicts
              </p>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              Verified
            </Badge>
          </CardContent>
        </Card>

        {/* Timetable Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {mockTimetable.map((daySchedule) => (
            <Card key={daySchedule.day} className="shadow-lg hover:shadow-xl transition-shadow border-t-4 border-t-[#ffb71b]">
              <CardHeader className="bg-[#0f2044] text-white rounded-t-lg pb-3">
                <CardTitle className="text-lg">{daySchedule.day}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {daySchedule.classes.length === 0 ? (
                  <p className="text-center text-slate-400 py-8 text-sm">No classes scheduled</p>
                ) : (
                  daySchedule.classes.map((entry, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover:bg-slate-100 transition-colors"
                    >
                      {/* Course Code & Name */}
                      <div className="mb-2">
                        <Badge className="bg-[#0f2044] text-white hover:bg-[#0f2044]/90 mb-1">
                          {entry.courseCode}
                        </Badge>
                        <p className="font-semibold text-sm text-[#0f2044] leading-tight">
                          {entry.courseName}
                        </p>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                        <Clock className="size-3 text-[#ffb71b]" />
                        <span>
                          {entry.startTime} - {entry.endTime}
                        </span>
                      </div>

                      {/* Venue */}
                      <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                        <MapPin className="size-3 text-[#ffb71b]" />
                        <span>{entry.venue}</span>
                      </div>

                      {/* Lecturer */}
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <User className="size-3 text-[#ffb71b]" />
                        <span className="truncate">{entry.lecturer}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}