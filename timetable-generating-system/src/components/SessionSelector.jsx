import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Calendar, Info } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export function SessionSelector({ onSessionChange, onSemesterChange }) {
  // This would normally come from a shared store or API
  // For now, simulating sessions created by School Officer
  const [sessions] = useState([
    {
      id: '1',
      name: '2024-2025',
      startDate: '2024-09-01',
      endDate: '2025-08-31',
      status: 'completed',
      isActive: false,
      semesters: [
        {
          id: 's1',
          name: 'First Semester',
          startDate: '2024-09-01',
          endDate: '2025-01-15',
          status: 'completed',
        },
        {
          id: 's2',
          name: 'Second Semester',
          startDate: '2025-01-20',
          endDate: '2025-06-15',
          status: 'completed',
        },
      ],
    },
    {
      id: '2',
      name: '2025-2026',
      startDate: '2025-09-01',
      endDate: '2026-08-31',
      status: 'active',
      isActive: true,
      semesters: [
        {
          id: 's3',
          name: 'First Semester',
          startDate: '2025-09-01',
          endDate: '2026-01-15',
          status: 'active',
        },
      ],
    },
  ]);

  // Get active session by default
  const activeSession = sessions.find(s => s.isActive) || sessions[0];
  const [selectedSessionId, setSelectedSessionId] = useState(activeSession?.id || '');
  const [selectedSemesterId, setSelectedSemesterId] = useState(
    activeSession?.semesters[0]?.id || ''
  );

  const selectedSession = sessions.find(s => s.id === selectedSessionId);
  const availableSemesters = selectedSession?.semesters || [];

  const handleSessionChange = (sessionId) => {
    setSelectedSessionId(sessionId);
    const session = sessions.find(s => s.id === sessionId);
    
    // Auto-select first semester of the new session
    if (session && session.semesters.length > 0) {
      setSelectedSemesterId(session.semesters[0].id);
      if (onSemesterChange) {
        onSemesterChange(session.semesters[0].id, session.semesters[0].name);
      }
    }
    
    if (onSessionChange) {
      onSessionChange(sessionId, session?.name);
    }
  };

  const handleSemesterChange = (semesterId) => {
    setSelectedSemesterId(semesterId);
    const semester = availableSemesters.find(s => s.id === semesterId);
    if (onSemesterChange) {
      onSemesterChange(semesterId, semester?.name);
    }
  };

  if (sessions.length === 0) {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <Info className="size-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          No academic sessions have been created yet. Please contact the School Timetable Officer to set up sessions.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-l-4 border-l-[#ffb71b]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[#0f2044]">
          <Calendar className="size-5 text-[#ffb71b]" />
          Current Academic Period
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Info Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="size-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              Sessions and semesters are managed by the School Timetable Officer. 
              Select the period you want to work on.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Session Selector */}
            <div className="space-y-2">
              <Label htmlFor="session-select" className="text-[#0f2044]">
                Academic Session
              </Label>
              <Select value={selectedSessionId} onValueChange={handleSessionChange}>
                <SelectTrigger id="session-select" className="border-[#0f2044]/20">
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      <div className="flex items-center gap-2">
                        <span>{session.name}</span>
                        {session.isActive && (
                          <Badge className="bg-[#ffb71b] text-[#0f2044] text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSession && (
                <p className="text-xs text-slate-600">
                  {new Date(selectedSession.startDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })} - {new Date(selectedSession.endDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              )}
            </div>

            {/* Semester Selector */}
            <div className="space-y-2">
              <Label htmlFor="semester-select" className="text-[#0f2044]">
                Semester
              </Label>
              <Select 
                value={selectedSemesterId} 
                onValueChange={handleSemesterChange}
                disabled={availableSemesters.length === 0}
              >
                <SelectTrigger id="semester-select" className="border-[#0f2044]/20">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {availableSemesters.map((semester) => (
                    <SelectItem key={semester.id} value={semester.id}>
                      <div className="flex items-center gap-2">
                        <span>{semester.name}</span>
                        {semester.status === 'active' && (
                          <Badge className="bg-green-600 text-white text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableSemesters.length === 0 && (
                <p className="text-xs text-orange-600">
                  No semesters available for this session
                </p>
              )}
              {selectedSemesterId && availableSemesters.length > 0 && (
                <p className="text-xs text-slate-600">
                  {new Date(availableSemesters.find(s => s.id === selectedSemesterId)?.startDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })} - {new Date(availableSemesters.find(s => s.id === selectedSemesterId)?.endDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Status Summary */}
          {selectedSession && (
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#0f2044]">
                    Working On: {selectedSession.name} - {availableSemesters.find(s => s.id === selectedSemesterId)?.name}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    All timetables you create will be for this academic period
                  </p>
                </div>
                <Badge 
                  variant={selectedSession.isActive ? 'default' : 'outline'}
                  className={selectedSession.isActive ? 'bg-[#0f2044]' : ''}
                >
                  {selectedSession.status}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
