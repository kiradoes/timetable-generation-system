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
import { Users, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function ClassGroupManagement({ userDepartment }) {
  const [selectedLevel, setSelectedLevel] = useState('100');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [classGroups, setClassGroups] = useState([
    {
      id: '1',
      department: userDepartment,
      level: '400',
      group: 'A',
      classSize: 45,
      courses: ['COSC424', 'ITGY409', 'SENG406'],
    },
    {
      id: '2',
      department: userDepartment,
      level: '400',
      group: 'B',
      classSize: 42,
      courses: ['COSC424', 'ITGY409', 'SENG406'],
    },
    {
      id: '3',
      department: userDepartment,
      level: '300',
      group: 'A',
      classSize: 50,
      courses: ['COSC311', 'COSC321', 'COSC331'],
    },
    {
      id: '4',
      department: userDepartment,
      level: '200',
      group: 'A',
      classSize: 85,
      courses: ['COS202', 'COS211', 'COS221'],
    },
  ]);

  const [formData, setFormData] = useState({
    department: userDepartment,
    level: '200',
    group: 'A',
    classSize: 0,
    courses: '',
  });

  const levels = ['200', '300', '400', '500'];
  const groups = ['A', 'B', 'C', 'D', 'E'];

  const handleAdd = () => {
    if (!formData.level || !formData.group || formData.classSize <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check for duplicate
    const duplicate = classGroups.find(
      c => c.department === formData.department && 
           c.level === formData.level && 
           c.group === formData.group
    );

    if (duplicate) {
      toast.error(`${formData.level} Level - Group ${formData.group} already exists`);
      return;
    }

    const newClass: ClassGroup = {
      id: String(classGroups.length + 1),
      department: formData.department,
      level: formData.level,
      group: formData.group,
      classSize: formData.classSize,
      courses: formData.courses.split(',').map(c => c.trim()).filter(c => c),
    };

    setClassGroups([...classGroups, newClass]);
    setIsAddModalOpen(false);
    resetForm();
    toast.success(`${formData.level} Level - Group ${formData.group} created successfully`);
  };

  const handleDelete = (id: string) => {
    const classGroup = classGroups.find(c => c.id === id);
    if (classGroup) {
      setClassGroups(classGroups.filter(c => c.id !== id));
      toast.success(`${classGroup.level} Level - Group ${classGroup.group} deleted`);
    }
  };

  const resetForm = () => {
    setFormData({
      department: userDepartment,
      level: '200',
      group: 'A',
      classSize: 0,
      courses: '',
    });
  };

  // Group classes by level
  const classesByLevel = classGroups.reduce((acc, cls) => {
    if (!acc[cls.level]) {
      acc[cls.level] = [];
    }
    acc[cls.level].push(cls);
    return acc;
  }, {} as Record<string, ClassGroup[]>);

  return (
    <>
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-[#0f2044]">
              <Users className="size-5 text-[#ffb71b]" />
              Class & Group Management
            </CardTitle>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
            >
              <Plus className="mr-2 size-4" />
              Add Class Group
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-blue-700 mb-1">Total Groups</p>
                <p className="text-2xl font-bold text-blue-900">{classGroups.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-green-700 mb-1">Total Students</p>
                <p className="text-2xl font-bold text-green-900">
                  {classGroups.reduce((sum, c) => sum + c.classSize, 0)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-purple-700 mb-1">Levels</p>
                <p className="text-2xl font-bold text-purple-900">
                  {Object.keys(classesByLevel).length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-orange-700 mb-1">Avg Class Size</p>
                <p className="text-2xl font-bold text-orange-900">
                  {classGroups.length > 0 
                    ? Math.round(classGroups.reduce((sum, c) => sum + c.classSize, 0) / classGroups.length)
                    : 0
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Classes Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Department</TableHead>
                  <TableHead className="font-semibold">Level</TableHead>
                  <TableHead className="font-semibold">Group</TableHead>
                  <TableHead className="font-semibold">Class Size</TableHead>
                  <TableHead className="font-semibold">Courses</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No class groups defined. Click "Add Class Group" to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  classGroups
                    .sort((a, b) => {
                      // Sort by level descending, then by group ascending
                      if (a.level !== b.level) {
                        return parseInt(b.level) - parseInt(a.level);
                      }
                      return a.group.localeCompare(b.group);
                    })
                    .map((classGroup) => (
                      <TableRow key={classGroup.id} className="hover:bg-slate-50">
                        <TableCell>
                          <Badge variant="outline" className="border-purple-300 text-purple-700">
                            {classGroup.department}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <AlertCircle className="size-4 text-[#0f2044]" />
                            <span className="font-semibold text-[#0f2044]">
                              {classGroup.level} Level
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-[#ffb71b] text-[#0f2044] font-bold text-base">
                            Group {classGroup.group}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="size-4 text-slate-400" />
                            <span className="font-semibold">
                              {classGroup.classSize} students
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {classGroup.courses.length > 0 ? (
                              classGroup.courses.slice(0, 3).map((course, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="font-mono text-xs"
                                >
                                  {course}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400 italic">No courses</span>
                            )}
                            {classGroup.courses.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{classGroup.courses.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditModal(classGroup)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(classGroup.id)}
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

      {/* Add Class Group Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="mx-auto bg-[#0f2044] rounded-full p-3 mb-2">
              <Users className="size-8 text-[#ffb71b]" />
            </div>
            <DialogTitle className="text-2xl text-center text-[#0f2044]">
              Add Class Group
            </DialogTitle>
            <DialogDescription className="text-center">
              Define a new class by department, level, and group
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-department">Department</Label>
              <Input
                id="add-department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                disabled
                className="bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-level">Level *</Label>
                <select
                  id="add-level"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-slate-300 focus:border-[#ffb71b] focus:ring-1 focus:ring-[#ffb71b] bg-white"
                >
                  {levels.map(level => (
                    <option key={level} value={level}>{level} Level</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-group">Group *</Label>
                <select
                  id="add-group"
                  value={formData.group}
                  onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-slate-300 focus:border-[#ffb71b] focus:ring-1 focus:ring-[#ffb71b] bg-white"
                >
                  {groups.map(group => (
                    <option key={group} value={group}>Group {group}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-classSize">Class Size (Number of Students) *</Label>
              <Input
                id="add-classSize"
                type="number"
                min="1"
                placeholder="e.g., 45"
                value={formData.classSize || ''}
                onChange={(e) => setFormData({ ...formData, classSize: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-courses">Courses (Optional)</Label>
              <Input
                id="add-courses"
                placeholder="e.g., COSC424, ITGY409, SENG406"
                value={formData.courses}
                onChange={(e) => setFormData({ ...formData, courses: e.target.value })}
              />
              <p className="text-xs text-slate-500">
                Enter course codes separated by commas
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddModalOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              className="bg-[#0f2044] hover:bg-[#0f2044]/90"
            >
              Add Class Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}