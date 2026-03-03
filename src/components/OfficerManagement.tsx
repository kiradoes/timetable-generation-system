import { AlertCircle, Edit, Eye, EyeOff, Trash2, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';

interface Officer {
  officer_id: number;
  full_name: string;
  email: string;
  department: string;
  department_id: number;
  status: 'active' | 'inactive';
  role: string;
}

interface Department {
  department_id: number;
  name: string;
  status: 'active' | 'inactive';
}

export function OfficerManagement() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    department: '',
    password: ''
  });

  useEffect(() => {
    fetchOfficers();
    fetchDepartments();
  }, []);

  const fetchOfficers = async () => {
    try {
      const response = await api.getOfficers({});
      if (response.success) {
        const allOfficers = response.data || [];
        const departmentOfficers = allOfficers.filter(
          (officer: Officer) => officer.department && officer.role === 'department-officer'
        );
        setOfficers(departmentOfficers);
      } else {
        toast.error('Failed to load officers');
      }
    } catch (error) {
      console.error('Error fetching officers:', error);
      toast.error('Failed to load officers');
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.getDepartments();
      if (response.success) {
        const depts = response.data || [];
        setAllDepartments(depts);
      } else {
        toast.error('Failed to load departments');
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    }
  };

  const activeDepartments = allDepartments.filter((d) => (d.status || 'active') === 'active');
  const departmentStatusMap = new Map(allDepartments.map((d) => [d.name, d.status || 'active']));
  const isDepartmentInactive = (departmentName: string) => departmentStatusMap.get(departmentName) === 'inactive';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.department) {
      toast.error('Please select a department');
      return;
    }

    if (!editingOfficer && !formData.password) {
      toast.error('Password is required');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Officer form data:', formData);
      console.log('Full name:', formData.full_name);
      console.log('Email:', formData.email);
      console.log('Department:', formData.department);
      console.log('Password length:', formData.password?.length || 0);
      console.log('Is editing:', !!editingOfficer);

      const response = editingOfficer
        ? await api.updateOfficer(editingOfficer.officer_id, formData)
        : await api.createOfficer(formData);

      console.log('API response:', response);
      console.log('Response success:', response.success);
      console.log('Response error:', response.error);

      if (response.success) {
        toast.success(editingOfficer ? 'Officer updated successfully' : 'Officer added successfully');
        resetForm();
        fetchOfficers();
      } else {
        toast.error(response.error || 'Failed to save officer');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this officer? Their login credentials will be preserved.')) return;

    try {
      const response = await api.deleteOfficer(id);
      if (response.success) {
        toast.success('Officer removed successfully');
        fetchOfficers();
      } else {
        toast.error(response.error || 'Failed to remove officer');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove officer');
    }
  };

  const resetForm = () => {
    setFormData({ full_name: '', email: '', department: '', password: '' });
    setEditingOfficer(null);
    setShowForm(false);
    setShowPassword(false);
  };

  const handleEdit = (officer: Officer) => {
    setEditingOfficer(officer);
    setFormData({
      full_name: officer.full_name,
      email: officer.email,
      department: officer.department || '',
      password: ''
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0f2044]">Officer Management</h2>
          <p className="text-slate-600 mt-1">Manage department timetable officers</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          disabled={activeDepartments.length === 0}
          className="bg-[#0f2044] hover:bg-[#0f2044]/90 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          <UserPlus className="size-4 mr-2" />
          Add Officer
        </Button>
      </div>

      {/* Warning: No Active Departments */}
      {activeDepartments.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900">No Active Departments</h3>
                <p className="text-sm text-yellow-800 mt-1">
                  Please create and activate departments in Department Management before adding officers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Officer Form */}
      {showForm && activeDepartments.length > 0 && (
        <Card className="shadow-md border-2 border-[#ffb71b]">
          <CardHeader className="bg-[#ffb71b]/10">
            <CardTitle className="text-[#0f2044]">
              {editingOfficer ? 'Edit Officer' : 'Add New Officer'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-[#0f2044] font-semibold">
                    Full Name *
                  </Label>
                  <input
                    id="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="e.g., Dr. John Doe"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#0f2044] font-semibold">
                    Email *
                  </Label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="officer@babcock.edu.ng"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                    required
                  />
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-[#0f2044] font-semibold">
                    Department *
                  </Label>
                  <select
                    id="department"
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b] bg-white"
                    required
                  >
                    <option value="">Select Department</option>
                    {activeDepartments.map((dept) => (
                      <option key={dept.department_id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 italic">Only active departments can be selected. Only one officer per department is allowed—if a department already has an officer, you will see an error when saving.</p>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#0f2044] font-semibold">
                    Password {!editingOfficer && '*'}
                  </Label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingOfficer ? 'Leave blank to keep current' : 'Enter password'}
                      className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                      required={!editingOfficer}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                  {editingOfficer && (
                    <p className="text-xs text-slate-500 italic">Leave blank to keep current password</p>
                  )}
                  {!editingOfficer && (
                    <p className="text-xs text-slate-500 italic">Must contain uppercase, lowercase, and number (min 8 characters)</p>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#0f2044] hover:bg-[#0f2044]/90"
                >
                  {isLoading ? 'Saving...' : (editingOfficer ? 'Update Officer' : 'Add Officer')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Officers Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-[#0f2044] flex items-center gap-2">
            <UserPlus className="size-5" />
            Department Officers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b-2 border-[#0f2044]">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#0f2044] w-1/4">Full Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#0f2044] w-1/3">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#0f2044] w-1/5">Department</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#0f2044] w-1/5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {officers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <UserPlus className="size-12 text-slate-300" />
                        <p className="text-slate-500 font-medium">No officers assigned yet</p>
                        <p className="text-sm text-slate-400">Click "Add Officer" to create your first officer</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  officers.map((officer) => {
                    const deptInactive = officer.department ? isDepartmentInactive(officer.department) : false;
                    return (
                    <tr
                      key={officer.officer_id}
                      className={`border-b hover:bg-slate-50 transition-colors ${deptInactive ? 'bg-amber-50/50' : ''}`}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        <div className="truncate" title={officer.full_name}>
                          {officer.full_name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <div className="truncate" title={officer.email}>
                          {officer.email}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        <div className="flex flex-wrap items-center gap-2">
                          <span>{officer.department || 'N/A'}</span>
                          {deptInactive && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                              Department inactive
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(officer)}
                            disabled={isLoading}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(officer.officer_id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                  })
                )}
              </tbody>
            </table>
          </div>
          {officers.length > 0 && (
            <p className="text-xs text-slate-500 mt-4 italic">
              Note: Only active officers with department assignments are shown
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
