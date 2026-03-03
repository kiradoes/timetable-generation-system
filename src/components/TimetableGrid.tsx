import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, MapPin, User } from 'lucide-react';

/** e.g. { event_type, day_of_week, start_time, end_time, event_name?, level? } */
const defaultSpecialEvents = [];

function parseSlotHours(slotStr) {
  // "10:00 AM - 11:00 AM" -> { start: 10, end: 11 }
  const match = slotStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  const to24 = (h, ampm) => {
    const n = parseInt(h, 10);
    if (ampm.toUpperCase() === 'PM' && n !== 12) return n + 12;
    if (ampm.toUpperCase() === 'AM' && n === 12) return 0;
    return n;
  };
  return {
    start: to24(match[1], match[3]) + parseInt(match[2], 10) / 60,
    end: to24(match[4], match[6]) + parseInt(match[5], 10) / 60,
  };
}

function parseTimeToHour(t) {
  if (!t) return 0;
  const s = String(t).trim();
  const [h, m] = s.split(':').map((x) => parseInt(x, 10) || 0);
  return h + (m || 0) / 60;
}

export function TimetableGrid({
  department,
  level,
  group,
  semester,
  session,
  entries,
  specialEvents = defaultSpecialEvents,
}) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const levelNum = level != null ? Number(level) : null;

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

  const parseEventLevel = (ev) => {
    if (ev.level != null) return Number(ev.level);
    if (!ev.description) return null;
    const m = String(ev.description).match(/Level\s*(\d+)/i);
    return m ? parseInt(m[1], 10) : null;
  };
  const getSpecialEventForSlot = (day, time) => {
    const slot = parseSlotHours(time);
    if (!slot || !specialEvents.length) return null;
    for (const ev of specialEvents) {
      const dayMatch = ev.day_of_week === 'All' || ev.day_of_week === day;
      const evLevel = parseEventLevel(ev);
      const levelMatch = evLevel == null || evLevel === levelNum;
      const evStart = parseTimeToHour(ev.start_time);
      const evEnd = parseTimeToHour(ev.end_time);
      const overlaps = slot.start < evEnd && slot.end > evStart;
      if (dayMatch && levelMatch && overlaps) return ev;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f2044] to-[#1a3a6b] text-white p-6 rounded-lg">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">BABCOCK UNIVERSITY</h2>
          <h3 className="text-xl">SCHOOL OF COMPUTING & ENGINEERING</h3>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Badge className="bg-slate-200 text-slate-700 px-4 py-2 text-sm font-semibold">
              DEPARTMENT: {department.toUpperCase()}
            </Badge>
            <Badge className="bg-slate-200 text-slate-700 px-4 py-2 text-sm font-semibold">
              LEVEL: {level}
            </Badge>
            <Badge className="bg-slate-200 text-slate-700 px-4 py-2 text-sm font-semibold">
              GROUP: {group}
            </Badge>
            <Badge className="bg-slate-200 text-slate-700 px-4 py-2 text-sm font-semibold">
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
                    const specialEvent = getSpecialEventForSlot(day, time);

                    if (specialEvent) {
                      const label = (specialEvent.event_name || specialEvent.event_type || '').toUpperCase();
                      return (
                        <td
                          key={`${day}-${timeIdx}`}
                          className="border-2 border-slate-300 bg-blue-600 text-white relative"
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center p-2">
                              <p className="font-bold text-sm tracking-wide">
                                {label}
                              </p>
                            </div>
                          </div>
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