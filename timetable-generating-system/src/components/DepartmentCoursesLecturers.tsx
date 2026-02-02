import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BookOpen, UserCircle, Plus, Edit, Trash2, Search, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

export function DepartmentCoursesLecturers({ userDepartment }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('courses');
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isAddLecturerModalOpen, setIsAddLecturerModalOpen] = useState(false);

  const [courses, setCourses] = useState([
    { id: '1', code: 'COSC424', title: 'Advanced Algorithms', units: 3, level: '400', semester: 'first' },
    { id: '2', code: 'COSC301', title: 'Database Management', units: 3, level: '300', semester: 'first' },
    { id: '3', code: 'COS202', title: 'Data Structures', units: 3, level: '200', semester: 'first' },
  ]);

  const [lecturers, setLecturers] = useState([
    {
      id: '1',
      name: 'Dr. Adeyemi Johnson',
      email: 'a.johnson@babcock.edu.ng',
      phone: '+234 803 123 4567',
      coursesTaught: ['COSC424', 'COS202'],
    },
    {
      id: '2',
      name: 'Prof. Grace Okonkwo',
      email: 'g.okonkwo@babcock.edu.ng',
      phone: '+234 802 234 5678',
      coursesTaught: ['SENG406'],
    },
    {
      id: '3',
      name: 'Dr. Michael Eze',
      email: 'm.eze@babcock.edu.ng',
      phone: '+234 805 345 6789',
      coursesTaught: ['ITGY409'],
    },
  ]);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null);

  const [courseFormData, setCourseFormData] = useState({
    code: '',
    title: '',
    units: 3,
    level: '200',
    semester: 'first' as 'first' | 'second' | 'both',
  });

  const [lecturerFormData, setLecturerFormData] = useState({
    name: '',
    email: '',
    phone: '',
    coursesTaught: '',
  });

  // Course Handlers
  const handleAddCourse = () => {
    if (!courseFormData.code || !courseFormData.title) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newCourse: Course = {
      id: String(courses.length + 1),
      ...courseFormData,
    };

    setCourses([...courses, newCourse]);
    setIsAddCourseModalOpen(false);
    resetCourseForm();
    toast.success('Course added successfully');
  };

  const handleEditCourse = () => {
    if (!selectedCourse) return;

    setCourses(courses.map(c =>
      c.id === selectedCourse.id ? { ...selectedCourse, ...courseFormData } : c
    ));
    setIsAddCourseModalOpen(false);
    setSelectedCourse(null);
    resetCourseForm();
    toast.success('Course updated successfully');
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
    toast.success('Course deleted successfully');
  };

  const openEditCourseModal = (course: Course) => {
    setSelectedCourse(course);
    setCourseFormData({
      code: course.code,
      title: course.title,
      units: course.units,
      level: course.level,
      semester: course.semester,
    });
    setIsAddCourseModalOpen(true);
  };

  const resetCourseForm = () => {
    setCourseFormData({
      code: '',
      title: '',
      units: 3,
      level: '200',
      semester: 'first',
    });
  };

  // Lecturer Handlers
  const handleAddLecturer = () => {
    if (!lecturerFormData.name || !lecturerFormData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newLecturer: Lecturer = {
      id: String(lecturers.length + 1),
      name: lecturerFormData.name,
      email: lecturerFormData.email,
      phone: lecturerFormData.phone,
      coursesTaught: lecturerFormData.coursesTaught.split(',').map(c => c.trim()).filter(c => c),
    };

    setLecturers([...lecturers, newLecturer]);
    setIsAddLecturerModalOpen(false);
    resetLecturerForm();
    toast.success('Lecturer added successfully');
  };

  const handleEditLecturer = () => {
    if (!selectedLecturer) return;

    setLecturers(lecturers.map(l =>
      l.id === selectedLecturer.id
        ? {
            ...selectedLecturer,
            ...lecturerFormData,
            coursesTaught: lecturerFormData.coursesTaught.split(',').map(c => c.trim()).filter(c => c),
          }
        : l
    ));
    setIsAddLecturerModalOpen(false);
    setSelectedLecturer(null);
    resetLecturerForm();
    toast.success('Lecturer updated successfully');
  };

  const handleDeleteLecturer = (id: string) => {
    setLecturers(lecturers.filter(l => l.id !== id));
    toast.success('Lecturer deleted successfully');
  };

  const openEditLecturerModal = (lecturer: Lecturer) => {
    setSelectedLecturer(lecturer);
    setLecturerFormData({
      name: lecturer.name,
      email: lecturer.email,
      phone: lecturer.phone,
      coursesTaught: lecturer.coursesTaught.join(', '),
    });
    setIsAddLecturerModalOpen(true);
  };

  const resetLecturerForm = () => {
    setLecturerFormData({
      name: '',
      email: '',
      phone: '',
      coursesTaught: '',
    });
  };

  return (
    <Tabs defaultValue="courses" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="courses">Department Courses</TabsTrigger>
        <TabsTrigger value="lecturers">Department Lecturers</TabsTrigger>
      </TabsList>

      {/* Courses Tab */}
      <TabsContent value="courses" className="mt-6">
        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-[#0f2044]">
                <BookOpen className="size-5 text-[#ffb71b]" />
                Computing Courses
              </CardTitle>
              <Button
                onClick={() => setIsAddCourseModalOpen(true)}
                className="bg-[#0f2044] hover:bg-[#0f2044]/90"
              >
                <Plus className="mr-2 size-4" />
                Add Course
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4 text-center">
                  <p className="text-sm text-blue-700 mb-1">Total Courses</p>
                  <p className="text-2xl font-bold text-blue-900">{courses.length}</p>
                </CardContent>
              </Card>
              {['200', '300', '400'].map(level => (
                <Card key={level} className="bg-slate-50 border-slate-200">
                  <CardContent className="pt-4 text-center">
                    <p className="text-sm text-slate-700 mb-1">{level} Level</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {courses.filter(c => c.level === level).length}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map(course => (
                    <TableRow key={course.id}>
                      <TableCell className="font-mono font-semibold text-[#0f2044]">
                        {course.code}
                      </TableCell>
                      <TableCell>{course.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{course.units}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{course.level} Level</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={course.semester === 'first' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                          {course.semester === 'first' ? 'First' : course.semester === 'second' ? 'Second' : 'Both'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openEditCourseModal(course)} className="text-blue-600">
                            <Edit className="size-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteCourse(course.id)} className="text-red-600">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Lecturers Tab */}
      <TabsContent value="lecturers" className="mt-6">
        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-[#0f2044]">
                <UserCircle className="size-5 text-[#ffb71b]" />
                Department Lecturers
              </CardTitle>
              <Button
                onClick={() => setIsAddLecturerModalOpen(true)}
                className="bg-[#0f2044] hover:bg-[#0f2044]/90"
              >
                <Plus className="mr-2 size-4" />
                Add Lecturer
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Courses Taught</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lecturers.map(lecturer => (
                    <TableRow key={lecturer.id}>
                      <TableCell className="font-semibold text-[#0f2044]">
                        {lecturer.name}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1">
                            <Mail className="size-3" />
                            <span>{lecturer.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="size-3" />
                            <span>{lecturer.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {lecturer.coursesTaught.map((course, idx) => (
                            <Badge key={idx} variant="secondary" className="font-mono text-xs">
                              {course}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openEditLecturerModal(lecturer)} className="text-blue-600">
                            <Edit className="size-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteLecturer(lecturer.id)} className="text-red-600">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Course Modals */}
      <Dialog open={isAddCourseModalOpen} onOpenChange={setIsAddCourseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Computing Course</DialogTitle>
            <DialogDescription>
              Add a new course to your department curriculum
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Course Code *</Label>
                <Input placeholder="e.g., COSC424" value={courseFormData.code} onChange={(e) => setCourseFormData({ ...courseFormData, code: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Units *</Label>
                <Input type="number" min="1" max="6" value={courseFormData.units} onChange={(e) => setCourseFormData({ ...courseFormData, units: parseInt(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Course Title *</Label>
              <Input placeholder="e.g., Advanced Algorithms" value={courseFormData.title} onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Level *</Label>
                <select value={courseFormData.level} onChange={(e) => setCourseFormData({ ...courseFormData, level: e.target.value })} className="w-full h-10 px-3 rounded-md border">
                  <option value="200">200</option>
                  <option value="300">300</option>
                  <option value="400">400</option>
                  <option value="500">500</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Semester *</Label>
                <select value={courseFormData.semester} onChange={(e) => setCourseFormData({ ...courseFormData, semester: e.target.value as any })} className="w-full h-10 px-3 rounded-md border">
                  <option value="first">First</option>
                  <option value="second">Second</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCourseModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCourse}>Add Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lecturer Modal */}
      <Dialog open={isAddLecturerModalOpen} onOpenChange={setIsAddLecturerModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Department Lecturer</DialogTitle>
            <DialogDescription>
              Add a new lecturer to your department
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input placeholder="e.g., Dr. John Doe" value={lecturerFormData.name} onChange={(e) => setLecturerFormData({ ...lecturerFormData, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" placeholder="email@babcock.edu.ng" value={lecturerFormData.email} onChange={(e) => setLecturerFormData({ ...lecturerFormData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="+234 800 000 0000" value={lecturerFormData.phone} onChange={(e) => setLecturerFormData({ ...lecturerFormData, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Courses Taught</Label>
              <Input placeholder="e.g., COSC424, SENG406" value={lecturerFormData.coursesTaught} onChange={(e) => setLecturerFormData({ ...lecturerFormData, coursesTaught: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddLecturerModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddLecturer}>Add Lecturer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Modal */}
      <Dialog open={isAddCourseModalOpen} onOpenChange={setIsAddCourseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Computing Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Course Code *</Label>
                <Input placeholder="e.g., COSC424" value={courseFormData.code} onChange={(e) => setCourseFormData({ ...courseFormData, code: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Units *</Label>
                <Input type="number" min="1" max="6" value={courseFormData.units} onChange={(e) => setCourseFormData({ ...courseFormData, units: parseInt(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Course Title *</Label>
              <Input placeholder="e.g., Advanced Algorithms" value={courseFormData.title} onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Level *</Label>
                <select value={courseFormData.level} onChange={(e) => setCourseFormData({ ...courseFormData, level: e.target.value })} className="w-full h-10 px-3 rounded-md border">
                  <option value="200">200</option>
                  <option value="300">300</option>
                  <option value="400">400</option>
                  <option value="500">500</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Semester *</Label>
                <select value={courseFormData.semester} onChange={(e) => setCourseFormData({ ...courseFormData, semester: e.target.value as any })} className="w-full h-10 px-3 rounded-md border">
                  <option value="first">First</option>
                  <option value="second">Second</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCourseModalOpen(false)}>Cancel</Button>
            <Button onClick={handleEditCourse}>Update Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Lecturer Modal */}
      <Dialog open={isAddLecturerModalOpen} onOpenChange={setIsAddLecturerModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department Lecturer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input placeholder="e.g., Dr. John Doe" value={lecturerFormData.name} onChange={(e) => setLecturerFormData({ ...lecturerFormData, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" placeholder="email@babcock.edu.ng" value={lecturerFormData.email} onChange={(e) => setLecturerFormData({ ...lecturerFormData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="+234 800 000 0000" value={lecturerFormData.phone} onChange={(e) => setLecturerFormData({ ...lecturerFormData, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Courses Taught</Label>
              <Input placeholder="e.g., COSC424, SENG406" value={lecturerFormData.coursesTaught} onChange={(e) => setLecturerFormData({ ...lecturerFormData, coursesTaught: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddLecturerModalOpen(false)}>Cancel</Button>
            <Button onClick={handleEditLecturer}>Update Lecturer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}