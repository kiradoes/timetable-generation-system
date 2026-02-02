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
import { Search, Code, Plus, Edit, Trash2, Loader2, Filter, BookOpen, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

export function ComputingCoursesManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [courses, setCourses] = useState([
    // Computer Science
    { id: '1', code: 'COSC424', title: 'Advanced Algorithms', units: 3, level: '400', semester: 'first', department: 'Computer Science' },
    { id: '2', code: 'COSC301', title: 'Database Management', units: 3, level: '300', semester: 'first', department: 'Computer Science' },
    { id: '3', code: 'COS202', title: 'Data Structures', units: 3, level: '200', semester: 'first', department: 'Computer Science' },
    
    // Software Engineering
    { id: '4', code: 'SENG406', title: 'Software Testing', units: 3, level: '400', semester: 'first', department: 'Software Engineering' },
    { id: '5', code: 'SENG305', title: 'Software Design', units: 3, level: '300', semester: 'first', department: 'Software Engineering' },
    { id: '6', code: 'SENG202', title: 'Programming Fundamentals II', units: 3, level: '200', semester: 'second', department: 'Software Engineering' },
    
    // Information Technology
    { id: '7', code: 'ITGY409', title: 'IT Governance', units: 3, level: '400', semester: 'first', department: 'Information Technology' },
    { id: '8', code: 'ITM308', title: 'Network Administration', units: 3, level: '300', semester: 'first', department: 'Information Technology' },
    { id: '9', code: 'ITM205', title: 'Web Technologies', units: 3, level: '200', semester: 'first', department: 'Information Technology' },
    
    // Information Systems
    { id: '10', code: 'INFS410', title: 'Enterprise Systems', units: 3, level: '400', semester: 'first', department: 'Information Systems' },
    { id: '11', code: 'INFS312', title: 'Systems Analysis and Design', units: 3, level: '300', semester: 'first', department: 'Information Systems' },
    { id: '12', code: 'INFS206', title: 'Business Information Systems', units: 3, level: '200', semester: 'first', department: 'Information Systems' },
    
    // Cyber Security
    { id: '13', code: 'CYB408', title: 'Ethical Hacking', units: 3, level: '400', semester: 'first', department: 'Cyber Security' },
    { id: '14', code: 'CYB307', title: 'Network Security', units: 3, level: '300', semester: 'first', department: 'Cyber Security' },
    { id: '15', code: 'CYB203', title: 'Introduction to Cybersecurity', units: 3, level: '200', semester: 'first', department: 'Cyber Security' },
  ]);

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    units: 3,
    level: '200',
    semester: 'first' as 'first' | 'second' | 'both',
    department: 'Computer Science' as ComputingCourse['department'],
  });

  const departments: ComputingCourse['department'][] = [
    'Computer Science',
    'Software Engineering',
    'Information Technology',
    'Information Systems',
    'Cyber Security'
  ];

  const handleAdd = () => {
    if (!formData.code || !formData.title) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newCourse: ComputingCourse = {
      id: String(courses.length + 1),
      ...formData,
    };

    setCourses([...courses, newCourse]);
    setIsAddModalOpen(false);
    resetForm();
    toast.success('Computing course added successfully');
  };

  const handleDelete = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
    toast.success('Course deleted successfully');
  };

  const resetForm = () => {
    setFormData({
      code: '',
      title: '',
      units: 3,
      level: '200',
      semester: 'first',
      department: 'Computer Science',
    });
  };

  const filteredCourses = selectedDepartment === 'all' 
    ? courses 
    : courses.filter(c => c.department === selectedDepartment);

  const departmentCounts = departments.map(dept => ({
    name: dept,
    count: courses.filter(c => c.department === dept).length
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0f2044]">Computing Courses Management</h2>
          <p className="text-slate-600 mt-1">Manage courses across all 5 computing departments</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#0f2044] hover:bg-[#0f2044]/90"
        >
          <Plus className="mr-2 size-4" />
          Add Computing Course
        </Button>
      </div>

      {/* Department Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {departmentCounts.map((dept) => (
          <Card 
            key={dept.name}
            className={`cursor-pointer transition-all ${
              selectedDepartment === dept.name 
                ? 'ring-2 ring-[#ffb71b] bg-[#ffb71b]/5' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedDepartment(dept.name)}
          >
            <CardContent className="pt-4 text-center">
              <p className="text-xs text-slate-600 mb-1 font-medium">{dept.name}</p>
              <p className="text-2xl font-bold text-[#0f2044]">{dept.count}</p>
              <p className="text-xs text-slate-500 mt-1">courses</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Bar */}
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="size-5 text-slate-400" />
            <Label className="text-sm font-semibold text-slate-700">Filter by Department:</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedDepartment === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedDepartment('all')}
                className={selectedDepartment === 'all' ? 'bg-[#0f2044]' : ''}
              >
                All Departments ({courses.length})
              </Button>
              {departments.map((dept) => (
                <Button
                  key={dept}
                  size="sm"
                  variant={selectedDepartment === dept ? 'default' : 'outline'}
                  onClick={() => setSelectedDepartment(dept)}
                  className={selectedDepartment === dept ? 'bg-[#0f2044]' : ''}
                >
                  {dept}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
          <CardTitle className="flex items-center gap-2 text-[#0f2044]">
            <BookOpen className="size-5 text-[#ffb71b]" />
            {selectedDepartment === 'all' 
              ? `All Computing Courses (${filteredCourses.length})` 
              : `${selectedDepartment} Courses (${filteredCourses.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      No courses found for {selectedDepartment}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCourses.map(course => (
                    <TableRow key={course.id}>
                      <TableCell className="font-mono font-semibold text-[#0f2044]">
                        {course.code}
                      </TableCell>
                      <TableCell>{course.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {course.department}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{course.units}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{course.level} Level</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            course.semester === 'first' 
                              ? 'border-blue-300 text-blue-700 bg-blue-50' 
                              : course.semester === 'second'
                              ? 'border-green-300 text-green-700 bg-green-50'
                              : 'border-purple-300 text-purple-700 bg-purple-50'
                          }
                        >
                          {course.semester === 'first' ? 'First' : course.semester === 'second' ? 'Second' : 'Both'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => openEditModal(course)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 className="size-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDelete(course.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
        </CardContent>
      </Card>

      {/* Add Course Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Computing Course</DialogTitle>
            <DialogDescription>
              Add a new course to any of the 5 computing departments
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Department *</Label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value as ComputingCourse['department'] })}
                className="w-full h-10 px-3 rounded-md border"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Course Code *</Label>
                <Input 
                  placeholder="e.g., INFS410" 
                  value={formData.code} 
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} 
                />
              </div>
              <div className="space-y-2">
                <Label>Credit Units *</Label>
                <Input 
                  type="number" 
                  min="1" 
                  max="6" 
                  value={formData.units} 
                  onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) })} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Course Title *</Label>
              <Input 
                placeholder="e.g., Enterprise Systems" 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Level *</Label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border"
                >
                  <option value="100">100</option>
                  <option value="200">200</option>
                  <option value="300">300</option>
                  <option value="400">400</option>
                  <option value="500">500</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Semester *</Label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value as any })}
                  className="w-full h-10 px-3 rounded-md border"
                >
                  <option value="first">First</option>
                  <option value="second">Second</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} className="bg-[#0f2044] hover:bg-[#0f2044]/90">Add Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}