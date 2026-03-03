import { Edit2, Save, Settings, Trash2, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

/**
 * Lecturer Preferences – View and edit preferences for all lecturers across all departments.
 * Data is aggregated from all department officers; use this view when scheduling courses school-wide.
 */
export function SchoolLecturerPreferences() {
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<{ department_id?: number; name: string }[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    department: '',
    session_id: null as number | null,
    preferences: '',
  });

  const [prefsByLecturer, setPrefsByLecturer] = useState<Record<number, { preferences: string }>>({});

  useEffect(() => {
    fetchLecturers();
    fetchDepartments();
    fetchSessions();
  }, []);

  const fetchLecturers = async () => {
    setLoading(true);
    try {
      // Fetch all lecturers from all departments (no department/session filter) so school can see all department officers' data
      const res = await api.getLecturers({});
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : [];
        setLecturers(list);
        const prefs: Record<number, { preferences: string }> = {};
        list.forEach((lec: any) => {
          let p = { preferences: '' };
          if (lec.preferences) {
            try {
              const parsed = typeof lec.preferences === 'string' ? JSON.parse(lec.preferences) : lec.preferences;
              p = { preferences: parsed.preferences != null ? String(parsed.preferences) : '' };
            } catch (_) {}
          }
          prefs[lec.lecturer_id ?? lec.id] = p;
        });
        setPrefsByLecturer(prefs);
      }
    } catch (_) {
      toast.error('Failed to load lecturers');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.getDepartments();
      if (res.success) setDepartments(Array.isArray(res.data) ? res.data : []);
    } catch (_) {}
  };

  const fetchSessions = async () => {
    try {
      const res = await api.getSessions({});
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : [];
        setSessions(list);
        if (list.length > 0 && !formData.session_id) setFormData((p) => ({ ...p, session_id: list[0].session_id }));
      }
    } catch (_) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name?.trim() || !formData.last_name?.trim() || !formData.department?.trim()) {
      toast.error('First name, last name and department are required');
      return;
    }
    const sessionId = formData.session_id ?? sessions[0]?.session_id;
    if (!sessionId) {
      toast.error('No session selected. Create a session in Academic Settings first.');
      return;
    }

    setLoading(true);
    try {
      const name = `${formData.first_name.trim()} ${formData.last_name.trim()}`;
      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        name,
        department: formData.department.trim(),
        session_id: sessionId,
        status: 'active',
      };

      if (editingId) {
        const res = await api.updateLecturer(editingId, payload);
        if (res.success) {
          await savePreferences(editingId);
          toast.success('Lecturer and preferences updated');
        } else {
          toast.error((res as any).error || 'Update failed');
        }
      } else {
        const res = await api.createLecturer(payload);
        if (res.success && res.data) {
          const row = res.data as any;
          const id = row.lecturer_id ?? row.id;
          if (id) await savePreferences(id);
          toast.success('Lecturer added and preferences saved');
        } else {
          toast.error((res as any).error || 'Create failed');
        }
      }
      resetForm();
      fetchLecturers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (lecturerId: number) => {
    await api.createLecturerPreference({
      lecturer_id: lecturerId,
      preferences: formData.preferences,
    });
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      department: '',
      session_id: sessions[0]?.session_id ?? null,
      preferences: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (lec: any) => {
    setEditingId(lec.lecturer_id ?? lec.id);
    setFormData({
      first_name: lec.first_name || '',
      last_name: lec.last_name || '',
      department: lec.department || '',
      session_id: lec.session_id ?? sessions[0]?.session_id ?? null,
      preferences: prefsByLecturer[lec.lecturer_id ?? lec.id]?.preferences ?? '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this lecturer and their preferences?')) return;
    try {
      const res = await api.deleteLecturer(id);
      if (res.success) {
        toast.success('Lecturer removed');
        fetchLecturers();
      } else toast.error((res as any).error || 'Delete failed');
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0f2044] flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#ffb71b]" />
          Lecturer Preferences
        </h2>
        <p className="text-slate-600 mt-1">
          All lecturers from all departments — data from department officers. Use when scheduling; preferences apply school-wide.
        </p>
      </div>

      <Card className="shadow-md border border-slate-200">
        <CardHeader>
          <CardTitle className="text-[#0f2044] flex items-center justify-between">
            <span className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#ffb71b]" />
              Lecturers & preferences
            </span>
            <Button
              type="button"
              variant={showForm ? 'outline' : 'default'}
              className={!showForm ? 'bg-[#0f2044] hover:bg-[#0f2044]/90' : ''}
              size="sm"
              onClick={() => {
                if (showForm) resetForm();
                else setShowForm(true);
              }}
            >
              {showForm ? 'Cancel' : 'Add Lecturer'}
            </Button>
          </CardTitle>
          <p className="text-sm text-slate-600 mt-1">Used by the scheduler to avoid booking when unavailable</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {showForm && (
            <form onSubmit={handleSubmit} className="p-4 bg-slate-50 rounded-lg space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#0f2044] font-medium">First Name *</Label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData((p) => ({ ...p, first_name: e.target.value }))}
                    placeholder="First name"
                    required
                    className="border-slate-300 focus:ring-[#ffb71b]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#0f2044] font-medium">Last Name *</Label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData((p) => ({ ...p, last_name: e.target.value }))}
                    placeholder="Last name"
                    required
                    className="border-slate-300 focus:ring-[#ffb71b]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#0f2044] font-medium">Department *</Label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                  >
                    <option value="">Select department</option>
                    {departments.map((d) => (
                      <option key={d.department_id ?? d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <Label className="text-[#0f2044] font-medium block mb-2">Preferences</Label>
                <textarea
                  value={formData.preferences}
                  onChange={(e) => setFormData((p) => ({ ...p, preferences: e.target.value }))}
                  placeholder="e.g. Prefer morning slots; avoid Fridays"
                  className="w-full min-h-[80px] px-3 py-2 rounded-md border border-slate-300 bg-white text-[#0f2044] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={loading} className="bg-[#0f2044] hover:bg-[#0f2044]/90">
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Update Lecturer' : 'Add Lecturer'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {departments.length > 0 && (
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              <Label className="text-[#0f2044] font-medium">Filter by department:</Label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
              >
                <option value="">All departments</option>
                {departments.map((d) => (
                  <option key={d.department_id ?? d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          )}
          {loading && lecturers.length === 0 && <p className="text-slate-500 py-4">Loading...</p>}
          {!loading && lecturers.length === 0 && <p className="text-slate-500 py-4">No lecturers yet. Add one above.</p>}
          {lecturers.length > 0 && (() => {
            const filtered = departmentFilter
              ? lecturers.filter((lec: any) => (lec.department || '') === departmentFilter)
              : lecturers;
            return (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Lecturer name</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Department</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Preferences</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#0f2044]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lec) => {
                    const pref = prefsByLecturer[lec.lecturer_id ?? lec.id];
                    const name = [lec.first_name, lec.last_name].filter(Boolean).join(' ') || lec.name;
                    return (
                      <tr key={lec.lecturer_id ?? lec.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">{name}</td>
                        <td className="py-3 px-4">{lec.department || '—'}</td>
                        <td className="py-3 px-4 max-w-xs">{pref?.preferences?.trim() || '—'}</td>
                        <td className="py-3 px-4 text-right">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(lec)} title="Edit">
                            <Edit2 className="size-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(lec.lecturer_id ?? lec.id)} title="Delete">
                            <Trash2 className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );})()}
        </CardContent>
      </Card>
    </div>
  );
}
