import { useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { StatCard } from './StatCard';
import { EnhancedTimetableScheduling } from './EnhancedTimetableScheduling';
import { LecturerPreferences } from './LecturerPreferences';
import { DepartmentCoursesLecturers } from './DepartmentCoursesLecturers';
import { ClassGroupManagement } from './ClassGroupManagement';
import { TimetableViewer } from './TimetableViewer';
import { SessionSelector } from './SessionSelector';
import { 
  BookOpen, 
  Users, 
  CalendarDays,
  Clock,
  FileCheck,
  Settings as SettingsIcon,
  Sparkles,
  AlertCircle,
  UserCircle,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';

export function DepartmentOfficerDashboard({ userEmail, onLogout }) {
  const [activeView, setActiveView] = useState('overview');

  // Extract department from email
  const getDepartmentFromEmail = (email) => {
    const emailMap = {
      'department.cs@babcock.edu.ng': 'Computer Science',
      'department.se@babcock.edu.ng': 'Software Engineering',
      'department.it@babcock.edu.ng': 'Information Technology',
      'department.is@babcock.edu.ng': 'Information Systems',
      'department.cyber@babcock.edu.ng': 'Cyber Security',
    };
    
    return emailMap[email] || 'Computer Science'; // fallback
  };

  const userDepartment = getDepartmentFromEmail(userEmail);

  const navigation = [
    {
      name: 'Dashboard Overview',
      icon: CalendarDays,
      active: activeView === 'overview',
      onClick: () => setActiveView('overview'),
    },
    {
      name: 'Department Courses',
      icon: BookOpen,
      active: activeView === 'my-courses',
      onClick: () => setActiveView('my-courses'),
      description: 'Add and manage department courses & lecturers'
    },
    {
      name: 'Class Groups',
      icon: Users,
      active: activeView === 'class-groups',
      onClick: () => setActiveView('class-groups'),
      description: 'Manage class groups by level'
    },
    {
      name: 'Lecturer Preferences',
      icon: UserCircle,
      active: activeView === 'preferences',
      onClick: () => setActiveView('preferences'),
      description: 'Set lecturer availability & time slots'
    },
    {
      name: 'Schedule Timetable',
      icon: Sparkles,
      active: activeView === 'schedule',
      onClick: () => setActiveView('schedule'),
      description: 'Create and generate teaching schedules'
    },
    {
      name: 'View Timetable',
      icon: Calendar,
      active: activeView === 'timetable-view',
      onClick: () => setActiveView('timetable-view'),
      description: 'View generated timetables'
    },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewView userDepartment={userDepartment} />;
      case 'my-courses':
        return <MyCoursesView userDepartment={userDepartment} />;
      case 'lecturers':
        return <LecturersView userDepartment={userDepartment} />;
      case 'class-groups':
        return <ClassGroupsView userDepartment={userDepartment} />;
      case 'schedule':
        return <ScheduleView userDepartment={userDepartment} />;
      case 'timetable-view':
        return <TimetableView userDepartment={userDepartment} />;
      case 'preferences':
        return <PreferencesView userDepartment={userDepartment} />;
      default:
        return <OverviewView userDepartment={userDepartment} />;
    }
  };

  return (
    <DashboardLayout
      userEmail={userEmail}
      userRole="department-officer"
      onLogout={onLogout}
      navigation={navigation}
    >
      {renderContent()}
    </DashboardLayout>
  );
}

function OverviewView({ userDepartment }: { userDepartment: string }) {
  const [timetableStatus] = useState<'not-generated' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  const handleSessionChange = (sessionId, sessionName) => {
    setSelectedSession(sessionName);
  };

  const handleSemesterChange = (semesterId, semesterName) => {
    setSelectedSemester(semesterName);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0f2044]">Department Timetable Officer</h1>
          <p className="text-slate-600 mt-1">Manage {userDepartment} computing courses and schedules</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-[#0f2044] text-white px-4 py-2 text-sm">
            {userDepartment}
          </Badge>
          <Badge className="bg-blue-600 text-white px-4 py-2 text-sm">
            School of Computing
          </Badge>
        </div>
      </div>

      {/* Session Selector - Shows sessions created by School Officer */}
      <SessionSelector 
        onSessionChange={handleSessionChange} 
        onSemesterChange={handleSemesterChange}
      />

      {/* Status Alert */}
      {timetableStatus === 'pending' && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="size-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Your timetable is currently <strong>Pending Approval</strong> from the School Timetable Officer.
          </AlertDescription>
        </Alert>
      )}

      {timetableStatus === 'approved' && (
        <Alert className="border-green-200 bg-green-50">
          <FileCheck className="size-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Your timetable has been <strong>Approved</strong>! Students can now view it.
          </AlertDescription>
        </Alert>
      )}

      {timetableStatus === 'rejected' && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="size-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Your timetable was <strong>Rejected</strong>. Please review feedback and regenerate.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Computing Courses"
          value={12}
          icon={BookOpen}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
          trend={{ value: 'COSC, ITGY, SENG', positive: true }}
        />
        <StatCard
          title="Department Lecturers"
          value={8}
          icon={Users}
          iconColor="text-green-600"
          iconBgColor="bg-green-50"
          trend={{ value: userDepartment, positive: true }}
        />
        <StatCard
          title="Class Groups"
          value={6}
          icon={UserCircle}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-50"
          trend={{ value: '200-500 Level', positive: true }}
        />
        <StatCard
          title="Active Schedules"
          value={24}
          icon={CalendarDays}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-50"
          trend={{ value: 'This semester', positive: true }}
        />
      </div>

      {/* Scheduling Control Center */}
      <Card className="shadow-md border-l-4 border-l-[#ffb71b]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0f2044]">
            <Sparkles className="size-5 text-[#ffb71b]" />
            Scheduling Control Center
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-[#0f2044] to-[#1a3a6b] rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Automated Timetable Generation</h3>
            <p className="text-slate-200 mb-4">
              Generate an optimized timetable based on your constraints: no lecturer overlaps, 
              venue capacity matching, and preferred time slots.
            </p>
            <Button className="bg-[#ffb71b] hover:bg-[#ffb71b]/90 text-[#0f2044] font-semibold">
              <Sparkles className="mr-2 size-4" />
              Generate Timetable
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 rounded-full p-2">
                  <FileCheck className="size-4 text-green-600" />
                </div>
                <h4 className="font-semibold text-[#0f2044]">No Overlaps</h4>
              </div>
              <p className="text-sm text-slate-600">
                Ensures lecturers are not double-booked
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 rounded-full p-2">
                  <Users className="size-4 text-blue-600" />
                </div>
                <h4 className="font-semibold text-[#0f2044]">Capacity Match</h4>
              </div>
              <p className="text-sm text-slate-600">
                Venues match student group sizes
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-100 rounded-full p-2">
                  <Clock className="size-4 text-purple-600" />
                </div>
                <h4 className="font-semibold text-[#0f2044]">Preferences</h4>
              </div>
              <p className="text-sm text-slate-600">
                Respects lecturer availability preferences
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-[#0f2044]">Timetable Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Current Status</span>
                <Badge 
                  variant="outline" 
                  className={
                    timetableStatus === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                    timetableStatus === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    timetableStatus === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-slate-50 text-slate-700 border-slate-200'
                  }
                >
                  {timetableStatus === 'approved' ? '✓ Approved' :
                   timetableStatus === 'pending' ? '⏳ Pending Approval' :
                   timetableStatus === 'rejected' ? '✗ Rejected' :
                   'Not Generated'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Last Generated</span>
                <span className="font-medium text-[#0f2044]">Jan 25, 2026</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Conflicts</span>
                <span className="font-medium text-green-600">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-[#0f2044]">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: 'Timetable submitted for approval', time: '2 hours ago' },
                { action: 'Lecturer preferences updated', time: '1 day ago' },
                { action: 'New course added', time: '3 days ago' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 pb-2 border-b border-slate-100 last:border-0">
                  <div className="bg-[#ffb71b]/10 rounded-full p-1.5 mt-0.5">
                    <div className="size-2 rounded-full bg-[#ffb71b]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#0f2044]">{item.action}</p>
                    <p className="text-xs text-slate-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MyCoursesView({ userDepartment }: { userDepartment: string }) {
  return <DepartmentCoursesLecturers userDepartment={userDepartment} />;
}

function LecturersView({ userDepartment }: { userDepartment: string }) {
  return <DepartmentCoursesLecturers userDepartment={userDepartment} />;
}

function ClassGroupsView({ userDepartment }: { userDepartment: string }) {
  return <ClassGroupManagement userDepartment={userDepartment} />;
}

function ScheduleView({ userDepartment }: { userDepartment: string }) {
  return <EnhancedTimetableScheduling userDepartment={userDepartment} />;
}

function TimetableView({ userDepartment }: { userDepartment: string }) {
  return <TimetableViewer userRole="department-officer" department={userDepartment} />;
}

function PreferencesView({ userDepartment }: { userDepartment: string }) {
  return <LecturerPreferences userDepartment={userDepartment} />;
}

function SessionManagementView({ userDepartment }: { userDepartment: string }) {
  return <SessionSelector userDepartment={userDepartment} />;
}