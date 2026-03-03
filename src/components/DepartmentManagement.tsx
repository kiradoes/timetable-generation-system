import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';

interface Department {
  department_id: number;
  name: string;
  status: 'active' | 'inactive';
}

export function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: '', status: 'active' as 'active' | 'inactive' });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const response = await api.getDepartments();
      console.log('Fetched departments:', response.data);
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to fetch departments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Department name is required');
      return;
    }

    // Show warning when updating department name
    if (editingDept && formData.name !== editingDept.name) {
      const confirmed = confirm(
        `You are changing the department name from "${editingDept.name}" to "${formData.name}".\n\n` +
        `This will update the department name across the entire system while maintaining all associations with:\n` +
        `• Officers\n` +
        `• Lecturers\n` +
        `• Courses\n` +
        `• Class Groups\n` +
        `• Timetable Entries\n\n` +
        `Continue with this change?`
      );
      if (!confirmed) return;
    }

    setIsLoading(true);

    try {
      const response = editingDept
        ? await api.updateDepartment(editingDept.department_id, formData)
        : await api.createDepartment(formData);
      if (response.success) {
        toast.success(editingDept ? 'Department updated successfully. All associations maintained.' : 'Department created successfully');
        resetForm();
        fetchDepartments();
      } else {
        toast.error((response as any).error || 'Failed to save department');
      }
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save department');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (dept: Department) => {
    const currentStatus = dept.status || 'active';
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    // Show warning for deactivation
    if (newStatus === 'inactive') {
      const confirmed = confirm(
        `Are you sure you want to deactivate "${dept.name}"?\n\n` +
        `⚠️ This will also affect all associated data.`
      );
      if (!confirmed) return;
    }

    try {
      setIsLoading(true);
      await api.updateDepartmentStatus(dept.department_id, newStatus);
      toast.success(`Department ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      fetchDepartments();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update department status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (dept: Department) => {
    console.log('Editing department:', dept);
    setEditingDept(dept);
    setFormData({ name: dept.name, status: dept.status || 'active' });
    setShowForm(true);
  };

  const handleDelete = async (id: number, name: string) => {
    console.log('Attempting to delete department:', { id, name });

    if (!id) {
      toast.error('Invalid department ID');
      console.error('Department ID is undefined or invalid:', id);
      return;
    }

    const confirmed = confirm(
      `⚠️ DELETE DEPARTMENT: "${name}"\n\n` +
      `This will affect the following data:\n\n` +
      `✓ Officers & Lecturers: Will lose department association\n` +
      `✓ Courses: Will lose department association\n` +
      `✗ Class Groups: Will be PERMANENTLY DELETED\n` +
      `✗ Timetable Entries: Will be PERMANENTLY DELETED\n\n` +
      `This action CANNOT be undone. Continue?`
    );

    if (!confirmed) return;

    try {
      setIsLoading(true);
      const response = await api.deleteDepartment(id);

      // Show detailed feedback about what was affected
      if (response.data?.affected) {
        const { officers, lecturers, courses, classGroups, timetableEntries } = response.data.affected;
        const affectedSummary = [
          officers > 0 ? `${officers} officer(s)` : null,
          lecturers > 0 ? `${lecturers} lecturer(s)` : null,
          courses > 0 ? `${courses} course(s)` : null,
          classGroups > 0 ? `${classGroups} class group(s) deleted` : null,
          timetableEntries > 0 ? `${timetableEntries} timetable entry(ies) deleted` : null
        ].filter(Boolean).join(', ');

        toast.success(
          affectedSummary
            ? `Department deleted. Affected: ${affectedSummary}`
            : 'Department deleted successfully'
        );
      } else {
        toast.success('Department deleted successfully');
      }

      fetchDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete department');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', status: 'active' });
    setEditingDept(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0f2044]">Department Management</h2>
        <p className="text-slate-600 mt-1">Manage computing departments and their status</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-[#0f2044]">
            <span>Computing Departments</span>
            <Button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
              size="sm"
            >
              <Plus className="size-4 mr-1" />
              Add Department
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dept-name">Department Name *</Label>
                  <input
                    id="dept-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Computer Science"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dept-status">Status *</Label>
                  <select
                    id="dept-status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white">
                  {editingDept ? 'Update' : 'Add'} Department
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} disabled={isLoading}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {isLoading && !departments.length && (
            <div className="text-center py-8 text-slate-500">
              Loading departments...
            </div>
          )}

          {!isLoading && departments.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No departments found. Create one to get started.
            </div>
          )}

          {departments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#0f2044]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => {
                    // Defensive check and logging
                    if (!dept.department_id) {
                      console.error('Department missing department_id:', dept);
                    }

                    return (
                      <tr key={dept.department_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">{dept.department_id}</td>
                        <td className="py-3 px-4 font-medium">{dept.name}</td>
                        <td className="py-3 px-4">
                          <Badge className={((dept.status || 'active') === 'active') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {dept.status || 'active'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(dept)}
                            disabled={isLoading}
                          >
                            {((dept.status || 'active') === 'active') ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(dept)}
                            disabled={isLoading}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(dept.department_id, dept.name)}
                            disabled={isLoading || !dept.department_id}
                            title={!dept.department_id ? 'Invalid department ID' : 'Delete department'}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
