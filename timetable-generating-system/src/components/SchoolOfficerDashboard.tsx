import { DepartmentOfficerRegistration } from './DepartmentOfficerRegistration';
import { AcademicSettingsPanel } from './AcademicSettingsPanel';
import { TimetableViewer } from './TimetableViewer';
import { useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { StatCard } from './StatCard';
import { OfficerManagementTable } from './OfficerManagementTable';
import { VenueManagementTable } from './VenueManagementTable';
import { CourseManagementTable } from './CourseManagementTable';
import { NonComputingCourseManagement } from './NonComputingCourseManagement';
import { ComputingCoursesManagement } from './ComputingCoursesManagement';
import { SessionManagement } from './SessionManagement';
import { 
  Users, 
  Building2, 
  BookOpen, 
  Calendar,
  UserPlus,
  Settings,
  GraduationCap,
  MapPin,
  UserCircle,
  CalendarDays,
  Code
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';

export function SchoolOfficerDashboard({ userEmail, onLogout }) {
  const [activeView, setActiveView] = useState('overview');
  const [currentSession, setCurrentSession] = useState('2025-2026');
  const [currentSemester, setCurrentSemester] = useState('first');

  const navigation = [
    {
      name: 'Dashboard Overview',
      icon: GraduationCap,
      active: activeView === 'overview',
      onClick: () => setActiveView('overview'),
    },
    {
      name: 'Session Management',
      icon: CalendarDays,
      active: activeView === 'session-management',
      onClick: () => setActiveView('session-management'),
      description: 'Create sessions and semesters'
    },
    {
      name: 'Register Officers',
      icon: UserPlus,
      active: activeView === 'user-management',
      onClick: () => setActiveView('user-management'),
      description: 'Register Department Timetable Officers'
    },
    {
      name: 'Non-Computing Courses',
      icon: BookOpen,
      active: activeView === 'non-computing',
      onClick: () => setActiveView('non-computing'),
      description: 'Manage GEDS/GST/SAT courses & lecturers'
    },
    {
      name: 'Computing Courses',
      icon: Code,
      active: activeView === 'computing-courses',
      onClick: () => setActiveView('computing-courses'),
      description: 'Manage computing courses'
    },
    {
      name: 'Venue Management',
      icon: MapPin,
      active: activeView === 'venue-management',
      onClick: () => setActiveView('venue-management'),
      description: 'Add and manage lecture halls & labs'
    },
    {
      name: 'Academic Settings',
      icon: Settings,
      active: activeView === 'settings',
      onClick: () => setActiveView('settings'),
      description: 'Set session, semester & time slots'
    },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewView currentSession={currentSession} currentSemester={currentSemester} />;
      case 'session-management':
        return <SessionManagementView />;
      case 'user-management':
        return <UserManagementView />;
      case 'non-computing':
        return <NonComputingView />;
      case 'computing-courses':
        return <ComputingCoursesView />;
      case 'venue-management':
        return <VenueManagementView />;
      case 'timetable-management':
        return <TimetableManagementView />;
      case 'settings':
        return (
          <AcademicSettingsView
            currentSession={currentSession}
            currentSemester={currentSemester}
            onSessionChange={setCurrentSession}
            onSemesterChange={setCurrentSemester}
          />
        );
      default:
        return <OverviewView currentSession={currentSession} currentSemester={currentSemester} />;
    }
  };

  return (
    <DashboardLayout
      userEmail={userEmail}
      userRole="school-officer"
      onLogout={onLogout}
      navigation={navigation}
    >
      {renderContent()}
    </DashboardLayout>
  );
}

function OverviewView({ currentSession, currentSemester }: { currentSession: string; currentSemester: string }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0f2044]">School Timetable Officer</h1>
          <p className="text-slate-600 mt-1">Manage GEDS, GST, SAT courses and lecture scheduling</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-[#0f2044] text-white px-4 py-2 text-sm">
            <Calendar className="size-4 mr-2" />
            {currentSession} • {currentSemester === 'first' ? 'First' : 'Second'} Semester
          </Badge>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Computing Departments"
          value={5}
          icon={Building2}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
          trend={{ value: 'CS, SE, IT, Cyber', positive: true }}
        />
        <StatCard
          title="General Lecturers"
          value={32}
          icon={Users}
          iconColor="text-green-600"
          iconBgColor="bg-green-50"
          trend={{ value: 'GEDS/GST/SAT Staff', positive: true }}
        />
        <StatCard
          title="Total Venues"
          value={64}
          icon={MapPin}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-50"
        />
        <StatCard
          title="General Courses"
          value={24}
          icon={BookOpen}
          iconColor="text-orange-600"
          iconBgColor="bg-orange-50"
          trend={{ value: 'GEDS, GST, SAT', positive: true }}
        />
      </div>

      {/* Quick Actions */}
      <Card className="shadow-md border-l-4 border-l-[#ffb71b]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0f2044]">
            <UserPlus className="size-5 text-[#ffb71b]" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white py-6">
              <UserPlus className="mr-2 size-4" />
              Register Department Officer
            </Button>
            <Button variant="outline" className="border-[#0f2044] text-[#0f2044] hover:bg-[#0f2044]/5 py-6">
              <MapPin className="mr-2 size-4" />
              Add New Venue
            </Button>
            <Button variant="outline" className="border-[#0f2044] text-[#0f2044] hover:bg-[#0f2044]/5 py-6">
              <BookOpen className="mr-2 size-4" />
              Add General Course
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-[#0f2044]">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'Department Officer registered', dept: 'Computer Science - Dr. Adegoke', time: '2 hours ago' },
              { action: 'GEDS Course scheduled', dept: 'GEDS 420 - Wednesday 11:00 AM', time: '5 hours ago' },
              { action: 'Venue added', dept: 'LT 5 (Capacity: 200)', time: '1 day ago' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="bg-[#ffb71b]/10 rounded-full p-2">
                  <Calendar className="size-4 text-[#ffb71b]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#0f2044]">{item.action}</p>
                  <p className="text-sm text-slate-600">{item.dept}</p>
                </div>
                <span className="text-xs text-slate-500">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SessionManagementView() {
  return <SessionManagement />;
}

function UserManagementView() {
  return <DepartmentOfficerRegistration />;
}

function NonComputingView() {
  return <NonComputingCourseManagement />;
}

function ComputingCoursesView() {
  return <ComputingCoursesManagement />;
}

function VenueManagementView() {
  return <VenueManagementTable />;
}

function TimetableManagementView() {
  return <TimetableViewer userRole="school-officer" />;
}

function AcademicSettingsView({
  currentSession,
  currentSemester,
  onSessionChange,
  onSemesterChange,
}: {
  currentSession: string;
  currentSemester: string;
  onSessionChange: (session: string) => void;
  onSemesterChange: (semester: string) => void;
}) {
  return <AcademicSettingsPanel />;
}