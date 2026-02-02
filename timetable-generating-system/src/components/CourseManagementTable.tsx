import { useState, useEffect } from 'react';
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
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Search, MoreVertical, Trash2, Edit, BookOpen, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function CourseManagementTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courses, setCourses] = useState([
    { id: '1', code: 'GST 101', title: 'Use of English I', creditUnits: 2, category: 'GEDS', semester: 'First', level: 100 },
    { id: '2', code: 'GST 102', title: 'Use of English II', creditUnits: 2, category: 'GEDS', semester: 'Second', level: 100 },
    { id: '3', code: 'GST 103', title: 'Philosophy and Logic', creditUnits: 2, category: 'GEDS', semester: 'First', level: 100 },
    { id: '4', code: 'GST 105', title: 'Citizenship Education', creditUnits: 2, category: 'GEDS', semester: 'First', level: 100 },
    { id: '5', code: 'SAT 101', title: 'Introduction to Biblical Studies', creditUnits: 1, category: 'SAT', semester: 'First', level: 100 },
    { id: '6', code: 'SAT 102', title: 'Christian Spirituality', creditUnits: 1, category: 'SAT', semester: 'Second', level: 100 },
  ]);

  const handleDelete = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
    toast.success('Course removed successfully');
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setIsAddModalOpen(true);
  };

  const filteredCourses = courses.filter(course =>
    course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#0f2044]">Course Management</h2>
            <p className="text-slate-600 mt-1">Manage GEDS and SAT courses</p>
          </div>
          <Button 
            className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
            onClick={() => {
              setEditingCourse(null);
              setIsAddModalOpen(true);
            }}
          >
            <BookOpen className="mr-2 size-4" />
            Add New Course
          </Button>
        </div>

        {/* Search */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  placeholder="Search by course code, title, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-[#ffb71b] focus:ring-[#ffb71b]"
                />
              </div>
              <Badge variant="outline" className="bg-slate-100 px-4 py-2">
                {filteredCourses.length} {filteredCourses.length === 1 ? 'Course' : 'Courses'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-[#0f2044] flex items-center gap-2">
              <BookOpen className="size-5 text-[#ffb71b]" />
              All Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="font-semibold text-[#0f2044]">Course Code</TableHead>
                    <TableHead className="font-semibold text-[#0f2044]">Course Title</TableHead>
                    <TableHead className="font-semibold text-[#0f2044]">Category</TableHead>
                    <TableHead className="font-semibold text-[#0f2044]">Credit Units</TableHead>
                    <TableHead className="font-semibold text-[#0f2044]">Semester</TableHead>
                    <TableHead className="font-semibold text-[#0f2044]">Level</TableHead>
                    <TableHead className="text-right font-semibold text-[#0f2044]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                        {searchQuery ? 'No courses found matching your search' : 'No courses added yet'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCourses.map((course) => (
                      <TableRow key={course.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="bg-[#ffb71b]/10 rounded-full p-2">
                              <BookOpen className="size-4 text-[#ffb71b]" />
                            </div>
                            <span className="font-mono font-semibold text-[#0f2044]">{course.code}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-slate-700">{course.title}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              course.category === 'GEDS' 
                                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }
                          >
                            {course.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-[#0f2044]">{course.creditUnits}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-slate-50 text-slate-700">
                            {course.semester}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-slate-600">{course.level} Level</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={() => handleEdit(course)}
                              >
                                <Edit className="mr-2 size-4" />
                                Edit Course
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer text-red-600 focus:text-red-600"
                                onClick={() => handleDelete(course.id)}
                              >
                                <Trash2 className="mr-2 size-4" />
                                Remove Course
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <AddCourseModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingCourse(null);
        }}
        onSave={(course) => {
          if (editingCourse) {
            setCourses(courses.map(c => c.id === editingCourse.id ? { ...course, id: editingCourse.id } : c));
            toast.success('Course updated successfully');
          } else {
            setCourses([...courses, { ...course, id: String(courses.length + 1) }]);
            toast.success('Course added successfully');
          }
          setIsAddModalOpen(false);
          setEditingCourse(null);
        }}
        editingCourse={editingCourse}
      />
    </>
  );
}

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Omit<Course, 'id'>) => void;
  editingCourse: Course | null;
}

