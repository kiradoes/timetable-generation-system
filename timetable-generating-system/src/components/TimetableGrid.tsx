import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, MapPin, User } from 'lucide-react';

export function TimetableGrid({
  department,
  level,
  group,
  semester,
  session,
  entries,
}) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  const timeSlots = [
    '7:00 AM - 8:00 AM',
    '8:00 AM - 9:00 AM',
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 1:00 PM',
    '1:00 PM - 2:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM',
    '5:00 PM - 6:00 PM',
  ];

  const getEntry = (day, time) => {
    const entry = entries.find((e) => e.day === day && e.time === time);
    return entry?.course || null;
  };

  const isChapelTime = (time, day) => {
    return day === 'Wednesday' && (time === '10:00 AM - 11:00 AM' || time === '11:00 AM - 12:00 PM');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f2044] to-[#1a3a6b] text-white p-6 rounded-lg">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">BABCOCK UNIVERSITY</h2>
          <h3 className="text-xl">SCHOOL OF COMPUTING & ENGINEERING</h3>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Badge className="bg-[#ffb71b] text-[#0f2044] px-4 py-2 text-sm font-semibold">
              DEPARTMENT: {department.toUpperCase()}
            </Badge>
            <Badge className="bg-[#ffb71b] text-[#0f2044] px-4 py-2 text-sm font-semibold">
              LEVEL: {level}
            </Badge>
            <Badge className="bg-[#ffb71b] text-[#0f2044] px-4 py-2 text-sm font-semibold">
              GROUP: {group}
            </Badge>
            <Badge className="bg-[#ffb71b] text-[#0f2044] px-4 py-2 text-sm font-semibold">
              {semester} - {session}
            </Badge>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="overflow-x-auto">
        <Card className="border-2 border-[#0f2044]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#0f2044]">
                <th className="border-2 border-slate-300 p-3 text-white font-bold text-sm min-w-[120px]">
                  TIME
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className="border-2 border-slate-300 p-3 text-white font-bold text-sm min-w-[150px]"
                  >
                    {day.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time, timeIdx) => (
                <tr key={timeIdx} className="hover:bg-slate-50">
                  <td className="border-2 border-slate-300 p-2 bg-slate-100 font-semibold text-xs text-[#0f2044] text-center">
                    {time}
                  </td>
                  {days.map((day, dayIdx) => {
                    const course = getEntry(day, time);
                    const isChapel = isChapelTime(time, day);

                    if (isChapel) {
                      return (
                        <td
                          key={`${day}-${timeIdx}`}
                          className="border-2 border-slate-300 bg-blue-600 text-white relative"
                        >
                          {time === '10:00 AM - 11:00 AM' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="transform -rotate-0 text-center p-2">
                                <p className="font-bold text-lg tracking-widest writing-vertical">
                                  CHAPEL SEMINAR
                                </p>
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    }

                    return (
                      <td
                        key={`${day}-${timeIdx}`}
                        className={`border-2 border-slate-300 p-2 ${
                          course ? 'bg-slate-200' : 'bg-white'
                        }`}
                      >
                        {course && (
                          <div className="space-y-1">
                            <p className="font-bold text-xs text-[#0f2044]">
                              {course.courseCode}
                            </p>
                            <p className="text-xs text-slate-700 font-medium leading-tight">
                              {course.courseTitle}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-slate-600">
                              <User className="size-3" />
                              <span>{course.lecturer}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-600">
                              <MapPin className="size-3" />
                              <span>{course.venue}</span>
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-slate-200 border-2 border-slate-300"></div>
          <span className="text-slate-700">Scheduled Class</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white border-2 border-slate-300"></div>
          <span className="text-slate-700">Free Period</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 border-2 border-slate-300"></div>
          <span className="text-slate-700">Chapel/Special Event</span>
        </div>
      </div>
    </div>
  );
}