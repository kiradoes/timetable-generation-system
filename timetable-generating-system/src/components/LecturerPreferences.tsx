import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Clock, MapPin, Users, Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function LecturerPreferences({ userDepartment }) {
  const [lecturers] = useState([
    { id: '1', name: 'Dr. Adeyemi Johnson' },
    { id: '2', name: 'Prof. Grace Okonkwo' },
    { id: '3', name: 'Dr. Michael Eze' },
    { id: '4', name: 'Engr. Sarah Adebayo' },
    { id: '5', name: 'Dr. Emmanuel Okoro' },
  ]);

  const [selectedLecturer, setSelectedLecturer] = useState<string>(lecturers[0].id);
  
  const [preferences, setPreferences] = useState<Record<string, boolean>>({
    'Monday-08:00 - 10:00': true,
    'Monday-10:30 - 12:30': true,
    'Monday-13:00 - 15:00': false,
    'Monday-15:30 - 17:30': false,
    'Tuesday-08:00 - 10:00': true,
    'Tuesday-10:30 - 12:30': false,
    'Tuesday-13:00 - 15:00': true,
    'Tuesday-15:30 - 17:30': false,
    'Wednesday-08:00 - 10:00': true,
    'Wednesday-10:30 - 12:30': true,
    'Wednesday-13:00 - 15:00': true,
    'Wednesday-15:30 - 17:30': false,
    'Thursday-08:00 - 10:00': false,
    'Thursday-10:30 - 12:30': true,
    'Thursday-13:00 - 15:00': true,
    'Thursday-15:30 - 17:30': false,
    'Friday-08:00 - 10:00': true,
    'Friday-10:30 - 12:30': false,
    'Friday-13:00 - 15:00': false,
    'Friday-15:30 - 17:30': false,
  });

  const togglePreference = (day: string, timeSlot: string) => {
    const key = `${day}-${timeSlot}`;
    setPreferences({ ...preferences, [key]: !preferences[key] });
  };

  const handleSave = () => {
    const selectedLecturerName = lecturers.find(l => l.id === selectedLecturer)?.name;
    toast.success(`Preferences saved for ${selectedLecturerName}!`);
  };

  const getPreference = (day: string, timeSlot: string): boolean => {
    const key = `${day}-${timeSlot}`;
    return preferences[key] || false;
  };

  const availableCount = Object.values(preferences).filter(Boolean).length;
  const totalSlots = days.length * timeSlots.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0f2044]">Lecturer Preferences</h2>
          <p className="text-slate-600 mt-1">Set preferred teaching hours for lecturers</p>
        </div>
        <Button 
          onClick={handleSave}
          className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
        >
          <Save className="mr-2 size-4" />
          Save Preferences
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-blue-700 mb-1">Available Slots</p>
              <p className="text-3xl font-bold text-blue-900">{availableCount}/{totalSlots}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-green-700 mb-1">Availability Rate</p>
              <p className="text-3xl font-bold text-green-900">
                {Math.round((availableCount / totalSlots) * 100)}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-purple-700 mb-1">Total Lecturers</p>
              <p className="text-3xl font-bold text-purple-900">{lecturers.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lecturer Selection */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-[#0f2044] flex items-center gap-2">
            <User className="size-5 text-[#ffb71b]" />
            Select Lecturer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="lecturer" className="text-[#0f2044] font-semibold">
              Lecturer
            </Label>
            <select
              id="lecturer"
              value={selectedLecturer}
              onChange={(e) => setSelectedLecturer(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-slate-300 focus:border-[#ffb71b] focus:ring-1 focus:ring-[#ffb71b] bg-white"
            >
              {lecturers.map((lecturer) => (
                <option key={lecturer.id} value={lecturer.id}>
                  {lecturer.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">
              Select a lecturer to manage their teaching preferences
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preference Grid */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-[#0f2044] flex items-center gap-2">
            <Clock className="size-5 text-[#ffb71b]" />
            Weekly Availability
          </CardTitle>
          <p className="text-sm text-slate-600 mt-2">
            Click on a time slot to toggle availability. Green = Available, Red = Not Available
          </p>
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
                    const isAvailable = getPreference(day, timeSlot);
                    return (
                      <button
                        key={`${day}-${timeSlot}`}
                        onClick={() => togglePreference(day, timeSlot)}
                        className={`
                          min-h-[80px] p-3 rounded-lg border-2 transition-all cursor-pointer
                          flex flex-col items-center justify-center gap-2 group
                          ${isAvailable 
                            ? 'bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300' 
                            : 'bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300'
                          }
                        `}
                      >
                        {isAvailable ? (
                          <>
                            <Check className="size-8 text-green-600 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium text-green-700">Available</span>
                          </>
                        ) : (
                          <>
                            <X className="size-8 text-red-600 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium text-red-700">Not Available</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-sm font-semibold text-[#0f2044] mb-3">Legend:</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-green-100 border-2 border-green-300 rounded p-2">
                  <Check className="size-4 text-green-600" />
                </div>
                <span className="text-sm text-slate-700">Lecturer is available for this slot</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-red-100 border-2 border-red-300 rounded p-2">
                  <X className="size-4 text-red-600" />
                </div>
                <span className="text-sm text-slate-700">Lecturer is not available for this slot</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="bg-blue-500 rounded-full p-2 h-fit">
              <svg className="size-5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">How Preferences Work</h4>
              <p className="text-sm text-blue-800">
                Lecturer preferences are used during automated timetable generation to ensure classes 
                are scheduled when lecturers are available. The system will prioritize available slots 
                but may override preferences if necessary to avoid conflicts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}