function AddCourseModal({ isOpen, onClose, onSave, editingCourse }: AddCourseModalProps) {
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [creditUnits, setCreditUnits] = useState('');
  const [category, setCategory] = useState<'GEDS' | 'SAT'>('GEDS');
  const [semester, setSemester] = useState<'First' | 'Second' | 'Both'>('First');
  const [level, setLevel] = useState('100');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ code?: string; title?: string; creditUnits?: string }>({});

  // Pre-fill form when editing
  useEffect(() => {
    if (editingCourse) {
      setCode(editingCourse.code);
      setTitle(editingCourse.title);
      setCreditUnits(String(editingCourse.creditUnits));
      setCategory(editingCourse.category);
      setSemester(editingCourse.semester);
      setLevel(String(editingCourse.level));
    }
  }, [editingCourse]);

  const validateForm = () => {
    const newErrors: { code?: string; title?: string; creditUnits?: string } = {};

    if (!code) {
      newErrors.code = 'Course code is required';
    } else if (!/^[A-Z]{3}\s?\d{3}$/.test(code)) {
      newErrors.code = 'Invalid format (e.g., GST 101)';
    }

    if (!title) {
      newErrors.title = 'Course title is required';
    } else if (title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!creditUnits) {
      newErrors.creditUnits = 'Credit units is required';
    } else if (Number(creditUnits) < 1 || Number(creditUnits) > 6) {
      newErrors.creditUnits = 'Credit units must be between 1 and 6';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSave({ 
      code: code.toUpperCase(), 
      title, 
      creditUnits: Number(creditUnits), 
      category, 
      semester, 
      level: Number(level) 
    });
    setLoading(false);
    
    // Reset form
    setCode('');
    setTitle('');
    setCreditUnits('');
    setCategory('GEDS');
    setSemester('First');
    setLevel('100');
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-t-4 border-t-[#ffb71b]">
        <DialogHeader>
          <div className="mx-auto bg-[#0f2044] rounded-full p-3">
            <BookOpen className="size-8 text-[#ffb71b]" />
          </div>
          <DialogTitle className="text-2xl text-center text-[#0f2044]">
            {editingCourse ? 'Edit Course' : 'Add New Course'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {editingCourse ? 'Update course information' : 'Create a new GEDS or SAT course'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Course Code */}
            <div className="space-y-2">
              <Label htmlFor="code" className="text-[#0f2044] font-semibold">
                Course Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                placeholder="e.g., GST 101"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (errors.code) setErrors({ ...errors, code: undefined });
                }}
                disabled={loading}
                className={`font-mono ${errors.code ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-[#ffb71b] focus:ring-[#ffb71b]'}`}
              />
              {errors.code && (
                <p className="text-xs text-red-600">{errors.code}</p>
              )}
            </div>

            {/* Credit Units */}
            <div className="space-y-2">
              <Label htmlFor="credits" className="text-[#0f2044] font-semibold">
                Credit Units <span className="text-red-500">*</span>
              </Label>
              <Input
                id="credits"
                type="number"
                placeholder="e.g., 2"
                value={creditUnits}
                onChange={(e) => {
                  setCreditUnits(e.target.value);
                  if (errors.creditUnits) setErrors({ ...errors, creditUnits: undefined });
                }}
                min="1"
                max="6"
                disabled={loading}
                className={`${errors.creditUnits ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-[#ffb71b] focus:ring-[#ffb71b]'}`}
              />
              {errors.creditUnits && (
                <p className="text-xs text-red-600">{errors.creditUnits}</p>
              )}
            </div>
          </div>

          {/* Course Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-[#0f2044] font-semibold">
              Course Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Use of English I"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: undefined });
              }}
              disabled={loading}
              className={`${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-[#ffb71b] focus:ring-[#ffb71b]'}`}
            />
            {errors.title && (
              <p className="text-xs text-red-600">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-[#0f2044] font-semibold">
                Category <span className="text-red-500">*</span>
              </Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as 'GEDS' | 'SAT')}
                disabled={loading}
                className="w-full h-10 px-3 rounded-md border border-slate-300 focus:border-[#ffb71b] focus:ring-1 focus:ring-[#ffb71b] bg-white"
              >
                <option value="GEDS">GEDS</option>
                <option value="SAT">SAT</option>
              </select>
            </div>

            {/* Semester */}
            <div className="space-y-2">
              <Label htmlFor="semester" className="text-[#0f2044] font-semibold">
                Semester <span className="text-red-500">*</span>
              </Label>
              <select
                id="semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value as 'First' | 'Second' | 'Both')}
                disabled={loading}
                className="w-full h-10 px-3 rounded-md border border-slate-300 focus:border-[#ffb71b] focus:ring-1 focus:ring-[#ffb71b] bg-white"
              >
                <option value="First">First</option>
                <option value="Second">Second</option>
                <option value="Both">Both</option>
              </select>
            </div>

            {/* Level */}
            <div className="space-y-2">
              <Label htmlFor="level" className="text-[#0f2044] font-semibold">
                Level <span className="text-red-500">*</span>
              </Label>
              <select
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                disabled={loading}
                className="w-full h-10 px-3 rounded-md border border-slate-300 focus:border-[#ffb71b] focus:ring-1 focus:ring-[#ffb71b] bg-white"
              >
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="300">300</option>
                <option value="400">400</option>
                <option value="500">500</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>{editingCourse ? 'Update' : 'Add'} Course</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}