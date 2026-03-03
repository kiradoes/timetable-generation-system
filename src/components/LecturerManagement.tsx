import { Edit, Trash2, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';

interface Lecturer {
  id: number;  // Backend returns 'id', not 'lecturer_id'
  first_name?: string;
  last_name?: string;
  name: string;
  department: string;
  department_id: number;
  session_id?: number;
  status: 'active' | 'inactive';
  preferences?: string;
}

interface OfficerProfile {
  role: string;
  department_id: number | null;
  department?: string;
}

export function LecturerManagement({ activeSessionId }: { activeSessionId: number | null }) {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [profile, setProfile] = useState<OfficerProfile>({ role: '', department_id: null });
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    department: null as string | null,
    preferences: ''
  });

  const splitName = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return {
      first_name: parts[0] || '',
      last_name: parts.slice(1).join(' ') || ''
    };
  };

  const getNameParts = (lecturer: Lecturer) => {
    if (lecturer.first_name || lecturer.last_name) {
      return {
        first_name: lecturer.first_name || '',
        last_name: lecturer.last_name || ''
      };
    }
    return splitName(lecturer.name);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeSessionId) {
      fetchLecturers();
    } else {
      setLecturers([]);
    }
  }, [activeSessionId]);

  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const response = await api.getProfile();

      if (response.success) {
        const officer = response.data?.officer || response.data?.user;
        console.log('Profile loaded successfully:', { officer, department: officer?.department });
        setProfile({
          role: officer?.role || '',
          department_id: officer?.department_id || null,
          department: officer?.department || officer?.department_name
        });

        // For school officers, fetch departments list
        if (officer?.role === 'school-officer') {
          await fetchDepartments();
        }

        if (!officer?.department && officer?.role === 'department-officer') {
          console.warn('Warning: Department is null/undefined in officer data:', officer);
        }
      } else {
        toast.error('Failed to load your profile. Please refresh the page.');
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Error loading profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.getDepartments();
      if (response.success) {
        setDepartments(response.data || []);
      } else {
        toast.error('Failed to load departments');
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      toast.error('Error loading departments');
    }
  };

  const fetchLecturers = async () => {
    if (!activeSessionId) {
      return;
    }
    try {
      const response = await api.getLecturers({ session_id: activeSessionId });
      if (response.success) {
        setLecturers(Array.isArray(response.data) ? response.data : (response.data?.lecturers || []));
      } else {
        toast.error(response.error || 'Failed to load lecturers');
      }
    } catch (error: any) {
      console.error('Error fetching lecturers:', error);
      toast.error(error.message || 'Error loading lecturers');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (profileLoading) {
      toast.error('Please wait while your profile is loading...');
      return;
    }

    if (!activeSessionId) {
      toast.error('No active session selected');
      return;
    }

    const firstName = formData.first_name.trim();
    const lastName = formData.last_name.trim();

    if (!firstName || !lastName) {
      toast.error('Please enter both first name and last name');
      return;
    }

    // Validate lecturer name - only letters, numbers, spaces, and allowed punctuation
    if (!/^[a-zA-Z\s.'-]+$/.test(firstName) || !/^[a-zA-Z\s.'-]+$/.test(lastName)) {
      toast.error('Names can only contain letters, spaces, apostrophes, hyphens, and periods');
      return;
    }

    const fullName = `${firstName} ${lastName}`.trim();

    // Determine which department to use
    const targetDeptId = profile.role === 'school-officer' ? formData.department : profile.department;

    if (!targetDeptId) {
      toast.error('Please select a department');
      return;
    }

    // Check for duplicate: same lecturer name in the same department
    const isDuplicate = lecturers.some(
      (lecturer) =>
        lecturer.name.toLowerCase() === fullName.toLowerCase() &&
        lecturer.department === targetDeptId &&
        (!editingLecturer || lecturer.id !== editingLecturer.id)
    );

    if (isDuplicate) {
      toast.error('This lecturer already exists in the selected department');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        session_id: activeSessionId,
        preferences: formData.preferences || null,
        ...(formData.department && { department: formData.department })
      };

      console.log('Sending lecturer payload:', {
        payload,
        user_role: profile.role,
        user_department: profile.department,
        selected_department: formData.department,
      });

      const response = editingLecturer
        ? await api.updateLecturer(editingLecturer.id, payload)
        : await api.createLecturer(payload);

      if (response.success) {
        const successMsg = editingLecturer ? 'Lecturer updated successfully' : 'Lecturer added successfully';
        toast.success(successMsg);

        // Wait a moment then refresh the list
        await new Promise(resolve => setTimeout(resolve, 100));
        await fetchLecturers();
        resetForm();
      } else {
        const errorMsg = (response as any).error || 'Operation failed';
        console.error('Backend error response:', { response, payload });
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('Error saving lecturer:', error);
      toast.error(error.message || 'Failed to save lecturer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (lecturerId: number) => {
    if (!lecturerId) {
      toast.error('Invalid lecturer ID');
      console.error('Delete called with invalid lecturerId:', lecturerId);
      return;
    }

    if (!confirm('Are you sure you want to delete this lecturer? Any classes currently assigned to them will be removed from the timetable and those slots will become available to reassign.')) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('Deleting lecturer with ID:', lecturerId);
      const response = await api.deleteLecturer(lecturerId);

      if (response.success) {
        toast.success('Lecturer deleted successfully');
        // Immediately refresh the list
        await fetchLecturers();
      } else {
        const errorMsg = (response as any)?.error || 'Failed to delete lecturer';
        console.error('Delete error response:', { response, lecturerId });
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('Error deleting lecturer:', { error, lecturerId });
      toast.error(error.message || 'Failed to delete lecturer due to network error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      department: null
    });
    setEditingLecturer(null);
    setShowForm(false);
  };

  const handleEdit = (lecturer: Lecturer) => {
    const { first_name, last_name } = getNameParts(lecturer);
    setEditingLecturer(lecturer);
    setFormData({
      first_name,
      last_name,
      department: lecturer.department
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0f2044]">Lecturer Management</h2>
        <p className="text-slate-600 mt-1">Manage lecturers for timetable scheduling</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-[#0f2044]">
            <span>Lecturers</span>
            <Button
              type="button"
              onClick={() => {
                if (showForm) {
                  resetForm(); // Close form and clear editing state
                } else {
                  setEditingLecturer(null); // Clear editing state before opening form
                  setShowForm(true);
                }
              }}
              disabled={profileLoading || !activeSessionId}
              className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white disabled:bg-slate-300"
              size="sm"
              title={profileLoading ? 'Loading your profile...' : !activeSessionId ? 'Please select an active session' : ''}
            >
              <UserPlus className={`size-4 mr-1 ${showForm ? 'hidden' : ''}`} />
              {showForm ? 'Close' : 'Add Lecturer'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <input
                    id="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="e.g., John"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <input
                    id="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="e.g., Doe"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                    required
                  />
                </div>
              </div>

              {/* Department Selection - Only for School Officers */}
              {profile?.role === 'school-officer' && (
                <div className="space-y-2">
                  <Label htmlFor="department">Select Department *</Label>
                  <select
                    id="department"
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                    required
                  >
                    <option value="">-- Select a Department --</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Preferences */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="preferences">Preferences / Notes</Label>
                <textarea
                  id="preferences"
                  value={formData.preferences}
                  onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                  placeholder="e.g., Prefers morning classes, Available on weekends, Special equipment needs..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b] resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isLoading || profileLoading}
                  className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
                  title={profileLoading ? 'Loading profile...' : ''}
                >
                  {editingLecturer ? 'Update' : 'Add'} Lecturer
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} disabled={isLoading}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {isLoading && !lecturers.length && (
            <div className="text-center py-8 text-slate-500">
              Loading lecturers...
            </div>
          )}

          {!isLoading && lecturers.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No lecturers found. Add one to get started.
            </div>
          )}

          {lecturers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Lecturer name</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#0f2044]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lecturers.map((lecturer) => {
                    // Backend returns 'id' field for lecturer identification
                    const lecturerId = lecturer.id;
                    if (!lecturerId) return null; // Skip if no ID found

                    const { first_name, last_name } = getNameParts(lecturer);
                    const fullName = [first_name, last_name].filter(Boolean).join(' ') || lecturer.name || '—';
                    return (
                      <tr key={lecturerId} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium">{fullName}</td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(lecturer)}
                            disabled={isLoading}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(lecturer.id)}
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
