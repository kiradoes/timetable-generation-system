import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';

interface Assignment {
  lecturer_id?: number;
  class_group_id?: number;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
}

interface NonComputingCourse {
  course_id?: number;
  course_code: string;
  title: string;
  category?: 'GEDS' | 'SAT';
  level: number;
  semester: 'First' | 'Second';
  session_id?: number;
  status?: string;
  schedule_count?: number;
  assignment?: Assignment;
  lecturer_name?: string;
  class_group_name?: string;
}

export function NonComputingCourseManagement() {
  const [courses, setCourses] = useState<NonComputingCourse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCourse, setEditingCourse] = useState<NonComputingCourse | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<{ department_id?: number; name: string }[]>([]);
  const [allClassGroups, setAllClassGroups] = useState<any[]>([]);
  const [classGroups, setClassGroups] = useState<any[]>([]);
  const [formData, setFormData] = useState<NonComputingCourse & { department?: string; lecturer_id?: number; lecturer_name?: string; class_group_id?: number; day_of_week?: string; start_time?: string; end_time?: string }>({
    course_code: '',
    title: '',
    category: 'GEDS',
    level: 100,
    semester: 'First',
    session_id: undefined,
    department: '',
    lecturer_id: undefined,
    lecturer_name: '',
    class_group_id: undefined,
    day_of_week: 'Monday',
    start_time: '09:00',
    end_time: '10:00',
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchLecturersAndDepartments = async () => {
      try {
        const [lecRes, deptRes, grpRes] = await Promise.all([
          api.getLecturers({}),
          api.getDepartments(),
          api.getClassGroups({}),
        ]);
        if (lecRes.success) setLecturers(Array.isArray(lecRes.data) ? lecRes.data : []);
        if (deptRes.success) setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
        if (grpRes.success) setAllClassGroups(Array.isArray(grpRes.data) ? grpRes.data : []);
      } catch (_) {}
    };
    fetchLecturersAndDepartments();
  }, []);

  useEffect(() => {
    if (!formData.department || formData.level == null) {
      setClassGroups([]);
      return;
    }
    const filtered = allClassGroups.filter(
      (g: any) => (g.department || '') === formData.department && Number(g.level) === Number(formData.level)
    );
    setClassGroups(filtered);
  }, [formData.department, formData.level, allClassGroups]);

  const fetchCourses = async () => {
    try {
      const response = await api.getCourses({}) as any;
      if (response.success) {
        const raw = Array.isArray(response.data) ? response.data : (response.data?.courses || []);
        const nonComputing = raw.filter(
          (c: any) => (c.category === 'GEDS' || c.category === 'SAT') && c.session_id != null
        );
        const coursesWithMappedId = nonComputing.map((course: any) => ({
          ...course,
          course_id: course.id || course.course_id,
          assignment: typeof course.assignment === 'string' ? JSON.parse(course.assignment || '{}') : course.assignment,
        }));
        setCourses(coursesWithMappedId);
      } else {
        toast.error(response.error || 'Failed to load courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'level') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.department?.trim()) {
        toast.error('Please select a department.');
        setIsLoading(false);
        return;
      }
      if (!formData.class_group_id) {
        toast.error('Please select a group.');
        setIsLoading(false);
        return;
      }
      const selectedGroup = classGroups.find((g) => (g.group_id ?? g.id) === formData.class_group_id) ?? allClassGroups.find((g) => (g.group_id ?? g.id) === formData.class_group_id);
      const sessionId = selectedGroup?.session_id ?? (editingCourse?.session_id as number | undefined);
      if (!sessionId && !editingCourse) {
        toast.error('Selected group has no session. Please choose another group.');
        setIsLoading(false);
        return;
      }
      const level = selectedGroup?.level ?? formData.level;
      const department = formData.department?.trim() || selectedGroup?.department;
      const hasSchedule = (formData.lecturer_name?.trim() || formData.lecturer_id) && formData.class_group_id;
      const assignment = hasSchedule
        ? {
            ...(formData.lecturer_id ? { lecturer_id: formData.lecturer_id } : {}),
            ...(formData.lecturer_name?.trim() ? { lecturer_name: formData.lecturer_name.trim() } : {}),
            class_group_id: formData.class_group_id,
            class_name: selectedGroup?.name,
            department,
            level,
            day_of_week: formData.day_of_week || 'Monday',
            start_time: formData.start_time || '09:00',
            end_time: formData.end_time || '10:00',
          }
        : undefined;
      const courseData = {
        course_code: formData.course_code.trim(),
        title: formData.title.trim(),
        credit_units: formData.credit_units ?? 0,
        category: formData.category,
        level,
        semester: formData.semester,
        session_id: sessionId,
        status: 'active',
        assignment,
        department: department || undefined,
      };

      const response = editingCourse
        ? await api.updateCourse(editingCourse.course_id || 0, courseData)
        : await api.createCourse(courseData);

      if (response.success) {
        toast.success(editingCourse ? 'Course updated successfully' : 'Course added successfully');
        resetForm();
        fetchCourses();
      } else {
        const errorMsg = (response as any).error || 'Operation failed';
        console.error('Update/Create error:', { response });
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('Error saving course:', error);
      toast.error(error.message || 'Failed to save course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (course: NonComputingCourse) => {
    setEditingCourse(course);
    const a = course.assignment as { lecturer_id?: number; lecturer_name?: string; class_group_id?: number; department?: string; level?: number; day_of_week?: string; start_time?: string; end_time?: string } | undefined;
    const lecturerName = a?.lecturer_name ?? (a?.lecturer_id ? getLecturerName(a.lecturer_id) : '');
    const group = a?.class_group_id ? allClassGroups.find((g) => (g.group_id ?? g.id) === a.class_group_id) : null;
    setFormData((prev) => ({
      ...prev,
      course_code: course.course_code,
      title: course.title,
      category: course.category || 'GEDS',
      level: a?.level ?? group?.level ?? course.level,
      semester: course.semester,
      session_id: course.session_id,
      department: a?.department ?? group?.department ?? prev.department ?? '',
      lecturer_id: a?.lecturer_id,
      lecturer_name: lecturerName !== '-' ? lecturerName : '',
      class_group_id: a?.class_group_id,
      day_of_week: a?.day_of_week || 'Monday',
      start_time: a?.start_time || '09:00',
      end_time: a?.end_time || '10:00',
    }));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!id) {
      toast.error('Invalid course ID');
      console.error('Delete called with invalid ID:', id);
      return;
    }

    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await api.deleteCourse(id);

      if (response.success) {
        toast.success('Course deleted successfully');
        fetchCourses();
      } else {
        const errorMsg = (response as any).error || 'Failed to delete course';
        console.error('Delete error:', { response, id });
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast.error(error.message || 'Failed to delete course');
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Delete all non-computing courses (GEDS/SAT)? This cannot be undone.')) return;

    try {
      // Note: Bulk delete is not available in current API. Delete courses individually
      for (const course of courses) {
        if (course.course_id) {
          await api.deleteCourse(course.course_id);
        }
      }
      toast.success('All non-computing courses deleted');
      fetchCourses();
    } catch (error: any) {
      console.error('Error deleting courses:', error);
      toast.error(error.message || 'Failed to delete courses');
    }
  };

  const resetForm = () => {
    setFormData((prev) => ({
      ...prev,
      course_code: '',
      title: '',
      category: 'GEDS',
      level: 100,
      semester: 'First',
      session_id: undefined,
      department: '',
      lecturer_id: undefined,
      lecturer_name: '',
      class_group_id: undefined,
      day_of_week: 'Monday',
      start_time: '09:00',
      end_time: '10:00',
    }));
    setEditingCourse(null);
    setShowForm(false);
  };

  const getLecturerName = (id: number) => {
    const l = lecturers.find((x) => x.lecturer_id === id || x.id === id);
    if (!l) return '-';
    const first = l.first_name || l.name || '';
    const last = l.last_name || '';
    const full = (first + ' ' + last).trim();
    return full || l.name || '-';
  };
  const getGroupName = (id: number) => {
    const g = classGroups.find((x) => x.group_id === id || x.id === id) || allClassGroups.find((x) => x.group_id === id || x.id === id);
    return g ? (g.name || '-') : '-';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0f2044]">Non-Computing Courses Management</h2>
        <p className="text-slate-600 mt-1">Add GEDS/SAT courses by Level, Department, and Class so they are considered when generating the timetable (no time clashes).</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-[#0f2044]">
            <span>Input form &ndash; add or edit course</span>
            <Button
              type="button"
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  setShowForm(true);
                  setEditingCourse(null);
                }
              }}
              className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
              size="sm"
            >
              <Plus className="size-4 mr-1" />
              {showForm ? 'Cancel' : 'Add Course'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-5 bg-slate-50 rounded-lg space-y-4">
              <div className="space-y-3">
                <p className="text-sm font-medium text-[#0f2044]">Input form fields</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#0f2044] font-semibold">Course Code *</Label>
                    <input name="course_code" type="text" value={formData.course_code} onChange={handleInputChange} placeholder="e.g., GST101" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#0f2044] font-semibold">Title *</Label>
                    <input name="title" type="text" value={formData.title} onChange={handleInputChange} placeholder="e.g., Use of English I" className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#0f2044] font-semibold">Lecturer</Label>
                    <input
                      name="lecturer_name"
                      type="text"
                      value={formData.lecturer_name ?? ''}
                      onChange={(e) => setFormData((p) => ({ ...p, lecturer_name: e.target.value }))}
                      placeholder="e.g., Dr. Jane Smith"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#0f2044] font-semibold">Department</Label>
                    <select
                      value={formData.department ?? ''}
                      onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value, class_group_id: undefined }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                    >
                      <option value="">Select department</option>
                      {departments.map((d) => (
                        <option key={d.department_id ?? d.name} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#0f2044] font-semibold">Level</Label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                    >
                      {[100, 200, 300, 400].map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#0f2044] font-semibold">Class</Label>
                    <select
                      value={formData.class_group_id ?? ''}
                      onChange={(e) => setFormData((p) => ({ ...p, class_group_id: e.target.value ? Number(e.target.value) : undefined }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                    >
                      <option value="">Select class</option>
                      {classGroups.map((g) => (
                        <option key={g.group_id ?? g.id} value={g.group_id ?? g.id}>{g.name}</option>
                      ))}
                    </select>
                    {formData.department && formData.level != null && classGroups.length === 0 && (
                      <p className="text-xs text-amber-600">No classes for this department and level. Add classes in Class Management.</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#0f2044] font-semibold">Day</Label>
                    <select value={formData.day_of_week ?? 'Monday'} onChange={(e) => setFormData((p) => ({ ...p, day_of_week: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#0f2044] font-semibold">Time</Label>
                    <div className="flex gap-2 items-center">
                      <input type="time" value={formData.start_time ?? '09:00'} onChange={(e) => setFormData((p) => ({ ...p, start_time: e.target.value }))} className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]" />
                      <span className="text-slate-500">to</span>
                      <input type="time" value={formData.end_time ?? '10:00'} onChange={(e) => setFormData((p) => ({ ...p, end_time: e.target.value }))} className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {editingCourse ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      {editingCourse ? <Edit className="mr-2 size-4" /> : <Plus className="mr-2 size-4" />}
                      {editingCourse ? 'Update Course' : 'Add Course'}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {isLoading && !courses.length && (
            <div className="text-center py-8 text-slate-500">
              Loading courses...
            </div>
          )}

          {!isLoading && courses.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No courses found. Create one to get started.
            </div>
          )}

          {courses.length > 0 && (
            <div className="mt-4">
              <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Code</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Level</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Department</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Class</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Lecturer</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Day</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Time</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#0f2044]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => {
                    const a = course.assignment as { department?: string; level?: number; class_group_id?: number } | undefined;
                    const dept = (a as any)?.department ?? (a?.class_group_id ? (allClassGroups.find((g) => (g.group_id ?? g.id) === a.class_group_id)?.department) : null) ?? '—';
                    return (
                      <tr key={course.course_id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">{course.course_code}</td>
                        <td className="py-3 px-4">{course.title}</td>
                        <td className="py-3 px-4">{course.level ?? (a as any)?.level ?? '—'}</td>
                        <td className="py-3 px-4">{dept}</td>
                        <td className="py-3 px-4">{(a as any)?.class_name || (a?.class_group_id ? getGroupName(a.class_group_id) : '-')}</td>
                        <td className="py-3 px-4">{(a as any)?.lecturer_name || (a?.lecturer_id ? getLecturerName(a.lecturer_id) : null) || '-'}</td>
                        <td className="py-3 px-4">{a?.day_of_week ?? '-'}</td>
                        <td className="py-3 px-4">{a?.start_time && a?.end_time ? `${a.start_time} - ${a.end_time}` : '-'}</td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(course)}
                            disabled={isLoading}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => course.course_id && handleDelete(course.course_id)}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
