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
    course_title?: string;
    class_name?: string;
    venue_name?: string;
    group_department?: string;
    group_level?: string | number;
    semester_id?: number | null;
}

/** Show group/class name as a single letter (e.g. "A"). Strips "Class " prefix so we don't show "Class A" and "A" twice. */
function formatGroupDisplayName(name: string | null | undefined): string {
    if (name == null || String(name).trim() === '') return '—';
    const s = String(name).trim();
    const withoutPrefix = s.replace(/^Class\s+/i, '').trim();
    return withoutPrefix || s;
}

function formatDay(day: string | null | undefined): string {
    if (day == null || String(day).trim() === '') return '—';
    const d = String(day).trim().toLowerCase();
    const days: Record<string, string> = { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday' };
    return days[d] ?? d.charAt(0).toUpperCase() + d.slice(1);
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
    const [semestersList, setSemestersList] = useState<any[]>([]);
    const [selectedSemester, setSelectedSemester] = useState<any>(null);
    const activeSemester = selectedSemester ?? propsSemester ?? null;
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
    const [allowedCourseIdsForClass, setAllowedCourseIdsForClass] = useState<number[] | null>(null);

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

    // Fetch all semesters for the session so user can select First, Second, Summer, or Post-SIWES (6-hour logic)
    useEffect(() => {
        const sessionId = activeSession?.session_id ?? activeSession?.id;
        if (!sessionId) {
            setSemestersList([]);
            setSelectedSemester(null);
            return;
        }
        const loadSemesters = async () => {
            try {
                const res = await api.getSemestersBySession(sessionId) as any;
                const list = Array.isArray(res?.data) ? res.data : [];
                setSemestersList(list);
                if (list.length > 0) {
                    const active = list.find((s: any) => s.status === 'active');
                    const matchProp = propsSemester && list.find((s: any) => (s.semester_id ?? s.id) === (propsSemester.semester_id ?? propsSemester.id));
                    setSelectedSemester(matchProp ?? active ?? list[0]);
                } else {
                    setSelectedSemester(null);
                }
            } catch (e) {
                console.error('Failed to fetch semesters:', e);
                setSemestersList([]);
                setSelectedSemester(null);
            }
        };
        loadSemesters();
    }, [activeSession?.session_id ?? activeSession?.id, propsSemester?.semester_id ?? propsSemester?.id]);

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
                // Prefer lecturers for this session + department; if none found (e.g. lecturers stored without session or under old department name),
                // fall back to department-only, then all lecturers, and filter to active ones so the Schedule Lecture lecturer dropdown is populated.
                if (lecturersRes.success) {
                    const normLecturers = (raw: any) => norm(raw || [], 'lecturer_id');
                    let lecList: any[] = normLecturers(lecturersRes.data);
                    if ((!lecList || lecList.length === 0) && department) {
                        const fallbackByDept = await api.getLecturers({ department }) as any;
                        if (fallbackByDept?.success) lecList = normLecturers(fallbackByDept.data);
                    }
                    if (!lecList || lecList.length === 0) {
                        const fallbackAll = await api.getLecturers({}) as any;
                        if (fallbackAll?.success) lecList = normLecturers(fallbackAll.data);
                    }
                    if (lecList && lecList.length > 0) {
                        const activeLecturers = lecList.filter((l: any) => (l.status ?? 'active') === 'active');
                        setLecturers(activeLecturers);
                    } else {
                        setLecturers([]);
                    }
                }
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

    // Class-to-course mapping: fetch allowed course IDs for (session, department, level) so dropdown is filtered
    useEffect(() => {
        const sessionId = activeSession?.session_id ?? activeSession?.id;
        if (!sessionId || !department || !level) {
            setAllowedCourseIdsForClass(null);
            return;
        }
        let cancelled = false;
        api.getCourseIdsForClass(sessionId, department, level).then((ids) => {
            if (!cancelled) setAllowedCourseIdsForClass(ids ?? null);
        });
        return () => { cancelled = true; };
    }, [activeSession?.session_id ?? activeSession?.id, department, level]);

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
                const semesterId = activeSemester?.semester_id ?? activeSemester?.id ?? undefined;
                const hoursRes = await api.checkCourseHoursForGroup(sessionId, Number(course_id), Number(class_group_id), duration, editingId ?? undefined, semesterId);
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
        if (validation_result.success && sessionId && lecturer_id) {
            try {
                const lecturerConflictRes = await (api as any).checkLecturerTimeConflict(sessionId, Number(lecturer_id), day, start_time, endTimeStr, editingId ?? undefined);
                if (lecturerConflictRes?.conflict) {
                    validation_result.success = false;
                    validation_result.error = (validation_result.error || '') + (lecturerConflictRes.message || 'This lecturer is already scheduled at that time.');
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
        if (validation_result.success && sessionId && class_group_id) {
            try {
                const semesterId = activeSemester?.semester_id ?? activeSemester?.id ?? undefined;
                const dayLimitsRes = await api.checkClassDayLimits(sessionId, Number(class_group_id), day, start_time, endTimeStr, editingId ?? undefined, semesterId);
                if (dayLimitsRes?.conflict) {
                    validation_result.success = false;
                    validation_result.error = (validation_result.error || '') + (dayLimitsRes.message || 'Class day limits exceeded (max 6 hours per day, max 3 hours at a stretch).');
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

        const semesterIdForDayLimits = activeSemester?.semester_id ?? activeSemester?.id ?? undefined;
        const dayLimitsRes = await api.checkClassDayLimits(sessionId, Number(class_group_id), day, start_time, endTimeStr, editingId ?? undefined, semesterIdForDayLimits);
        if (dayLimitsRes?.conflict) {
            toast.error(dayLimitsRes.message || 'Class day limits exceeded (max 6 hours per day, max 3 hours at a stretch). Choose another day or time.');
            return;
        }

        const classGroupLevel = classGroups.find((g) => g.id === class_group_id)?.level ?? selectedClass?.level ?? null;
        const specialConflictRes = await api.checkSpecialEventConflict(sessionId, day, start_time, endTimeStr, classGroupLevel);
        if (specialConflictRes?.conflict) {
            toast.error(specialConflictRes.message || 'This time is blocked by a special event (Break or Chapel Seminar). Choose another time.');
            return;
        }

        const semesterId = activeSemester?.semester_id ?? activeSemester?.id ?? undefined;
        const hoursRes = await api.checkCourseHoursForGroup(sessionId, Number(course_id), Number(class_group_id), duration, editingId ?? undefined, semesterId);
        if (hoursRes.overLimit) {
            toast.error(hoursRes.message || 'This course can only be scheduled twice per week for this class.');
            return;
        }

        setLoading(true);
        try {
            const semesterId = activeSemester?.semester_id ?? activeSemester?.id;
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
            if (semesterId != null) scheduleData.semester_id = semesterId;
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

    // Level options: always include 100–400, plus any from class groups
    const levelsFromDb = useMemo(() => {
        const set = new Set<string>();
        classGroups.forEach((g) => {
            if (g.level != null && String(g.level).trim() !== '') set.add(String(g.level));
        });
        return Array.from(set).sort((a, b) => Number(a) - Number(b));
    }, [classGroups]);
    const levelOptions = useMemo(
        () => [...new Set(['100', '200', '300', '400', ...levelsFromDb])].sort((a, b) => Number(a) - Number(b)),
        [levelsFromDb]
    );

    const classGroupsByLevel = level ? classGroups.filter((g) => String(g.level) === String(level)) : classGroups;
    const coursesByLevel = level ? courses.filter((c) => String((c as any).level) === String(level)) : courses;
    // Class-to-course mapping: only show courses that have been selected for this class in Class to Course Management. If none selected, show no courses.
    const coursesByLevelFiltered = useMemo(() => {
        if (allowedCourseIdsForClass === null) return []; // no mapping for this class → show no courses until one is set
        const idSet = new Set(allowedCourseIdsForClass);
        return coursesByLevel.filter((c) => idSet.has(Number((c as any).course_id ?? c.id)));
    }, [coursesByLevel, allowedCourseIdsForClass]);

    const isPostSiwesSemester = Boolean(
        activeSemester?.name && String(activeSemester.name).toLowerCase().includes('post-siwes')
    );
    const isSummerSemester = Boolean(
        activeSemester?.name && String(activeSemester.name).toLowerCase().includes('summer')
    );
    const activeSemesterId = activeSemester?.semester_id ?? activeSemester?.id ?? null;
    // Count only entries in the active semester so Summer/Post-SIWES hours are per semester
    const entriesForCounting = activeSemesterId != null
        ? timetableEntries.filter((e) => (e as any).semester_id === activeSemesterId)
        : timetableEntries;

    const hoursBetween = (start: string, end: string) => {
        const [sh, sm] = (start || '0:0').slice(0, 5).split(':').map(Number);
        const [eh, em] = (end || '0:0').slice(0, 5).split(':').map(Number);
        return (eh - sh) + (em - sm) / 60;
    };

    // Total scheduled hours per (course, group). First/Second: by credit_units (2 or 3). Summer: 2 hrs. Post-SIWES: 6 hrs.
    const scheduledHoursByCourseGroup = useMemo(() => {
        const map = new Map<string, number>();
        for (const e of entriesForCounting) {
            if (editingId != null && e.id === editingId) continue;
            const key = `${Number(e.course_id)}-${Number(e.class_group_id)}`;
            const hrs = hoursBetween(e.start_time || '', e.end_time || '');
            map.set(key, (map.get(key) || 0) + hrs);
        }
        return map;
    }, [entriesForCounting, editingId]);

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
        return coursesByLevelFiltered.filter((c) => {
            const courseId = Number((c as any).course_id ?? c.id);
            const groupId = Number(class_group_id);
            const key = `${courseId}-${groupId}`;
            if (isPostSiwesSemester) {
                const hours = scheduledHoursByCourseGroup.get(key) || 0;
                const atMax = hours >= 6;
                if (atMax) return editingId != null && Number(editingEntryCourseId) === courseId;
                return true;
            }
            if (isSummerSemester) {
                const hours = scheduledHoursByCourseGroup.get(key) || 0;
                const atMax = hours >= 2;
                if (atMax) return editingId != null && Number(editingEntryCourseId) === courseId;
                return true;
            }
            // First/Second: course disappears after total hours >= credit_units (2 or 3)
            const requiredHours = (c as any).credit_units != null ? Number((c as any).credit_units) : 2;
            const hours = scheduledHoursByCourseGroup.get(key) || 0;
            const atMax = hours >= requiredHours;
            if (atMax) return editingId != null && Number(editingEntryCourseId) === courseId;
            return true;
        });
    }, [coursesByLevelFiltered, class_group_id, scheduledHoursByCourseGroup, isPostSiwesSemester, isSummerSemester, course_id, editingId, editingEntryCourseId]);

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

    const classSize = selectedClass?.student_count ?? 0;
    const endTimeStrForSlot = (() => {
        const [h, m] = (start_time || '09:00').slice(0, 5).split(':').map(Number);
        const totalMins = (h || 0) * 60 + (m || 0) + Math.round((duration || 1) * 60);
        const eh = Math.floor(totalMins / 60) % 24;
        const em = totalMins % 60;
        return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
    })();
    const toMinutes = (t: string) => {
        const [h, m] = String(t).slice(0, 5).split(':').map(Number);
        return (h || 0) * 60 + (m || 0);
    };
    const slotStartMins = toMinutes(start_time);
    const slotEndMins = toMinutes(endTimeStrForSlot);
    const suggestedVenues = useMemo(() => {
        const dayNorm = formatDay(day) || day || '';
        const busyVenueIds = new Set<number>();
        for (const e of timetableEntries) {
            if (editingId != null && (e.id === editingId || (e as any).schedule_id === editingId)) continue;
            const entryDay = formatDay(e.day) || (e.day as string) || '';
            if (entryDay !== dayNorm) continue;
            const s2 = toMinutes(e.start_time || '');
            const e2 = toMinutes(e.end_time || '');
            if (slotStartMins < e2 && slotEndMins > s2) busyVenueIds.add(e.venue_id);
        }
        const minCapacity = classSize > 0 ? classSize : 0;
        return venues
            .filter((v) => {
                const cap = Number((v as any).capacity ?? (v as any).size ?? 0);
                if (minCapacity > 0 && cap < minCapacity) return false;
                return !busyVenueIds.has(v.id);
            })
            .sort((a, b) => {
                const capA = Number((a as any).capacity ?? (a as any).size ?? 0);
                const capB = Number((b as any).capacity ?? (b as any).size ?? 0);
                return capA - capB;
            });
    }, [day, start_time, duration, timetableEntries, venues, classSize, editingId, slotStartMins, slotEndMins]);

    const dayOrder = (d: string) => {
        const i = DAYS.indexOf(d || '');
        return i >= 0 ? i : 999;
    };
    const sortedEntries = useMemo(
        () =>
            [...timetableEntries].sort((a, b) => {
                const dayA = dayOrder(formatDay(a.day) || (a.day as string));
                const dayB = dayOrder(formatDay(b.day) || (b.day as string));
                if (dayA !== dayB) return dayA - dayB;
                const lvA = String(a.group_level ?? '');
                const lvB = String(b.group_level ?? '');
                if (lvA !== lvB) return Number(lvA) - Number(lvB);
                const deptA = (a.group_department ?? '').toLowerCase();
                const deptB = (b.group_department ?? '').toLowerCase();
                return deptA.localeCompare(deptB);
            }),
        [timetableEntries]
    );

    const sessionSemesterLabel = activeSession && activeSemester
        ? `${(activeSession.name || '').replace(/-/g, '/')} · ${activeSemester.name || 'Semester'}`
        : activeSession ? (activeSession.name || '').replace(/-/g, '/') : null;
    const noActiveSessionOrSemester = !activeSession || !activeSemester;
    const timetablePublished = activeSemester?.timetable_status === 'published';
    const schedulingDisabled = noActiveSessionOrSemester;

    // Finalize: First/Second = each (course, class) has scheduled hours >= course credit_units; Summer = 2 hrs; Post-SIWES = 6 hrs
    const requiredHoursForSemester = isPostSiwesSemester ? 6 : isSummerSemester ? 2 : null;
    const { scheduledCount, totalCount, missingCount } = useMemo(() => {
        // Summer / Post-SIWES: fixed hours per (course, class)
        if (requiredHoursForSemester != null) {
            const requiredPairs = new Set<string>();
            for (const g of classGroups) {
                for (const c of allCoursesForSession) {
                    if ((c as any).category === 'GEDS' || (c as any).category === 'SAT') continue;
                    const cDept = (c as any).department ?? '';
                    const gDept = g.department_name ?? g.department ?? '';
                    if (cDept !== gDept) continue;
                    if (g.level != null && (c as any).level != null && String(g.level) !== String((c as any).level)) continue;
                    requiredPairs.add(`${g.id}-${c.id}`);
                }
            }
            let cleared = 0;
            for (const key of requiredPairs) {
                const [gId, cId] = key.split('-').map(Number);
                const hours = scheduledHoursByCourseGroup.get(`${cId}-${gId}`) || 0;
                if (hours >= requiredHoursForSemester) cleared++;
            }
            const total = requiredPairs.size;
            return {
                allCoursesScheduled: total > 0 && cleared === total,
                scheduledCount: cleared,
                totalCount: total,
                missingCount: total - cleared,
            };
        }
        // First/Second: each (course, class) must have scheduled hours >= course credit_units (2 or 3)
        const requiredPairs = new Set<string>();
        for (const g of classGroups) {
            for (const c of allCoursesForSession) {
                if ((c as any).category === 'GEDS' || (c as any).category === 'SAT') continue;
                const cDept = (c as any).department ?? '';
                const gDept = g.department_name ?? g.department ?? '';
                if (cDept !== gDept) continue;
                if (g.level != null && (c as any).level != null && String(g.level) !== String((c as any).level)) continue;
                requiredPairs.add(`${g.id}-${c.id}`);
            }
        }
        let cleared = 0;
        for (const key of requiredPairs) {
            const [gId, cId] = key.split('-').map(Number);
            const hours = scheduledHoursByCourseGroup.get(`${cId}-${gId}`) || 0;
            const course = allCoursesForSession.find((c) => Number(c.id) === cId);
            const requiredHrs = (course as any)?.credit_units != null ? Number((course as any).credit_units) : 2;
            if (hours >= requiredHrs) cleared++;
        }
        const total = requiredPairs.size;
        return {
            allCoursesScheduled: total > 0 && cleared === total,
            scheduledCount: cleared,
            totalCount: total,
            missingCount: total - cleared,
        };
    }, [allCoursesForSession, timetableEntries, requiredHoursForSemester, classGroups, scheduledHoursByCourseGroup]);

    // Complete (department, level, group): group has no pending course – all required courses for that group are fully scheduled
    const completeGroupsList = useMemo(() => {
        const list: { department: string; level: string; groupName: string; groupId: number }[] = [];
        const requiredHoursForCourse = (c: any) => {
            if (requiredHoursForSemester != null) return requiredHoursForSemester;
            return (c?.credit_units != null ? Number(c.credit_units) : 2);
        };
        for (const g of classGroups) {
            const gDept = (g.department_name ?? g.department ?? '').trim();
            const gLevel = g.level != null ? String(g.level) : '';
            const requiredCourses = allCoursesForSession.filter((c: any) => {
                if ((c as any).category === 'GEDS' || (c as any).category === 'SAT') return false;
                const cDept = ((c as any).department ?? '').trim();
                if (cDept !== gDept) return false;
                if (gLevel && (c as any).level != null && String((c as any).level) !== gLevel) return false;
                return true;
            });
            if (requiredCourses.length === 0) continue;
            let allComplete = true;
            for (const c of requiredCourses) {
                const key = `${Number(c.id)}-${Number(g.id)}`;
                const hours = scheduledHoursByCourseGroup.get(key) || 0;
                const required = requiredHoursForCourse(c);
                if (hours < required) {
                    allComplete = false;
                    break;
                }
            }
            if (allComplete) list.push({ department: gDept, level: gLevel, groupName: g.name ?? '', groupId: g.id });
        }
        return list;
    }, [classGroups, allCoursesForSession, scheduledHoursByCourseGroup, requiredHoursForSemester]);

    const completeDepartments = useMemo(() => [...new Set(completeGroupsList.map((x) => x.department))].filter(Boolean).sort(), [completeGroupsList]);
    const [publishDepartment, setPublishDepartment] = useState('');
    const [publishLevel, setPublishLevel] = useState('');
    const [publishGroupId, setPublishGroupId] = useState<number | ''>('');
    const publishLevelOptions = useMemo(
        () => [...new Set(completeGroupsList.filter((x) => x.department === publishDepartment).map((x) => x.level))].sort((a, b) => Number(a) - Number(b)),
        [completeGroupsList, publishDepartment]
    );
    const publishGroupOptions = useMemo(
        () => completeGroupsList.filter((x) => x.department === publishDepartment && String(x.level) === String(publishLevel)),
        [completeGroupsList, publishDepartment, publishLevel]
    );
    useEffect(() => {
        if (!publishDepartment || !completeDepartments.includes(publishDepartment)) setPublishLevel('');
        if (!publishLevel || !publishLevelOptions.includes(publishLevel)) setPublishGroupId('');
        if (publishGroupId && !publishGroupOptions.some((x) => x.groupId === publishGroupId)) setPublishGroupId('');
    }, [publishDepartment, publishLevel, publishLevelOptions, publishGroupOptions, completeDepartments]);

    const activeSemesterIdForPublish = activeSemester?.semester_id ?? activeSemester?.id ?? null;
    // Entries for the selected publish group (and current semester) so the Approve modal shows the right count and course list
    const entriesForPublishGroup = useMemo(() => {
        if (!publishGroupId) return [];
        return timetableEntries.filter((e) => {
            if (Number(e.class_group_id) !== Number(publishGroupId)) return false;
            if (activeSemesterIdForPublish == null) return true;
            return e.semester_id == null || Number(e.semester_id) === Number(activeSemesterIdForPublish);
        });
    }, [timetableEntries, publishGroupId, activeSemesterIdForPublish]);
    const publishGroupCourseList = useMemo(() => {
        const seen = new Set<number>();
        const list: { course_code: string; title?: string }[] = [];
        for (const e of entriesForPublishGroup) {
            const cid = Number(e.course_id);
            if (seen.has(cid)) continue;
            seen.add(cid);
            list.push({
                course_code: (e as any).course_code ?? e.course_code ?? '—',
                title: (e as any).course_title ?? (e as any).course_name
            });
        }
        return list.sort((a, b) => String(a.course_code).localeCompare(String(b.course_code)));
    }, [entriesForPublishGroup]);

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-[#0f2044]">Schedule Lecture</h2>
                    {department && (
                        <p className="text-sm font-medium text-[#0f2044] mt-1">Department: {department}</p>
                    )}
                    <p className="text-sm text-slate-600 mt-1">Assign lecturers, courses, and classes to venues and time slots. Venues are shared school-wide; if a venue is already booked for the same day and time, you’ll see an error. Choose another venue or time.</p>
                </div>
                {activeSession && (
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-[#0f2044] text-white text-sm font-medium">
                            <Calendar className="w-4 h-4 mr-2" />
                            {(activeSession.name || '').replace(/-/g, '/')}
                        </span>
                        {semestersList.length > 0 && (
                            <label className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-slate-700">Semester:</span>
                                <select
                                    value={activeSemester ? String(activeSemester.semester_id ?? activeSemester.id ?? '') : ''}
                                    onChange={(e) => {
                                        const id = e.target.value ? Number(e.target.value) : null;
                                        const sem = semestersList.find((s: any) => (s.semester_id ?? s.id) === id);
                                        if (sem) setSelectedSemester(sem);
                                    }}
                                    className="px-3 py-1.5 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ffb71b] focus:border-transparent min-w-[140px]"
                                >
                                    {semestersList.map((s: any) => (
                                        <option key={s.semester_id ?? s.id} value={s.semester_id ?? s.id}>
                                            {s.name || 'Semester'}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}
                    </div>
                )}
            </div>

            {noActiveSessionOrSemester && (
                <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-6">
                        {!activeSession ? (
                            <>
                                <p className="text-amber-800 font-medium">No session is active</p>
                                <p className="text-sm text-amber-700 mt-1">Create a session in <strong>Academic Settings</strong> to schedule a lecture. Schedules are stored per session.</p>
                            </>
                        ) : (
                            <>
                                <p className="text-amber-800 font-medium">No active semester</p>
                                <p className="text-sm text-amber-700 mt-1">Start a semester (First, Second, or Post-SIWES) in <strong>Academic Settings</strong> to schedule a lecture.</p>
                            </>
                        )}
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
            <Card className="border border-slate-200 shadow-md">
                <CardHeader className="bg-gradient-to-r from-[#0f2044] to-[#1a3a5c] text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-6 h-6" />
                        {editingId ? 'Edit Schedule' : 'Create New Schedule'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Row 0: Day (first) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Day *
                            </label>
                            <select
                                value={day}
                                onChange={(e) => setDay(e.target.value)}
                                className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffb71b] focus:border-transparent"
                            >
                                {DAYS.map((d) => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Row 1: Department */}
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
                            <p className="text-xs text-slate-500 mt-1">Lecturers, courses, level and class are from the selected department.</p>
                        </div>

                        {/* Row 2: Level and Class */}
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
                                    {levelOptions.map((lv) => (
                                        <option key={lv} value={lv}>{lv}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Class *
                                </label>
                                <select
                                    value={class_group_id}
                                    onChange={(e) => setClassGroupId(e.target.value ? Number(e.target.value) : '')}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffb71b] focus:border-transparent"
                                    required
                                >
                                    <option value="">Select class</option>
                                    {classGroupsByLevel.map((group) => (
                                        <option key={group.id} value={group.id}>
                                            {formatGroupDisplayName(group.name)}
                                        </option>
                                    ))}
                                </select>
                                {class_group_id && selectedClass && (
                                    <p className="text-xs text-slate-600 mt-1">Class capacity: {selectedClass.student_count ?? '—'} students</p>
                                )}
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
                                <p className="text-xs text-slate-500 mt-1">
                                    {isPostSiwesSemester
                                        ? 'Post-SIWES: each course needs 6 hours total per group. It disappears from the list once 6 hours are scheduled.'
                                        : isSummerSemester
                                        ? 'Summer: each course needs 2 hours total per group. It disappears from the list once 2 hours are scheduled.'
                                        : 'First/Second: each course needs 2 or 3 hours total per group (by credit units). It disappears from the list once the required hours are scheduled.'}
                                </p>
                            </div>
                        </div>
                        {/* Start Time, Duration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                        {/* Venue (last – uses day, group and time for suggested venues) */}
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
                            <p className="text-xs text-slate-500 mt-1">Set day, group and time first so suggested venues show below. Venues are shared school-wide.</p>
                            {(day && start_time && (class_group_id || selectedClass)) && (
                                <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-md">
                                    <p className="text-xs font-medium text-slate-500 mb-1">Suggested venues (available for {formatDay(day)} {start_time}–{endTimeStrForSlot}, capacity ≥ class size):</p>
                                    {suggestedVenues.length === 0 ? (
                                        <p className="text-sm text-slate-600">No venues free at this time{Number(classSize) > 0 ? ` with capacity ≥ ${classSize}` : ''}. Try another day or time.</p>
                                    ) : (
                                        <ul className="text-sm text-slate-700 list-disc list-inside space-y-0.5">
                                            {suggestedVenues.slice(0, 10).map((v) => (
                                                <li key={v.id}>
                                                    <strong>{v.name}</strong> (Capacity: {(v as any).size ?? (v as any).capacity ?? 0})
                                                    {venue_id === v.id && ' ✓ selected'}
                                                </li>
                                            ))}
                                            {suggestedVenues.length > 10 && (
                                                <li className="text-slate-500">+{suggestedVenues.length - 10} more</li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                            )}
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
                                        <span className="font-medium">Group:</span> {formatGroupDisplayName(selectedClass.name)}
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
                                        <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Day</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Level</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Department</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Lecturer</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Course</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Group</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Venue</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Time</th>
                                        <th className="text-right py-3 px-4 font-semibold text-[#0f2044]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedEntries.map((entry) => (
                                        <tr key={entry.id} className="border-b border-slate-200 hover:bg-slate-50">
                                            <td className="px-4 py-3 text-slate-900 font-medium">{formatDay(entry.day)}</td>
                                            <td className="px-4 py-3 text-slate-900">{entry.group_level != null ? entry.group_level : '—'}</td>
                                            <td className="px-4 py-3 text-slate-900 font-medium">{entry.group_department ?? '—'}</td>
                                            <td className="px-4 py-3 text-slate-900">{entry.lecturer_name}</td>
                                            <td className="px-4 py-3 text-slate-900">{entry.course_code}</td>
                                            <td className="px-4 py-3 text-slate-900">{formatGroupDisplayName(entry.class_name) ?? '—'}</td>
                                            <td className="px-4 py-3 text-slate-900">{entry.venue_name}</td>
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

            {/* Finalize & Publish – only completed schedules (no pending course) in dropdowns; then Approve/Reject popup to publish */}
            {timetableEntries.length > 0 && (
                <Card className="border border-slate-200 shadow-md">
                    <CardHeader className="bg-gradient-to-r from-[#0f2044] to-[#1a3a5c] text-white rounded-t-lg">
                        <CardTitle className="flex items-center gap-2">
                            <Send className="w-6 h-6" />
                            Finalize & Publish
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <p className="text-sm text-slate-600">
                            Select the department, level and class you intend to publish the timetable for. Only completed schedules (no pending course) appear below.
                        </p>
                        {completeGroupsList.length === 0 ? (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-sm font-medium text-amber-800">No completed schedule yet</p>
                                <p className="text-sm text-amber-700 mt-1">
                                    Complete all required courses for at least one group (department + level + group) so it appears in the dropdowns. Progress: {scheduledCount} of {totalCount} class–course combinations complete ({missingCount} remaining).
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                    <select
                                        value={publishDepartment}
                                        onChange={(e) => { setPublishDepartment(e.target.value); setPublishLevel(''); setPublishGroupId(''); }}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                                    >
                                        <option value="">Select department</option>
                                        {completeDepartments.map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                                    <select
                                        value={publishLevel}
                                        onChange={(e) => { setPublishLevel(e.target.value); setPublishGroupId(''); }}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                                        disabled={!publishDepartment}
                                    >
                                        <option value="">Select level</option>
                                        {publishLevelOptions.map((lv) => (
                                            <option key={lv} value={lv}>{lv}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Group</label>
                                    <select
                                        value={publishGroupId === '' ? '' : String(publishGroupId)}
                                        onChange={(e) => setPublishGroupId(e.target.value ? Number(e.target.value) : '')}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                                        disabled={!publishLevel}
                                    >
                                        <option value="">Select class</option>
                                        {publishGroupOptions.map((g) => (
                                            <option key={g.groupId} value={g.groupId}>{formatGroupDisplayName(g.groupName)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                        {timetablePublished && (
                            <p className="text-sm text-green-700 font-medium">
                                Timetable is live on the landing page. You can always edit or delete entries above; the next time you push to the landing page it will show as <strong>Re-publish</strong>.
                            </p>
                        )}
                        <Button
                            type="button"
                            onClick={() => setShowApproveModal(true)}
                            disabled={completeGroupsList.length === 0 || !publishGroupId}
                            className="bg-[#0f2044] text-white hover:bg-[#1a3a5c] disabled:opacity-50 disabled:pointer-events-none"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            {timetablePublished ? 'Update & Re-publish to Landing Page' : 'Publish Timetable'}
                        </Button>
                    </CardContent>
                </Card>
            )}
            </>
            ) : null}

            {/* Approve / Reject popup: publish timetable to landing page so users see it when they select department, level and group */}
            <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{timetablePublished ? 'Re-publish Timetable' : 'Publish Timetable'}</DialogTitle>
                        <DialogDescription>
                            {timetablePublished
                                ? `Re-publish the timetable for ${sessionSemesterLabel || 'this session'} so the student landing page shows your latest changes.`
                                : `Publish the timetable for ${sessionSemesterLabel || 'this session'}. Students will see their schedule on the landing page when they select their department, level and class.`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2 space-y-3">
                        <p className="text-sm text-slate-700">
                            <span className="font-medium">{entriesForPublishGroup.length}</span> schedule entries for the selected group will be {timetablePublished ? 'updated and re-' : ''}published. Approve to go live; Reject to stay in the editor.
                        </p>
                        {entriesForPublishGroup.length > 0 && (
                            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                                <p className="text-xs font-medium text-slate-600 mb-2">Scheduled courses for this group:</p>
                                <ul className="text-sm text-slate-700 list-disc list-inside space-y-0.5 max-h-40 overflow-y-auto">
                                    {publishGroupCourseList.map((c, i) => (
                                        <li key={i}>{c.course_code}{c.title ? ` — ${c.title}` : ''}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowApproveModal(false)}
                            disabled={approving}
                        >
                            Reject
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
                                    const res = await (api as any).updateSemester(semesterId, { timetable_status: 'published', publish_group_id: publishGroupId || undefined }) as any;
                                    if (res?.success) {
                                        toast.success(timetablePublished ? 'Timetable re-published. Students will see the update on the landing page.' : 'Timetable published. Students can view their schedule by selecting department, level and group on the landing page.');
                                        onTimetablePublished?.();
                                        setSelectedSemester((prev: any) => prev ? { ...prev, timetable_status: 'published' } : null);
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
                            ) : (
                                'Approve'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
