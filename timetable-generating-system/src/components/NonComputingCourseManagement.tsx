import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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
import { Search, BookOpen, Plus, Edit, Trash2, Users, User, Mail, Phone, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

export function NonComputingCourseManagement() {
  // Courses State
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [courses, setCourses] = useState([
    {
      id: '1',
      code: 'GEDS 420',
      title: 'Research Methodology',
      units: 3,
      category: 'GEDS',
      description: 'Introduction to research methods and academic writing',
    },
    {
      id: '2',
      code: 'BU-GST 220',
      title: 'Introduction to Entrepreneurship',
      units: 2,
      category: 'BU-GST',
      description: 'Fundamentals of entrepreneurship and business development',
    },
    {
      id: '3',
      code: 'BU-SEN 212',
      title: 'Spiritual Emphasis',
      units: 1,
      category: 'BU-SEN',
      description: 'Spiritual formation and character development',
    },
    {
      id: '4',
      code: 'GEDS 315',
      title: 'Philosophy and Logic',
      units: 2,
      category: 'GEDS',
      description: 'Critical thinking and logical reasoning',
    },
  ]);

  const [courseFormData, setCourseFormData] = useState({
    code: '',
    title: '',
    units: '',
    category: '',
    description: '',
  });

  // Lecturers State
  const [lecturerSearchQuery, setLecturerSearchQuery] = useState('');
  const [isAddLecturerModalOpen, setIsAddLecturerModalOpen] = useState(false);
  const [lecturers, setLecturers] = useState([
    {
      id: '1',
      name: 'Dr. Oluwaseun Adebayo',
      email: 'o.adebayo@babcock.edu.ng',
      phone: '+234 803 456 7890',
      department: 'GEDS',
      coursesTaught: ['GEDS 420'],
    },
    {
      id: '2',
      name: 'Prof. Chioma Nwosu',
      email: 'c.nwosu@babcock.edu.ng',
      phone: '+234 802 345 6789',
      department: 'Business',
      coursesTaught: ['BU-GST 220', 'BU-GST 312'],
    },
    {
      id: '3',
      name: 'Pastor Emmanuel Okafor',
      email: 'e.okafor@babcock.edu.ng',
      phone: '+234 805 678 9012',
      department: 'Theology',
      coursesTaught: ['BU-SEN 212'],
    },
  ]);

  const [lecturerFormData, setLecturerFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    coursesTaught: '',
  });

  // Course Functions
  const handleAddCourse = () => {
    const newCourse = {
      id: String(courses.length + 1),
      code: courseFormData.code,
      title: courseFormData.title,
      units: parseInt(courseFormData.units),
      category: courseFormData.category,
      description: courseFormData.description,
    };
    setCourses([...courses, newCourse]);
    setIsAddCourseModalOpen(false);
    resetCourseForm();
    toast.success('Course added successfully');
  };

  const handleDeleteCourse = (id) => {
    setCourses(courses.filter(c => c.id !== id));
    toast.success('Course removed successfully');
  };

  const resetCourseForm = () => {
    setCourseFormData({
      code: '',
      title: '',
      units: '',
      category: '',
      description: '',
    });
  };

  // Lecturer Functions
  const handleAddLecturer = () => {
    const newLecturer = {
      id: String(lecturers.length + 1),
      name: lecturerFormData.name,
      email: lecturerFormData.email,
      phone: lecturerFormData.phone,
      department: lecturerFormData.department,
      coursesTaught: lecturerFormData.coursesTaught.split(',').map(c => c.trim()).filter(c => c),
    };
    setLecturers([...lecturers, newLecturer]);
    setIsAddLecturerModalOpen(false);
    resetLecturerForm();
    toast.success('Lecturer added successfully');
  };

  const handleDeleteLecturer = (id) => {
    setLecturers(lecturers.filter(l => l.id !== id));
    toast.success('Lecturer removed successfully');
  };

  const resetLecturerForm = () => {
    setLecturerFormData({
      name: '',
      email: '',
      phone: '',
      department: '',
      coursesTaught: '',
    });
  };

  // Filter functions
  const filteredCourses = courses.filter(course =>
    course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLecturers = lecturers.filter(lecturer =>
    lecturer.name.toLowerCase().includes(lecturerSearchQuery.toLowerCase()) ||
    lecturer.email.toLowerCase().includes(lecturerSearchQuery.toLowerCase()) ||
    lecturer.department.toLowerCase().includes(lecturerSearchQuery.toLowerCase())
  );

  const categories = ['GEDS', 'BU-GST', 'BU-SEN', 'SAT'];
  const departments = Array.from(new Set(lecturers.map(l => l.department)));

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50">
        <CardTitle className="flex items-center gap-2 text-[#0f2044]">
          <BookOpen className="size-6 text-[#ffb71b]" />
          Non-Computing Course Management
        </CardTitle>
        <p className="text-sm text-slate-600 mt-2">
          Manage GEDS, GST, SAT courses and non-computing department lecturers
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="courses" className="data-[state=active]:bg-[#0f2044] data-[state=active]:text-white">
              <BookOpen className="mr-2 size-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="lecturers" className="data-[state=active]:bg-[#0f2044] data-[state=active]:text-white">
              <Users className="mr-2 size-4" />
              Lecturers
            </TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            {/* Course Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4 text-center">
                  <p className="text-sm text-blue-700 mb-1">Total Courses</p>
                  <p className="text-2xl font-bold text-blue-900">{courses.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-4 text-center">
                  <p className="text-sm text-purple-700 mb-1">GEDS</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {courses.filter(c => c.category === 'GEDS').length}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4 text-center">
                  <p className="text-sm text-green-700 mb-1">GST</p>
                  <p className="text-2xl font-bold text-green-900">
                    {courses.filter(c => c.category === 'BU-GST').length}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="pt-4 text-center">
                  <p className="text-sm text-orange-700 mb-1">SEN/SAT</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {courses.filter(c => c.category === 'BU-SEN' || c.category === 'SAT').length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Course Search and Add */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 size-4" />
                <Input
                  placeholder="Search courses by code, title, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Button
                onClick={() => setIsAddCourseModalOpen(true)}
                className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white whitespace-nowrap"
              >
                <Plus className="mr-2 size-4" />
                Add Course
              </Button>
            </div>

            {/* Courses Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">Course Code</TableHead>
                    <TableHead className="font-semibold">Title</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Units</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        No courses found. Click "Add Course" to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCourses.map((course) => (
                      <TableRow key={course.id} className="hover:bg-slate-50">
                        <TableCell>
                          <span className="font-mono font-semibold text-[#0f2044]">
                            {course.code}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{course.title}</p>
                            <p className="text-xs text-slate-500">{course.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              course.category === 'GEDS' ? 'border-purple-300 text-purple-700' :
                              course.category === 'BU-GST' ? 'border-green-300 text-green-700' :
                              'border-orange-300 text-orange-700'
                            }
                          >
                            {course.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{course.units} units</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteCourse(course.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Lecturers Tab */}
          <TabsContent value="lecturers" className="space-y-6">
            {/* Lecturer Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-4 text-center">
                  <p className="text-sm text-purple-700 mb-1">Total Lecturers</p>
                  <p className="text-2xl font-bold text-purple-900">{lecturers.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4 text-center">
                  <p className="text-sm text-blue-700 mb-1">Departments</p>
                  <p className="text-2xl font-bold text-blue-900">{departments.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4 text-center">
                  <p className="text-sm text-green-700 mb-1">GEDS Faculty</p>
                  <p className="text-2xl font-bold text-green-900">
                    {lecturers.filter(l => l.department === 'GEDS').length}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="pt-4 text-center">
                  <p className="text-sm text-orange-700 mb-1">Other Depts</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {lecturers.filter(l => l.department !== 'GEDS').length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Lecturer Search and Add */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 size-4" />
                <Input
                  placeholder="Search lecturers by name, email, or department..."
                  value={lecturerSearchQuery}
                  onChange={(e) => setLecturerSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Button
                onClick={() => setIsAddLecturerModalOpen(true)}
                className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white whitespace-nowrap"
              >
                <Plus className="mr-2 size-4" />
                Add Lecturer
              </Button>
            </div>

            {/* Lecturers Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Department</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Courses</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLecturers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        No lecturers found. Click "Add Lecturer" to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLecturers.map((lecturer) => (
                      <TableRow key={lecturer.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="bg-purple-100 rounded-full p-2">
                              <User className="size-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-[#0f2044]">{lecturer.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-purple-300 text-purple-700">
                            {lecturer.department}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1 text-slate-600">
                              <Mail className="size-3" />
                              <span className="truncate max-w-[150px]">{lecturer.email}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-600">
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
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteLecturer(lecturer.id)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Course Modal */}
        <Dialog open={isAddCourseModalOpen} onOpenChange={setIsAddCourseModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <div className="mx-auto bg-[#0f2044] rounded-full p-3 mb-2">
                <BookOpen className="size-8 text-[#ffb71b]" />
              </div>
              <DialogTitle className="text-2xl text-center text-[#0f2044]">
                Add Non-Computing Course
              </DialogTitle>
              <DialogDescription className="text-center">
                Add a new GEDS, GST, or SAT course
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-code">Course Code *</Label>
                  <Input
                    id="add-code"
                    placeholder="e.g., GEDS 420"
                    value={courseFormData.code}
                    onChange={(e) => setCourseFormData({ ...courseFormData, code: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-category">Category *</Label>
                  <select
                    id="add-category"
                    value={courseFormData.category}
                    onChange={(e) => setCourseFormData({ ...courseFormData, category: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-title">Course Title *</Label>
                <Input
                  id="add-title"
                  placeholder="e.g., Research Methodology"
                  value={courseFormData.title}
                  onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-units">Credit Units *</Label>
                <Input
                  id="add-units"
                  type="number"
                  min="1"
                  max="6"
                  placeholder="e.g., 3"
                  value={courseFormData.units}
                  onChange={(e) => setCourseFormData({ ...courseFormData, units: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-description">Description</Label>
                <Input
                  id="add-description"
                  placeholder="Brief course description"
                  value={courseFormData.description}
                  onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsAddCourseModalOpen(false); resetCourseForm(); }}>
                Cancel
              </Button>
              <Button
                onClick={handleAddCourse}
                className="bg-[#0f2044] hover:bg-[#0f2044]/90"
                disabled={!courseFormData.code || !courseFormData.title || !courseFormData.units || !courseFormData.category}
              >
                Add Course
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Lecturer Modal */}
        <Dialog open={isAddLecturerModalOpen} onOpenChange={setIsAddLecturerModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <div className="mx-auto bg-[#0f2044] rounded-full p-3 mb-2">
                <User className="size-8 text-[#ffb71b]" />
              </div>
              <DialogTitle className="text-2xl text-center text-[#0f2044]">
                Add Non-Computing Lecturer
              </DialogTitle>
              <DialogDescription className="text-center">
                Register a lecturer from other departments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">Full Name *</Label>
                <Input
                  id="add-name"
                  placeholder="e.g., Dr. John Doe"
                  value={lecturerFormData.name}
                  onChange={(e) => setLecturerFormData({ ...lecturerFormData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-email">Email *</Label>
                  <Input
                    id="add-email"
                    type="email"
                    placeholder="email@babcock.edu.ng"
                    value={lecturerFormData.email}
                    onChange={(e) => setLecturerFormData({ ...lecturerFormData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-phone">Phone</Label>
                  <Input
                    id="add-phone"
                    placeholder="+234 800 000 0000"
                    value={lecturerFormData.phone}
                    onChange={(e) => setLecturerFormData({ ...lecturerFormData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-department">Department *</Label>
                <Input
                  id="add-department"
                  placeholder="e.g., GEDS"
                  value={lecturerFormData.department}
                  onChange={(e) => setLecturerFormData({ ...lecturerFormData, department: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-courses">Courses Taught</Label>
                <Input
                  id="add-courses"
                  placeholder="e.g., GEDS 420, BU-GST 220 (comma-separated)"
                  value={lecturerFormData.coursesTaught}
                  onChange={(e) => setLecturerFormData({ ...lecturerFormData, coursesTaught: e.target.value })}
                />
                <p className="text-xs text-slate-500">
                  Enter course codes separated by commas
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsAddLecturerModalOpen(false); resetLecturerForm(); }}>
                Cancel
              </Button>
              <Button
                onClick={handleAddLecturer}
                className="bg-[#0f2044] hover:bg-[#0f2044]/90"
                disabled={!lecturerFormData.name || !lecturerFormData.email || !lecturerFormData.department}
              >
                Add Lecturer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
