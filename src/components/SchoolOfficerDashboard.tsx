import {
  Activity,
  BookOpen,
  Building2,
  Calendar,
  Clock,
  GraduationCap,
  LayoutGrid,
  Link2,
  MapPin,
  Settings,
  UserPlus,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { AcademicSettings } from './AcademicSettings';
import { DashboardLayout } from './DashboardLayout';
import { DepartmentManagement } from './DepartmentManagement';
import LectureScheduler from './LectureScheduler';
import { NonComputingCourseManagement } from './NonComputingCourseManagement';
import { OfficerManagement } from './OfficerManagement';
import { SchoolClassGroupsManagement } from './SchoolClassGroupsManagement';
import { SchoolComputingCoursesManagement } from './SchoolComputingCoursesManagement';
import { SchoolLecturerPreferences } from './SchoolLecturerPreferences';
import { SpecialEventsPanel } from './SpecialEventsPanel';
import { VenueManagement } from './VenueManagement';
import { ClassToCourseManagement } from './ClassToCourseManagement';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
export function SchoolOfficerDashboard({ userEmail, onLogout }: { userEmail: string; onLogout: () => void }) {
  const [activeView, setActiveView] = useState('overview');
  const [activeSession, setActiveSession] = useState<any>(null);
  const [activeSemester, setActiveSemester] = useState<any>(null);

  const fetchCurrentSession = async () => {
    try {
      const response = await api.getCurrentSession();
      let session = response.success && response.data ? response.data : null;
      if (!session) {
        const allRes = await api.getSessions({});
        if (allRes.success && Array.isArray(allRes.data) && allRes.data.length > 0) {
          const current = (allRes.data as any[]).find((s: any) => s.is_current) || allRes.data[0];
          session = current;
        }
      }
      if (session) {
        setActiveSession(session);
        const sessionId = session.session_id ?? session.id;
        if (sessionId) {
          const semRes = await api.getSemestersBySession(sessionId);
          if (semRes.success && Array.isArray(semRes.data) && semRes.data.length > 0) {
            const active = (semRes.data as any[]).find((s: any) => s.status === 'active') || semRes.data[0];
            setActiveSemester(active);
          } else {
            setActiveSemester(null);
          }
        } else {
          setActiveSemester(null);
        }
      } else {
        setActiveSession(null);
        setActiveSemester(null);
      }
    } catch (error: any) {
      try {
        const allRes = await api.getSessions({});
        if (allRes.success && Array.isArray(allRes.data) && allRes.data.length > 0) {
          const session = (allRes.data as any[]).find((s: any) => s.is_current) || allRes.data[0];
          setActiveSession(session);
          const sessionId = session.session_id ?? session.id;
          if (sessionId) {
            const semRes = await api.getSemestersBySession(sessionId);
            if (semRes.success && Array.isArray(semRes.data) && semRes.data.length > 0) {
              const active = (semRes.data as any[]).find((s: any) => s.status === 'active') || semRes.data[0];
              setActiveSemester(active);
            } else setActiveSemester(null);
          } else setActiveSemester(null);
        } else {
          setActiveSession(null);
          setActiveSemester(null);
        }
      } catch (_) {
        setActiveSession(null);
        setActiveSemester(null);
      }
    }
  };

  useEffect(() => {
    fetchCurrentSession();
  }, []);

  // Refetch current session when user switches to overview (e.g. after creating/activating in Academic Settings)
  useEffect(() => {
    if (activeView === 'overview') {
      fetchCurrentSession();
    }
  }, [activeView]);

  const navigation = [
    { name: 'Dashboard Overview', icon: GraduationCap, active: activeView === 'overview', onClick: () => setActiveView('overview') },
    { name: 'Academic Settings', icon: Settings, active: activeView === 'academic-settings', onClick: () => setActiveView('academic-settings'), description: 'Manage sessions and semesters' },
    { name: 'Department Management', icon: Building2, active: activeView === 'department-management', onClick: () => setActiveView('department-management'), description: 'Manage departments (active/inactive)' },
    { name: 'Officer Management', icon: UserPlus, active: activeView === 'officer-management', onClick: () => setActiveView('officer-management'), description: 'Add/Remove Department Timetable Officers' },
    { name: 'Class Management', icon: LayoutGrid, active: activeView === 'class-management', onClick: () => setActiveView('class-management'), description: 'Manage class groups by department (same layout as DTTO)' },
    { name: 'Course Management', icon: BookOpen, active: activeView === 'computing-courses-management', onClick: () => setActiveView('computing-courses-management'), description: 'Computing courses by department with search' },
    { name: 'Class to Course Management', icon: Link2, active: activeView === 'class-to-course', onClick: () => setActiveView('class-to-course'), description: 'Manage which classes are linked to which courses' },
    { name: 'Non-Computing Courses Management', icon: BookOpen, active: activeView === 'courses-management', onClick: () => setActiveView('courses-management'), description: 'External courses: Course code, title, lecturer, class/group, day, time' },
    { name: 'Lecturer Preferences', icon: Users, active: activeView === 'lecturer-preferences', onClick: () => setActiveView('lecturer-preferences'), description: 'Logic engine: Add lecturer (name, department), set unavailable days/times' },
    { name: 'Venue Management', icon: MapPin, active: activeView === 'venue-management', onClick: () => setActiveView('venue-management'), description: 'Add and manage venues (lecture halls, labs) for scheduling' },
    { name: 'Schedule Lecture', icon: Clock, active: activeView === 'lecture-scheduler', onClick: () => setActiveView('lecture-scheduler'), description: 'Schedule lectures and manage timetables' },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewView activeSession={activeSession} activeSemester={activeSemester} onNavigate={setActiveView} />;
      case 'academic-settings':
        return <AcademicSettings onSessionsOrSemestersChange={fetchCurrentSession} />;
      case 'department-management':
        return <DepartmentManagement />;
      case 'officer-management':
        return <OfficerManagement />;
      case 'class-management':
        return <SchoolClassGroupsManagement sessionId={activeSession?.session_id ?? activeSession?.id ?? null} />;
      case 'computing-courses-management':
        return <SchoolComputingCoursesManagement sessionId={activeSession?.session_id ?? activeSession?.id ?? null} />;
      case 'class-to-course':
        return <ClassToCourseManagement sessionId={activeSession?.session_id ?? activeSession?.id ?? null} role="school-officer" />;
      case 'courses-management':
        return <NonComputingCourseManagement />;
      case 'lecturer-preferences':
        return <SchoolLecturerPreferences />;
      case 'venue-management':
        return <VenueManagement />;
      case 'non-computing-courses':
        return <NonComputingCourseManagement />;
      case 'lecture-scheduler':
        return <LectureScheduler activeSession={activeSession} activeSemester={activeSemester} onTimetablePublished={fetchCurrentSession} />;
      default:
        return <OverviewView activeSession={activeSession} activeSemester={activeSemester} onNavigate={setActiveView} />;
    }
  };

  return (
    <DashboardLayout
      userEmail={userEmail}
      userRole="school-officer"
      userDepartment=""
      onLogout={onLogout}
      navigation={navigation}
    >
      {renderContent()}
    </DashboardLayout>
  );
}

