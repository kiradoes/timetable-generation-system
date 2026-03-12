import { BookOpen, Check, LayoutGrid, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';

export interface ClassToCourseManagementProps {
  departmentName?: string;
  sessionId?: number | null;
  role?: 'school-officer' | 'department-officer';
}

const LEVEL_OPTIONS = ['100', '200', '300', '400'];

/**
 * Class to Course Management – map (department, level) to allowed courses.
 * Schedule Lecture then shows only these courses when that dept+level (STTO) or level (DTTO) is selected.
 */
export function ClassToCourseManagement({
  departmentName: propDepartment,
  sessionId,
  role = 'school-officer',
}: ClassToCourseManagementProps) {
  const isDTTO = role === 'department-officer';
  const effectiveDepartment = (isDTTO ? propDepartment : null) ?? '';

  const [departments, setDepartments] = useState<{ department_id?: number; name: string }[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [allCourses, setAllCourses] = useState<{ course_id: number; course_code: string; title: string; level?: number }[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [mappedCourses, setMappedCourses] = useState<{ course_id: number; course_code: string; title?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const departmentForQuery = isDTTO ? effectiveDepartment : selectedDepartment;

  // Load departments (STTO only)
  useEffect(() => {
    if (isDTTO || !sessionId) return;
    let cancelled = false;
    (async () => {
      const res = await api.getDepartments({}) as any;
      if (cancelled) return;
      const list = (res?.success && Array.isArray(res?.data)) ? res.data : [];
      setDepartments(list);
    })();
    return () => { cancelled = true; };
  }, [sessionId, isDTTO]);

  // Load courses for session (and department when set): computing only
  useEffect(() => {
    if (!sessionId) {
      setAllCourses([]);
      return;
    }
    const params: any = { session_id: sessionId, computing_only: true };
    if (isDTTO && effectiveDepartment) params.department = effectiveDepartment;
    else if (!isDTTO && selectedDepartment) params.department = selectedDepartment;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const res = await api.getCourses(params) as any;
      if (cancelled) return;
      const list = (res?.success && Array.isArray(res?.data)) ? res.data : [];
      const computing = list.filter((c: any) => !['GEDS', 'SAT'].includes(c.category || ''));
      setAllCourses(computing.map((c: any) => ({ course_id: c.course_id ?? c.id, course_code: c.course_code ?? '', title: c.title ?? '', level: c.level })));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [sessionId, isDTTO, effectiveDepartment, selectedDepartment]);

  // Load existing mappings when (department, level) selected
  const loadMappings = useCallback(async () => {
    if (!sessionId || !departmentForQuery || !selectedLevel) {
      setMappedCourses([]);
      return;
    }
    const res = await api.getClassCourseMappings(sessionId, { department: departmentForQuery, level: selectedLevel }) as any;
    const rows = (res?.success && Array.isArray(res?.data)) ? res.data : [];
    const courseIds = rows.map((r: any) => r.course_id).filter(Boolean);
    const withDetails = allCourses.filter((c) => courseIds.includes(c.course_id));
    setMappedCourses(withDetails.length > 0 ? withDetails : rows.map((r: any) => ({ course_id: r.course_id, course_code: '', title: '' })));
    setSelectedCourseIds(courseIds);
  }, [sessionId, departmentForQuery, selectedLevel, allCourses]);

  useEffect(() => {
    loadMappings();
  }, [loadMappings]);

  const handleSubmit = async () => {
    if (!sessionId || !departmentForQuery || !selectedLevel) {
      toast.error('Select department and level (STTO) or level (DTTO) first.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.setClassCourseMappings(sessionId, departmentForQuery, Number(selectedLevel), selectedCourseIds);
      if (res?.success) {
        toast.success('Mappings saved. Schedule Lecture will show only these courses for this class.');
        loadMappings();
      } else {
        toast.error((res as any)?.error || 'Failed to save.');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCourse = (courseId: number) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const canSubmit = Boolean(sessionId && departmentForQuery && selectedLevel);
  const classLabel = departmentForQuery && selectedLevel ? `${departmentForQuery} · Level ${selectedLevel}` : '—';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f2044] flex items-center gap-2">
          <span className="flex items-center justify-center size-10 rounded-lg bg-[#ffb71b]/20 text-[#0f2044]">
            <LayoutGrid className="size-5" />
          </span>
          Class to Course Management
        </h1>
        <p className="text-slate-600 mt-1">
          Map classes (department + level) to courses. When you pick department and level in Schedule Lecture, only these courses will appear in the course dropdown.
        </p>
      </div>

      <Card className="border-slate-200 shadow">
        <CardHeader className="bg-slate-50 border-b border-slate-200">
          <CardTitle className="text-lg flex items-center gap-2 text-[#0f2044]">
            <BookOpen className="size-5" />
            Select class and courses
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!isDTTO && (
              <div>
                <Label className="text-[#0f2044] font-medium">Department *</Label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => { setSelectedDepartment(e.target.value); setSelectedLevel(''); setMappedCourses([]); }}
                  className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.department_id ?? d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}
            {isDTTO && (
              <div>
                <Label className="text-[#0f2044] font-medium">Department</Label>
                <p className="mt-1 px-3 py-2 bg-slate-100 rounded-md text-slate-700">{effectiveDepartment || '—'}</p>
              </div>
            )}
            <div>
              <Label className="text-[#0f2044] font-medium">Level *</Label>
              <select
                value={selectedLevel}
                onChange={(e) => { setSelectedLevel(e.target.value); setMappedCourses([]); }}
                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md bg-white"
              >
                <option value="">Select level</option>
                {LEVEL_OPTIONS.map((lv) => (
                  <option key={lv} value={lv}>{lv} Level</option>
                ))}
              </select>
            </div>
          </div>

          {departmentForQuery && selectedLevel && (
            <>
              <div>
                <Label className="text-[#0f2044] font-medium">Courses (scroll to see all) – select the courses for this class</Label>
                <p className="text-xs text-slate-500 mt-0.5">Only selected courses will appear in Schedule Lecture for this department and level.</p>
                {loading ? (
                  <div className="mt-2 flex items-center gap-2 text-slate-600">
                    <Loader2 className="size-4 animate-spin" /> Loading courses…
                  </div>
                ) : (
                  <div className="mt-2 max-h-56 overflow-y-auto border border-slate-200 rounded-md p-2 bg-white space-y-1">
                    {allCourses.length === 0 && (
                      <p className="text-sm text-slate-500 py-2">No computing courses found. Add courses in Course Management first.</p>
                    )}
                    {allCourses.map((c) => (
                      <label key={c.course_id} className="flex items-center gap-2 py-1.5 px-2 hover:bg-slate-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCourseIds.includes(c.course_id)}
                          onChange={() => toggleCourse(c.course_id)}
                          className="rounded border-slate-300"
                        />
                        <span className="font-mono text-sm">{c.course_code}</span>
                        <span className="text-slate-600 text-sm truncate">{c.title}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className="bg-[#0f2044] hover:bg-[#0f2044]/90"
                >
                  {submitting ? <><Loader2 className="size-4 animate-spin mr-2" /> Saving…</> : <><Check className="size-4 mr-2" /> Submit</>}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {departmentForQuery && selectedLevel && (
        <Card className="border-slate-200 shadow">
          <CardHeader className="bg-green-50 border-b border-green-200">
            <CardTitle className="text-lg text-green-900">Selected courses for this class</CardTitle>
            <p className="text-sm text-green-800">These are the courses that will show in Schedule Lecture when you pick <strong>{classLabel}</strong>.</p>
          </CardHeader>
          <CardContent className="pt-4">
            {mappedCourses.length === 0 ? (
              <p className="text-slate-500 text-sm">No courses saved yet. Select courses above and click Submit.</p>
            ) : (
              <ul className="space-y-1">
                {mappedCourses.map((c) => (
                  <li key={c.course_id} className="flex items-center gap-2 text-sm">
                    <span className="font-mono font-medium text-[#0f2044]">{c.course_code}</span>
                    {c.title && <span className="text-slate-600">{c.title}</span>}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
