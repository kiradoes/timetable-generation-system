import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { 
  Clock, 
  MapPin, 
  User, 
  X, 
  Plus,
  BookOpen,
  Sparkles,
  Download,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { ConflictDetectionPanel } from './ConflictDetectionPanel';
import { MissingCoursesPanel } from './MissingCoursesPanel';
import { SmartValidationPanel } from './SmartValidationPanel';
import { ApprovalWorkflow } from './ApprovalWorkflow';

export function DynamicTimetableGrid() {
  const [scheduledClasses, setScheduledClasses] = useState<ScheduledClass[]>([
    {
      id: '1',
      courseCode: 'COSC311',
      courseName: 'Data Structures & Algorithms',
      lecturer: 'Dr. Adeyemi Johnson',
      venue: 'CSC Lab 1',
      group: 'Group A',
      startTime: '08:00',
      endTime: '10:00',
      day: 'Monday',
    },
    {
      id: '2',
      courseCode: 'COSC321',
      courseName: 'Database Management Systems',
      lecturer: 'Prof. Grace Okonkwo',
      venue: 'LT 3',
      group: 'Group A',
      startTime: '10:30',
      endTime: '12:30',
      day: 'Monday',
    },
  ]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; timeSlot: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>({ status: 'pending' });

  const handleAddClass = (slot: { day: string; timeSlot: string }) => {
    setSelectedSlot(slot);
    setIsAddModalOpen(true);
  };

  const handleSaveClass = (classData: Omit<ScheduledClass, 'id' | 'day' | 'startTime' | 'endTime'>) => {
    if (!selectedSlot) return;

    const [startTime, endTime] = selectedSlot.timeSlot.split(' - ');
    const newClass: ScheduledClass = {
      id: String(scheduledClasses.length + 1),
      ...classData,
      day: selectedSlot.day,
      startTime,
      endTime,
    };

    setScheduledClasses([...scheduledClasses, newClass]);
    setIsAddModalOpen(false);
    setSelectedSlot(null);
    toast.success('Class scheduled successfully!');
  };

  const handleRemoveClass = (id: string) => {
    setScheduledClasses(scheduledClasses.filter(c => c.id !== id));
    toast.success('Class removed from schedule');
  };

  const getClassesForSlot = (day: string, timeSlot: string) => {
    const [startTime] = timeSlot.split(' - ');
    return scheduledClasses.filter(
      c => c.day === day && c.startTime === startTime
    );
  };

  const handleGenerateTimetable = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock generated timetable
    const generated: ScheduledClass[] = [
      {
        id: '100',
        courseCode: 'COSC311',
        courseName: 'Data Structures & Algorithms',
        lecturer: 'Dr. Adeyemi Johnson',
        venue: 'CSC Lab 1',
        group: 'Group A',
        startTime: '08:00',
        endTime: '10:00',
        day: 'Monday',
      },
      {
        id: '101',
        courseCode: 'COSC321',
        courseName: 'Database Management Systems',
        lecturer: 'Prof. Grace Okonkwo',
        venue: 'LT 3',
        group: 'Group A',
        startTime: '10:30',
        endTime: '12:30',
        day: 'Monday',
      },
      {
        id: '102',
        courseCode: 'COSC331',
        courseName: 'Operating Systems',
        lecturer: 'Dr. Michael Eze',
        venue: 'CSC Lab 2',
        group: 'Group A',
        startTime: '08:00',
        endTime: '10:00',
        day: 'Tuesday',
      },
      {
        id: '103',
        courseCode: 'COSC341',
        courseName: 'Software Engineering',
        lecturer: 'Engr. Sarah Adebayo',
        venue: 'LT 1',
        group: 'Group A',
        startTime: '13:00',
        endTime: '15:00',
        day: 'Tuesday',
      },
      {
        id: '104',
        courseCode: 'COSC311',
        courseName: 'Data Structures & Algorithms',
        lecturer: 'Dr. Adeyemi Johnson',
        venue: 'LT 2',
        group: 'Group B',
        startTime: '08:00',
        endTime: '10:00',
        day: 'Wednesday',
      },
      {
        id: '105',
        courseCode: 'COSC351',
        courseName: 'Computer Networks',
        lecturer: 'Dr. Emmanuel Okoro',
        venue: 'CSC Lab 3',
        group: 'Group A',
        startTime: '10:30',
        endTime: '12:30',
        day: 'Thursday',
      },
      {
        id: '106',
        courseCode: 'COSC321',
        courseName: 'Database Management Systems',
        lecturer: 'Prof. Grace Okonkwo',
        venue: 'CSC Lab 1',
        group: 'Group B',
        startTime: '13:00',
        endTime: '15:00',
        day: 'Thursday',
      },
      {
        id: '107',
        courseCode: 'COSC331',
        courseName: 'Operating Systems',
        lecturer: 'Dr. Michael Eze',
        venue: 'LT 4',
        group: 'Group B',
        startTime: '08:00',
        endTime: '10:00',
        day: 'Friday',
      },
    ];

    setScheduledClasses(generated);
    setIsGenerating(false);
    toast.success('Timetable generated successfully! Review and submit for approval.');
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#0f2044]">Schedule Teaching</h2>
            <p className="text-slate-600 mt-1">Create and manage class schedules</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleGenerateTimetable}
              disabled={isGenerating}
              className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 size-4" />
                  Auto-Generate Timetable
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="border-[#0f2044] text-[#0f2044] hover:bg-[#0f2044]/5"
            >
              <Download className="mr-2 size-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-blue-700 mb-1">Scheduled Classes</p>
                <p className="text-3xl font-bold text-blue-900">{scheduledClasses.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-green-700 mb-1">Conflicts</p>
                <p className="text-3xl font-bold text-green-900">0</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-purple-700 mb-1">Venues Used</p>
                <p className="text-3xl font-bold text-purple-900">
                  {new Set(scheduledClasses.map(c => c.venue)).size}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-orange-700 mb-1">Contact Hours</p>
                <p className="text-3xl font-bold text-orange-900">{scheduledClasses.length * 2}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timetable Grid */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-[#0f2044] flex items-center gap-2">
              <Clock className="size-5 text-[#ffb71b]" />
              Weekly Timetable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header Row */}
                <div className="grid grid-cols-6 gap-2 mb-2">
                  <div className="font-semibold text-[#0f2044] text-sm p-3 bg-slate-100 rounded-lg">
                    Time / Day
                  </div>
                  {days.map((day) => (
                    <div
                      key={day}
                      className="font-semibold text-[#0f2044] text-sm p-3 bg-slate-100 rounded-lg text-center"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Time Slot Rows */}
                {timeSlots.map((timeSlot) => (
                  <div key={timeSlot} className="grid grid-cols-6 gap-2 mb-2">
                    <div className="text-sm p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center font-medium text-slate-700">
                      {timeSlot}
                    </div>
                    {days.map((day) => {
                      const classes = getClassesForSlot(day, timeSlot);
                      return (
                        <div
                          key={`${day}-${timeSlot}`}
                          className="min-h-[120px] p-2 bg-white rounded-lg border-2 border-dashed border-slate-200 hover:border-[#ffb71b]/50 transition-colors relative group"
                        >
                          {classes.length === 0 ? (
                            <button
                              onClick={() => handleAddClass({ day, timeSlot })}
                              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <div className="bg-[#0f2044] text-white rounded-full p-2">
                                <Plus className="size-4" />
                              </div>
                            </button>
                          ) : (
                            <div className="space-y-2">
                              {classes.map((cls) => (
                                <div
                                  key={cls.id}
                                  className="bg-gradient-to-br from-[#0f2044] to-[#1a3a6b] text-white p-2 rounded-lg relative group/card"
                                >
                                  <button
                                    onClick={() => handleRemoveClass(cls.id)}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/card:opacity-100 transition-opacity"
                                  >
                                    <X className="size-3" />
                                  </button>
                                  <p className="font-mono text-xs font-semibold text-[#ffb71b] mb-1">
                                    {cls.courseCode}
                                  </p>
                                  <p className="text-xs font-medium line-clamp-2 mb-2">
                                    {cls.courseName}
                                  </p>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-xs text-slate-200">
                                      <User className="size-3" />
                                      <span className="truncate">{cls.lecturer}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-200">
                                      <MapPin className="size-3" />
                                      <span className="truncate font-bold">{cls.venue}</span>
                                    </div>
                                  </div>
                                  <Badge className="mt-2 bg-[#ffb71b]/20 text-[#ffb71b] border-[#ffb71b]/30 text-xs">
                                    {cls.group}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        {scheduledClasses.length > 0 && (
          <Card className="shadow-md bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[#0f2044] mb-1">
                    Ready to submit your timetable?
                  </h3>
                  <p className="text-sm text-slate-600">
                    Review all scheduled classes and submit for approval
                  </p>
                </div>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  Submit for Approval
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AddClassModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedSlot(null);
        }}
        onSave={handleSaveClass}
        selectedSlot={selectedSlot}
      />
    </>
  );
}

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: Omit<ScheduledClass, 'id' | 'day' | 'startTime' | 'endTime'>) => void;
  selectedSlot: { day: string; timeSlot: string } | null;
}

function AddClassModal({ isOpen, onClose, onSave, selectedSlot }: AddClassModalProps) {
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [lecturer, setLecturer] = useState('');
  const [venue, setVenue] = useState('');
  const [group, setGroup] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ courseCode, courseName, lecturer, venue, group });
    
    // Reset form
    setCourseCode('');
    setCourseName('');
    setLecturer('');
    setVenue('');
    setGroup('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-t-4 border-t-[#ffb71b]">
        <DialogHeader>
          <div className="mx-auto bg-[#0f2044] rounded-full p-3">
            <BookOpen className="size-8 text-[#ffb71b]" />
          </div>
          <DialogTitle className="text-2xl text-center text-[#0f2044]">
            Schedule Class
          </DialogTitle>
          <DialogDescription className="text-center">
            {selectedSlot && `${selectedSlot.day} • ${selectedSlot.timeSlot}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courseCode" className="text-[#0f2044] font-semibold">
                Course Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="courseCode"
                placeholder="e.g., COSC311"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                required
                className="border-slate-300 focus:border-[#ffb71b] focus:ring-[#ffb71b]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="group" className="text-[#0f2044] font-semibold">
                Group <span className="text-red-500">*</span>
              </Label>
              <select
                id="group"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-md border border-slate-300 focus:border-[#ffb71b] focus:ring-1 focus:ring-[#ffb71b] bg-white"
              >
                <option value="">Select group</option>
                <option value="Group A">Group A</option>
                <option value="Group B">Group B</option>
                <option value="Group C">Group C</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="courseName" className="text-[#0f2044] font-semibold">
              Course Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="courseName"
              placeholder="e.g., Data Structures & Algorithms"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              required
              className="border-slate-300 focus:border-[#ffb71b] focus:ring-[#ffb71b]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lecturer" className="text-[#0f2044] font-semibold">
              Lecturer <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lecturer"
              placeholder="e.g., Dr. Adeyemi Johnson"
              value={lecturer}
              onChange={(e) => setLecturer(e.target.value)}
              required
              className="border-slate-300 focus:border-[#ffb71b] focus:ring-[#ffb71b]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue" className="text-[#0f2044] font-semibold">
              Venue <span className="text-red-500">*</span>
            </Label>
            <select
              id="venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              required
              className="w-full h-10 px-3 rounded-md border border-slate-300 focus:border-[#ffb71b] focus:ring-1 focus:ring-[#ffb71b] bg-white"
            >
              <option value="">Select venue</option>
              <option value="LT 1">LT 1</option>
              <option value="LT 2">LT 2</option>
              <option value="LT 3">LT 3</option>
              <option value="LT 4">LT 4</option>
              <option value="CSC Lab 1">CSC Lab 1</option>
              <option value="CSC Lab 2">CSC Lab 2</option>
              <option value="CSC Lab 3">CSC Lab 3</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
            >
              Schedule Class
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}