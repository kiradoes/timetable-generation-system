/**
 * Comprehensive Type Definitions for the Timetable Generation System
 * 
 * This file defines all core types used throughout the application.
 * All API requests must use Supabase (via /src/services/api.js), not direct fetch calls.
 * 
 * Usage in Components:
 * ```tsx
 * import api from '../services/api';
 * import type { Session, Course, Lecturer } from '../types';
 * 
 * // ✅ CORRECT - Use API service
 * const response = await api.getSessions({ status: 'active' });
 * 
 * // ❌ INCORRECT - Don't use direct fetch
 * const response = await fetch('http://localhost:5000/api/sessions');
 * ```
 */

// =====================================================
// API RESPONSE TYPES
// =====================================================

/**
 * Standard API response wrapper for all Supabase operations
 * @template T The type of data being returned
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string | null;
    details?: any; // Additional error details
}

// =====================================================
// CORE DOMAIN TYPES
// =====================================================

export interface Session {
    session_id: number;
    name: string;
    start_date: string; // YYYY-MM-DD
    end_date: string; // YYYY-MM-DD
    status: 'active' | 'inactive' | 'ended';
    is_current?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Semester {
    semester_id: number;
    session_id: number;
    name: string;
    start_date: string; // YYYY-MM-DD
    end_date: string; // YYYY-MM-DD
    status: 'active' | 'completed' | 'inactive';
    timetable_status?: 'approved' | 'published';
    created_at?: string;
    updated_at?: string;
}

export interface Department {
    department_id: number;
    name: string;
    status: 'active' | 'inactive';
    created_by?: number;
    updated_by?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Officer {
    officer_id: number;
    auth_user_id: string; // UUID from Supabase Auth
    full_name: string;
    email: string;
    role: 'school-officer' | 'department-officer';
    department: string;
    status: 'active' | 'inactive';
    created_at?: string;
    updated_at?: string;
    last_login?: string;
}

export interface Lecturer {
    lecturer_id: number;
    name: string;
    email: string;
    department: string;
    qualification?: string;
    status: 'active' | 'inactive' | 'on-leave';
    created_at?: string;
    updated_at?: string;
}

export interface Course {
    course_id: number;
    code: string;
    title: string;
    department: string;
    credits: number;
    category: 'GEDS' | 'SAT' | 'Computing' | 'Core' | 'Elective';
    semester?: 'First' | 'Second' | 'Both';
    expected_students?: number;
    status: 'active' | 'inactive';
    created_at?: string;
    updated_at?: string;
}

export interface Venue {
    venue_id: number;
    name: string;
    building?: string;
    floor?: number;
    capacity: number;
    type: 'Lecture room' | 'Laboratory';
    status: 'available' | 'unavailable';
    created_at?: string;
    updated_at?: string;
}

export interface ClassGroup {
    group_id: number;
    name: string;
    level: number;
    department: string;
    student_count: number;
    session_id: number;
    status: 'active' | 'inactive';
    created_at?: string;
    updated_at?: string;
}

export interface TimeSlot {
    slot_id: number;
    day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
    start_time: string; // HH:MM
    end_time: string; // HH:MM
    slot_name?: string;
    is_active: boolean;
    created_at?: string;
}

export interface SpecialEvent {
    event_id: number;
    event_type: 'chapel' | 'seminar' | 'lunch';
    day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'All';
    start_time: string; // HH:MM or HH:MM:SS
    end_time: string;
    event_name?: string;
    description?: string;
    session_id: number;
    level?: number | null; // 100,200,300,400; null = all levels
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Schedule {
    schedule_id: number;
    timetable_id: number;
    course_id: number;
    lecturer_id: number;
    class_group_id?: number;
    venue_id: number;
    day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
    start_time: string; // HH:MM
    end_time: string; // HH:MM
    status: 'scheduled' | 'cancelled' | 'rescheduled';
    created_at?: string;
    updated_at?: string;
}

export interface Timetable {
    timetable_id: number;
    semester_id: number;
    status: 'draft' | 'pending' | 'approved' | 'published' | 'archived';
    created_by: number;
    approved_by?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Conflict {
    conflict_id: number;
    timetable_id: number;
    conflict_type: 'lecturer_conflict' | 'venue_conflict' | 'capacity_conflict' | 'time_constraint';
    severity: 'high' | 'medium' | 'low';
    description: string;
    status: 'unresolved' | 'resolved' | 'ignored';
    resolved_by?: number;
    created_at?: string;
    updated_at?: string;
}

export interface LecturerPreference {
    preference_id: number;
    lecturer_id: number;
    day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
    time_slot?: string;
    availability: 'preferred' | 'acceptable' | 'avoid';
    created_at?: string;
    updated_at?: string;
}

// =====================================================
// FORM DATA TYPES
// =====================================================

export interface CreateSessionForm {
    name: string;
    start_date: string; // YYYY-MM-DD
    end_date: string; // YYYY-MM-DD
    status?: 'active' | 'inactive';
}

export interface CreateCourseForm {
    code: string;
    title: string;
    department: string;
    credits: number;
    category: 'GEDS' | 'SAT' | 'Computing' | 'Core' | 'Elective';
    semester?: 'First' | 'Second' | 'Both';
    expected_students?: number;
}

export interface CreateLecturerForm {
    name: string;
    email: string;
    department: string;
    qualification?: string;
}

export interface CreateVenueForm {
    name: string;
    building?: string;
    floor?: number;
    capacity: number;
    type: 'Lecture room' | 'Laboratory';
}

export interface CreateClassGroupForm {
    name: string;
    level: number;
    department: string;
    student_count?: number;
}

export interface CreateSpecialEventForm {
    event_type: 'chapel' | 'seminar' | 'lunch';
    day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'All';
    start_time: string; // HH:MM
    end_time: string; // HH:MM
    event_name?: string;
    description?: string;
}

// =====================================================
// DASHBOARD DATA TYPES
// =====================================================

export interface DashboardStats {
    total_sessions: number;
    active_sessions: number;
    total_courses: number;
    total_lecturers: number;
    total_venues: number;
    pending_approvals: number;
    active_conflicts: number;
}

export interface SchoolOfficerDashboard {
    stats: DashboardStats;
    recent_timetables: Timetable[];
    pending_approvals: any[];
    active_conflicts: Conflict[];
}

export interface DepartmentOfficerDashboard {
    department: Department;
    courses: Course[];
    lecturers: Lecturer[];
    class_groups: ClassGroup[];
    recent_schedules: Schedule[];
}

// =====================================================
// API SERVICE REFERENCE
// =====================================================

/**
 * COMPLETE API SERVICE METHODS
 *
 * All methods are available on the `api` object imported from '../services/api'
 *
 * Authentication:
 * - login(email, password)
 * - logout()
 * - getCurrentUser()
 * - getProfile()
 *
 * Sessions:
 * - getSessions(params?)
 * - getSessionById(id)
 * - getCurrentSession()
 * - createSession(data)
 * - updateSession(id, data)
 * - deleteSession(id)
 * - setCurrentSession(id)
 *
 * Departments:
 * - getDepartments(params?)
 * - getDepartmentById(id)
 * - createDepartment(data)
 * - updateDepartment(id, data)
 * - deleteDepartment(id)
 * - getActiveDepartments()
 *
 * Officers:
 * - getOfficers(params?)
 * - getOfficerById(id)
 * - createOfficer(data)
 * - updateOfficer(id, data)
 * - deleteOfficer(id)
 *
 * Courses:
 * - getCourses(params?)
 * - getCourseById(id)
 * - createCourse(data)
 * - updateCourse(id, data)
 * - deleteCourse(id)
 * - getNonComputingCourses(params?)
 * - createNonComputingCourse(data)
 * - updateNonComputingCourse(id, data)
 * - deleteNonComputingCourse(id)
 *
 * Lecturers:
 * - getLecturers(params?)
 * - getLecturerById(id)
 * - createLecturer(data)
 * - updateLecturer(id, data)
 * - deleteLecturer(id)
 * - createLecturerPreference(data)
 * - updateLecturerPreference(id, data)
 * - deleteLecturerPreference(id)
 *
 * Venues:
 * - getVenues(params?)
 * - getVenueById(id)
 * - getAvailableVenues(params?)
 * - createVenue(data)
 * - updateVenue(id, data)
 * - deleteVenue(id)
 * - getVenueTypes()
 *
 * Class Groups:
 * - getClassGroups(params?)
 * - getClassGroupById(id)
 * - createClassGroup(data)
 * - updateClassGroup(id, data)
 * - deleteClassGroup(id)
 *
 * Special Events:
 * - getSpecialEvents(params?)
 * - getSpecialEventById(id)
 * - createSpecialEvent(data)
 * - updateSpecialEvent(id, data)
 * - deleteSpecialEvent(id)
 */

