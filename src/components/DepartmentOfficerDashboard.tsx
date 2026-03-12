import {
  BookOpen,
  Clock,
  GraduationCap,
  LayoutGrid,
  Link2,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { DashboardLayout } from './DashboardLayout';
import { DepartmentClassGroupsManagement } from './DepartmentClassGroupsManagement';
import { DepartmentCoursesManagement } from './DepartmentCoursesManagement';
import { DepartmentLecturersManagement } from './DepartmentLecturersManagement';
import { DepartmentTimetableScheduling } from './DepartmentTimetableScheduling';
import { DepartmentVenuesManagement } from './DepartmentVenuesManagement';
import { ClassToCourseManagement } from './ClassToCourseManagement';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface DepartmentOfficerDashboardProps {
  userEmail: string;
  userDepartment: string;
  onLogout: () => void;
}

export function DepartmentOfficerDashboard({
  userEmail,
  userDepartment,
  onLogout,
}: DepartmentOfficerDashboardProps) {
  const [activeView, setActiveView] = useState('overview');
  const [departmentName, setDepartmentName] = useState(userDepartment?.trim() || '');
  const [activeSession, setActiveSession] = useState<{ session_id: number; name: string } | null>(null);
  const [activeSemester, setActiveSemester] = useState<{ name: string; semester_id?: number } | null>(null);

  const hydrateActiveSession = async () => {
    try {
      const response = await api.getCurrentSession() as any;
      const session = response?.data;
      if (response?.success && session?.session_id) {
        setActiveSession({ session_id: session.session_id, name: session.name });
        const semRes = await api.getSemestersBySession(session.session_id);
        if (semRes.success && Array.isArray(semRes.data) && semRes.data.length > 0) {
          const active = (semRes.data as any[]).find((s: any) => s.status === 'active') || semRes.data[0];
          setActiveSemester({ name: active.name, semester_id: active.semester_id ?? active.id });
        } else {
          setActiveSemester(null);
        }
        return;
      }
    } catch (error) {
      console.error('Failed to load active session:', error);
    }
    try {
      const sessionsRes = await api.getSessions({}) as any;
      if (sessionsRes.success) {
        const sessions = Array.isArray(sessionsRes.data) ? sessionsRes.data : (sessionsRes.data?.sessions || []);
        const current = sessions.find((s: any) => s.is_current || s.status === 'active');
        if (current?.session_id) {
          setActiveSession({ session_id: current.session_id, name: current.name });
          const semRes = await api.getSemestersBySession(current.session_id);
          if (semRes.success && Array.isArray(semRes.data) && semRes.data.length > 0) {
            const active = (semRes.data as any[]).find((s: any) => s.status === 'active') || semRes.data[0];
            setActiveSemester({ name: active.name, semester_id: active.semester_id ?? active.id });
          } else {
            setActiveSemester(null);
          }
        } else {
          setActiveSession(null);
          setActiveSemester(null);
        }
      } else {
        setActiveSession(null);
        setActiveSemester(null);
      }
    } catch (error) {
      console.error('Failed to load fallback session:', error);
      setActiveSession(null);
      setActiveSemester(null);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const hydrateDepartment = async () => {
      try {
        const response = await api.getCurrentUser();
        if (response?.success && response.data?.officer) {
          const dbDepartment = response.data.officer.department ?? response.data.officer.department_name ?? '';
          if (isMounted && dbDepartment) {
            setDepartmentName(dbDepartment);
          }
        }
      } catch (error) {
        console.error('Failed to load department from profile:', error);
      }
    };
    hydrateDepartment();
    hydrateActiveSession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Refetch current session when user switches to overview (e.g. after creating/activating in Academic Settings)
  useEffect(() => {
    if (activeView === 'overview') {
      hydrateActiveSession();
    }
  }, [activeView]);

  const effectiveDepartment = departmentName || userDepartment || '';

  const navigation = [
    { name: 'Dashboard Overview', icon: GraduationCap, active: activeView === 'overview', onClick: () => setActiveView('overview') },
    { name: 'Lecturer Management', icon: Users, active: activeView === 'lecturers-management', onClick: () => setActiveView('lecturers-management') },
    { name: 'Class Management', icon: LayoutGrid, active: activeView === 'class-management', onClick: () => setActiveView('class-management') },
    { name: 'Course Management', icon: BookOpen, active: activeView === 'courses-management', onClick: () => setActiveView('courses-management') },
    { name: 'Class to Course Management', icon: Link2, active: activeView === 'class-to-course', onClick: () => setActiveView('class-to-course') },
    { name: 'Schedule Lecture', icon: Clock, active: activeView === 'timetable-scheduling', onClick: () => setActiveView('timetable-scheduling') },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <OverviewView
            userDepartment={effectiveDepartment}
            activeSession={activeSession?.name || ''}
            activeSemester={activeSemester?.name}
            onNavigate={setActiveView}
          />
        );
      case 'lecturers-management':
        return <DepartmentLecturersManagement departmentName={effectiveDepartment} sessionId={activeSession?.session_id || null} />;
      case 'class-management':
        return <DepartmentClassGroupsManagement departmentName={effectiveDepartment} sessionId={activeSession?.session_id || null} />;
      case 'courses-management':
        return <DepartmentCoursesManagement departmentName={effectiveDepartment} sessionId={activeSession?.session_id || null} />;
      case 'class-to-course':
        return <ClassToCourseManagement departmentName={effectiveDepartment} sessionId={activeSession?.session_id || null} role="department-officer" />;
      case 'venues-management':
        return <DepartmentVenuesManagement departmentName={effectiveDepartment} sessionId={activeSession?.session_id || null} />;
      case 'timetable-scheduling':
        return <DepartmentTimetableScheduling departmentName={effectiveDepartment} sessionId={activeSession?.session_id || null} activeSemester={activeSemester} />;
      default:
        return <OverviewView userDepartment={effectiveDepartment} activeSession={activeSession?.name || ''} activeSemester={activeSemester?.name} />;
    }
  };

  return (
    <DashboardLayout
      userEmail={userEmail}
      userRole="department-officer"
      userDepartment={effectiveDepartment}
      onLogout={onLogout}
      navigation={navigation}
    >
      {renderContent()}
    </DashboardLayout>
  );
}

function OverviewView({
  userDepartment,
  activeSession,
  activeSemester,
  onNavigate,
}: {
  userDepartment: string;
  activeSession: string;
  activeSemester?: string | null;
  onNavigate?: (view: string) => void;
}) {
  const [downloadingCoverage, setDownloadingCoverage] = useState(false);

  const sessionSemesterLabel = activeSession
    ? activeSemester
      ? `${activeSession.replace(/-/g, '/')} · ${activeSemester}`
      : activeSession.replace(/-/g, '/')
    : '';
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0f2044]">Department Timetable Officer</h1>
          <p className="text-slate-600 mt-1">Manage {userDepartment} computing courses and schedules</p>
        </div>
        <div className="flex items-center gap-2">
          {sessionSemesterLabel ? (
            <Badge className="bg-[#ffb71b] text-[#0f2044] px-4 py-2 text-sm">
              Session & Semester: {sessionSemesterLabel}
            </Badge>
          ) : activeSession ? (
            <Badge className="bg-[#ffb71b] text-[#0f2044] px-4 py-2 text-sm">
              Session: {activeSession.replace(/-/g, '/')}
            </Badge>
          ) : (
            <Badge className="bg-slate-200 text-slate-700 px-4 py-2 text-sm">
              No Active Session
            </Badge>
          )}
          <Badge className="bg-blue-600 text-white px-4 py-2 text-sm">
            School of Computing
          </Badge>
          {userDepartment ? (
            <Badge className="bg-[#0f2044] text-white px-4 py-2 text-sm">
              {userDepartment}
            </Badge>
          ) : null}
        </div>
      </div>

      <Card className="shadow-md border-l-4 border-l-[#ffb71b]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-[#0f2044]">
            <span className="flex items-center gap-2">
              <Clock className="size-5 text-[#ffb71b]" />
              Quick Actions
            </span>
            {onNavigate && activeSemester && (
              <Button
                variant="outline"
                className="border-[#0f2044] text-[#0f2044] hover:bg-[#0f2044]/5 text-xs sm:text-sm"
                onClick={async () => {
                  if (!activeSemester) {
                    alert('No active semester selected.');
                    return;
                  }
                  setDownloadingCoverage(true);
                  try {
                    // Department-scoped coverage: only this department's class groups and courses
                    const res = await api.canPublishSemester((activeSemester as any).semester_id ?? (activeSemester as any).id, {
                      department: userDepartment,
                    });
                    if (!res.success || !res.data) {
                      alert(res.error || 'Unable to generate coverage report.');
                      return;
                    }
                    const missing = Array.isArray(res.data.missing) ? res.data.missing : [];
                    if (missing.length === 0) {
                      alert('All required courses in this department have the required hours scheduled for every class. No missing entries to report.');
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
                    const semLabel = activeSemester ? String(activeSemester).replace(/\s+/g, '_') : 'semester';
                    const deptLabel = userDepartment ? userDepartment.replace(/\s+/g, '_') : 'department';
                    a.download = `coverage_report_${deptLabel}_${semLabel}.csv`;
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
                }}
                disabled={downloadingCoverage}
              >
                {downloadingCoverage ? 'Preparing Coverage Report…' : 'Download Coverage Report'}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {onNavigate && (
              <>
                <Button onClick={() => onNavigate('timetable-scheduling')} className="flex flex-col items-center gap-2 bg-[#0f2044] hover:bg-[#0f2044]/90 text-white py-6 h-auto">
                  <Clock className="size-6" />
                  <span>Schedule Lecture</span>
                </Button>
                <Button onClick={() => onNavigate('class-management')} variant="outline" className="flex flex-col items-center gap-2 border-[#0f2044] text-[#0f2044] hover:bg-[#0f2044]/5 py-6 h-auto">
                  <LayoutGrid className="size-6" />
                  <span>Class Management</span>
                </Button>
                <Button onClick={() => onNavigate('courses-management')} variant="outline" className="flex flex-col items-center gap-2 border-[#0f2044] text-[#0f2044] hover:bg-[#0f2044]/5 py-6 h-auto">
                  <BookOpen className="size-6" />
                  <span>Course Management</span>
                </Button>
                <Button onClick={() => onNavigate('lecturers-management')} variant="outline" className="flex flex-col items-center gap-2 border-[#0f2044] text-[#0f2044] hover:bg-[#0f2044]/5 py-6 h-auto">
                  <Users className="size-6" />
                  <span>Lecturer Management</span>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
