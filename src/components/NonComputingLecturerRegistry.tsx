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
import { Search, UserCircle, Plus, Edit, Trash2, Mail, Phone, Users, User, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

export function NonComputingLecturerRegistry() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    coursesTaught: '',
  });

  const handleAdd = () => {
    const newLecturer = {
      id: String(lecturers.length + 1),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      coursesTaught: formData.coursesTaught.split(',').map(c => c.trim()).filter(c => c),
    };
    setLecturers([...lecturers, newLecturer]);
    setIsAddModalOpen(false);
    resetForm();
    toast.success('Lecturer added successfully');
  };

  const handleDelete = (id: string) => {
    setLecturers(lecturers.filter(l => l.id !== id));
    toast.success('Lecturer removed successfully');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      department: '',
      coursesTaught: '',
    });
  };

  // Get unique departments
  const departments = Array.from(new Set(lecturers.map(l => l.department)));

  return (
    <>
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-[#0f2044]">
              <Users className="size-5 text-[#ffb71b]" />
              Non-Computing Lecturer Registry
            </CardTitle>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
            >
              <Plus className="mr-2 size-4" />
              Add Lecturer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-purple-700 mb-1">Total Lecturers</p>
                <p className="text-2xl font-bold text-purple-900">
                  {lecturers.length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-blue-700 mb-1">Departments</p>
                <p className="text-2xl font-bold text-blue-900">
                  {departments.length}
                </p>
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
                {lecturers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No non-computing lecturers found. Click "Add Lecturer" to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  lecturers.map((lecturer) => (
                    <TableRow key={lecturer.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="bg-purple-100 rounded-full p-2">
                            <User className="size-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#0f2044]">
                              {lecturer.name}
                            </p>
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
                            <Badge 
                              key={idx} 
                              variant="secondary"
                              className="font-mono text-xs"
                            >
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
                            onClick={() => openEditModal(lecturer)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 className="size-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(lecturer.id)}
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

      {/* Add Lecturer Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
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
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-email">Email *</Label>
                <Input
                  id="add-email"
                  type="email"
                  placeholder="email@babcock.edu.ng"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-phone">Phone</Label>
                <Input
                  id="add-phone"
                  placeholder="+234 800 000 0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-department">Department *</Label>
                <Input
                  id="add-department"
                  placeholder="e.g., GEDS"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-courses">Courses Taught</Label>
              <Input
                id="add-courses"
                placeholder="e.g., GEDS 420, BU-GST 220 (comma-separated)"
                value={formData.coursesTaught}
                onChange={(e) => setFormData({ ...formData, coursesTaught: e.target.value })}
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
              disabled={!formData.name || !formData.email || !formData.department}
            >
              Add Lecturer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}