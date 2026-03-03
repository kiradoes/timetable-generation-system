import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';

interface Course {
  id: number;
  course_code: string;
  title: string;
  credit_units: number;
  level: number;
  semester: 'First' | 'Second' | 'Both';
  category: string;
  department_id: number | null;
  department?: string;
  session_id?: number;
}

interface OfficerProfile {
  role: string;
  department_id: number | null;
  department?: string;
}

export function DepartmentCourseManagement({ activeSessionId }: { activeSessionId: number | null }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [profile, setProfile] = useState<OfficerProfile>({ role: '', department_id: null });
  const [formData, setFormData] = useState({
    course_code: '',
    title: '',
    credit_units: 2,
    level: 100,
    semester: 'First' as 'First' | 'Second',
    category: 'Computing' as 'Computing' | 'Elective' | 'Core'
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeSessionId) {
      fetchCourses();
    } else {
      setCourses([]);
    }
  }, [activeSessionId]);

  const fetchProfile = async () => {
    try {
      const response = await api.getProfile();

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

  const fetchCourses = async () => {
    if (!activeSessionId) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.getCourses({ session_id: activeSessionId, computing_only: true });
      if (response.success) {
        const raw = Array.isArray(response.data) ? response.data : (response.data?.courses || []);
        const normalized = raw.map((c: any) => ({ ...c, id: c.id ?? c.course_id }));
        setCourses(normalized);
      } else {
        toast.error(response.error || 'Failed to load courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Network error: Unable to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      course_code: '',
      title: '',
      credit_units: 2,
      level: 100,
      semester: 'First',
      category: 'Computing'
    });
    setEditingCourse(null);
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

    if (!formData.course_code || !formData.title) {
      toast.error('Please fill in all required fields');
      return;
    }

    const normalizedCode = formData.course_code.trim().toUpperCase();
    const departmentId = profile.department_id || null;
    const duplicate = courses.some(
      (course) =>
        course.course_code.toUpperCase() === normalizedCode &&
        course.department_id === departmentId &&
        (!editingCourse || course.id !== (editingCourse.id ?? (editingCourse as any).course_id))
    );

    if (duplicate) {
      toast.error('This course code already exists for this department in the current session');
      return;
    }

    setIsLoading(true);

    try {
      // Safely resolve the editing ID (support both `id` and legacy `course_id`)
      const editingId = editingCourse ? (editingCourse.id ?? (editingCourse as any).course_id) : null;
      if (editingCourse && !editingId) {
        console.error('Attempting to update course but id is missing on editingCourse', editingCourse);
        toast.error('Unable to update course: missing course id');
        setIsLoading(false);
        return;
      }

      const payload = {
        course_code: normalizedCode,
        title: formData.title.trim(),
        credit_units: formData.credit_units,
        level: formData.level,
        semester: formData.semester,
        category: 'Computing',
        department: departmentId,
        session_id: activeSessionId
      };

      const response = editingCourse
        ? await api.updateCourse(editingId, payload)
        : await api.createCourse(payload);

      if (response.success) {
        toast.success(editingCourse ? 'Course updated successfully' : 'Course added successfully');
        await fetchCourses();
        resetForm();
      } else {
        const errorMsg = (response as any).error || 'Failed to save course';
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('Error saving course:', error);
      toast.error(error.message || 'Failed to save course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      course_code: course.course_code,
      title: course.title,
      credit_units: course.credit_units,
      level: course.level,
      semester: course.semester === 'Second' ? 'Second' : 'First',
      category: (course.category === 'Elective' ? 'Elective' : course.category === 'Core' ? 'Core' : 'Computing')
    });
    setShowForm(true);
  };

  const handleDelete = async (courseId: number) => {
    if (!confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      const response = await api.deleteCourse(courseId);

      if (response.success) {
        toast.success('Course deleted successfully');
        fetchCourses();
      } else {
        const error = (response as any).error;
        // Show specific error message
        toast.error(error || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-[#0f2044]">Course Management</h2>
        <p className="text-slate-600 mt-1 text-base">Manage computing courses for the active session</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-[#0f2044] text-xl">
            <span>Courses</span>
            <Button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
              size="sm"
            >
              <Plus className="size-4 mr-1" />
              {showForm ? 'Close' : 'Add Course'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course_code">Course Code *</Label>
                  <input
                    id="course_code"
                    type="text"
                    value={formData.course_code}
                    onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                    placeholder="e.g., CSC101"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Introduction to Programming"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credit_units">Credit Units *</Label>
                  <input
                    id="credit_units"
                    type="number"
                    min={1}
                    max={6}
                    value={formData.credit_units}
                    onChange={(e) => setFormData({ ...formData, credit_units: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                    required
                  />
                </div>

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
                  <Label htmlFor="semester">Semester *</Label>
                  <select
                    id="semester"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value as 'First' | 'Second' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b] bg-white"
                    required
                  >
                    <option value="First">First</option>
                    <option value="Second">Second</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Course type</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as 'Computing' | 'Elective' | 'Core' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b] bg-white"
                  >
                    <option value="Computing">Core / Computing</option>
                    <option value="Core">Core</option>
                    <option value="Elective">Elective (can be scheduled same time as other electives)</option>
                  </select>
                  <p className="text-xs text-slate-500">Electives can share the same time slot.</p>
                </div>

              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white">
                  {editingCourse ? 'Update' : 'Add'} Course
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} disabled={isLoading}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {isLoading && !courses.length && (
            <div className="text-center py-8 text-slate-500">Loading courses...</div>
          )}

          {!isLoading && courses.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No courses found. Add one to get started.
            </div>
          )}

          {courses.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044] text-base">Code</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044] text-base">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044] text-base">Credit Units</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044] text-base">Level</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044] text-base">Semester</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044] text-base">Type</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#0f2044] text-base">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-base">
                        {course.course_code}
                      </td>
                      <td className="py-3 px-4 text-base">{course.title}</td>
                      <td className="py-3 px-4 text-base">
                        {course.credit_units}
                      </td>
                      <td className="py-3 px-4 text-base">
                        {course.level}
                      </td>
                      <td className="py-3 px-4 text-base">
                        {course.semester}
                      </td>
                      <td className="py-3 px-4 text-base">
                        <span className={course.category === 'Elective' ? 'text-amber-600 font-medium' : 'text-slate-600'}>{course.category === 'Elective' ? 'Elective' : 'Core'}</span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(course)}
                          disabled={isLoading}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(course.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
