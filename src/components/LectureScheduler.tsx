import {
    AlertCircle,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    Edit2,
    Plus,
    Send,
    Trash2,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';

interface Course {
    id: number;
    course_code: string;
    title: string;
    department_id: number;
    credit_units?: number;
}

interface Lecturer {
    id: number;
    name: string;
    department_id: number;
}

interface Venue {
    id: number;
    name: string;
    size?: number;
    capacity?: number;
    type: string;
}

interface ClassGroup {
    id: number;
    name: string;
    level: string;
    student_count: number;
    department_id: number;
    department_name?: string;
    /** Department name from API (e.g. from join or view) */
    department?: string;
}

interface ValidationResult {
    success: boolean;
    error?: string;
    end_time?: string;
}

interface TimetableEntry {
    id: number;
    lecturer_id: number;
    course_id: number;
    class_group_id: number;
    venue_id: number;
    day: string;
    start_time: string;
    end_time: string;
    lecturer_name?: string;
    course_code?: string;
    class_name?: string;
    venue_name?: string;
    group_department?: string;
    group_level?: string | number;
}

/** Format class as "400L Group A" from level and group name */
function formatDay(day: string | null | undefined): string {
    if (day == null || String(day).trim() === '') return '—';
    const d = String(day).trim().toLowerCase();
    const days: Record<string, string> = { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday' };
    return days[d] ?? d.charAt(0).toUpperCase() + d.slice(1);
}

function formatClassDisplay(level: string | number | null | undefined, groupName: string | null | undefined): string {
    const l = level != null && String(level).trim() !== '' ? String(level).trim() : '';
    const g = groupName != null && String(groupName).trim() !== '' ? String(groupName).trim() : '';
    if (!l && !g) return '—';
    if (!l) return g;
    if (!g) return `${l}L`;
    return `${l}L ${g}`;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DURATIONS = [
    { value: 1, label: '1 Hour' },
    { value: 2, label: '2 Hours' },
    { value: 3, label: '3 Hours' },
];

interface LectureSchedulerProps {
    activeSession?: any;
    activeSemester?: any;
    /** Called after timetable is approved and published so parent can refetch session/semester */
    onTimetablePublished?: () => void;
}

export default function LectureScheduler({ activeSession: propsSession, activeSemester: propsSemester, onTimetablePublished }: LectureSchedulerProps = {}) {
    // Form state
    const [department, setDepartment] = useState<string>('');
    const [lecturer_id, setLecturerId] = useState<number | ''>('');
    const [course_id, setCourseId] = useState<number | ''>('');
    const [class_group_id, setClassGroupId] = useState<number | ''>('');
    const [venue_id, setVenueId] = useState<number | ''>('');
    const [level, setLevel] = useState<string>('');
    const [day, setDay] = useState<string>('Monday');
    const [start_time, setStartTime] = useState<string>('09:00');
    const [duration, setDuration] = useState<number>(1);

    // Data state (current session only; no session selector in form)
    const [internalSession, setInternalSession] = useState<any>(null);
    const activeSession = propsSession ?? internalSession;
    const activeSemester = propsSemester ?? null;
    const [departments, setDepartments] = useState<{ department_id?: number; name: string }[]>([]);
    const [lecturers, setLecturers] = useState<Lecturer[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [allCoursesForSession, setAllCoursesForSession] = useState<Course[]>([]);
    const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
    const [venues, setVenues] = useState<Venue[]>([]);
    const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);

    // UI state
    const [loading, setLoading] = useState(false);
    const [validating, _setValidating] = useState(false);
    const [validation, setValidation] = useState<ValidationResult | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [lecturerPreferenceText, setLecturerPreferenceText] = useState<string | null>(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [approving, setApproving] = useState(false);

    // Fetch all sessions from DB for dropdown
    useEffect(() => {
        const loadSessions = async () => {
            try {
                const res = await api.getSessions({}) as any;
                const list = Array.isArray(res?.data) ? res.data : [];
                if (list.length > 0 && !propsSession && !internalSession) {
                    const currentRes = await api.getCurrentSession() as any;
                    const current = currentRes?.success && currentRes?.data
                        ? currentRes.data
                        : list.find((s: any) => s.is_current) || list[0];
                    setInternalSession(current);
                }
            } catch (e) {
                console.error('Failed to fetch sessions:', e);
            }
        };
        loadSessions();
    }, []);

    // Fetch departments once
    useEffect(() => {
        const loadDepts = async () => {
            try {
                const res = await api.getDepartments() as any;
                if (res?.success && Array.isArray(res?.data)) setDepartments(res.data);
            } catch (e) {
                console.error('Failed to fetch departments:', e);
            }
        };
        loadDepts();
    }, []);

    // When active session or department changes, fetch session- and department-scoped data (order: department → lecturers, courses, class groups from that department)
    useEffect(() => {
        const sessionId = activeSession?.session_id ?? activeSession?.id;
        if (!sessionId) return;

        const fetchData = async () => {
            try {
                const params: any = { session_id: sessionId };
                if (department) params.department = department;
                const [coursesRes, allCoursesRes, lecturersRes, classGroupsRes, venuesRes] = await Promise.all([
                    api.getCourses(params) as any,
                    api.getCourses({ session_id: sessionId, computing_only: true }) as any,
                    api.getLecturers(params) as any,
                    api.getClassGroups(params) as any,
                    api.getVenues({}) as any
                ]);
                const norm = (list: any[], idKey: string) => (Array.isArray(list) ? list.map((x) => ({ ...x, id: x[idKey] ?? x.id })) : []);
                if (coursesRes.success) setCourses(norm(coursesRes.data || [], 'course_id'));
                if (allCoursesRes.success) setAllCoursesForSession(norm(allCoursesRes.data || [], 'course_id'));
                if (lecturersRes.success) setLecturers(norm(lecturersRes.data || [], 'lecturer_id'));
                if (classGroupsRes.success) setClassGroups(norm(classGroupsRes.data || [], 'group_id'));
                if (venuesRes.success) setVenues(norm(venuesRes.data || [], 'venue_id'));
            } catch (error) {
                toast.error('Failed to load form data');
                console.error(error);
            }
        };
        fetchData();
        fetchTimetable();
    }, [activeSession?.session_id ?? activeSession?.id, department]);

    // When department changes, clear dependent selections — but not when we're pre-filling the form for edit
    const isPopulatingForEdit = useRef(false);
    useEffect(() => {
        if (isPopulatingForEdit.current) {
            isPopulatingForEdit.current = false;
            return;
        }
        setLevel('');
        setLecturerId('');
        setCourseId('');
        setClassGroupId('');
    }, [department]);

    // Fetch timetable entries (with session filter and expanded details)
    const fetchTimetable = async () => {
        try {
            const sessionId = activeSession?.session_id ?? activeSession?.id;
            if (!sessionId) {
                setTimetableEntries([]);
                return;
            }
            const response = await api.getSchedules({ session_id: sessionId, expand: true }) as any;
            if (response.success) {
                setTimetableEntries(response.data || []);
            } else {
                console.error('Failed to fetch timetable:', response);
            }
        } catch (error) {
            console.error('Failed to fetch timetable:', error);
        }
    };

    // Real-time validation - includes lecturer preferences (unavailable days/times)
    const validateSchedule = async () => {
        if (!lecturer_id || !course_id || !class_group_id || !venue_id || !start_time) {
            setValidation(null);
            return;
        }

        const start = new Date(`2000-01-01T${start_time}`);
        const end = new Date(start.getTime() + duration * 60 * 60 * 1000);
        const endTimeStr = end.toTimeString().slice(0, 5);

        if (start_time.slice(0, 5) < '14:00' && endTimeStr > '13:00') {
            setValidation({ success: false, error: 'No class can be scheduled at 1-2 PM (break).', end_time: endTimeStr });
            return;
        }

        const validation_result: ValidationResult = {
            success: true,
            error: undefined,
            end_time: endTimeStr,
        };

        try {
            const prefRes = await api.getLecturerPreference(Number(lecturer_id));
            if (prefRes.success && prefRes.data) {
                const pref = prefRes.data as any;
                if (Array.isArray(pref.unavailable_days) && pref.unavailable_days.includes(day)) {
                    validation_result.success = false;
                    validation_result.error = `Lecturer is unavailable on ${formatDay(day)} (set in Lecturer Preferences).`;
                }
                if (Array.isArray(pref.unavailable_times) && pref.unavailable_times.length > 0) {
                    const timeStr = `${start_time}-${endTimeStr}`;
                    const matches = pref.unavailable_times.some((t: string) => t && timeStr.includes(t));
                    if (matches) {
                        validation_result.success = false;
                        validation_result.error = (validation_result.error || '') + ' Selected time is in lecturer\'s unavailable slots.';
                    }
                }
            }
        } catch (_) {}

        const selectedGroup = classGroups.find((g) => g.id === class_group_id);
        const selectedVenueForValidation = venues.find((v) => v.id === venue_id);
        if (selectedGroup && selectedVenueForValidation) {
            const capacity = Number((selectedVenueForValidation as any).capacity ?? (selectedVenueForValidation as any).size ?? 0);
            const classSize = Number(selectedGroup.student_count ?? 0);
            if (classSize > 0 && capacity > 0 && classSize > capacity) {
                validation_result.success = false;
                validation_result.error = (validation_result.error || '') + ` Venue capacity (${capacity}) is less than class size (${classSize}). Choose a larger venue.`;
            }
        }

        const sessionId = activeSession?.session_id ?? activeSession?.id;
        if (validation_result.success && sessionId && course_id && class_group_id) {
            try {
                const hoursRes = await api.checkCourseHoursForGroup(sessionId, Number(course_id), Number(class_group_id), duration, editingId ?? undefined);
                if (hoursRes.overLimit) {
                    validation_result.success = false;
                    validation_result.error = (validation_result.error || '') + (validation_result.error ? ' ' : '') + (hoursRes.message || 'This course can only be scheduled twice per week for this group.');
                }
            } catch (_) {}
        }

        // Run conflict checks so "Schedule available" only shows when there are no conflicts
        if (validation_result.success && sessionId && venue_id && class_group_id) {
            try {
                const conflictRes = await api.checkVenueConflict(sessionId, Number(venue_id), day, start_time, endTimeStr, editingId ?? undefined);
                if (conflictRes?.conflict) {
                    validation_result.success = false;
                    validation_result.error = (validation_result.error || '') + (conflictRes.message || 'This venue is already booked for that day and time.');
                }
            } catch (_) {}
        }
        if (validation_result.success && sessionId && class_group_id) {
            try {
                const groupConflictRes = await api.checkClassGroupTimeConflict(sessionId, Number(class_group_id), day, start_time, endTimeStr, editingId ?? undefined, Number(course_id) || undefined);
                if (groupConflictRes?.conflict) {
                    validation_result.success = false;
                    validation_result.error = (validation_result.error || '') + (groupConflictRes.message || 'This class already has something at this time.');
                }
            } catch (_) {}
        }
        if (validation_result.success && sessionId) {
            const classGroupLevel = selectedGroup?.level ?? null;
            try {
                const specialConflictRes = await api.checkSpecialEventConflict(sessionId, day, start_time, endTimeStr, classGroupLevel);
                if (specialConflictRes?.conflict) {
                    validation_result.success = false;
                    validation_result.error = (validation_result.error || '') + (specialConflictRes.message || 'This time is blocked by a special event (Break or Chapel Seminar).');
                }
            } catch (_) {}
        }

        setValidation(validation_result);
    };

    // Validate on input change
    useEffect(() => {
        const timer = setTimeout(() => {
            validateSchedule();
        }, 500);

        return () => clearTimeout(timer);
    }, [lecturer_id, course_id, class_group_id, venue_id, day, start_time, duration, classGroups, venues, activeSession?.session_id ?? activeSession?.id, editingId]);

    // Fetch and show selected lecturer's preferences as text below the dropdown
    useEffect(() => {
        if (!lecturer_id) {
            setLecturerPreferenceText(null);
            return;
        }
        let cancelled = false;
        const load = async () => {
            try {
                const res = await api.getLecturerPreference(Number(lecturer_id)) as any;
                if (cancelled) return;
                if (!res?.success || !res?.data) {
                    setLecturerPreferenceText('No preferences set. Set in Lecturer Preferences.');
                    return;
                }
                const p = res.data;
                // Prefer single preferences string (School Lecturer Preferences); fallback to legacy unavailable_days/times
                if (typeof p.preferences === 'string' && p.preferences.trim()) {
                    setLecturerPreferenceText(p.preferences.trim());
                    return;
                }
                const days = Array.isArray(p.unavailable_days) && p.unavailable_days.length > 0
                    ? p.unavailable_days.join(', ')
                    : 'None';
                const times = Array.isArray(p.unavailable_times) && p.unavailable_times.length > 0
                    ? p.unavailable_times.join(', ')
                    : 'None';
                setLecturerPreferenceText(`Unavailable days: ${days}. Unavailable times: ${times}.`);
            } catch (_) {
                if (!cancelled) setLecturerPreferenceText('Could not load preferences.');
            }
        };
        load();
        return () => { cancelled = true; };
    }, [lecturer_id]);

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validation?.success) {
            toast.error(validation?.error || 'Schedule validation failed');
            return;
        }

        const sessionId = activeSession?.session_id ?? activeSession?.id;
        if (!sessionId) {
            toast.error('No active session. Please select or create a session first.');
            return;
        }

        const endTimeStr = validation?.end_time || start_time;
        const conflictRes = await api.checkVenueConflict(sessionId, Number(venue_id), day, start_time, endTimeStr, editingId ?? undefined);
        if (conflictRes?.conflict) {
            toast.error(conflictRes.message || 'This venue is already booked for that day and time. Please choose another venue or time.');
            return;
        }

        const groupConflictRes = await api.checkClassGroupTimeConflict(sessionId, Number(class_group_id), day, start_time, endTimeStr, editingId ?? undefined, Number(course_id) || undefined);
        if (groupConflictRes?.conflict) {
            toast.error(groupConflictRes.message || 'This class already has something at this time (including non-computing courses). Choose another time.');
            return;
        }

        const classGroupLevel = classGroups.find((g) => g.id === class_group_id)?.level ?? selectedClass?.level ?? null;
        const specialConflictRes = await api.checkSpecialEventConflict(sessionId, day, start_time, endTimeStr, classGroupLevel);
        if (specialConflictRes?.conflict) {
            toast.error(specialConflictRes.message || 'This time is blocked by a special event (Break or Chapel Seminar). Choose another time.');
            return;
        }

        const hoursRes = await api.checkCourseHoursForGroup(sessionId, Number(course_id), Number(class_group_id), duration, editingId ?? undefined);
        if (hoursRes.overLimit) {
            toast.error(hoursRes.message || 'This course can only be scheduled twice per week for this class group.');
            return;
        }

        setLoading(true);
        try {
            const scheduleData: any = {
                session_id: sessionId,
                lecturer_id: Number(lecturer_id),
                course_id: Number(course_id),
                class_group_id: Number(class_group_id),
                venue_id: Number(venue_id),
                day,
                start_time,
                end_time: endTimeStr,
                duration_hours: duration,
            };
            if (!editingId) scheduleData.created_by_role = 'school-officer';

            let response;
            if (editingId) {
                response = await api.updateSchedule(editingId, scheduleData) as any;
            } else {
                response = await api.createSchedule(scheduleData) as any;
            }

            if (response.success) {
                toast.success(editingId ? 'Schedule updated successfully' : 'Schedule created successfully');
                resetForm();
                fetchTimetable();
            } else {
                toast.error(response.error || 'Failed to save schedule');
                console.error('Schedule save error:', response);
            }
        } catch (error: any) {
            toast.error('Error saving schedule');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Handle edit — pre-fill all fields so the user can change only what they need
    const handleEdit = (entry: TimetableEntry) => {
        const group = classGroups.find((g) => g.id === entry.class_group_id);
        const departmentName = entry.group_department ?? group?.department_name ?? (group as any)?.department ?? '';

        isPopulatingForEdit.current = true;
        setDepartment(departmentName);
        setLecturerId(entry.lecturer_id);
        setCourseId(entry.course_id);
        setClassGroupId(entry.class_group_id);
        setVenueId(entry.venue_id);
        setLevel(group ? String(group.level) : '');
        setDay(formatDay(entry.day) || entry.day || 'Monday');
        setStartTime(entry.start_time);

        // Calculate duration from start_time and end_time
        const start = new Date(`2000-01-01 ${entry.start_time}`);
        const end = new Date(`2000-01-01 ${entry.end_time}`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        setDuration(hours);

        setEditingId(entry.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle delete
    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this schedule?')) return;

        try {
            const response = await api.deleteSchedule(id) as any;
            if (response.success) {
                toast.success('Schedule deleted successfully');
                if (editingId === id) resetForm();
                fetchTimetable();
            } else {
                toast.error(response.error || 'Failed to delete schedule');
                console.error('Delete schedule error:', response);
            }
        } catch (error: any) {
            toast.error('Error deleting schedule');
            console.error(error);
        }
    };

    // Reset form
    const resetForm = () => {
        setLecturerId('');
        setCourseId('');
        setClassGroupId('');
        setVenueId('');
        setLevel('');
        setDay('Monday');
        setStartTime('09:00');
        setDuration(1);
        setEditingId(null);
        setValidation(null);
    };

    // Level options from class groups in DB (no hardcoded levels)
    const levelsFromDb = useMemo(() => {
        const set = new Set<string>();
        classGroups.forEach((g) => {
            if (g.level != null && String(g.level).trim() !== '') set.add(String(g.level));
        });
        return Array.from(set).sort((a, b) => Number(a) - Number(b));
    }, [classGroups]);

    const classGroupsByLevel = level ? classGroups.filter((g) => String(g.level) === String(level)) : classGroups;
    const coursesByLevel = level ? courses.filter((c) => String((c as any).level) === String(level)) : courses;

    // Each course can only be scheduled twice per week per group. Courses disappear once scheduled twice.
    const scheduledCountByCourseGroup = useMemo(() => {
        const map = new Map<string, number>();
        for (const e of timetableEntries) {
            if (editingId != null && e.id === editingId) continue; // exclude entry being edited so course stays in list
            const key = `${Number(e.course_id)}-${Number(e.class_group_id)}`;
            map.set(key, (map.get(key) || 0) + 1);
        }
        return map;
    }, [timetableEntries, editingId]);

    const editingEntryCourseId = editingId ? timetableEntries.find((e) => e.id === editingId)?.course_id : null;

    // Same course + class must use the same lecturer; get lecturer already assigned for (course_id, class_group_id)
    const requiredLecturerIdForCourseGroup = useMemo(() => {
        if (!course_id || !class_group_id) return null;
        const existing = timetableEntries.find(
            (e) => Number(e.course_id) === Number(course_id) && Number(e.class_group_id) === Number(class_group_id) && (editingId == null || e.id !== editingId)
        );
        return existing?.lecturer_id ?? null;
    }, [timetableEntries, course_id, class_group_id, editingId]);

    const lecturersForDropdown = useMemo(() => {
        if (requiredLecturerIdForCourseGroup == null) return lecturers;
        return lecturers.filter((l) => Number(l.id) === Number(requiredLecturerIdForCourseGroup));
    }, [lecturers, requiredLecturerIdForCourseGroup]);

    // When course+class already has a scheduled slot, force same lecturer (auto-select)
    useEffect(() => {
        if (requiredLecturerIdForCourseGroup != null && Number(lecturer_id) !== Number(requiredLecturerIdForCourseGroup)) {
            setLecturerId(requiredLecturerIdForCourseGroup);
        }
    }, [requiredLecturerIdForCourseGroup, lecturer_id]);

    const coursesAvailableForDropdown = useMemo(() => {
        return coursesByLevel.filter((c) => {
            const courseId = Number((c as any).course_id ?? c.id);
            const groupId = Number(class_group_id);
            const key = `${courseId}-${groupId}`;
            const scheduledCount = scheduledCountByCourseGroup.get(key) || 0;
            const atMaxSlots = scheduledCount >= 2; // each course only twice per week per group
            if (atMaxSlots) return editingId != null && Number(editingEntryCourseId) === courseId;
            return true;
        });
    }, [coursesByLevel, class_group_id, scheduledCountByCourseGroup, course_id, editingId, editingEntryCourseId]);

    // Clear course selection when it's no longer in the list (e.g. just reached 2 slots for this class)
    useEffect(() => {
        if (!course_id || !class_group_id) return;
        const stillAvailable = coursesAvailableForDropdown.some((c) => Number((c as any).course_id ?? c.id) === Number(course_id));
        if (!stillAvailable) setCourseId('');
    }, [coursesAvailableForDropdown, course_id, class_group_id]);

    const selectedCourse = courses.find((c) => c.id === course_id);
    const selectedLecturer = lecturers.find((l) => l.id === lecturer_id);
    const selectedClass = classGroups.find((c) => c.id === class_group_id);
    const selectedVenue = venues.find((v) => v.id === venue_id);

    const sessionSemesterLabel = activeSession && activeSemester
        ? `${(activeSession.name || '').replace(/-/g, '/')} · ${activeSemester.name || 'Semester'}`
        : activeSession ? (activeSession.name || '').replace(/-/g, '/') : null;
    const noActiveSessionOrSemester = !activeSession || !activeSemester;
    const timetablePublished = activeSemester?.timetable_status === 'published';
    const schedulingDisabled = noActiveSessionOrSemester;

    // Finalize allowed only when every course (for this session) has at least one schedule
    const { allCoursesScheduled, scheduledCount, totalCount, missingCount } = useMemo(() => {
        const allIds = new Set(allCoursesForSession.map((c) => c.id));
        const scheduledIds = new Set(timetableEntries.map((e) => e.course_id));
        const total = allIds.size;
        const scheduled = [...allIds].filter((id) => scheduledIds.has(id)).length;
        const missing = total - scheduled;
        return {
            allCoursesScheduled: total > 0 && missing === 0,
            scheduledCount: scheduled,
            totalCount: total,
            missingCount: missing,
        };
    }, [allCoursesForSession, timetableEntries]);

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-[#0f2044]">Schedule Lecture</h2>
                    {department && (
                        <p className="text-sm font-medium text-[#0f2044] mt-1">Department: {department}</p>
                    )}
                    <p className="text-sm text-slate-600 mt-1">Assign lecturers, courses, and class groups to venues and time slots. Venues are shared school-wide; if a venue is already booked for the same day and time, you’ll see an error. Choose another venue or time.</p>
                </div>
                {sessionSemesterLabel && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-[#0f2044] text-white text-sm font-medium shrink-0">
                        <Calendar className="w-4 h-4 mr-2" />
                        {sessionSemesterLabel}
                    </span>
                )}
            </div>

            {noActiveSessionOrSemester && (
                <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-6">
                        <p className="text-amber-800 font-medium">No active session or semester</p>
                        <p className="text-sm text-amber-700 mt-1">You cannot schedule when there is no active session and semester. Set the current session and an active semester in <strong>Academic Settings</strong>.</p>
                    </CardContent>
                </Card>
            )}

            {!noActiveSessionOrSemester && timetablePublished && (
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-6">
                        <p className="text-green-800 font-medium">Timetable is live on the landing page</p>
                        <p className="text-sm text-green-700 mt-1">Students can view and download this timetable. You can still make changes here and re-publish to update the landing page.</p>
                    </CardContent>
                </Card>
            )}

            {schedulingDisabled && (
                <p className="text-sm text-slate-500">Scheduling is disabled until an active session and semester are set.</p>
            )}

            {!schedulingDisabled ? (
            <>
            {/* Summary – show only before any schedule is created (revert: hide after schedules exist) */}
            {timetableEntries.length === 0 && (
                <Card className="border border-slate-200 shadow-md">
                    <CardHeader className="bg-gradient-to-r from-[#0f2044] to-[#1a3a5c] text-white rounded-t-lg">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Calendar className="w-5 h-5" />
                            Summary – before creating schedule
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <p className="text-sm text-slate-600 mb-3">Fill the form below and click Create Schedule. Once you add schedules, this summary is hidden and the table shows your scheduled lectures.</p>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {timetableEntries.map((entry) => (
                                <div key={entry.id} className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                    <div className="space-y-1 text-sm text-slate-600">
                                        <p><span className="font-medium text-slate-700">Level:</span> {entry.group_level != null ? entry.group_level : '—'}</p>
                                        <p><span className="font-medium text-slate-700">Lecturer:</span> {entry.lecturer_name ?? '—'}</p>
                                        <p><span className="font-medium text-slate-700">Course:</span> {entry.course_code ?? '—'}</p>
                                        <p><span className="font-medium text-slate-700">Class:</span> {formatClassDisplay(entry.group_level, entry.class_name)}</p>
                                        <p><span className="font-medium text-slate-700">Venue:</span> {entry.venue_name ?? '—'}</p>
                                        <p><span className="font-medium text-slate-700">Time:</span> {formatDay(entry.day)}, {entry.start_time} – {entry.end_time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="border border-slate-200 shadow-md">
                <CardHeader className="bg-gradient-to-r from-[#0f2044] to-[#1a3a5c] text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-6 h-6" />
                        {editingId ? 'Edit Schedule' : 'Create New Schedule'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Row 0: Department (first – lecturers, courses, level, class group depend on it) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Department *
                            </label>
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffb71b] focus:border-transparent"
                                required
                            >
                                <option value="">Select Department</option>
                                {departments.map((d) => (
                                    <option key={d.department_id ?? d.name} value={d.name}>{d.name}</option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500 mt-1">Lecturers, courses, level and class group are from the selected department.</p>
                        </div>

                        {/* Row 1: Level and Class Group (first) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Level *
                                </label>
                                <select
                                    value={level}
                                    onChange={(e) => { setLevel(e.target.value); setClassGroupId(''); }}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffb71b] focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Level</option>
                                    {levelsFromDb.map((lv) => (
                                        <option key={lv} value={lv}>{lv}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Class Group *
                                </label>
                                <select
                                    value={class_group_id}
                                    onChange={(e) => setClassGroupId(e.target.value ? Number(e.target.value) : '')}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffb71b] focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Class Group</option>
                                    {classGroupsByLevel.map((group) => (
                                        <option key={group.id} value={group.id}>
                                            {group.department_name ?? group.department ?? 'Unassigned'} - {group.level} - {group.name} ({group.student_count} students)
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Row 2: Lecturer and Course */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Lecturer *
                                </label>
                                <select
                                    value={lecturer_id}
                                    onChange={(e) => setLecturerId(e.target.value ? Number(e.target.value) : '')}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffb71b] focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Lecturer</option>
                                    {lecturersForDropdown.map((lecturer) => (
                                        <option key={lecturer.id} value={lecturer.id}>
                                            {lecturer.name}
                                        </option>
                                    ))}
                                </select>
                                {requiredLecturerIdForCourseGroup != null && (
                                    <p className="text-xs text-amber-700 mt-1">This course is already scheduled for this class; the same lecturer must be used for all slots.</p>
                                )}
                                {(lecturerPreferenceText != null) && (
                                    <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-md">
                                        <p className="text-xs font-medium text-slate-500 mb-1">Preferences:</p>
                                        <p className="text-sm text-slate-700">{lecturerPreferenceText || 'No preferences set. Set in Lecturer Preferences.'}</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Course *
                                </label>
                                <select
                                    value={course_id}
                                    onChange={(e) => setCourseId(e.target.value ? Number(e.target.value) : '')}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffb71b] focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Course</option>
                                    {coursesAvailableForDropdown.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.course_code} - {course.title}
                                        </option>
                                    ))}
                                </select>
                                {selectedCourse && (
                                    <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700">
                                        <span className="font-medium">Title:</span> {selectedCourse.title}
                                        {(selectedCourse as any).credit_units != null && (
                                            <span className="ml-3"><span className="font-medium">Credit units:</span> {(selectedCourse as any).credit_units}</span>
                                        )}
                                    </div>
                                )}
                                <p className="text-xs text-slate-500 mt-1">Each course can only be scheduled twice per week for a group. It disappears from the list once scheduled twice.</p>
                            </div>
                        </div>

                        {/* Row 3: Venue */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Venue *
                            </label>
                                <select
                                    value={venue_id}
                                    onChange={(e) => setVenueId(e.target.value ? Number(e.target.value) : '')}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffb71b] focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Venue</option>
                                    {venues.map((venue) => (
                                        <option key={venue.id} value={venue.id}>
                                            {venue.name} (Capacity: {venue.size ?? venue.capacity ?? 0})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Venues are shared school-wide. If a venue is already booked for the same day and time, you’ll see an error. Choose another venue or time.</p>
                        </div>

                        {/* Row 4: Day, Start Time, Duration */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Day *
                                </label>
                                <select
                                    value={day}
                                    onChange={(e) => setDay(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffb71b] focus:border-transparent"
                                >
                                    {DAYS.map((d) => (
                                        <option key={d} value={d}>
                                            {d}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Start Time (24h format) *
                                </label>
                                <input
                                    type="time"
                                    value={start_time}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    min="07:00"
                                    max="18:00"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffb71b] focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Duration *
                                </label>
                                <select
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffb71b] focus:border-transparent"
                                >
                                    {DURATIONS.map((d) => (
                                        <option key={d.value} value={d.value}>
                                            {d.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Validation Status */}
                        {validating ? (
                            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-300 rounded-lg">
                                <Clock className="w-5 h-5 text-slate-500 animate-spin" />
                                <span className="text-sm text-slate-600">Validating schedule...</span>
                            </div>
                        ) : validation ? (
                            <div
                                className={`flex items-start gap-3 p-4 border rounded-lg ${validation.success
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                                    }`}
                            >
                                {validation.success ? (
                                    <>
                                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm">
                                            <p className="text-green-800 font-medium">Schedule available</p>
                                            <p className="text-green-700 text-xs mt-1">
                                                End Time: {validation.end_time}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm">
                                            <p className="text-red-800 font-medium">Conflict detected</p>
                                            <p className="text-red-700 text-xs mt-1">{validation.error}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : null}

                        {/* Summary */}
                        {selectedCourse && selectedLecturer && selectedClass && selectedVenue && (
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                <p className="text-sm font-medium text-slate-700 mb-2">Summary:</p>
                                <div className="space-y-1 text-sm text-slate-600">
                                    <p>
                                        <span className="font-medium">Level:</span> {level ?? '—'}
                                    </p>
                                    <p>
                                        <span className="font-medium">Lecturer:</span> {selectedLecturer.name}
                                    </p>
                                    <p>
                                        <span className="font-medium">Course:</span> {selectedCourse.course_code} -{' '}
                                        {selectedCourse.title}
                                    </p>
                                    <p>
                                        <span className="font-medium">Class:</span> {formatClassDisplay(selectedClass.level, selectedClass.name)}
                                        {selectedClass.student_count != null && (
                                            <span className="text-slate-600"> ({selectedClass.student_count} students)</span>
                                        )}
                                    </p>
                                    <p>
                                        <span className="font-medium">Venue:</span> {selectedVenue.name} (Capacity:{' '}
                                        {selectedVenue.size ?? selectedVenue.capacity ?? '—'})
                                    </p>
                                    <p>
                                        <span className="font-medium">Day:</span> {formatDay(day)}
                                    </p>
                                    <p>
                                        <span className="font-medium">Time:</span> {start_time} ({duration} hour
                                        {duration > 1 ? 's' : ''})
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3 justify-end pt-4">
                            {editingId && (
                                <Button
                                    type="button"
                                    onClick={resetForm}
                                    variant="outline"
                                    className="px-6 py-2 border border-slate-300 hover:bg-slate-50"
                                >
                                    Cancel Edit
                                </Button>
                            )}
                            <Button
                                type="submit"
                                disabled={loading || !validation?.success}
                                className="px-6 py-2 bg-[#0f2044] text-white hover:bg-[#1a3a5c] disabled:bg-slate-400"
                            >
                                {loading ? (
                                    <Clock className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <Plus className="w-4 h-4 mr-2" />
                                )}
                                {editingId ? 'Update Schedule' : 'Create Schedule'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Timetable Section */}
            <Card className="border border-slate-200 shadow-md">
                <CardHeader className="bg-gradient-to-r from-[#0f2044] to-[#1a3a5c] text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-6 h-6" />
                        Scheduled Lectures ({timetableEntries.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {timetableEntries.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500">No schedules created yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Department</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Level</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Lecturer</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Course</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Class</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Venue</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Day</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Time</th>
                                        <th className="text-right py-3 px-4 font-semibold text-[#0f2044]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {timetableEntries.map((entry) => (
                                        <tr key={entry.id} className="border-b border-slate-200 hover:bg-slate-50">
                                            <td className="px-4 py-3 text-slate-900 font-medium">{entry.group_department ?? '—'}</td>
                                            <td className="px-4 py-3 text-slate-900">{entry.group_level != null ? entry.group_level : '—'}</td>
                                            <td className="px-4 py-3 text-slate-900">{entry.lecturer_name}</td>
                                            <td className="px-4 py-3 text-slate-900">{entry.course_code}</td>
                                            <td className="px-4 py-3 text-slate-900">{formatClassDisplay(entry.group_level, entry.class_name)}</td>
                                            <td className="px-4 py-3 text-slate-900">{entry.venue_name}</td>
                                            <td className="px-4 py-3 text-slate-900">
                                                {formatDay(entry.day)}
                                            </td>
                                            <td className="px-4 py-3 text-slate-900">{entry.start_time} - {entry.end_time}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEdit(entry)}
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="size-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDelete(entry.id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Generate Timetable & Submit for Approval */}
            {timetableEntries.length > 0 && (allCoursesScheduled || timetablePublished) && (
                <Card className="border border-slate-200 shadow-md">
                    <CardHeader className="bg-gradient-to-r from-[#0f2044] to-[#1a3a5c] text-white rounded-t-lg">
                        <CardTitle className="flex items-center gap-2">
                            <Send className="w-6 h-6" />
                            Finalize & Publish
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        {!allCoursesScheduled && !timetablePublished && (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-sm font-medium text-amber-800">Schedule all courses before finalizing</p>
                                <p className="text-sm text-amber-700 mt-1">
                                    {scheduledCount} of {totalCount} courses scheduled. {missingCount} course{missingCount !== 1 ? 's' : ''} still need to be scheduled.
                                </p>
                            </div>
                        )}
                        {timetablePublished ? (
                            <p className="text-sm text-slate-600">
                                Timetable is live on the student landing page. Make any changes above, then click below to update and re-publish so students see the latest version.
                            </p>
                        ) : (
                            <p className="text-sm text-slate-600">
                                Once all courses are scheduled, generate the full class timetable and submit for approval. Approve to publish to the student landing page, or Reject to return to the schedule editor.
                            </p>
                        )}
                        {!allCoursesScheduled && !timetablePublished && (
                            <p className="text-amber-700 text-sm font-medium">You cannot finalize until all courses are scheduled ({scheduledCount} of {totalCount} done).</p>
                        )}
                        <Button
                            type="button"
                            onClick={() => setShowApproveModal(true)}
                            disabled={!timetablePublished && !allCoursesScheduled}
                            className="bg-[#0f2044] text-white hover:bg-[#1a3a5c] disabled:opacity-50 disabled:pointer-events-none"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            {timetablePublished ? 'Update & Re-publish to Landing Page' : 'Generate Timetable & Submit for Approval'}
                        </Button>
                    </CardContent>
                </Card>
            )}
            </>
            ) : null}

            {/* Approval / Publish workflow modal */}
            <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{timetablePublished ? 'Update & Re-publish Timetable' : 'Generate Timetable – Approval'}</DialogTitle>
                        <DialogDescription>
                            {timetablePublished
                                ? `Review the schedule for ${sessionSemesterLabel || 'this session'}. Save and re-publish to update the student landing page with your latest changes.`
                                : `Review the schedule for ${sessionSemesterLabel || 'this session'}. Approve to publish to the student landing page, or Reject to return to the editor.`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <p className="text-sm text-slate-700">
                            <span className="font-medium">{timetableEntries.length}</span> schedule entries will be {timetablePublished ? 'updated and re-' : ''}published. Students will be able to view and download their class timetable as PDF.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowApproveModal(false)}
                            disabled={approving}
                        >
                            {timetablePublished ? 'Cancel' : 'Reject (Return to Editor)'}
                        </Button>
                        <Button
                            type="button"
                            onClick={async () => {
                                const semesterId = activeSemester?.semester_id ?? activeSemester?.id;
                                if (!semesterId) {
                                    toast.error('No active semester');
                                    return;
                                }
                                setApproving(true);
                                try {
                                    const res = await (api as any).updateSemester(semesterId, { timetable_status: 'published' }) as any;
                                    if (res?.success) {
                                        toast.success(timetablePublished ? 'Timetable updated and re-published to the landing page.' : 'Timetable published. Students can now view and download their schedules.');
                                        onTimetablePublished?.();
                                        setShowApproveModal(false);
                                    } else {
                                        toast.error(res?.error || 'Failed to publish timetable');
                                    }
                                } catch (e) {
                                    toast.error('Failed to publish timetable');
                                    console.error(e);
                                } finally {
                                    setApproving(false);
                                }
                            }}
                            disabled={approving}
                            className="bg-[#0f2044] text-white hover:bg-[#1a3a5c]"
                        >
                            {approving ? (
                                <>
                                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                                    {timetablePublished ? 'Updating…' : 'Publishing…'}
                                </>
                            ) : timetablePublished ? (
                                'Update & Re-publish to Landing Page'
                            ) : (
                                'Approve (Publish to Students)'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