function OverviewView({ activeSession, activeSemester, onNavigate }: {
  activeSession: any;
  activeSemester: any;
  onNavigate: (view: string) => void;
}) {
  const [recentActivities, setRecentActivities] = useState<{ full_name: string; department: string; description: string }[]>([]);
  const [downloadingCoverage, setDownloadingCoverage] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const activitiesRes = await api.getRecentOfficerActivities(15);
        if (activitiesRes.success && Array.isArray(activitiesRes.data)) {
          setRecentActivities(activitiesRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const handleDownloadCoverageReport = async () => {
    if (!activeSemester?.semester_id && !activeSemester?.id) {
      alert('No active semester selected.');
      return;
    }
    const semesterId = activeSemester.semester_id ?? activeSemester.id;
    setDownloadingCoverage(true);
    try {
      const res = await api.canPublishSemester(semesterId);
      if (!res.success || !res.data) {
        alert(res.error || 'Unable to generate coverage report.');
        return;
      }
      const missing = Array.isArray(res.data.missing) ? res.data.missing : [];
      if (missing.length === 0) {
        alert('All required courses have the required hours scheduled for every class. No missing entries to report.');
        return;
      }
      const rows = [
        ['Group', 'Course', 'Hours Scheduled', 'Required Hours'],
        ...missing.map((m: any) => [
          m.group || '',
          m.course || '',
          String(m.hoursScheduled ?? 0),
          String(m.required ?? ''),
        ]),
      ];
      const csv = rows
        .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
        .join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const semLabel = activeSemester?.name ? String(activeSemester.name).replace(/\s+/g, '_') : 'semester';
      a.download = `coverage_report_all_departments_${semLabel}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download coverage report:', err);
      alert('Failed to generate coverage report.');
    } finally {
      setDownloadingCoverage(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0f2044]">School Timetable Officer</h1>
          <p className="text-slate-600 mt-1">Manage GEDS and SAT courses</p>
        </div>
        <div className="flex items-center gap-2">
          {activeSession && (
            <Badge className="bg-[#0f2044] text-white px-4 py-2 text-sm">
              <Calendar className="size-4 mr-2" />
              {activeSemester
                ? `Session & Semester: ${(activeSession.name || '').replace(/-/g, '/')} · ${activeSemester.name}`
                : `Session: ${(activeSession.name || '').replace(/-/g, '/')}`}
            </Badge>
          )}
        </div>
      </div>

      <Card className="shadow-md border-l-4 border-l-[#ffb71b]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-[#0f2044]">
            <span className="flex items-center gap-2">
              <Clock className="size-5 text-[#ffb71b]" />
              Quick Actions
            </span>
            <Button
              variant="outline"
              className="border-[#0f2044] text-[#0f2044] hover:bg-[#0f2044]/5 text-xs sm:text-sm"
              onClick={handleDownloadCoverageReport}
              disabled={downloadingCoverage}
            >
              {downloadingCoverage ? 'Preparing Coverage Report…' : 'Download Coverage Report'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button onClick={() => onNavigate('officer-management')} className="flex flex-col items-center gap-2 bg-[#0f2044] hover:bg-[#0f2044]/90 text-white py-6 h-auto">
              <UserPlus className="size-6" />
              <span>Register Officer</span>
            </Button>
            <Button onClick={() => onNavigate('class-management')} variant="outline" className="flex flex-col items-center gap-2 border-[#0f2044] text-[#0f2044] hover:bg-[#0f2044]/5 py-6 h-auto">
              <LayoutGrid className="size-6" />
              <span>Class Management</span>
            </Button>
            <Button onClick={() => onNavigate('computing-courses-management')} variant="outline" className="flex flex-col items-center gap-2 border-[#0f2044] text-[#0f2044] hover:bg-[#0f2044]/5 py-6 h-auto">
              <BookOpen className="size-6" />
              <span>Course Management</span>
            </Button>
            <Button onClick={() => onNavigate('courses-management')} variant="outline" className="flex flex-col items-center gap-2 border-[#0f2044] text-[#0f2044] hover:bg-[#0f2044]/5 py-6 h-auto">
              <BookOpen className="size-6" />
              <span>Non-Computing Courses</span>
            </Button>
            <Button onClick={() => onNavigate('venue-management')} variant="outline" className="flex flex-col items-center gap-2 border-[#0f2044] text-[#0f2044] hover:bg-[#0f2044]/5 py-6 h-auto">
              <MapPin className="size-6" />
              <span>Venue Management</span>
            </Button>
            <Button onClick={() => onNavigate('lecture-scheduler')} variant="outline" className="flex flex-col items-center gap-2 border-[#0f2044] text-[#0f2044] hover:bg-[#0f2044]/5 py-6 h-auto">
              <Clock className="size-6" />
              <span>Schedule Lecture</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0f2044]">
            <Activity className="size-5 text-[#ffb71b]" />
            Recent activity
          </CardTitle>
          <p className="text-sm text-slate-600 mt-1">Schedule creations and other activity from officers</p>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <p className="text-slate-500 py-4">No recent activity to show.</p>
          ) : (
            <ul className="space-y-3">
              {recentActivities.map((item, i) => (
                <li key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-[#0f2044]/10 flex items-center justify-center">
                      <Users className="size-4 text-[#0f2044]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#0f2044]">{item.full_name}</p>
                    </div>
                  </div>
                  <span className="text-sm text-slate-500">{item.description}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <SpecialEventsPanel activeSessionId={activeSession?.session_id || activeSession?.id || null} />
    </div>
  );
}
