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
} from './ui/dialog';
import { Search, BookOpen, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function GEDSCourseManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
      description: 'Spiritual development and character building',
    },
  ]);

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    units: 2,
    category: 'GEDS' as 'GEDS' | 'SAT' | 'BU-GST' | 'BU-SEN',
    description: '',
  });

  const handleAdd = () => {
    const newCourse = {
      id: String(courses.length + 1),
      ...formData,
    };
    setCourses([...courses, newCourse]);
    setIsAddModalOpen(false);
    resetForm();
    toast.success('GEDS/SAT course added successfully');
  };

  const handleDelete = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
    toast.success('Course deleted successfully');
  };

  const resetForm = () => {
    setFormData({
      code: '',
      title: '',
      units: 2,
      category: 'GEDS',
      description: '',
    });
  };

  const getCategoryBadge = (category: 'GEDS' | 'SAT' | 'BU-GST' | 'BU-SEN') => {
    const colors = {
      'GEDS': 'bg-blue-100 text-blue-800 border-blue-300',
      'SAT': 'bg-purple-100 text-purple-800 border-purple-300',
      'BU-GST': 'bg-green-100 text-green-800 border-green-300',
      'BU-SEN': 'bg-orange-100 text-orange-800 border-orange-300',
    };
    return (
      <Badge variant="outline" className={colors[category]}>
        {category}
      </Badge>
    );
  };

  return (
    <>
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-[#0f2044]">
              <GraduationCap className="size-5 text-[#ffb71b]" />
              GEDS & University-Wide Courses
            </CardTitle>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
            >
              <Plus className="mr-2 size-4" />
              Add Course
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-blue-700 mb-1">GEDS Courses</p>
                <p className="text-2xl font-bold text-blue-900">
                  {courses.filter(c => c.category === 'GEDS').length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-purple-700 mb-1">SAT Courses</p>
                <p className="text-2xl font-bold text-purple-900">
                  {courses.filter(c => c.category === 'SAT').length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-green-700 mb-1">BU-GST</p>
                <p className="text-2xl font-bold text-green-900">
                  {courses.filter(c => c.category === 'BU-GST').length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-orange-700 mb-1">BU-SEN</p>
                <p className="text-2xl font-bold text-orange-900">
                  {courses.filter(c => c.category === 'BU-SEN').length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Courses Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Course Code</TableHead>
                  <TableHead className="font-semibold">Title</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold text-center">Units</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No GEDS/SAT courses found. Click "Add Course" to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map((course) => (
                    <TableRow key={course.id} className="hover:bg-slate-50">
                      <TableCell className="font-mono font-semibold text-[#0f2044]">
                        {course.code}
                      </TableCell>
                      <TableCell>{course.title}</TableCell>
                      <TableCell>{getCategoryBadge(course.category)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{course.units}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {course.description}
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="mx-auto bg-[#0f2044] rounded-full p-3 mb-2">
              <BookOpen className="size-8 text-[#ffb71b]" />
            </div>
            <DialogTitle className="text-2xl text-center text-[#0f2044]">
              Add GEDS/SAT Course
            </DialogTitle>
            <DialogDescription className="text-center">
              Add a new university-wide course
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-code">Course Code *</Label>
                <Input
                  id="add-code"
                  placeholder="e.g., GEDS 420"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-category">Category *</Label>
                <select
                  id="add-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as 'GEDS' | 'SAT' | 'BU-GST' | 'BU-SEN' })}
                  className="w-full h-10 px-3 rounded-md border border-slate-300 focus:border-[#ffb71b] focus:ring-1 focus:ring-[#ffb71b] bg-white"
                >
                  <option value="GEDS">GEDS</option>
                  <option value="SAT">SAT</option>
                  <option value="BU-GST">BU-GST</option>
                  <option value="BU-SEN">BU-SEN</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-title">Course Title *</Label>
              <Input
                id="add-title"
                placeholder="e.g., Research Methodology"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-units">Credit Units *</Label>
              <Input
                id="add-units"
                type="number"
                min="1"
                max="6"
                value={formData.units}
                onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-description">Description</Label>
              <Input
                id="add-description"
                placeholder="Brief course description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddModalOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              className="bg-[#0f2044] hover:bg-[#0f2044]/90"
              disabled={!formData.code || !formData.title}
            >
              Add Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}