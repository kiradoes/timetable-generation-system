import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function TimetableDiscovery({ onSearch }: { onSearch: (data: any) => void }) {
  const [session, setSession] = useState('');
  const [sessions, setSessions] = useState<{ name: string; status: string; is_current: boolean }[]>([]);
  const [semester, setSemester] = useState('');
  const [course, setCourse] = useState('');
  const [level, setLevel] = useState('');
  const [group, setGroup] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await api.getSessions({}) as any;
        if (!response.success) {
          setSessions([]);
          return;
        }

        const allSessions = response.data || [];
        setSessions(allSessions);
        const current = allSessions.find((item: any) => item.is_current && item.status === 'active');
        if (current?.name) {
          setSession(current.name);
        }
      } catch (error) {
        console.error('Failed to load sessions:', error);
        setSessions([]);
      }
    };

    fetchSessions();
  }, []);

  const handleSearch = () => {
    if (session && semester && course && level && group) {
      onSearch({ session, semester, course, level, group });
    }
  };

  const isSearchDisabled = !session || !semester || !course || !level || !group;

  return (
    <div className="bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <Card className="shadow-xl border-t-4 border-t-slate-300">
          <CardHeader className="bg-gradient-to-r from-[#0f2044] to-[#0f2044]/90 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Search className="size-6 text-white" />
              View Your Timetable
            </CardTitle>
            <p className="text-slate-200 text-sm mt-2">
              Choose your session, department, and level to view your schedule
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
              {/* Session */}
              <div className="space-y-2">
                <Label htmlFor="session" className="text-[#0f2044] font-semibold">
                  Academic Session
                </Label>
                <Select value={session} onValueChange={setSession} disabled={sessions.length === 0}>
                  <SelectTrigger id="session" className="border-slate-300 focus:border-[#0f2044] focus:ring-[#0f2044]">
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent className="">
                    {sessions.map((item: any) => (
                      <SelectItem key={item.session_id} value={item.name} className="">
                        {item.name.replace('-', '/')} {item.status === 'active' ? '(active)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Semester */}
              <div className="space-y-2">
                <Label htmlFor="semester" className="text-[#0f2044] font-semibold">
                  Semester
                </Label>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger id="semester" className="border-slate-300 focus:border-[#0f2044] focus:ring-[#0f2044]">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent className="">
                    <SelectItem value="first" className="">First Semester</SelectItem>
                    <SelectItem value="second" className="">Second Semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Course */}
              <div className="space-y-2">
                <Label htmlFor="course" className="text-[#0f2044] font-semibold">
                  Course of Study
                </Label>
                <Select value={course} onValueChange={setCourse}>
                  <SelectTrigger id="course" className="border-slate-300 focus:border-[#0f2044] focus:ring-[#0f2044]">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent className="">
                    <SelectItem value="cs" className="">Computer Science</SelectItem>
                    <SelectItem value="se" className="">Software Engineering</SelectItem>
                    <SelectItem value="it" className="">Information Technology</SelectItem>
                    <SelectItem value="ce" className="">Computer Engineering</SelectItem>
                    <SelectItem value="is" className="">Information Systems</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Level */}
              <div className="space-y-2">
                <Label htmlFor="level" className="text-[#0f2044] font-semibold">
                  Level
                </Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger id="level" className="border-slate-300 focus:border-[#0f2044] focus:ring-[#0f2044]">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="">
                    <SelectItem value="100" className="">100</SelectItem>
                    <SelectItem value="200" className="">200</SelectItem>
                    <SelectItem value="300" className="">300</SelectItem>
                    <SelectItem value="400" className="">400</SelectItem>
                    <SelectItem value="500" className="">500</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Class */}
              <div className="space-y-2">
                <Label htmlFor="group" className="text-[#0f2044] font-semibold">
                  Class
                </Label>
                <Select value={group} onValueChange={setGroup}>
                  <SelectTrigger id="group" className="border-slate-300 focus:border-[#0f2044] focus:ring-[#0f2044]">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent className="">
                    <SelectItem value="A" className="">Class A</SelectItem>
                    <SelectItem value="B" className="">Class B</SelectItem>
                    <SelectItem value="C" className="">Class C</SelectItem>
                    <SelectItem value="D" className="">Class D</SelectItem>
                    <SelectItem value="E" className="">Class E</SelectItem>
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