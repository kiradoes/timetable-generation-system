import { useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  GraduationCap, 
  Calendar, 
  Download, 
  Smartphone,
  CheckCircle,
  Users,
  BookOpen,
  Clock,
  Search
} from 'lucide-react';
import { StudentTimetableView } from './StudentTimetableView';

export function StudentLandingPage({ onOfficerLoginClick }) {
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [showTimetable, setShowTimetable] = useState(false);

  // Reset group when level changes
  const handleLevelChange = (level) => {
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
              <div className="bg-[#ffb71b] rounded-lg p-2">
                <GraduationCap className="size-6 text-[#0f2044]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">BUCC</h1>
                <p className="text-xs text-[#ffb71b]">Timetable System</p>
              </div>
            </div>
            <Button
              onClick={onOfficerLoginClick}
              className="bg-[#ffb71b] hover:bg-[#ffb71b]/90 text-[#0f2044] font-semibold"
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
            Welcome to BUCC
          </h2>
          <p className="text-xl md:text-2xl text-[#ffb71b] mb-6">
            Computer-Aided Timetable System
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
            <div className="bg-[#0f2044] text-white p-6 rounded-t-lg">
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
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Academic Session */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0f2044]">
                    Academic Session
                  </label>
                  <Select value={selectedSession} onValueChange={setSelectedSession}>
                    <SelectTrigger className="h-12 border-2 border-slate-300 focus:border-[#ffb71b]">
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025-2026">2025/2026</SelectItem>
                      <SelectItem value="2024-2025">2024/2025</SelectItem>
                      <SelectItem value="2023-2024">2023/2024</SelectItem>
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
                    <SelectContent>
                      <SelectItem value="1st">1st Semester</SelectItem>
                      <SelectItem value="2nd">2nd Semester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Course of Study */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#0f2044]">
                    Course of Study
                  </label>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger className="h-12 border-2 border-slate-300 focus:border-[#ffb71b]">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="computer-science">Computer Science</SelectItem>
                      <SelectItem value="software-engineering">Software Engineering</SelectItem>
                      <SelectItem value="information-technology">Information Technology</SelectItem>
                      <SelectItem value="information-systems">Information Systems</SelectItem>
                      <SelectItem value="cyber-security">Cyber Security</SelectItem>
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
                    <SelectContent>
                      <SelectItem value="100">100 Level</SelectItem>
                      <SelectItem value="200">200 Level</SelectItem>
                      <SelectItem value="300">300 Level</SelectItem>
                      <SelectItem value="400">400 Level</SelectItem>
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
                    <SelectContent>
                      {getGroupsForLevel().map(group => (
                        <SelectItem key={group} value={group}>{selectedLevel} Level - Group {group}</SelectItem>
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
        </div>
      </section>

      {/* Why Choose Our System Section */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-[#0f2044] mb-4">
              Why Choose Our System?
            </h3>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              A comprehensive, computer-aided solution designed to streamline academic scheduling and enhance the educational experience at BUCC.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Smart Scheduling */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow border-2 border-slate-200 hover:border-[#ffb71b]">
              <div className="inline-flex items-center justify-center bg-blue-100 rounded-full p-4 mb-4">
                <Calendar className="size-8 text-blue-600" />
              </div>
              <h4 className="font-bold text-[#0f2044] mb-2 text-lg">Smart Scheduling</h4>
              <p className="text-sm text-slate-600">
                Automated conflict detection ensures no overlapping classes
              </p>
            </Card>

            {/* Multi-Role Access */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow border-2 border-slate-200 hover:border-[#ffb71b]">
              <div className="inline-flex items-center justify-center bg-green-100 rounded-full p-4 mb-4">
                <Users className="size-8 text-green-600" />
              </div>
              <h4 className="font-bold text-[#0f2044] mb-2 text-lg">Multi-Role Access</h4>
              <p className="text-sm text-slate-600">
                Separate portals for students, lecturers, and officers
              </p>
            </Card>

            {/* Course Management */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow border-2 border-slate-200 hover:border-[#ffb71b]">
              <div className="inline-flex items-center justify-center bg-purple-100 rounded-full p-4 mb-4">
                <BookOpen className="size-8 text-purple-600" />
              </div>
              <h4 className="font-bold text-[#0f2044] mb-2 text-lg">Course Management</h4>
              <p className="text-sm text-slate-600">
                Comprehensive course and venue allocation system
              </p>
            </Card>

            {/* Real-Time Updates */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow border-2 border-slate-200 hover:border-[#ffb71b]">
              <div className="inline-flex items-center justify-center bg-orange-100 rounded-full p-4 mb-4">
                <Clock className="size-8 text-orange-600" />
              </div>
              <h4 className="font-bold text-[#0f2044] mb-2 text-lg">Real-Time Updates</h4>
              <p className="text-sm text-slate-600">
                Instant notifications for schedule changes and updates
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f2044] text-white py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-300">
            © 2026 Babcock University Computer Club. All rights reserved.
          </p>
          <p className="text-sm text-slate-400 mt-2">
            Computer-Aided Timetable Management System
          </p>
        </div>
      </footer>
    </div>
  );
}