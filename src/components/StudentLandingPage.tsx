import {
  CheckCircle,
  Download,
  Search,
  Smartphone
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Api from '../services/api';
import { StudentTimetableView } from './StudentTimetableView';
import TimetableSearch from './TimetableSearch';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function StudentLandingPage({ onOfficerLoginClick }: { onOfficerLoginClick: () => void }) {
  const [selectedSession, setSelectedSession] = useState('');
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [allSessions, setAllSessions] = useState<{ session_id: number; name: string; start_date: string; end_date: string; status: string; is_current: boolean }[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [departments, setDepartments] = useState<{ department_id: number; name: string }[]>([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [showTimetable, setShowTimetable] = useState(false);
  const [searchView, setSearchView] = useState<'classic' | 'advanced'>('classic');

  // Reset group when level changes
  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    setSelectedGroup(''); // Reset group when level changes
  };

  // Get available groups based on selected level
  const getGroupsForLevel = () => {
    if (!selectedLevel) return [];
    if (selectedLevel === '400') return ['A', 'B']; // 400 level has only 2 groups
    return ['A', 'B', 'C', 'D', 'E']; // Other levels have 5 groups
  };

  const handleViewTimetable = () => {
    setShowTimetable(true);
  };

  const handleBackToSearch = () => {
    setShowTimetable(false);
  };

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

  // If viewing timetable, show the timetable view
  if (showTimetable) {
    return (
      <StudentTimetableView
        session={selectedSession}
        semester={selectedSemester}
        course={selectedCourse}
        level={selectedLevel}
        group={selectedGroup}
        onBack={handleBackToSearch}
      />
    );
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
          {searchView === 'classic' ? (
            <Card className="shadow-xl border-2 border-slate-200">
              <div className="bg-[#0f2044] text-white p-6 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
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
                <Button
                  onClick={() => setSearchView('advanced')}
                  variant="outline"
                  className="text-white border-white hover:bg-white/10"
                  size="sm"
                >
                  Try Advanced Search
                </Button>
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
                    <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                      <SelectTrigger className="h-12 border-2 border-slate-300 focus:border-[#ffb71b]">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent className="">
                        <SelectItem className="" value="1st">1st Semester</SelectItem>
                        <SelectItem className="" value="2nd">2nd Semester</SelectItem>
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

                  {/* Group */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#0f2044]">
                      Group
                    </label>
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                      <SelectTrigger className="h-12 border-2 border-slate-300 focus:border-[#ffb71b]">
                        <SelectValue placeholder="Select group" />
                      </SelectTrigger>
                      <SelectContent className="">
                        {getGroupsForLevel().map(group => (
                          <SelectItem className="" key={group} value={group}>{selectedLevel} Level - Group {group}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleViewTimetable}
                  disabled={!selectedSession || !selectedSemester || !selectedCourse || !selectedLevel || !selectedGroup}
                  className="w-full h-14 bg-[#0f2044] hover:bg-[#0f2044]/90 text-white font-semibold text-lg"
                >
                  <Search className="mr-2 size-5" />
                  View Timetable
                </Button>
              </div>
            </Card>
          ) : (
            <TimetableSearch />
          )}
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