// =====================================================
// CORRECT USAGE PATTERNS
// =====================================================

/**
 * PATTERN 1: Fetching data
 * 
 * ✅ CORRECT:
 * const response = await api.getCourses({ department: 'Computer Science' });
 * if (response.success) {
 *   const courses = response.data;
 * } else {
 *   console.error(response.error);
 * }
 * 
 * ❌ INCORRECT:
 * const response = await fetch('/api/courses?department=Computer Science');
 * const data = await response.json();
 */

/**
 * PATTERN 2: Creating data
 * 
 * ✅ CORRECT:
 * const response = await api.createSession({
 *   name: '2024-2025',
 *   start_date: '2024-09-01',
 *   end_date: '2025-05-30'
 * });
 * 
 * ❌ INCORRECT:
 * const response = await fetch('/api/sessions', {
 *   method: 'POST',
 *   headers: { 'Authorization': `Bearer ${token}` },
 *   body: JSON.stringify({ ... })
 * });
 */

/**
 * PATTERN 3: Updating data
 * 
 * ✅ CORRECT:
 * const response = await api.updateCourse(courseId, {
 *   title: 'New Title',
 *   expected_students: 50
 * });
 * 
 * ❌ INCORRECT:
 * const response = await fetch(`/api/courses/${courseId}`, {
 *   method: 'PUT',
 *   ...
 * });
 */

/**
 * PATTERN 4: Deleting data
 * 
 * ✅ CORRECT:
 * const response = await api.deleteVenue(venueId);
 * 
 * ❌ INCORRECT:
 * const response = await fetch(`/api/venues/${venueId}`, {
 *   method: 'DELETE',
 *   ...
 * });
 */

/**
 * PATTERN 5: Error handling in components
 * 
 * ✅ CORRECT:
 * try {
 *   const response = await api.getSessions({});
 *   if (response.success) {
 *     setSessions(response.data);
 *   } else {
 *     toast.error(response.error || 'Failed to load sessions');
 *     console.error('Error details:', response.details);
 *   }
 * } catch (error) {
 *   toast.error('Unexpected error');
 *   console.error(error);
 * }
 * 
 * ❌ INCORRECT:
 * const data = await response.json();
 * if (data.ok) { ... } // Response structure is different!
 */
