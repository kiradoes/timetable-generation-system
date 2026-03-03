import { Calendar, Edit2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';

interface Session {
  session_id?: number;
  name: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'inactive' | 'ended';
  is_current?: boolean;
}

interface SemesterRow {
  semester_id: number;
  name: string;
  status: string;
  timetable_status?: string;
  start_date?: string;
  end_date?: string;
  session_id?: number;
}

export function AcademicSettings({ onSessionsOrSemestersChange }: { onSessionsOrSemestersChange?: () => void }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [semesters, setSemesters] = useState<SemesterRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
  });

  // New semester form (after ending current one, or for second semester)
  const [showSemesterForm, setShowSemesterForm] = useState(false);
  const [semesterForm, setSemesterForm] = useState({ name: 'Second', start_date: '', end_date: '' });

  // Only show the active (current) session; once deactivated it disappears
  const activeSessions = sessions.filter((s) => s.is_current);
  const currentSession = activeSessions[0] ?? null;
  const activeSemester = semesters.find((s) => s.status === 'active') ?? null;

  /** Normalize semester name for display: only "First" or "Second" */
  const semesterDisplayName = (name: string | number | undefined) => {
    if (name === undefined || name === null) return '—';
    const n = String(name).trim().toLowerCase();
    if (n === 'first' || n === '1' || n === 'first semester') return 'First';
    if (n === 'second' || n === '2' || n === 'second semester') return 'Second';
    return '—';
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // When we have an active session, fetch its semesters
  useEffect(() => {
    const current = sessions.find((s) => s.is_current);
    if (!current) {
      setSemesters([]);
      return;
    }
    const sessionId = current.session_id ?? (current as any).id;
    if (!sessionId) {
      setSemesters([]);
      return;
    }
    (api.getSemestersBySession(sessionId) as Promise<{ success: boolean; data?: SemesterRow[] }>)
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setSemesters(res.data);
        } else {
          setSemesters([]);
        }
      })
      .catch(() => setSemesters([]));
  }, [sessions]);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const response = await api.getSessions({}) as any;
      if (response.success) {
        setSessions(response.data || []);
      } else {
        toast.error(response.error || 'Failed to load sessions');
      }
    } catch (error: any) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.start_date || !formData.end_date) {
      toast.error('Please fill all fields');
      return;
    }
    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      toast.error('Start date must be before end date');
      return;
    }

    setIsLoading(true);
    try {
      if (editingId) {
        const response = await api.updateSession(editingId, {
          name: formData.name,
          start_date: formData.start_date,
          end_date: formData.end_date,
        }) as any;
        if (response.success) {
          toast.success('Session updated');
          resetForm();
          fetchSessions();
        } else {
          console.error('Update session error:', response);
          toast.error(response.error || 'Failed to update session');
        }
      } else {
        const currentRes = await api.getCurrentSession() as any;
        if (currentRes?.success && currentRes?.data) {
          toast.error('A session is currently running. Deactivate it before adding another session.');
          setIsLoading(false);
          return;
        }
        const response = await api.createSession({
          name: formData.name,
          start_date: formData.start_date,
          end_date: formData.end_date,
          status: 'active',
        }) as any;
        if (response.success) {
          const newSessionId = response.data?.session_id ?? response.data?.id;
          if (newSessionId) {
            await api.setCurrentSession(newSessionId);
          }
          toast.success('Session created');
          resetForm();
          fetchSessions();
        } else {
          console.error('Create session error:', response);
          toast.error(response.error || 'Failed to create session');
        }
      }
    } catch (error: any) {
      console.error('Session operation error:', error);
      toast.error(error?.message || 'Failed to save session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (session: Session) => {
    setFormData({
      name: session.name,
      start_date: session.start_date,
      end_date: session.end_date,
    });
    setEditingId(session.session_id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this session? This cannot be undone.')) return;
    try {
      const response = await api.deleteSession(id) as any;
      if (response.success) {
        toast.success('Session deleted');
        fetchSessions();
      } else {
        toast.error(response?.error || 'Failed to delete session');
      }
    } catch (error: any) {
      toast.error('Failed to delete session');
    }
  };

  const handleDeactivateSession = async (id: number) => {
    if (!confirm('Deactivate this session? You can add a new session after deactivating.')) return;
    try {
      const response = await api.clearCurrentSession();
      if (response.success) {
        toast.success('Session deactivated. You can now add another session.');
        fetchSessions();
      } else {
        toast.error((response as any).error || 'Failed to deactivate session');
      }
    } catch (error: any) {
      toast.error('Failed to deactivate session');
    }
  };

  const handleDeactivateSemester = async (semesterId: number) => {
    if (!confirm('Deactivate this semester? You can start a new semester after deactivating.')) return;
    try {
      const response = await api.updateSemester(semesterId, { status: 'inactive' }) as any;
      if (response.success) {
        toast.success('Semester deactivated. You can now start a new semester.');
        const sessionId = currentSession?.session_id ?? (currentSession as any)?.id;
        if (sessionId) {
          const res = await api.getSemestersBySession(sessionId) as any;
          if (res.success && Array.isArray(res.data)) setSemesters(res.data);
        }
        onSessionsOrSemestersChange?.();
      } else {
        toast.error((response as any)?.error || 'Failed to deactivate semester');
      }
    } catch (error: any) {
      toast.error('Failed to deactivate semester');
    }
  };

  const handleStartNewSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    const sessionId = currentSession?.session_id ?? (currentSession as any)?.id;
    if (!sessionId) {
      toast.error('No active session');
      return;
    }
    const name = semesterForm.name.trim() || 'Second';
    const start_date = semesterForm.start_date || currentSession?.start_date || '';
    const end_date = semesterForm.end_date || currentSession?.end_date || '';
    if (!start_date || !end_date) {
      toast.error('Please set session dates or enter semester start/end dates.');
      return;
    }
    try {
      const response = await api.createSemester({
        session_id: sessionId,
        name,
        start_date,
        end_date,
        status: 'active',
      }) as any;
      if (response.success) {
        toast.success(`Semester "${name}" started. Courses and schedules will now apply to this semester.`);
        const res = await api.getSemestersBySession(sessionId) as any;
        if (res.success && Array.isArray(res.data)) setSemesters(res.data);
        setShowSemesterForm(false);
        setSemesterForm({ name: 'Second', start_date: '', end_date: '' });
        onSessionsOrSemestersChange?.();
      } else {
        toast.error(response?.error || 'Failed to start semester');
      }
    } catch (error: any) {
      toast.error('Failed to start semester');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', start_date: '', end_date: '' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0f2044]">Academic Settings</h2>
        <p className="text-slate-600 mt-1">Create and manage sessions (e.g. 2025/2026)</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-[#0f2044]">
            <span className="flex items-center gap-2">
              <Calendar className="size-5 text-[#ffb71b]" />
              Sessions
            </span>
            <Button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
              size="sm"
            >
              <Plus className="size-4 mr-1" />
              Add Session
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
        {/* Current session: show first, then the one active semester under it */}
        {currentSession && (
          <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
            <h3 className="text-base font-semibold text-[#0f2044]">
              Session: {(currentSession.name || '').replace(/-/g, '/')}
            </h3>

            {/* Only one semester block: the active semester, shown after the session */}
            {activeSemester ? (
              <div className="pl-2 border-l-4 border-[#ffb71b]">
                <p className="text-sm font-medium text-[#0f2044] mb-1">
                  Active semester: {semesterDisplayName(activeSemester.name)}
                </p>
                <p className="text-xs text-slate-600 mb-3">
                  Deactivate this semester when done; you can then start a new one (First or Second). Schedule Lecture will show the new semester.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-amber-700 border-amber-300 hover:bg-amber-50"
                  onClick={() => handleDeactivateSemester(activeSemester.semester_id)}
                >
                  Deactivate
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-600">
                  No active semester. Start one (First or Second) so you can use Schedule Lecture and course lists.
                </p>
                {!showSemesterForm ? (
                  <Button
                    type="button"
                    size="sm"
                    className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
                    onClick={() => {
                      setShowSemesterForm(true);
                      setSemesterForm({
                        name: semesters.some((s) => semesterDisplayName(s.name) === 'First') ? 'Second' : 'First',
                        start_date: currentSession.start_date || '',
                        end_date: currentSession.end_date || '',
                      });
                    }}
                  >
                    <Plus className="size-4 mr-1" />
                    Start new semester
                  </Button>
                ) : (
                  <form onSubmit={handleStartNewSemester} className="space-y-3 pt-2 border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-[#0f2044] font-medium">Semester (First or Second) *</Label>
                        <select
                          value={semesterForm.name}
                          onChange={(e) => setSemesterForm({ ...semesterForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                        >
                          <option value="First">First</option>
                          <option value="Second">Second</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-[#0f2044] font-medium">Start date *</Label>
                        <input
                          type="date"
                          value={semesterForm.start_date}
                          onChange={(e) => setSemesterForm({ ...semesterForm, start_date: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                        />
                      </div>
                      <div>
                        <Label className="text-[#0f2044] font-medium">End date *</Label>
                        <input
                          type="date"
                          value={semesterForm.end_date}
                          onChange={(e) => setSemesterForm({ ...semesterForm, end_date: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" className="bg-[#0f2044] hover:bg-[#0f2044]/90">Start semester</Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setShowSemesterForm(false)}>Cancel</Button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        )}

        {/* Session form */}
        {showForm && (
          <form onSubmit={handleAdd} className="mb-6 p-4 bg-slate-50 rounded-lg space-y-5">
              <h3 className="text-lg font-semibold text-[#0f2044]">
                {editingId ? 'Edit Session' : 'New Session'}
              </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <Label className="text-[#0f2044] font-medium">Session Name *</Label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., 2025-2026"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffb71b] focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#0f2044] font-medium">Start Date *</Label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffb71b] focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#0f2044] font-medium">End Date *</Label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffb71b] focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={isLoading} className="bg-[#0f2044] hover:bg-[#0f2044]/90">
                    {editingId ? 'Update Session' : 'Create Session'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
        )}

          {/* Sessions list */}
          {isLoading && !sessions.length && (
            <div className="text-center py-8 text-slate-500">Loading sessions...</div>
          )}

          {!isLoading && sessions.length === 0 && (
            <div className="text-center py-8 text-slate-500">No sessions yet. Create one to get started.</div>
          )}

          {!isLoading && sessions.length > 0 && activeSessions.length === 0 && (
            <div className="text-center py-8 text-slate-500">No active session. Add a session to set as current.</div>
          )}

          {activeSessions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Start Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">End Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#0f2044]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSessions.map((session) => (
                    <tr key={session.session_id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{(session.name || '').replace(/-/g, '/')}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(session.start_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(session.end_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                          Current
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-amber-700 border-amber-300 hover:bg-amber-50"
                          onClick={() => handleDeactivateSession(session.session_id || 0)}
                          disabled={isLoading}
                        >
                          Deactivate
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(session)} disabled={isLoading}>
                          <Edit2 className="size-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(session.session_id || 0)}
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
