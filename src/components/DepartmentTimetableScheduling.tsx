import { AlertCircle, BookOpen, Calendar, CheckCircle2, Clock, Edit2, Filter, Plus, Send, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
import { Input } from './ui/input';
import { Label } from './ui/label';

interface DepartmentTimetableSchedulingProps {
    departmentName: string;
    sessionId: number | null;
    activeSemester?: { name: string; semester_id?: number } | null;
}

interface ScheduleEntry {
    schedule_id?: number;
    course_id: number;
    course_name: string;
    lecturer_id: number;
    lecturer_name: string;
    class_group_id: number;
    group_name: string;
    venue_id: number;
    venue_name: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    duration: number;
}

function formatDay(day: string | null | undefined): string {
    if (day == null || String(day).trim() === '') return '—';
    const d = String(day).trim().toLowerCase();
    const days: Record<string, string> = { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday' };
    return days[d] ?? d.charAt(0).toUpperCase() + d.slice(1);
}

/** Compute end time string (HH:MM) from start time and duration in hours */
function endTimeFromStartAndDuration(startTime: string, durationHours: number): string {
    const [h, m] = String(startTime).slice(0, 5).split(':').map(Number);
    const totalMins = (h || 0) * 60 + (m || 0) + Math.round(durationHours * 60);
    const eh = Math.floor(totalMins / 60) % 24;
    const em = totalMins % 60;
    return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
}

/** No class can be scheduled at 1-2 PM (break) */
function overlapsBreak(start: string, end: string): boolean {
    const s = String(start).slice(0, 5);
    const e = String(end).slice(0, 5);
    return s < '14:00' && e > '13:00';
}

const DURATIONS = [
    { value: 1, label: '1 Hour' },
    { value: 2, label: '2 Hours' },
    { value: 3, label: '3 Hours' },
];

export function DepartmentTimetableScheduling({ departmentName, sessionId, activeSemester: propsActiveSemester }: DepartmentTimetableSchedulingProps) {
    const [semestersList, setSemestersList] = useState<any[]>([]);
    const [selectedSemester, setSelectedSemester] = useState<{ name: string; semester_id?: number } | null>(null);
    const activeSemester = selectedSemester ?? propsActiveSemester ?? null;

    const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [lecturers, setLecturers] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [venues, setVenues] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        course_id: '',
        lecturer_id: '',
        class_group_id: '',
        venue_id: '',
        level: '' as string,
        day_of_week: 'Monday',
        start_time: '09:00',
        duration: 1 as number,
    });
    const [lecturerPreferenceText, setLecturerPreferenceText] = useState<string | null>(null);
    const [conflictValidation, setConflictValidation] = useState<{ success: boolean; error?: string; end_time?: string } | null>(null);
    const [filterLevel, setFilterLevel] = useState<string>('');
    const [filterDay, setFilterDay] = useState<string>('');
    const [filterLecturer, setFilterLecturer] = useState<string>('');
    const [filterCourse, setFilterCourse] = useState<string>('');
    const [filterVenue, setFilterVenue] = useState<string>('');
    const [filterClass, setFilterClass] = useState<string>('');
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [approving, setApproving] = useState(false);

    useEffect(() => {
        if (departmentName && sessionId) {
            fetchAllData();
        }
    }, [departmentName, sessionId]);

    // Fetch all semesters for the session so user can select First, Second, Summer, or Post-SIWES (6-hour logic)
    useEffect(() => {
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
                    const matchProp = propsActiveSemester && list.find((s: any) => (s.semester_id ?? s.id) === (propsActiveSemester.semester_id ?? (propsActiveSemester as any).id));
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
    }, [sessionId, propsActiveSemester?.semester_id]);

    // When semester changes, clear level, class group, and course so the user picks a class for the current semester. Lecturers and courses lists stay populated.
    useEffect(() => {
        setFormData((prev) => {
            if (prev.level || prev.class_group_id || prev.course_id) {
                return { ...prev, level: '', class_group_id: '', course_id: '' };
            }
            return prev;
        });
    }, [activeSemester?.semester_id ?? activeSemester?.name]);

    // Lecturers and courses are loaded per session (and department) so they stay available for every semester in that session.
    const fetchAllData = async () => {
        if (!sessionId) return;
        setLoading(true);
        try {
            const [coursesRes, lecturersRes, groupsRes, venuesRes, schedulesRes] = await Promise.all([
                api.getCourses({ department: departmentName, session_id: sessionId }),
                api.getLecturers({ department: departmentName, session_id: sessionId }),
                api.getClassGroups({ department: departmentName, session_id: sessionId }),
                api.getVenues({}),
                api.getSchedules?.({ department: departmentName, session_id: sessionId, expand: true, for_department_view: true }) || Promise.resolve({ success: true, data: [] }),
            ]);

            if (coursesRes.success) {
                const list = Array.isArray(coursesRes.data) ? coursesRes.data : (coursesRes.data?.courses || []);
                const computingOnly = list.filter((c: any) => !['GEDS', 'SAT'].includes(c.category || ''));
                setCourses(computingOnly);
            }
            // Prefer lecturers for this session + department; if none found (e.g. lecturers not tied to the current session),
            // fall back to department-only, then all lecturers, and filter to active ones so the dropdown is never empty unnecessarily.
            if (lecturersRes.success) {
                let lecList: any[] = Array.isArray(lecturersRes.data) ? lecturersRes.data : (lecturersRes.data?.lecturers || []);
                if ((!lecList || lecList.length === 0) && departmentName) {
                    const fallbackByDept = await api.getLecturers({ department: departmentName }) as any;
                    if (fallbackByDept?.success) {
                        lecList = Array.isArray(fallbackByDept.data) ? fallbackByDept.data : (fallbackByDept.data?.lecturers || []);
                    }
                }
                if (!lecList || lecList.length === 0) {
                    const fallbackAll = await api.getLecturers({}) as any;
                    if (fallbackAll?.success) {
                        lecList = Array.isArray(fallbackAll.data) ? fallbackAll.data : (fallbackAll.data?.lecturers || []);
                    }
                }
                if (lecList && lecList.length > 0) {
                    const activeLecturers = lecList.filter((l: any) => (l.status ?? 'active') === 'active');
                    setLecturers(activeLecturers);
                } else {
                    setLecturers([]);
                }
            }
            if (groupsRes.success) setGroups(Array.isArray(groupsRes.data) ? groupsRes.data : (groupsRes.data?.groups || []));
            if (venuesRes.success) setVenues(Array.isArray(venuesRes.data) ? venuesRes.data : (venuesRes.data?.venues || []));
            if (schedulesRes.success) setSchedules(Array.isArray(schedulesRes.data) ? schedulesRes.data : []);
        } catch (error: any) {
            toast.error('Failed to load scheduling data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        const course = courses.find(c => c.course_id === parseInt(formData.course_id));
        const lecturer = lecturers.find(l => l.lecturer_id === parseInt(formData.lecturer_id));
        const group = groups.find(g => g.group_id === parseInt(formData.class_group_id));
        const venue = venues.find(v => v.venue_id === parseInt(formData.venue_id));

        if (!course || !lecturer || !group || !venue) {
            toast.error('Please select all required fields');
            return;
        }

        const venueCapacity = Number(venue.capacity ?? venue.size ?? 0);
        const classSize = Number(group.student_count ?? 0);
        if (classSize > 0 && venueCapacity > 0 && classSize > venueCapacity) {
            toast.error(`Venue capacity (${venueCapacity}) is less than class size (${classSize}). Choose a larger venue.`);
            return;
        }

        const start = formData.start_time.slice(0, 5);
        const end = endTimeFromStartAndDuration(formData.start_time, formData.duration);
        const durationHours = formData.duration;

        if (overlapsBreak(start, end)) {
            toast.error('No class can be scheduled at 1-2 PM (break).');
            return;
        }

        const conflictRes = await api.checkVenueConflict(sessionId!, parseInt(formData.venue_id), formData.day_of_week, start, end, editingId ?? undefined);
        if (conflictRes?.conflict) {
            toast.error(conflictRes.message || 'This venue is already booked for that day and time. Please choose another venue or time.');
            return;
        }

        const groupConflictRes = await api.checkClassGroupTimeConflict(sessionId!, parseInt(formData.class_group_id), formData.day_of_week, start, end, editingId ?? undefined, parseInt(formData.course_id) || undefined);
        if (groupConflictRes?.conflict) {
            toast.error(groupConflictRes.message || 'This class already has something at this day and time (including non-computing courses). Choose another time.');
            return;
        }

        const specialConflictRes = await api.checkSpecialEventConflict(sessionId!, formData.day_of_week, start, end, formData.level || null);
        if (specialConflictRes?.conflict) {
            toast.error(specialConflictRes.message || 'This time is blocked by a special event (Break or Chapel Seminar). Choose another time.');
            return;
        }

        const semesterId = activeSemester?.semester_id ?? undefined;
        const hoursRes = await api.checkCourseHoursForGroup(sessionId!, parseInt(formData.course_id), parseInt(formData.class_group_id), durationHours, editingId ?? undefined, semesterId);
        if (hoursRes?.overLimit) {
            toast.error(hoursRes.message || 'This course can only be scheduled twice per week for this class group.');
            return;
        }

        // Same course + class must use the same lecturer – block if different lecturer selected
        const existingForCourseGroup = schedules.find(
            (s: any) => Number(s.course_id) === parseInt(formData.course_id) && Number(s.class_group_id) === parseInt(formData.class_group_id) && (editingId == null || (s.schedule_id !== editingId && s.id !== editingId))
        );
        const requiredLecId = existingForCourseGroup?.lecturer_id ?? null;
        if (requiredLecId != null && parseInt(formData.lecturer_id) !== Number(requiredLecId)) {
            toast.error('This course is already scheduled for this class with another lecturer. The same lecturer must be used for all slots for this course and class.');
            return;
        }

        const scheduleData: any = {
            session_id: sessionId,
            course_id: parseInt(formData.course_id),
            lecturer_id: parseInt(formData.lecturer_id),
            class_group_id: parseInt(formData.class_group_id),
            venue_id: parseInt(formData.venue_id),
            day: formData.day_of_week,
            day_of_week: formData.day_of_week,
            start_time: start,
            end_time: end,
            duration_hours: durationHours,
            created_by_role: 'department-officer',
        };
        if (activeSemester?.semester_id != null) scheduleData.semester_id = activeSemester.semester_id;

        try {
            if (editingId) {
                const res = await api.updateSchedule(editingId, scheduleData);
                if (res?.success) {
                    toast.success('Schedule updated');
                    resetForm();
                    fetchAllData();
                } else {
                    toast.error(res?.error || 'Update failed');
                    // Keep form data so user can fix and resubmit (like STTO)
                }
            } else {
                const res = await api.createSchedule(scheduleData);
                if (res?.success) {
                    toast.success('Schedule created');
                    resetForm();
                    fetchAllData();
                } else {
                    toast.error(res?.error || 'Create failed');
                    // Keep form data so user can fix and resubmit (like STTO)
                }
            }
        } catch (error: any) {
            toast.error(error?.message || 'Error saving schedule');
            // Keep form data so user can fix and resubmit
        }
    };

    const resetForm = () => {
        setFormData({
            course_id: '',
            lecturer_id: '',
            class_group_id: '',
            venue_id: '',
            level: '',
            day_of_week: 'Monday',
            start_time: '09:00',
            duration: 1,
        });
        setEditingId(null);
        setShowForm(false);
    };

    // Level options from class groups in DB (no hardcoded levels)
    const levelsFromDb = useMemo(() => {
        const set = new Set<string>();
        groups.forEach((g: any) => {
            if (g.level != null && String(g.level).trim() !== '') set.add(String(g.level));
        });
        return Array.from(set).sort((a, b) => Number(a) - Number(b));
    }, [groups]);

    // Class groups: only those set in Class Management for the selected level (show nothing until level is chosen)
    const groupsByLevel = formData.level ? groups.filter((g: any) => String(g.level) === String(formData.level)) : [];
    // Courses: only for the selected level and department
    const coursesByLevel = formData.level ? courses.filter((c: any) => String(c.level) === String(formData.level)) : [];

    const activeSemesterId = activeSemester?.semester_id ?? null;
    const isPostSiwesSemester = Boolean(
        activeSemester?.name && String(activeSemester.name).toLowerCase().includes('post-siwes')
    );
    const isSummerSemester = Boolean(
        activeSemester?.name && String(activeSemester.name).toLowerCase().includes('summer')
    );
    // For hours-based semesters (Summer, Post-SIWES) and slot-based (First/Second), count only schedules in the active semester
    const schedulesForCounting = activeSemesterId != null
        ? schedules.filter((s: any) => (s.semester_id ?? null) === activeSemesterId)
        : schedules;
    const hoursBetween = (start: string, end: string) => {
        const [sh, sm] = (start || '0:0').slice(0, 5).split(':').map(Number);
        const [eh, em] = (end || '0:0').slice(0, 5).split(':').map(Number);
        return (eh - sh) + (em - sm) / 60;
    };

    const scheduledCountByCourseGroup = useMemo(() => {
        const map = new Map<string, number>();
        for (const s of schedulesForCounting) {
            if (editingId != null && (s.schedule_id === editingId || (s as any).id === editingId)) continue;
            const key = `${Number(s.course_id)}-${Number(s.class_group_id)}`;
            map.set(key, (map.get(key) || 0) + 1);
        }
        return map;
    }, [schedulesForCounting, editingId]);

    const scheduledHoursByCourseGroup = useMemo(() => {
        const map = new Map<string, number>();
        for (const s of schedulesForCounting) {
            if (editingId != null && (s.schedule_id === editingId || (s as any).id === editingId)) continue;
            const key = `${Number(s.course_id)}-${Number(s.class_group_id)}`;
            const hrs = hoursBetween((s as any).start_time || '', (s as any).end_time || '');
            map.set(key, (map.get(key) || 0) + hrs);
        }
        return map;
    }, [schedulesForCounting, editingId]);

    const editingEntryCourseId = editingId ? schedules.find((s: any) => s.schedule_id === editingId || s.id === editingId)?.course_id : null;

    // Same course + class must use the same lecturer
    const requiredLecturerIdForCourseGroup = useMemo(() => {
        const cid = formData.course_id ? parseInt(formData.course_id, 10) : null;
        const gid = formData.class_group_id ? parseInt(formData.class_group_id, 10) : null;
        if (cid == null || gid == null) return null;
        const existing = schedules.find(
            (s: any) => Number(s.course_id) === cid && Number(s.class_group_id) === gid && (editingId == null || (s.schedule_id !== editingId && s.id !== editingId))
        );
        return existing?.lecturer_id ?? null;
    }, [schedules, formData.course_id, formData.class_group_id, editingId]);

    // Show all lecturers; conflict validation will flag and block if a different lecturer is chosen for a course+class that already has a schedule
    const lecturersForDropdown = lecturers;

    const coursesAvailableForGroup = useMemo(() => {
        const groupId = formData.class_group_id ? parseInt(formData.class_group_id, 10) : null;
        if (!groupId) return coursesByLevel;
        return coursesByLevel.filter((c: any) => {
            const courseId = Number(c.course_id ?? c.id);
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
            const requiredHours = (c as any).credit_units != null ? Number((c as any).credit_units) : 3;
            const hours = scheduledHoursByCourseGroup.get(key) || 0;
            const atMax = hours >= requiredHours;
            if (atMax) return editingId != null && Number(editingEntryCourseId) === courseId;
            return true;
        });
    }, [coursesByLevel, formData.class_group_id, scheduledHoursByCourseGroup, isPostSiwesSemester, isSummerSemester, editingId, editingEntryCourseId]);

    // Clear course selection when it's no longer in the list (e.g. just reached 2 slots for this class)
    useEffect(() => {
        if (!formData.course_id || !formData.class_group_id) return;
        const stillAvailable = coursesAvailableForGroup.some((c: any) => Number(c.course_id ?? c.id) === Number(formData.course_id));
        if (!stillAvailable) setFormData((prev) => ({ ...prev, course_id: '' }));
    }, [coursesAvailableForGroup, formData.course_id, formData.class_group_id]);

    const selectedGroupForVenue = formData.class_group_id ? groups.find((g: any) => g.group_id === parseInt(formData.class_group_id, 10)) : null;
    const classSizeForVenue = Number(selectedGroupForVenue?.student_count ?? 0);
    const endTimeForSlot = endTimeFromStartAndDuration(formData.start_time, formData.duration);
    const toMinutes = (t: string) => {
        const [h, m] = String(t).slice(0, 5).split(':').map(Number);
        return (h || 0) * 60 + (m || 0);
    };
    const suggestedVenues = useMemo(() => {
        if (!formData.day_of_week || !formData.start_time) return [];
        const dayNorm = formatDay(formData.day_of_week) || formData.day_of_week;
        const slotStart = toMinutes(formData.start_time);
        const slotEnd = toMinutes(endTimeForSlot);
        const busyVenueIds = new Set<number>();
        for (const s of schedules) {
            if (editingId != null && (s.schedule_id === editingId || (s as any).id === editingId)) continue;
            const entryDay = formatDay((s as any).day_of_week || (s as any).day) || (s as any).day_of_week || '';
            if (entryDay !== dayNorm) continue;
            const s2 = toMinutes((s as any).start_time || '');
            const e2 = toMinutes((s as any).end_time || '');
            if (slotStart < e2 && slotEnd > s2) busyVenueIds.add(s.venue_id);
        }
        const minCapacity = classSizeForVenue > 0 ? classSizeForVenue : 0;
        return venues
            .filter((v: any) => {
                const cap = Number(v.capacity ?? v.size ?? 0);
                if (minCapacity > 0 && cap < minCapacity) return false;
                const vid = v.venue_id ?? v.id;
                return !busyVenueIds.has(vid);
            })
            .sort((a: any, b: any) => {
                const capA = Number(a.capacity ?? a.size ?? 0);
                const capB = Number(b.capacity ?? b.size ?? 0);
                return capA - capB;
            });
    }, [formData.day_of_week, formData.start_time, formData.duration, formData.class_group_id, schedules, venues, classSizeForVenue, editingId, endTimeForSlot]);

    // Show selected lecturer's preferences as text below the lecturer dropdown
    useEffect(() => {
        if (!formData.lecturer_id) {
            setLecturerPreferenceText(null);
            return;
        }
        let cancelled = false;
        const load = async () => {
            try {
                const res = await api.getLecturerPreference(parseInt(formData.lecturer_id)) as any;
                if (cancelled) return;
                if (!res?.success || !res?.data) {
                    setLecturerPreferenceText('No preferences set. Set in Lecturer Preferences.');
                    return;
                }
                const p = res.data;
                const prefs = p.preferences != null && String(p.preferences).trim() ? String(p.preferences).trim() : null;
                if (prefs) setLecturerPreferenceText(prefs);
                else setLecturerPreferenceText('No preferences set. Set in Lecturer Preferences.');
            } catch (_) {
                if (!cancelled) setLecturerPreferenceText('Could not load preferences.');
            }
        };
        load();
        return () => { cancelled = true; };
    }, [formData.lecturer_id]);

    // Real-time conflict check (like STTO) so DTTO sees conflicts before submitting
    useEffect(() => {
        // Flag error when this course+class is already scheduled with a different lecturer (do not allow)
        if (formData.course_id && formData.class_group_id && formData.lecturer_id && requiredLecturerIdForCourseGroup != null && Number(formData.lecturer_id) !== Number(requiredLecturerIdForCourseGroup)) {
            setConflictValidation({ success: false, error: 'This course is already scheduled for this class with another lecturer. The same lecturer must be used for all slots. Choose the lecturer already assigned to this course and class.' });
            return;
        }
        if (!sessionId || !formData.venue_id || !formData.class_group_id || !formData.start_time) {
            setConflictValidation(null);
            return;
        }
        const start = formData.start_time.slice(0, 5);
        const end = endTimeFromStartAndDuration(formData.start_time, formData.duration);
        if (overlapsBreak(start, end)) {
            setConflictValidation({ success: false, error: 'No class can be scheduled at 1-2 PM (break).' });
            return;
        }
        let cancelled = false;
        const run = async () => {
            try {
                const [venueRes, groupRes, specialRes] = await Promise.all([
                    api.checkVenueConflict(sessionId, parseInt(formData.venue_id), formData.day_of_week, start, end, editingId ?? undefined),
                    api.checkClassGroupTimeConflict(sessionId, parseInt(formData.class_group_id), formData.day_of_week, start, end, editingId ?? undefined, formData.course_id ? parseInt(formData.course_id) : undefined),
                    api.checkSpecialEventConflict(sessionId, formData.day_of_week, start, end, formData.level || null),
                ]);
                if (cancelled) return;
                if (venueRes?.conflict) {
                    setConflictValidation({ success: false, error: venueRes.message || 'This venue is already booked for that day and time.' });
                    return;
                }
                if (groupRes?.conflict) {
                    setConflictValidation({ success: false, error: groupRes.message || 'This class already has something at this time.' });
                    return;
                }
                if (specialRes?.conflict) {
                    setConflictValidation({ success: false, error: specialRes.message || 'This time is blocked by a special event.' });
                    return;
                }
                if (formData.course_id) {
                    const semesterId = activeSemester?.semester_id ?? undefined;
                    const hoursRes = await api.checkCourseHoursForGroup(sessionId, parseInt(formData.course_id), parseInt(formData.class_group_id), formData.duration, editingId ?? undefined, semesterId);
                    if (cancelled) return;
                    if (hoursRes?.overLimit) {
                        setConflictValidation({ success: false, error: hoursRes.message || 'This course can only be scheduled twice per week for this class.' });
                        return;
                    }
                }
                setConflictValidation({ success: true, end_time: end });
            } catch (_) {
                if (!cancelled) setConflictValidation(null);
            }
        };
        run();
        return () => { cancelled = true; };
    }, [sessionId, formData.venue_id, formData.class_group_id, formData.lecturer_id, formData.day_of_week, formData.start_time, formData.duration, formData.course_id, formData.level, editingId, requiredLecturerIdForCourseGroup]);

    const handleEdit = (schedule: ScheduleEntry) => {
        const group = groups.find((g: any) => g.group_id === schedule.class_group_id);
        const start = schedule.start_time ? new Date(`2000-01-01 ${schedule.start_time}`) : new Date('2000-01-01 09:00');
        const end = schedule.end_time ? new Date(`2000-01-01 ${schedule.end_time}`) : new Date('2000-01-01 10:00');
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60) || 1;
        setFormData({
            course_id: String(schedule.course_id),
            lecturer_id: String(schedule.lecturer_id),
            class_group_id: String(schedule.class_group_id),
            venue_id: String(schedule.venue_id),
            level: group ? String(group.level) : '',
            day_of_week: formatDay(schedule.day_of_week) || 'Monday',
            start_time: schedule.start_time?.slice(0, 5) || '09:00',
            duration: durationHours >= 3 ? 3 : durationHours >= 2 ? 2 : 1,
        });
        setEditingId(schedule.schedule_id ?? null);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this schedule entry?')) {
            try {
                await api.deleteSchedule?.(id) || Promise.resolve({ success: true });
                toast.success('Schedule deleted');
                fetchAllData();
            } catch (error: any) {
                toast.error(error.message);
            }
        }
    };

    const selectedCourseForDisplay = courses.find((c: any) => (c.course_id ?? c.id) === parseInt(formData.course_id));
    const dayOrder = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5 };
    // Per semester: show only this semester's schedules; lecturers and courses stay for the whole session
    const schedulesForSemester = activeSemesterId != null
        ? schedules.filter((s: any) => (s.semester_id ?? null) === activeSemesterId)
        : schedules;
    const sortedSchedules = [...schedulesForSemester].sort((a, b) => {
        const dayDiff = (dayOrder[a.day_of_week as keyof typeof dayOrder] || 0) - (dayOrder[b.day_of_week as keyof typeof dayOrder] || 0);
        if (dayDiff !== 0) return dayDiff;
        return a.start_time.localeCompare(b.start_time);
    });

    const requiredHoursForSemester = isPostSiwesSemester ? 6 : isSummerSemester ? 2 : null;
    const completeGroupsList = useMemo(() => {
        const list: { level: string; groupName: string; groupId: number }[] = [];
        for (const g of groups) {
            const gLevel = g.level != null ? String(g.level) : '';
            const requiredCourses = courses.filter((c: any) => {
                if ((c as any).category === 'GEDS' || (c as any).category === 'SAT') return false;
                if (gLevel && (c as any).level != null && String((c as any).level) !== gLevel) return false;
                return true;
            });
            if (requiredCourses.length === 0) continue;
            let allComplete = true;
            for (const c of requiredCourses) {
                const key = `${Number(c.course_id ?? c.id)}-${Number(g.group_id ?? g.id)}`;
                const hours = scheduledHoursByCourseGroup.get(key) || 0;
                const required = requiredHoursForSemester != null ? requiredHoursForSemester : (Number((c as any).credit_units) || 2);
                if (hours < required) {
                    allComplete = false;
                    break;
                }
            }
            if (allComplete) list.push({ level: gLevel, groupName: g.name ?? '', groupId: g.group_id ?? g.id });
        }
        return list;
    }, [groups, courses, scheduledHoursByCourseGroup, requiredHoursForSemester]);

    const [publishLevel, setPublishLevel] = useState('');
    const [publishGroupId, setPublishGroupId] = useState<number | ''>('');
    const publishLevelOptions = useMemo(() => [...new Set(completeGroupsList.map((x) => x.level))].sort((a, b) => Number(a) - Number(b)), [completeGroupsList]);
    const publishGroupOptions = useMemo(() => completeGroupsList.filter((x) => String(x.level) === String(publishLevel)), [completeGroupsList, publishLevel]);
    useEffect(() => {
        if (!publishLevel || !publishLevelOptions.includes(publishLevel)) setPublishGroupId('');
        if (publishGroupId && !publishGroupOptions.some((x) => x.groupId === publishGroupId)) setPublishGroupId('');
    }, [publishLevel, publishLevelOptions, publishGroupOptions]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                    <h2 className="text-2xl font-bold text-[#0f2044]">Schedule Lecture</h2>
                    <p className="text-xs text-amber-700 mt-1 bg-amber-50 border border-amber-200 rounded px-2 py-1 inline-block">
                        The School Timetable Officer can view and reschedule your department’s lectures. If they make changes, refresh this page to see the latest timetable.
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {semestersList.length > 0 && (
                        <label className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-slate-700">Semester:</span>
                            <select
                                value={activeSemester ? String(activeSemester.semester_id ?? (activeSemester as any).id ?? '') : ''}
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
                    <Button onClick={() => { setShowForm(!showForm); setEditingId(null); }} className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        {showForm ? 'Cancel' : 'Add Schedule'}
                    </Button>
                </div>
            </div>

            {showForm && (
                <Card className="border border-slate-200 shadow-md">
                    <CardHeader className="bg-gradient-to-r from-[#0f2044] to-[#1a3a5c] text-white rounded-t-lg">
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            {editingId ? 'Edit Schedule' : 'Add New Schedule'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Level and Class Group first — level and groups come from Class Management */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="level">Level *</Label>
                                    <select
                                        id="level"
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: e.target.value, class_group_id: '' })}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    >
                                        <option value="">Select level</option>
                                        {levelsFromDb.map((lv) => (
                                            <option key={lv} value={lv}>{lv}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">Levels and groups are set in Class Management.</p>
                                </div>
                                <div>
                                    <Label htmlFor="group">Class Group *</Label>
                                    <select
                                        id="group"
                                        value={formData.class_group_id}
                                        onChange={(e) => setFormData({ ...formData, class_group_id: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                        disabled={!formData.level}
                                    >
                                        <option value="">{formData.level ? 'Select group' : 'Select level first'}</option>
                                        {groupsByLevel.map((g: any) => (
                                            <option key={g.group_id} value={g.group_id}>{g.name}</option>
                                        ))}
                                    </select>
                                    {formData.class_group_id && selectedGroupForVenue && (
                                        <p className="text-xs text-slate-600 mt-1">Class capacity: {selectedGroupForVenue.student_count ?? '—'} students</p>
                                    )}
                                </div>
                            </div>

                            {/* Lecturer and Course */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="lecturer">Lecturer *</Label>
                                    <select
                                        id="lecturer"
                                        value={formData.lecturer_id}
                                        onChange={(e) => setFormData({ ...formData, lecturer_id: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    >
                                        <option value="">Select lecturer</option>
                                        {lecturersForDropdown.map((l: any) => (
                                            <option key={l.lecturer_id ?? l.id} value={l.lecturer_id ?? l.id}>{[l.first_name, l.last_name].filter(Boolean).join(' ') || l.name || '—'}</option>
                                        ))}
                                    </select>
                                    {requiredLecturerIdForCourseGroup != null && (
                                        <p className="text-xs text-amber-700 mt-1">This course is already scheduled for this class; the same lecturer must be used for all slots.</p>
                                    )}
                                    {requiredLecturerIdForCourseGroup != null && formData.lecturer_id && Number(formData.lecturer_id) !== Number(requiredLecturerIdForCourseGroup) && (
                                        <p className="text-xs text-red-700 font-medium mt-1">This lecturer is not allowed. This course and class already have slots with another lecturer—select that lecturer instead.</p>
                                    )}
                                    {lecturerPreferenceText != null && (
                                        <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-md">
                                            <p className="text-xs font-medium text-slate-500 mb-1">Lecturer preferences:</p>
                                            <p className="text-sm text-slate-700">{lecturerPreferenceText || 'No preferences set. Set in Lecturer Management.'}</p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="course">Course *</Label>
                                    <select
                                        id="course"
                                        value={formData.course_id}
                                        onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                        disabled={!formData.level}
                                    >
                                        <option value="">{formData.level ? 'Select course' : 'Select level first'}</option>
                                        {coursesAvailableForGroup.map((c: any) => {
                                            const levelStr = formData.level ? String(formData.level) : '';
                                            const groupObj = formData.class_group_id ? groupsByLevel.find((g: any) => g.group_id === parseInt(formData.class_group_id, 10)) : null;
                                            const groupStr = groupObj ? groupObj.name : '';
                                            const suffix = [levelStr, groupStr].filter(Boolean).length ? ` · ${[levelStr, groupStr].filter(Boolean).join(' · ')}` : '';
                                            return (
                                                <option key={c.course_id ?? c.id} value={c.course_id ?? c.id}>
                                                    {c.course_code || c.code} – {c.title}{suffix}
                                                </option>
                                            );
                                        })}
                                        {coursesAvailableForGroup.length === 0 && coursesByLevel.length > 0 && (
                                            <option disabled>All courses for this class are already scheduled</option>
                                        )}
                                    </select>
                                    {selectedCourseForDisplay && (
                                        <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700">
                                            <span className="font-medium">Title:</span> {selectedCourseForDisplay.title}
                                            {(selectedCourseForDisplay as any).credit_units != null && (
                                                <span className="ml-3"><span className="font-medium">Credit units:</span> {(selectedCourseForDisplay as any).credit_units}</span>
                                            )}
                                        </div>
                                    )}
                                    <p className="text-xs text-slate-500 mt-1">
                                        {isPostSiwesSemester
                                            ? 'Post-SIWES: each course needs 6 hours total per group. It disappears from the list once 6 hours are scheduled.'
                                            : isSummerSemester
                                            ? 'Summer: each course needs 2 hours total per group. It disappears from the list once 2 hours are scheduled.'
                                            : 'First/Second: each course disappears from the list once its total scheduled hours reach the course credit units (e.g. 2-unit after 2 hours, 3-unit after 3 hours).'}
                                    </p>
                                </div>
                            </div>

                            {/* Day, Start time, Duration – before venue so venue suggestions can use this slot */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="day">Day *</Label>
                                    <select
                                        id="day"
                                        value={formData.day_of_week}
                                        onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                    >
                                        <option value="Monday">Monday</option>
                                        <option value="Tuesday">Tuesday</option>
                                        <option value="Wednesday">Wednesday</option>
                                        <option value="Thursday">Thursday</option>
                                        <option value="Friday">Friday</option>
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="start_time">Start Time (24h format) *</Label>
                                    <Input
                                        id="start_time"
                                        type="time"
                                        value={formData.start_time}
                                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                        min="07:00"
                                        max="18:00"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="duration">Duration *</Label>
                                    <select
                                        id="duration"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-md"
                                    >
                                        {DURATIONS.map((d) => (
                                            <option key={d.value} value={d.value}>{d.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <Label htmlFor="venue">Venue *</Label>
                                    <select
                                        id="venue"
                                        value={formData.venue_id}
                                        onChange={(e) => setFormData({ ...formData, venue_id: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    >
                                        <option value="">Select venue</option>
                                        {venues.map(v => (
                                            <option key={v.venue_id} value={v.venue_id}>{v.name || v.venue_name} (Cap: {v.capacity ?? v.size ?? 0})</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">Venues are shared school-wide. Double-bookings for the same day and time are blocked.</p>
                                    {formData.day_of_week && formData.start_time && (formData.class_group_id || selectedGroupForVenue) && (
                                        <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-md">
                                            <p className="text-xs font-medium text-slate-500 mb-1">Venue suggestions (available for {formatDay(formData.day_of_week)} {formData.start_time.slice(0, 5)}–{endTimeForSlot.slice(0, 5)}, capacity ≥ class size):</p>
                                            {suggestedVenues.length === 0 ? (
                                                <p className="text-sm text-slate-600">No venues free at this time{classSizeForVenue > 0 ? ` with capacity ≥ ${classSizeForVenue}` : ''}. Try another day or time.</p>
                                            ) : (
                                                <ul className="text-sm text-slate-700 list-disc list-inside space-y-0.5">
                                                    {suggestedVenues.slice(0, 10).map((v: any) => (
                                                        <li key={v.venue_id ?? v.id}>
                                                            <strong>{v.name || v.venue_name}</strong> (Capacity: {v.capacity ?? v.size ?? 0})
                                                            {formData.venue_id && Number(formData.venue_id) === Number(v.venue_id ?? v.id) && ' ✓ selected'}
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
                            </div>

                            {/* Summary – only when form is filled (like STTO); does not show again once scheduled */}
                            {formData.lecturer_id && formData.course_id && formData.class_group_id && formData.venue_id && formData.day_of_week && formData.start_time && selectedCourseForDisplay && (() => {
                                const selLecturer = lecturers.find((l: any) => (l.lecturer_id ?? l.id) === parseInt(formData.lecturer_id));
                                const selGroup = groupsByLevel.find((g: any) => g.group_id === parseInt(formData.class_group_id));
                                const selVenue = venues.find((v: any) => (v.venue_id ?? v.id) === parseInt(formData.venue_id));
                                return selLecturer && selGroup && selVenue ? (
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                        <p className="text-sm font-medium text-slate-700 mb-2">Summary:</p>
                                        <div className="space-y-1 text-sm text-slate-600">
                                            <p><span className="font-medium text-slate-700">Level:</span> {formData.level ?? '—'}</p>
                                            <p><span className="font-medium text-slate-700">Lecturer:</span> {[selLecturer.first_name, selLecturer.last_name].filter(Boolean).join(' ') || selLecturer.name || '—'}</p>
                                            <p><span className="font-medium text-slate-700">Course:</span> {selectedCourseForDisplay.course_code || (selectedCourseForDisplay as any).code} – {selectedCourseForDisplay.title}</p>
                                            <p><span className="font-medium text-slate-700">Class:</span> {selGroup.name}</p>
                                            <p><span className="font-medium text-slate-700">Venue:</span> {selVenue.name || (selVenue as any).venue_name} (Cap: {selVenue.capacity ?? (selVenue as any).size ?? '—'})</p>
                                            <p><span className="font-medium text-slate-700">Day:</span> {formatDay(formData.day_of_week)}</p>
                                            <p><span className="font-medium text-slate-700">Time:</span> {formData.start_time} ({formData.duration} hour{formData.duration > 1 ? 's' : ''})</p>
                                        </div>
                                    </div>
                                ) : null;
                            })()}

                            {conflictValidation != null && (
                                <div className={`flex items-start gap-3 p-4 border rounded-lg ${conflictValidation.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                    {conflictValidation.success ? (
                                        <>
                                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm">
                                                <p className="text-green-800 font-medium">Schedule available</p>
                                                {conflictValidation.end_time && <p className="text-green-700 text-xs mt-1">End time: {conflictValidation.end_time}</p>}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm">
                                                <p className="text-red-800 font-medium">Conflict detected</p>
                                                <p className="text-red-700 text-xs mt-1">{conflictValidation.error}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={conflictValidation == null || !conflictValidation.success}>
                                {editingId ? 'Update Schedule' : 'Add Schedule'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Timetable Section – same layout as STTO: table + summary */}
            <Card className="border border-slate-200 shadow-md">
                <CardHeader className="bg-gradient-to-r from-[#0f2044] to-[#1a3a5c] text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-6 h-6" />
                        Scheduled Lectures ({sortedSchedules.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {loading ? (
                        <p className="text-center py-8">Loading schedules...</p>
                    ) : sortedSchedules.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500">No schedules created yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Course</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Lecturer</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Level</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Class</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Venue</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Day</th>
                                        <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Time</th>
                                        <th className="text-right py-3 px-4 font-semibold text-[#0f2044]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedSchedules.map((schedule) => {
                                        const scheduleLevel = groups.find((g: any) => g.group_id === schedule.class_group_id)?.level;
                                        return (
                                        <tr key={schedule.schedule_id} className="border-b border-slate-200 hover:bg-slate-50">
                                            <td className="px-4 py-3 text-slate-900 font-medium">{schedule.course_name ?? '—'}</td>
                                            <td className="px-4 py-3 text-slate-900">{schedule.lecturer_name ?? '—'}</td>
                                            <td className="px-4 py-3 text-slate-900">{scheduleLevel != null ? scheduleLevel : '—'}</td>
                                            <td className="px-4 py-3 text-slate-900">{schedule.group_name ?? '—'}</td>
                                            <td className="px-4 py-3 text-slate-900">{schedule.venue_name ?? '—'}</td>
                                            <td className="px-4 py-3 text-slate-900">
                                                {formatDay(schedule.day_of_week)}
                                            </td>
                                            <td className="px-4 py-3 text-slate-900">{schedule.start_time} – {schedule.end_time}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <Button size="sm" variant="outline" onClick={() => handleEdit(schedule)} title="Edit">
                                                        <Edit2 className="size-4" />
                                                    </Button>
                                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(schedule.schedule_id || 0)} title="Delete">
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
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

            {/* Finalize & Publish – only completed schedules (Level + Group) in dropdowns; then Approve/Reject popup */}
            {sortedSchedules.length > 0 && (
                <Card className="border border-slate-200 shadow-md">
                    <CardHeader className="bg-gradient-to-r from-[#0f2044] to-[#1a3a5c] text-white rounded-t-lg">
                        <CardTitle className="flex items-center gap-2">
                            <Send className="w-6 h-6" />
                            Finalize & Publish
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <p className="text-sm text-slate-600">
                            Select the level and group you intend to publish the timetable for. Only completed schedules (no pending course) appear below.
                        </p>
                        {completeGroupsList.length === 0 ? (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-sm font-medium text-amber-800">No completed schedule yet</p>
                                <p className="text-sm text-amber-700 mt-1">Complete all required courses for at least one group so it appears below. Then you can publish.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                    <div className="px-3 py-2 border border-slate-200 rounded-md bg-slate-50 text-slate-700">{departmentName}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                                    <select
                                        value={publishLevel}
                                        onChange={(e) => { setPublishLevel(e.target.value); setPublishGroupId(''); }}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
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
                                        <option value="">Select group</option>
                                        {publishGroupOptions.map((g) => (
                                            <option key={g.groupId} value={g.groupId}>{g.groupName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                        {(activeSemester as any)?.timetable_status === 'published' && (
                            <p className="text-sm text-green-700 font-medium">Timetable is live on the landing page. You can re-publish after changes.</p>
                        )}
                        <Button
                            type="button"
                            onClick={() => setShowApproveModal(true)}
                            disabled={completeGroupsList.length === 0 || !publishGroupId}
                            className="bg-[#0f2044] text-white hover:bg-[#1a3a5c] disabled:opacity-50 disabled:pointer-events-none"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            {(activeSemester as any)?.timetable_status === 'published' ? 'Update & Re-publish to Landing Page' : 'Publish Timetable'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{(activeSemester as any)?.timetable_status === 'published' ? 'Re-publish Timetable' : 'Publish Timetable'}</DialogTitle>
                        <DialogDescription>
                            {(activeSemester as any)?.timetable_status === 'published'
                                ? `Re-publish the timetable for ${activeSemester?.name || 'this semester'} so the student landing page shows your latest changes.`
                                : `Publish the timetable for ${activeSemester?.name || 'this semester'}. Students will see their schedule on the landing page when they select their department, level and group.`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <p className="text-sm text-slate-700">
                            <span className="font-medium">{sortedSchedules.length}</span> schedule entries will be {(activeSemester as any)?.timetable_status === 'published' ? 'updated and re-' : ''}published. Approve to go live; Reject to stay in the editor.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowApproveModal(false)} disabled={approving}>Reject</Button>
                        <Button
                            type="button"
                            onClick={async () => {
                                const semesterId = activeSemester?.semester_id ?? (activeSemester as any)?.id;
                                if (!semesterId) {
                                    toast.error('No active semester selected.');
                                    return;
                                }
                                setApproving(true);
                                try {
                                    const res = await (api as any).updateSemester(semesterId, { timetable_status: 'published' }) as any;
                                    if (res?.success) {
                                        toast.success((activeSemester as any)?.timetable_status === 'published'
                                            ? 'Timetable re-published. Students will see the update on the landing page.'
                                            : 'Timetable published. Students can view their schedule by selecting department, level and group on the landing page.');
                                        setShowApproveModal(false);
                                        setSelectedSemester((prev: any) => prev ? { ...prev, timetable_status: 'published' } : null);
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
                            {approving ? <><Clock className="w-4 h-4 mr-2 animate-spin" />{(activeSemester as any)?.timetable_status === 'published' ? 'Updating…' : 'Publishing…'}</> : 'Approve'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
