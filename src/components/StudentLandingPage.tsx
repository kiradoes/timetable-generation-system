import {
  CheckCircle,
  Download,
  Search,
  Smartphone
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Api from '../services/api';
import { DepartmentLevelTimetableView } from './DepartmentLevelTimetableView';
import { StudentTimetableView } from './StudentTimetableView';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const LANDING_STORAGE_KEY = 'studentLandingState';

function getStoredLandingState() {
  try {
    const raw = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(LANDING_STORAGE_KEY) : null;
    if (!raw) return null;
    const o = JSON.parse(raw);
    const mode = o?.timetableViewMode === 'level' || o?.timetableViewMode === 'department' ? o.timetableViewMode : 'group';
    return {
      session: typeof o?.session === 'string' ? o.session : '',
      semester: typeof o?.semester === 'string' ? o.semester : '',
      course: typeof o?.course === 'string' ? o.course : '',
      level: typeof o?.level === 'string' ? o.level : '',
      group: typeof o?.group === 'string' ? o.group : '',
      showTimetable: !!o?.showTimetable,
      timetableViewMode: mode,
    };
  } catch {
    return null;
  }
}

function setStoredLandingState(state: { session: string; semester: string; course: string; level: string; group: string; showTimetable: boolean; timetableViewMode: 'group' | 'level' | 'department' }) {
  try {
    sessionStorage.setItem(LANDING_STORAGE_KEY, JSON.stringify(state));
  } catch (_) {}
}

export function StudentLandingPage({ onOfficerLoginClick }: { onOfficerLoginClick: () => void }) {
  const stored = getStoredLandingState();
  const [selectedSession, setSelectedSession] = useState(stored?.session ?? '');
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [allSessions, setAllSessions] = useState<{ session_id: number; name: string; start_date: string; end_date: string; status: string; is_current: boolean }[]>([]);
  const [allSemesters, setAllSemesters] = useState<{ semester_id: number; name: string; session_id: number; status?: string }[]>([]);
  const [selectedSemester, setSelectedSemester] = useState(stored?.semester ?? '');
  const [selectedCourse, setSelectedCourse] = useState(stored?.course ?? '');
  const [departments, setDepartments] = useState<{ department_id: number; name: string }[]>([]);
  const [selectedLevel, setSelectedLevel] = useState(stored?.level ?? '');
  const [selectedGroup, setSelectedGroup] = useState(stored?.group ?? '');
  const [showTimetable, setShowTimetable] = useState(stored?.showTimetable ?? false);
  const [timetableViewMode, setTimetableViewMode] = useState<'group' | 'level' | 'department'>(stored?.timetableViewMode ?? 'group');
  const [resolvedSessionId, setResolvedSessionId] = useState<number | null>(null);
  const [resolvedClassGroupId, setResolvedClassGroupId] = useState<number | null>(null);
  const [resolvingIds, setResolvingIds] = useState(false);

  // Reset group when level changes
  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    setSelectedGroup(''); // Reset group when level changes
  };

  // Clear resolved ids when user changes selection so we never show another class's timetable
  useEffect(() => {
    setResolvedSessionId(null);
    setResolvedClassGroupId(null);
  }, [selectedSession, selectedCourse, selectedLevel, selectedGroup]);

  // Fetch semesters for the selected session so the landing page shows all semesters (First, Second, Summer, Post-SIWES, etc.)
  useEffect(() => {
    if (!selectedSession) {
      setAllSemesters([]);
      setSelectedSemester('');
      return;
    }
    const session = allSessions.find((s) => s.name === selectedSession);
    const sessionId = session?.session_id;
    if (!sessionId) {
      setAllSemesters([]);
      setSelectedSemester('');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await Api.getSemestersBySession(sessionId) as { success?: boolean; data?: { semester_id: number; name: string; session_id: number; status?: string }[] };
        if (cancelled) return;
        const list = (res?.success && Array.isArray(res?.data)) ? res.data : [];
        setAllSemesters(list);
        setSelectedSemester((prev) => (list.length > 0 && list.some((s) => s.name === prev)) ? prev : (list[0]?.name ?? ''));
      } catch (_) {
        if (!cancelled) setAllSemesters([]);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedSession, allSessions]);

  // Get available groups based on selected level
  const getGroupsForLevel = () => {
    if (!selectedLevel) return [];
    if (selectedLevel === '400') return ['A', 'B']; // 400 level has only 2 groups
    return ['A', 'B', 'C', 'D', 'E']; // Other levels have 5 groups
  };

  const handleViewTimetable = (mode: 'group' | 'level' | 'department') => {
    setTimetableViewMode(mode);
    setShowTimetable(true);
  };

  const handleBackToSearch = () => {
    setShowTimetable(false);
    setResolvedSessionId(null);
    setResolvedClassGroupId(null);
    setResolvingIds(false);
  };

  // Persist landing form and view so refresh keeps the same page
  useEffect(() => {
    setStoredLandingState({
      session: selectedSession,
      semester: selectedSemester,
      course: selectedCourse,
      level: selectedLevel,
      group: selectedGroup,
      showTimetable,
      timetableViewMode,
    });
  }, [selectedSession, selectedSemester, selectedCourse, selectedLevel, selectedGroup, showTimetable, timetableViewMode]);

  const formatStatusLabel = (status: string) => {
    if (!status) return 'Inactive';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  useEffect(() => {
    const fetchAllSessions = async () => {
      try {
        const res = await Api.getSessions();
        if (!res || !res.success) {
          setAllSessions([]);
          setCurrentSession(null);
          return;
        }

        const sessions = res.data || [];
        setAllSessions(sessions);

        const current = sessions.find((s: any) => s.is_current && s.status === 'active');
        const firstActive = sessions.find((s: any) => s.status === 'active');
        const defaultSession = current || firstActive || sessions[0];

        if (defaultSession) {
          setCurrentSession(defaultSession.name);
          setSelectedSession(defaultSession.name);
        }
      } catch (error) {
        console.error('Failed to load sessions:', error);
        setAllSessions([]);
        setCurrentSession(null);
      }
    };

    const fetchActiveDepartments = async () => {
      try {
        const res = await Api.getActiveDepartments();
        if (!res || !res.success) {
          setDepartments([]);
          return;
        }
        const deptList = res.data || [];
        setDepartments(deptList);
      } catch (error) {
        console.error('Failed to load active departments:', error);
        setDepartments([]);
      }
    };

    fetchAllSessions();
    fetchActiveDepartments();
  }, []);

  const sessionIdForDeptLevel = allSessions.find((s) => s.name === selectedSession)?.session_id ?? null;

  // Resolve sessionId and classGroupId when viewing group timetable
  useEffect(() => {
    if (!showTimetable || timetableViewMode !== 'group' || !selectedSession || !selectedCourse || !selectedLevel || !selectedGroup) {
      return;
    }
    let cancelled = false;
    setResolvedSessionId(null);
    setResolvedClassGroupId(null);
    setResolvingIds(true);
    (async () => {
      try {
        const session = allSessions.find((s: { name: string }) => s.name === selectedSession);
        const sessionId = session?.session_id ?? null;
        if (!sessionId || cancelled) {
          setResolvedSessionId(null);
          setResolvedClassGroupId(null);
          setResolvingIds(false);
          return;
        }
        const levelNum = parseInt(selectedLevel, 10);
        const res = await Api.getClassGroups({
          session_id: sessionId,
          department: selectedCourse,
          level: levelNum,
          status: 'active'
        });
        if (cancelled) {
          setResolvingIds(false);
          return;
        }
        const list = (res?.success && Array.isArray(res?.data)) ? res.data : [];
        const groupName = selectedGroup.replace(/^Group\s+/i, '').trim() || selectedGroup;
        const match = list.find((g: { name: string }) => String(g?.name).trim() === groupName || String(g?.name).trim() === selectedGroup);
        if (match) {
          setResolvedSessionId(sessionId);
          setResolvedClassGroupId(match.group_id ?? match.id);
        } else {
          setResolvedSessionId(null);
          setResolvedClassGroupId(null);
        }
      } catch (_) {
        if (!cancelled) {
          setResolvedSessionId(null);
          setResolvedClassGroupId(null);
        }
      } finally {
        if (!cancelled) setResolvingIds(false);
      }
    })();
    return () => { cancelled = true; };
  }, [showTimetable, timetableViewMode, selectedSession, selectedCourse, selectedLevel, selectedGroup, allSessions]);

  // If viewing timetable, show the appropriate view
  if (showTimetable) {
    if (timetableViewMode === 'level' || timetableViewMode === 'department') {
      const sessionId = sessionIdForDeptLevel;
      if (sessionId != null && selectedSession && selectedSemester && selectedCourse) {
        return (
          <DepartmentLevelTimetableView
            session={selectedSession}
            semester={selectedSemester}
            department={selectedCourse}
            level={timetableViewMode === 'level' ? selectedLevel : undefined}
            scope={timetableViewMode}
            onBack={handleBackToSearch}
            sessionId={sessionId}
          />
        );
      }
      if (selectedSession && allSessions.length === 0) {
        return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f2044] mx-auto mb-4" />
              <p className="text-slate-600">Loading...</p>
            </div>
          </div>
        );
      }
    }
    if (timetableViewMode === 'group') {
      if (resolvingIds) {
        return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f2044] mx-auto mb-4" />
              <p className="text-slate-600">Loading your timetable...</p>
            </div>
          </div>
        );
      }
      return (
        <StudentTimetableView
          session={selectedSession}
          semester={selectedSemester}
          course={selectedCourse}
          level={selectedLevel}
          group={selectedGroup}
          onBack={handleBackToSearch}
          sessionId={resolvedSessionId ?? undefined}
          classGroupId={resolvedClassGroupId ?? undefined}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#0f2044]">
      {/* Header */}
      <header className="bg-[#0f2044] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-lg p-2">
                <img src="/bucc-logo-raw.png" alt="School of Computing Logo" className="size-8 object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">School of Computing</h1>
                <p className="text-xs text-slate-300">Timetable System</p>
              </div>
            </div>
            <Button
              onClick={() => {
                console.log('Officer Login button clicked');
                onOfficerLoginClick();
              }}
              className="bg-[#0f2044] hover:bg-white text-white hover:text-[#0f2044] font-semibold transition-all duration-300 ease-in-out border border-white/20"
            >
              Officer Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[#0f2044] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to School of Computing Timetable System
          </h2>
          <p className="text-xl md:text-2xl text-[#ffb71b] mb-6">
            School of Computing Timetable Generating System
          </p>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-8">
            Discover your personalized academic schedule instantly. Search by session, semester, course, and level to view your conflict-free timetable.
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <div className="bg-[#ffb71b] rounded-full p-1.5">
                <CheckCircle className="size-4 text-[#0f2044]" />
              </div>
              <span className="text-sm font-medium">Conflict-Free Schedules</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <div className="bg-[#ffb71b] rounded-full p-1.5">
                <Download className="size-4 text-[#0f2044]" />
              </div>
              <span className="text-sm font-medium">Instant PDF Downloads</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <div className="bg-[#ffb71b] rounded-full p-1.5">
                <Smartphone className="size-4 text-[#0f2044]" />
              </div>
              <span className="text-sm font-medium">Mobile Responsive</span>
            </div>
          </div>
        </div>
      </section>

      {/* Find Your Timetable Section */}
      <section className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl border-2 border-slate-200">
              <div className="bg-[#0f2044] text-white p-6 rounded-t-lg flex items-center gap-3">
                <div className="bg-[#ffb71b] rounded-full p-2">
                  <Search className="size-5 text-[#0f2044]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Find Your Timetable</h3>
                  <p className="text-slate-300 text-sm mt-1">
                    Select your academic details to view your personalized schedule
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Academic Session */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#0f2044]">
                      Academic Session
                    </label>
                    <Select value={selectedSession} onValueChange={setSelectedSession} disabled={allSessions.length === 0}>
                      <SelectTrigger className="h-12 border-2 border-slate-300 focus:border-[#ffb71b]">
                        <SelectValue placeholder="Select session" />
                      </SelectTrigger>
                      <SelectContent className="">
                        {allSessions.map((session) => (
                          <SelectItem key={session.session_id} value={session.name}>
                            {session.name.replace(/-/g, '/')} ({formatStatusLabel(session.status)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Semester */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#0f2044]">
                      Semester
                    </label>
                    <Select value={selectedSemester} onValueChange={setSelectedSemester} disabled={allSemesters.length === 0}>
                      <SelectTrigger className="h-12 border-2 border-slate-300 focus:border-[#ffb71b]">
                        <SelectValue placeholder={allSemesters.length === 0 ? 'Select session first' : 'Select semester'} />
                      </SelectTrigger>
                      <SelectContent className="">
                        {allSemesters.map((sem) => {
                          const label = sem.name?.trim() ? `${sem.name}${sem.name.toLowerCase().includes('semester') ? '' : ' Semester'}` : 'Semester';
                          return (
                            <SelectItem key={sem.semester_id} className="" value={sem.name}>
                              {label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Course of Study */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#0f2044]">
                      Course of Study
                    </label>
                    <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={departments.length === 0}>
                      <SelectTrigger className="h-12 border-2 border-slate-300 focus:border-[#ffb71b]">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent className="">
                        {departments.map((dept) => (
                          <SelectItem key={dept.department_id} className="" value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Level */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#0f2044]">
                      Level
                    </label>
                    <Select value={selectedLevel} onValueChange={handleLevelChange}>
                      <SelectTrigger className="h-12 border-2 border-slate-300 focus:border-[#ffb71b]">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent className="">
                        <SelectItem className="" value="100">100 Level</SelectItem>
                        <SelectItem className="" value="200">200 Level</SelectItem>
                        <SelectItem className="" value="300">300 Level</SelectItem>
                        <SelectItem className="" value="400">400 Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Class */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#0f2044]">
                      Class
                    </label>
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                      <SelectTrigger className="h-12 border-2 border-slate-300 focus:border-[#ffb71b]">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent className="">
                        {getGroupsForLevel().map(group => (
                          <SelectItem className="" key={group} value={group}>{selectedLevel} Level - Class {group}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => handleViewTimetable('group')}
                    disabled={!selectedSession || !selectedSemester || !selectedCourse || !selectedLevel || !selectedGroup}
                    className="w-full h-12 bg-[#0f2044] hover:bg-[#0f2044]/90 text-white font-semibold"
                  >
                    <Search className="mr-2 size-5" />
                    View my timetable (by class)
                  </Button>
                  <Button
                    onClick={() => handleViewTimetable('level')}
                    disabled={!selectedSession || !selectedSemester || !selectedCourse || !selectedLevel}
                    variant="outline"
                    className="w-full h-11 border-2 border-[#0f2044] text-[#0f2044] hover:bg-[#0f2044]/5 font-medium"
                  >
                    View level timetable (all classes)
                  </Button>
                  <Button
                    onClick={() => handleViewTimetable('department')}
                    disabled={!selectedSession || !selectedSemester || !selectedCourse}
                    variant="outline"
                    className="w-full h-11 border-2 border-slate-400 text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    View department timetable (all levels & classes)
                  </Button>
                </div>
              </div>
            </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f2044] text-white py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-300">
            © 2026 Babcock University Computer Club. All rights reserved.
          </p>
          <p className="text-sm text-slate-400 mt-2">
            Computer-Aided Timetable Generation System
          </p>
        </div>
      </footer>
    </div>
  );
}