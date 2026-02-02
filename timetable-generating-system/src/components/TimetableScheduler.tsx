import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function TimetableScheduler({ userRole, department }) {
  const [selectedDepartment, setSelectedDepartment] = useState(department || 'Computer Science');
  const [selectedLevel, setSelectedLevel] = useState('200');
  const [selectedGroup, setSelectedGroup] = useState('A');
  const [selectedSemester, setSelectedSemester] = useState('1st Semester');
  const [selectedSession, setSelectedSession] = useState('2025/2026');

  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);

  // New Entry Form State
  const [newEntry, setNewEntry] = useState({
    courseCode: '',
    courseTitle: '',
    lecturer: '',
    day: 'Monday',
    timeSlot: '8:00 AM - 9:00 AM',
    venue: '',
  });

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

  const venues = [
    'Bucodel Lab 1',
    'Bucodel Lab 2', 
    'Computing Lab 3',
    'Computing Lab 4',
    'Server Room',
    'Seminar Room A',
    'New Horizon',
    'LT 1',
    'LT 2',
    'LT 3',
  ];

  const departments = ['Computer Science', 'Software Engineering', 'Information Technology', 'Information Systems', 'Cyber Security'];
  const levels = ['200', '300', '400', '500'];
  const groups = ['A', 'B', 'C', 'D', 'E'];

  const checkConflicts = (entry: typeof newEntry): string[] => {
    const conflicts: string[] = [];

    // Check if slot is already taken
    const existingEntry = scheduleEntries.find(
      (e) => e.day === entry.day && e.timeSlot === entry.timeSlot
    );
    if (existingEntry) {
      conflicts.push(`Time slot already occupied by ${existingEntry.courseCode}`);
    }

    // Check lecturer conflict
    const lecturerConflict = scheduleEntries.find(
      (e) =>
        e.lecturer === entry.lecturer &&
        e.day === entry.day &&
        e.timeSlot === entry.timeSlot
    );
    if (lecturerConflict) {
      conflicts.push(`${entry.lecturer} has another class at this time`);
    }

    // Check venue conflict
    const venueConflict = scheduleEntries.find(
      (e) =>
        e.venue === entry.venue &&
        e.day === entry.day &&
        e.timeSlot === entry.timeSlot
    );
    if (venueConflict) {
      conflicts.push(`${entry.venue} is already booked for this time`);
    }

    // Check chapel time (Wednesday 10-12)
    if (
      entry.day === 'Wednesday' &&
      (entry.timeSlot === '10:00 AM - 11:00 AM' || entry.timeSlot === '11:00 AM - 12:00 PM')
    ) {
      conflicts.push('Chapel time on Wednesdays (10:00 AM - 12:00 PM)');
    }

    return conflicts;
  };

  const handleAddCourse = () => {
    const detectedConflicts = checkConflicts(newEntry);
    
    if (detectedConflicts.length > 0) {
      setConflicts(detectedConflicts);
      toast.error('Cannot add course - conflicts detected!');
      return;
    }

    const entry: ScheduleEntry = {
      id: Date.now().toString(),
      courseId: Date.now().toString(),
      courseCode: newEntry.courseCode,
      courseTitle: newEntry.courseTitle,
      lecturer: newEntry.lecturer,
      day: newEntry.day,
      timeSlot: newEntry.timeSlot,
      venue: newEntry.venue,
      classGroup: `${selectedLevel}${selectedGroup}`,
    };

    setScheduleEntries([...scheduleEntries, entry]);
    setIsAddingCourse(false);
    setConflicts([]);
    setNewEntry({
      courseCode: '',
      courseTitle: '',
      lecturer: '',
      day: 'Monday',
      timeSlot: '8:00 AM - 9:00 AM',
      venue: '',
    });
    toast.success('Course added to timetable!');
  };

  const handleRemoveCourse = (id: string) => {
    setScheduleEntries(scheduleEntries.filter((e) => e.id !== id));
    toast.success('Course removed from timetable');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0f2044]">Timetable Scheduler</h2>
          <p className="text-slate-600 mt-1">
            {userRole === 'school-officer'
              ? 'Schedule GEDS, GST, and SAT courses'
              : `Schedule ${selectedDepartment} courses`}
          </p>
        </div>
        <Button
          onClick={() => setIsAddingCourse(true)}
          className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
        >
          <Plus className="mr-2 size-4" />
          Add Course to Schedule
        </Button>
      </div>

      {/* Class Selection */}
      <Card className="border-l-4 border-l-[#ffb71b]">
        <CardHeader>
          <CardTitle className="text-[#0f2044]">Class Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {userRole === 'school-officer' && (
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Level</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Group</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group} value={group}>
                      Group {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Semester</Label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st Semester">1st Semester</SelectItem>
                  <SelectItem value="2nd Semester">2nd Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Session</Label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025/2026">2025/2026</SelectItem>
                  <SelectItem value="2024/2025">2024/2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Course Modal/Form */}
      {isAddingCourse && (
        <Card className="border-2 border-[#0f2044] shadow-lg">
          <CardHeader className="bg-[#0f2044] text-white">
            <div className="flex items-center justify-between">
              <CardTitle>Add Course to Schedule</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingCourse(false);
                  setConflicts([]);
                }}
                className="text-white hover:bg-white/20"
              >
                <X className="size-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {conflicts.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="size-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 mb-2">Conflicts Detected:</h4>
                    <ul className="space-y-1">
                      {conflicts.map((conflict, idx) => (
                        <li key={idx} className="text-sm text-red-700">
                          • {conflict}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="courseCode">Course Code *</Label>
                <Input
                  id="courseCode"
                  placeholder="e.g., COSC 201"
                  value={newEntry.courseCode}
                  onChange={(e) => setNewEntry({ ...newEntry, courseCode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="courseTitle">Course Title *</Label>
                <Input
                  id="courseTitle"
                  placeholder="e.g., Data Structures"
                  value={newEntry.courseTitle}
                  onChange={(e) => setNewEntry({ ...newEntry, courseTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lecturer">Lecturer *</Label>
                <Input
                  id="lecturer"
                  placeholder="e.g., Dr. John Smith"
                  value={newEntry.lecturer}
                  onChange={(e) => setNewEntry({ ...newEntry, lecturer: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="venue">Venue *</Label>
                <Select value={newEntry.venue} onValueChange={(value) => setNewEntry({ ...newEntry, venue: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((venue) => (
                      <SelectItem key={venue} value={venue}>
                        {venue}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="day">Day *</Label>
                <Select value={newEntry.day} onValueChange={(value) => setNewEntry({ ...newEntry, day: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeSlot">Time Slot *</Label>
                <Select
                  value={newEntry.timeSlot}
                  onValueChange={(value) => setNewEntry({ ...newEntry, timeSlot: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingCourse(false);
                  setConflicts([]);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCourse}
                className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
                disabled={
                  !newEntry.courseCode ||
                  !newEntry.courseTitle ||
                  !newEntry.lecturer ||
                  !newEntry.venue
                }
              >
                <Plus className="mr-2 size-4" />
                Add to Schedule
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduled Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#0f2044]">
            Scheduled Courses ({scheduleEntries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scheduleEntries.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Calendar className="size-12 mx-auto mb-4 text-slate-300" />
              <p>No courses scheduled yet. Click "Add Course to Schedule" to begin.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduleEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-[#ffb71b] transition-colors"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Course</p>
                      <p className="font-bold text-[#0f2044]">{entry.courseCode}</p>
                      <p className="text-sm text-slate-600">{entry.courseTitle}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Lecturer</p>
                      <div className="flex items-center gap-1">
                        <User className="size-3 text-slate-400" />
                        <p className="text-sm text-slate-700">{entry.lecturer}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Day</p>
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3 text-slate-400" />
                        <p className="text-sm text-slate-700">{entry.day}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Time</p>
                      <div className="flex items-center gap-1">
                        <Clock className="size-3 text-slate-400" />
                        <p className="text-sm text-slate-700">{entry.timeSlot}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Venue</p>
                      <div className="flex items-center gap-1">
                        <MapPin className="size-3 text-slate-400" />
                        <p className="text-sm text-slate-700">{entry.venue}</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCourse(entry.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {scheduleEntries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle className="size-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0f2044]">{scheduleEntries.length}</p>
                  <p className="text-sm text-slate-600">Courses Scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-full p-3">
                  <Clock className="size-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0f2044]">
                    {new Set(scheduleEntries.map((e) => `${e.day}-${e.timeSlot}`)).size}
                  </p>
                  <p className="text-sm text-slate-600">Time Slots Used</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 rounded-full p-3">
                  <MapPin className="size-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0f2044]">
                    {new Set(scheduleEntries.map((e) => e.venue)).size}
                  </p>
                  <p className="text-sm text-slate-600">Venues in Use</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}