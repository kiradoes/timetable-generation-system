import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Settings, Calendar, Clock, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function AcademicSettingsPanel() {
  const [currentSession, setCurrentSession] = useState('2025-2026');
  const [currentSemester, setCurrentSemester] = useState('first');
  const [timeSlots, setTimeSlots] = useState([
    { id: '1', startTime: '08:00', endTime: '10:00' },
    { id: '2', startTime: '10:30', endTime: '12:30' },
    { id: '3', startTime: '13:00', endTime: '15:00' },
    { id: '4', startTime: '15:30', endTime: '17:30' },
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [newSlot, setNewSlot] = useState({ startTime: '', endTime: '' });

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (day: string) => {
    if (settings.activeDays.includes(day)) {
      setSettings({
        ...settings,
        activeDays: settings.activeDays.filter(d => d !== day),
      });
    } else {
      setSettings({
        ...settings,
        activeDays: [...settings.activeDays, day],
      });
    }
  };

  const addTimeSlot = () => {
    if (!newSlot.startTime || !newSlot.endTime) {
      toast.error('Please enter both start and end times');
      return;
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newSlot.startTime) || !timeRegex.test(newSlot.endTime)) {
      toast.error('Invalid time format. Use HH:MM (e.g., 08:00)');
      return;
    }

    // Check if end time is after start time
    const start = new Date(`2000-01-01T${newSlot.startTime}`);
    const end = new Date(`2000-01-01T${newSlot.endTime}`);
    if (end <= start) {
      toast.error('End time must be after start time');
      return;
    }

    const newTimeSlot: TimeSlot = {
      id: String(timeSlots.length + 1),
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
    };

    setTimeSlots([...timeSlots, newTimeSlot]);

    setNewSlot({ startTime: '', endTime: '' });
    toast.success('Time slot added successfully');
  };

  const removeTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
    toast.success('Time slot removed');
  };

  const handleSave = () => {
    if (settings.activeDays.length === 0) {
      toast.error('Please select at least one active day');
      return;
    }

    if (timeSlots.length === 0) {
      toast.error('Please add at least one time slot');
      return;
    }

    setIsEditing(false);
    toast.success('Academic settings updated successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0f2044]">Academic Settings</h2>
          <p className="text-slate-600 mt-1">Configure global academic parameters</p>
        </div>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-[#0f2044] hover:bg-[#0f2044]/90"
          >
            <Settings className="mr-2 size-4" />
            Edit Settings
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              <X className="mr-2 size-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="mr-2 size-4" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Academic Session & Semester */}
      <Card className="shadow-md border-l-4 border-l-[#ffb71b]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0f2044]">
            <Calendar className="size-5 text-[#ffb71b]" />
            Active Academic Period
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Academic Session */}
            <div className="space-y-2">
              <Label htmlFor="session" className="text-[#0f2044] font-semibold">
                Academic Session
              </Label>
              {isEditing ? (
                <Input
                  id="session"
                  placeholder="e.g., 2025-2026"
                  value={currentSession}
                  onChange={(e) => setCurrentSession(e.target.value)}
                  className="border-slate-300"
                />
              ) : (
                <div className="h-10 px-3 flex items-center rounded-md border border-slate-200 bg-slate-50">
                  <span className="font-semibold text-[#0f2044]">{currentSession}</span>
                </div>
              )}
            </div>

            {/* Semester */}
            <div className="space-y-2">
              <Label htmlFor="semester" className="text-[#0f2044] font-semibold">
                Current Semester
              </Label>
              {isEditing ? (
                <select
                  id="semester"
                  value={currentSemester}
                  onChange={(e) => setCurrentSemester(e.target.value as 'first' | 'second')}
                  className="w-full h-10 px-3 rounded-md border border-slate-300 focus:border-[#ffb71b] focus:ring-1 focus:ring-[#ffb71b] bg-white"
                >
                  <option value="first">First Semester</option>
                  <option value="second">Second Semester</option>
                </select>
              ) : (
                <div className="h-10 px-3 flex items-center rounded-md border border-slate-200 bg-slate-50">
                  <span className="font-semibold text-[#0f2044]">
                    {currentSemester === 'first' ? 'First Semester' : 'Second Semester'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Current Status Badge */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Currently Active</p>
                <p className="font-bold text-[#0f2044] text-lg">
                  {currentSession} • {currentSemester === 'first' ? 'First' : 'Second'} Semester
                </p>
              </div>
              <Badge className="bg-green-600 text-white px-4 py-2">
                <Check className="size-4 mr-1" />
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lecture Days */}
      <Card className="shadow-md border-l-4 border-l-[#ffb71b]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0f2044]">
            <Calendar className="size-5 text-[#ffb71b]" />
            Active Lecture Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Select the days when lectures are scheduled
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {allDays.map((day) => {
              const isActive = settings.activeDays.includes(day);
              return (
                <button
                  key={day}
                  onClick={() => isEditing && toggleDay(day)}
                  disabled={!isEditing}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${isActive
                      ? 'bg-[#0f2044] border-[#0f2044] text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-[#ffb71b]'
                    }
                    ${!isEditing && 'cursor-default'}
                    ${isEditing && 'cursor-pointer hover:scale-105'}
                  `}
                >
                  <div className="text-center">
                    <p className="font-semibold text-sm">{day.substring(0, 3)}</p>
                    <p className="text-xs mt-1 opacity-80">{day}</p>
                  </div>
                  {isActive && (
                    <Check className="size-4 mx-auto mt-2" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Selected:</strong> {settings.activeDays.join(', ')} ({settings.activeDays.length} days)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Time Slots */}
      <Card className="shadow-md border-l-4 border-l-[#ffb71b]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0f2044]">
            <Clock className="size-5 text-[#ffb71b]" />
            Lecture Time Slots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Define the time blocks for lectures (e.g., 8:00 AM - 6:00 PM)
          </p>

          {/* Existing Time Slots */}
          <div className="space-y-3 mb-6">
            {timeSlots.map((slot, index) => (
              <div
                key={slot.id}
                className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-[#0f2044] text-white border-[#0f2044]">
                    Slot {index + 1}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-slate-400" />
                    <span className="font-mono font-semibold text-[#0f2044]">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                </div>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeTimeSlot(slot.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Add New Time Slot */}
          {isEditing && (
            <div className="p-4 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-3">Add New Time Slot</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Label htmlFor="startTime" className="text-xs text-slate-600 mb-1 block">
                    Start Time
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    placeholder="08:00"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    className="border-blue-300"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="endTime" className="text-xs text-slate-600 mb-1 block">
                    End Time
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    placeholder="10:00"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    className="border-blue-300"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={addTimeSlot}
                    className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                  >
                    <Plus className="mr-2 size-4" />
                    Add Slot
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-900">
              <strong>Total Time Slots:</strong> {timeSlots.length} lecture periods configured
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}