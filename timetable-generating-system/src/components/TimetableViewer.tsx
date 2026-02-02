import { useState } from 'react';
import { TimetableGrid } from './TimetableGrid';
import { TimetableScheduler } from './TimetableScheduler';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Download, Eye, Edit, Printer } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function TimetableViewer({ userRole, department }) {
  const [viewMode, setViewMode] = useState('schedule');
  const [selectedDepartment, setSelectedDepartment] = useState(department || 'Computer Science');
  const [selectedLevel, setSelectedLevel] = useState('200');
  const [selectedGroup, setSelectedGroup] = useState('A');

  // Sample timetable data - this would come from the scheduler
  const sampleEntries = [
    {
      day: 'Monday',
      time: '8:00 AM - 9:00 AM',
      course: {
        courseCode: 'COSC 201',
        courseTitle: 'Data Structures and Algorithms',
        lecturer: 'Dr. Emmanuel Adeyemi',
        venue: 'Lab 2',
        duration: 1,
      },
    },
    {
      day: 'Monday',
      time: '10:00 AM - 11:00 AM',
      course: {
        courseCode: 'COSC 203',
        courseTitle: 'Object Oriented Programming',
        lecturer: 'Prof. Grace Okon',
        venue: 'LT 3',
        duration: 1,
      },
    },
    {
      day: 'Tuesday',
      time: '9:00 AM - 10:00 AM',
      course: {
        courseCode: 'GEDS 201',
        courseTitle: 'Communication Skills II',
        lecturer: 'Dr. Samuel Akinola',
        venue: 'LT 1',
        duration: 1,
      },
    },
    {
      day: 'Tuesday',
      time: '2:00 PM - 3:00 PM',
      course: {
        courseCode: 'COSC 205',
        courseTitle: 'Computer Architecture',
        lecturer: 'Dr. Emmanuel Adeyemi',
        venue: 'Lab 1',
        duration: 1,
      },
    },
    {
      day: 'Thursday',
      time: '8:00 AM - 9:00 AM',
      course: {
        courseCode: 'COSC 207',
        courseTitle: 'Database Management Systems',
        lecturer: 'Dr. Blessing Okoro',
        venue: 'Lab 3',
        duration: 1,
      },
    },
    {
      day: 'Thursday',
      time: '11:00 AM - 12:00 PM',
      course: {
        courseCode: 'GST 201',
        courseTitle: 'Philosophy and Logic',
        lecturer: 'Prof. David Adewale',
        venue: 'LT 2',
        duration: 1,
      },
    },
    {
      day: 'Friday',
      time: '10:00 AM - 11:00 AM',
      course: {
        courseCode: 'COSC 209',
        courseTitle: 'Web Technologies',
        lecturer: 'Dr. Grace Okon',
        venue: 'Lab 2',
        duration: 1,
      },
    },
    {
      day: 'Friday',
      time: '1:00 PM - 2:00 PM',
      course: {
        courseCode: 'COSC 211',
        courseTitle: 'Systems Analysis and Design',
        lecturer: 'Dr. Samuel Akinola',
        venue: 'LT 4',
        duration: 1,
      },
    },
  ];

  const handleExportTimetable = () => {
    toast.success('Timetable exported successfully!');
  };

  const handlePrintTimetable = () => {
    window.print();
    toast.success('Opening print dialog...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0f2044]">Timetable Management</h2>
          <p className="text-slate-600 mt-1">
            {userRole === 'school-officer'
              ? 'Create and manage timetables for all departments'
              : `Manage ${department} timetables`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-[#0f2044] text-[#0f2044] hover:bg-[#0f2044]/5"
            onClick={handlePrintTimetable}
          >
            <Printer className="mr-2 size-4" />
            Print
          </Button>
          <Button
            className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
            onClick={handleExportTimetable}
          >
            <Download className="mr-2 size-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'schedule' | 'preview')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Edit className="size-4" />
            Schedule Courses
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="size-4" />
            Preview Timetable
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-6">
          <TimetableScheduler userRole={userRole} department={department} />
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <div className="space-y-6">
            {/* Filter Options */}
            <Card className="border-l-4 border-l-[#ffb71b]">
              <CardHeader>
                <CardTitle className="text-[#0f2044]">View Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {userRole === 'school-officer' && (
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                          <SelectItem value="Information Technology">Information Technology</SelectItem>
                          <SelectItem value="Information Systems">Information Systems</SelectItem>
                          <SelectItem value="Cyber Security">Cyber Security</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Level</Label>
                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="200">200</SelectItem>
                        <SelectItem value="300">300</SelectItem>
                        <SelectItem value="400">400</SelectItem>
                        <SelectItem value="500">500</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Group</Label>
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                      <SelectTrigger>
                        <SelectValue />
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
              </CardContent>
            </Card>

            {/* Timetable Grid */}
            <TimetableGrid
              department={selectedDepartment}
              level={selectedLevel}
              group={selectedGroup}
              semester="1st Semester"
              session="2025/2026"
              entries={sampleEntries}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}