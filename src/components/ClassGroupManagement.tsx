import { AlertCircle, Edit, Plus, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';

interface ClassGroup {
  id: number;  // Backend returns 'id', not 'group_id'
  name: string;
  level: number;
  department_id: number;
  department?: string;
  student_count: number;
  session_id?: number;
}

interface OfficerProfile {
  role: string;
  department_id: number | null;
  department?: string;
}

export function ClassGroupManagement({ activeSessionId }: { activeSessionId: number | null }) {
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [profile, setProfile] = useState<OfficerProfile>({ role: '', department_id: null });
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ClassGroup | null>(null);
  const [formData, setFormData] = useState({
    level: 200,
    name: 'A',
    student_count: 0
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeSessionId) {
      fetchClassGroups();
    } else {
      setClassGroups([]);
    }
  }, [activeSessionId]);

  const fetchProfile = async () => {
    try {
      const response = await api.getProfile() as any;
      if (response.success) {
        const officer = response.data?.officer || response.data?.user;
        setProfile({
          role: officer?.role || '',
          department_id: officer?.department || null,
          department: officer?.department || officer?.department_name
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const fetchClassGroups = async () => {
    if (!activeSessionId) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.getClassGroups({
        status: 'active',
        session_id: activeSessionId
      }) as any;

      if (response.success) {
        setClassGroups(response.data?.class_groups || []);
      } else {
        const errorMsg = response.error || 'Failed to load classes';
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('Error fetching class groups:', error);
      toast.error(error.message || 'Network error: Unable to load classes');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      level: 200,
      name: 'A',
      student_count: 0
    });
    setEditingGroup(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeSessionId) {
      toast.error('No active session selected');
      return;
    }

    if (!profile.department && profile.role === 'department-officer') {
      toast.error('Department not found for this officer');
      return;
    }

    const normalizedName = formData.name.trim();

    if (!normalizedName || !formData.level) {
      toast.error('Please fill in all required fields');
      return;
    }

    const duplicate = classGroups.some(
      (group) =>
        group.level === formData.level &&
        group.name.toLowerCase() === normalizedName.toLowerCase() &&
        (!editingGroup || group.group_id !== editingGroup.group_id)
    );

    if (duplicate) {
      toast.error('This class already exists for the current session');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: normalizedName,
        level: formData.level,
        student_count: formData.student_count,
        department: profile.department_id,
        session_id: activeSessionId
      };

      const response = editingGroup
        ? await api.updateClassGroup(editingGroup.id, payload)
        : await api.createClassGroup(payload);

      if (response.success) {
        toast.success(editingGroup ? 'Class updated successfully' : 'Class created successfully');
        await fetchClassGroups();
        resetForm();
      } else {
        const errorMsg = (response as any).error || 'Failed to save class';
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('Error saving class group:', error);
      toast.error(error.message || 'Failed to save class');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (group: ClassGroup) => {
    setEditingGroup(group);
    setFormData({
      level: group.level,
      name: group.name,
      student_count: group.student_count
    });
    setShowForm(true);
  };

  const handleDelete = async (groupId: number) => {
    if (!confirm('Are you sure you want to delete this class?')) {
      return;
    }

    try {
      const response = await api.deleteClassGroup(groupId);

      if (response.success) {
        toast.success('Class deleted successfully');
        fetchClassGroups();
      } else {
        const errorMsg = (response as any).error || 'Failed to delete class';
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('Error deleting class group:', error);
      toast.error(error.message || 'Failed to delete class');
    }
  };

  const classesByLevel = classGroups.reduce((acc, cls) => {
    const key = String(cls.level);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(cls);
    return acc;
  }, {} as Record<string, ClassGroup[]>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0f2044]">Class Management</h2>
        <p className="text-slate-600 mt-1">Manage student groups for the active session</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-[#0f2044]">
            <span className="flex items-center gap-2">
              <Users className="size-5 text-[#ffb71b]" />
              Classes
            </span>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
              size="sm"
            >
              <Plus className="mr-2 size-4" />
              {showForm ? 'Close' : 'Add Class'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!activeSessionId && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900">No Active Session</h3>
                  <p className="text-sm text-yellow-800 mt-1">
                    Please set an active session before managing classes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Level *</Label>
                  <select
                    id="level"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b] bg-white"
                    required
                  >
                    {[100, 200, 300, 400].map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Group *</Label>
                  <select
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b] bg-white"
                    required
                  >
                    {['A', 'B', 'C', 'D', 'E'].map((group) => (
                      <option key={group} value={group}>
                        Group {group}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student_count">Class Size *</Label>
                  <input
                    id="student_count"
                    type="number"
                    min={1}
                    value={formData.student_count}
                    onChange={(e) => setFormData({ ...formData, student_count: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white">
                  {editingGroup ? 'Update' : 'Add'} Class Group
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} disabled={isLoading}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {isLoading && !classGroups.length && (
            <div className="text-center py-8 text-slate-500">Loading classes...</div>
          )}

          {!isLoading && classGroups.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No classes found. Add one to get started.
            </div>
          )}

          {classGroups.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Level</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Group</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Class Size</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#0f2044]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(classesByLevel)
                    .flat()
                    .sort((a, b) => (b.level - a.level) || a.name.localeCompare(b.name))
                    .map((group) => {
                      // Backend returns 'id' field for group identification
                      const groupId = group.id;
                      if (!groupId) return null; // Skip if no ID found

                      return (
                        <tr key={groupId} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 align-middle">
                            <span className="font-medium text-[#0f2044]">{group.level}</span>
                          </td>
                          <td className="py-3 px-4 align-middle">
                            <span className="font-medium text-[#0f2044]">Group {group.name}</span>
                          </td>
                          <td className="py-3 px-4 align-middle">
                            <span className="font-medium text-[#0f2044]">{group.student_count}</span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(group)}
                              disabled={isLoading}
                            >
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(group.id)}
                              disabled={isLoading}
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
