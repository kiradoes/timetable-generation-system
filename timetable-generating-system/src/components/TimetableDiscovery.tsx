import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Search, Calendar } from 'lucide-react';

export function TimetableDiscovery({ onSearch }) {
  const [session, setSession] = useState('');
  const [semester, setSemester] = useState('');
  const [course, setCourse] = useState('');
  const [level, setLevel] = useState('');
  const [group, setGroup] = useState('');

  const handleSearch = () => {
    if (session && semester && course && level && group) {
      onSearch({ session, semester, course, level, group });
    }
  };

  const isSearchDisabled = !session || !semester || !course || !level || !group;

  return (
    <div className="bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <Card className="shadow-xl border-t-4 border-t-[#ffb71b]">
          <CardHeader className="bg-gradient-to-r from-[#0f2044] to-[#0f2044]/90 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Search className="size-6 text-[#ffb71b]" />
              Find Your Timetable
            </CardTitle>
            <p className="text-slate-200 text-sm mt-2">
              Select your academic details to view your personalized schedule
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
              {/* Session */}
              <div className="space-y-2">
                <Label htmlFor="session" className="text-[#0f2044] font-semibold">
                  Academic Session
                </Label>
                <Select value={session} onValueChange={setSession}>
                  <SelectTrigger id="session" className="border-slate-300 focus:border-[#ffb71b] focus:ring-[#ffb71b]">
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023-2024">2023/2024</SelectItem>
                    <SelectItem value="2024-2025">2024/2025</SelectItem>
                    <SelectItem value="2025-2026">2025/2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Semester */}
              <div className="space-y-2">
                <Label htmlFor="semester" className="text-[#0f2044] font-semibold">
                  Semester
                </Label>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger id="semester" className="border-slate-300 focus:border-[#ffb71b] focus:ring-[#ffb71b]">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first">First Semester</SelectItem>
                    <SelectItem value="second">Second Semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Course */}
              <div className="space-y-2">
                <Label htmlFor="course" className="text-[#0f2044] font-semibold">
                  Course of Study
                </Label>
                <Select value={course} onValueChange={setCourse}>
                  <SelectTrigger id="course" className="border-slate-300 focus:border-[#ffb71b] focus:ring-[#ffb71b]">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cs">Computer Science</SelectItem>
                    <SelectItem value="se">Software Engineering</SelectItem>
                    <SelectItem value="it">Information Technology</SelectItem>
                    <SelectItem value="ce">Computer Engineering</SelectItem>
                    <SelectItem value="is">Information Systems</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Level */}
              <div className="space-y-2">
                <Label htmlFor="level" className="text-[#0f2044] font-semibold">
                  Level
                </Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger id="level" className="border-slate-300 focus:border-[#ffb71b] focus:ring-[#ffb71b]">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100 Level</SelectItem>
                    <SelectItem value="200">200 Level</SelectItem>
                    <SelectItem value="300">300 Level</SelectItem>
                    <SelectItem value="400">400 Level</SelectItem>
                    <SelectItem value="500">500 Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Group */}
              <div className="space-y-2">
                <Label htmlFor="group" className="text-[#0f2044] font-semibold">
                  Group
                </Label>
                <Select value={group} onValueChange={setGroup}>
                  <SelectTrigger id="group" className="border-slate-300 focus:border-[#ffb71b] focus:ring-[#ffb71b]">
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Group A</SelectItem>
                    <SelectItem value="B">Group B</SelectItem>
                    <SelectItem value="C">Group C</SelectItem>
                    <SelectItem value="D">Group D</SelectItem>
                    <SelectItem value="E">Group E</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex justify-center md:justify-end">
              <Button
                onClick={handleSearch}
                disabled={isSearchDisabled}
                className="w-full md:w-auto bg-[#0f2044] hover:bg-[#0f2044]/90 text-white px-8 py-6 text-lg"
                size="lg"
              >
                <Search className="mr-2 size-5" />
                View Timetable
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}