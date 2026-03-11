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
import { Search, UserPlus, Edit, Trash2, Mail, Shield, Plus, Building2, Edit2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export function DepartmentOfficerRegistration() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [officers, setOfficers] = useState([
    {
      id: '1',
      fullName: 'Dr. Samuel Adegoke',
      email: 'department.cs@babcock.edu.ng',
      department: 'Computer Science',
      password: 'encrypted_password',
      status: 'active',
      registeredDate: new Date('2026-01-15'),
    },
    {
      id: '2',
      fullName: 'Prof. Ngozi Uchenna',
      email: 'department.se@babcock.edu.ng',
      department: 'Software Engineering',
      password: 'encrypted_password',
      status: 'active',
      registeredDate: new Date('2026-01-18'),
    },
    {
      id: '3',
      fullName: 'Dr. Chidi Okafor',
      email: 'department.it@babcock.edu.ng',
      department: 'Information Technology',
      password: 'encrypted_password',
      status: 'active',
      registeredDate: new Date('2026-01-20'),
    },
    {
      id: '4',
      fullName: 'Dr. Blessing Nwosu',
      email: 'department.is@babcock.edu.ng',
      department: 'Information Systems',
      password: 'encrypted_password',
      status: 'active',
      registeredDate: new Date('2026-01-22'),
    },
    {
      id: '5',
      fullName: 'Dr. Ibrahim Lawal',
      email: 'department.cyber@babcock.edu.ng',
      department: 'Cyber Security',
      password: 'encrypted_password',
      status: 'active',
      registeredDate: new Date('2026-01-25'),
    },
  ]);

  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    department: '',
    password: '',
  });

  // Only School of Computing departments
  const departments = [
    'Computer Science',
    'Software Engineering',
    'Information Technology',
    'Information Systems',
    'Cyber Security',
  ];

  const handleAdd = () => {
    if (!formData.fullName || !formData.email || !formData.department || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check if department already has an officer
    const existingOfficer = officers.find(o => o.department === formData.department);
    if (existingOfficer) {
      toast.error(`${formData.department} already has a registered officer: ${existingOfficer.fullName}`);
      return;
    }

    // Check if email contains "department"
    if (!formData.email.toLowerCase().includes('department')) {
      toast.warning('Department officer emails typically contain "department"');
    }

    const newOfficer = {
      id: String(officers.length + 1),
      fullName: formData.fullName,
      email: formData.email,
      department: formData.department,
      password: formData.password,
      status: 'active',
      registeredDate: new Date(),
    };

    setOfficers([...officers, newOfficer]);
    setIsAddModalOpen(false);
    resetForm();
    toast.success(`Department Officer registered successfully! Login credentials sent to ${formData.email}`);
  };

  const handleEdit = () => {
    if (!selectedOfficer) return;

    setOfficers(officers.map(o =>
      o.id === selectedOfficer.id
        ? { ...o, ...formData }
        : o
    ));
    setIsAddModalOpen(false);
    setSelectedOfficer(null);
    resetForm();
    toast.success('Officer details updated successfully');
  };

  const handleDelete = (id: string) => {
    const officer = officers.find(o => o.id === id);
    if (officer) {
      setOfficers(officers.filter(o => o.id !== id));
      toast.success(`${officer.fullName} removed from the system`);
    }
  };

  const toggleStatus = (id: string) => {
    setOfficers(officers.map(o =>
      o.id === id
        ? { ...o, status: o.status === 'active' ? 'inactive' : 'active' }
        : o
    ));
    const officer = officers.find(o => o.id === id);
    toast.success(`${officer?.fullName} ${officer?.status === 'active' ? 'deactivated' : 'activated'}`);
  };

  const openEditModal = (officer: DepartmentOfficer) => {
    setSelectedOfficer(officer);
    setFormData({
      fullName: officer.fullName,
      email: officer.email,
      department: officer.department,
      password: officer.password,
    });
    setIsAddModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      department: '',
      password: '',
    });
    setShowPassword(false);
  };

  return (
    <>
      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-[#0f2044]">
              <UserPlus className="size-5 text-[#ffb71b]" />
              Department Officer Registration
            </CardTitle>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
              disabled={officers.length >= departments.length}
            >
              <Plus className="mr-2 size-4" />
              Register Officer
            </Button>
          </div>
          <p className="text-sm text-slate-600 mt-2">
            One officer per department in School of Computing
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-blue-700 mb-1">Total Officers</p>
                <p className="text-2xl font-bold text-blue-900">{officers.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-green-700 mb-1">Active</p>
                <p className="text-2xl font-bold text-green-900">
                  {officers.filter(o => o.status === 'active').length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-purple-700 mb-1">Computing Depts</p>
                <p className="text-2xl font-bold text-purple-900">
                  {departments.length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-orange-700 mb-1">Remaining Slots</p>
                <p className="text-2xl font-bold text-orange-900">
                  {departments.length - officers.length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Officers Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Full Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Department</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Registered</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {officers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No department officers registered. Click "Register Officer" to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  officers.map((officer) => (
                    <TableRow key={officer.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 rounded-full p-2">
                            <UserPlus className="size-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#0f2044]">{officer.fullName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="size-3 text-slate-400" />
                          <span>{officer.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-purple-300 text-purple-700">
                          <Building2 className="size-3 mr-1" />
                          {officer.department}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={officer.status === 'active' ? 'default' : 'secondary'}
                          className={
                            officer.status === 'active'
                              ? 'bg-green-100 text-green-800 border-green-300'
                              : 'bg-slate-100 text-slate-600 border-slate-300'
                          }
                        >
                          {officer.status === 'active' ? '● Active' : '○ Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {officer.registeredDate.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleStatus(officer.id)}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            {officer.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditModal(officer)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 className="size-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(officer.id)}
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

      {/* Add/Edit Officer Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="mx-auto bg-[#0f2044] rounded-full p-3 mb-2">
              <UserPlus className="size-8 text-[#ffb71b]" />
            </div>
            <DialogTitle className="text-2xl text-center text-[#0f2044]">
              Register Department Officer
            </DialogTitle>
            <DialogDescription className="text-center">
              Create login credentials for a new department timetable officer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-fullName">Full Name *</Label>
              <Input
                id="add-fullName"
                placeholder="e.g., Dr. Samuel Adegoke"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-email">Email Address *</Label>
              <Input
                id="add-email"
                type="email"
                placeholder="department.cs@babcock.edu.ng"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <p className="text-xs text-slate-500">
                Must contain "department" for authentication
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-department">Department *</Label>
              <select
                id="add-department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-slate-300 focus:border-[#ffb71b] focus:ring-1 focus:ring-[#ffb71b] bg-white"
              >
                <option value="">Select department</option>
                {departments
                  .filter(dept => !officers.find(o => o.department === dept))
                  .map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
              </select>
              <p className="text-xs text-slate-500">
                Only School of Computing departments (one officer per department)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-password">Password *</Label>
              <div className="relative">
                <Input
                  id="add-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Minimum 8 characters, include uppercase and numbers
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddModalOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button
              onClick={selectedOfficer ? handleEdit : handleAdd}
              className="bg-[#0f2044] hover:bg-[#0f2044]/90"
            >
              {selectedOfficer ? 'Update Officer' : 'Register Officer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}