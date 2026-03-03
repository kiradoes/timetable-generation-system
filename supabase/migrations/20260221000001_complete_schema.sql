-- =============================================
-- Computer-Aided Timetable System - Supabase Schema
-- Version: 1.0.0
-- Date: 2026-02-21
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- ENUM TYPES
-- =============================================

CREATE TYPE role_enum AS ENUM('school-officer', 'department-officer');
CREATE TYPE officer_status_enum AS ENUM('active', 'inactive');
CREATE TYPE session_status_enum AS ENUM('active', 'inactive');
CREATE TYPE semester_status_enum AS ENUM('active', 'completed', 'inactive');
CREATE TYPE semester_timetable_status AS ENUM('approved', 'published');
CREATE TYPE class_group_status_enum AS ENUM('active', 'inactive');
CREATE TYPE timetable_status_enum AS ENUM('draft', 'pending', 'approved', 'published', 'archived');
CREATE TYPE schedule_status_enum AS ENUM('scheduled', 'cancelled', 'rescheduled');
CREATE TYPE venue_type_enum AS ENUM('Lecture room', 'Laboratory');
CREATE TYPE venue_status_enum AS ENUM('available', 'unavailable');
CREATE TYPE conflict_type_enum AS ENUM('lecturer_conflict', 'venue_conflict', 'capacity_conflict', 'time_constraint');
CREATE TYPE conflict_severity_enum AS ENUM('high', 'medium', 'low');
CREATE TYPE conflict_status_enum AS ENUM('unresolved', 'resolved', 'ignored');
CREATE TYPE approval_status_enum AS ENUM('pending', 'approved', 'rejected', 'revision_requested');
CREATE TYPE audit_action_enum AS ENUM('INSERT', 'UPDATE', 'DELETE');
CREATE TYPE day_of_week_enum AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday');
CREATE TYPE course_category_enum AS ENUM('GEDS', 'SAT', 'Computing', 'Core', 'Elective');
CREATE TYPE course_semester_enum AS ENUM('First', 'Second', 'Both');
CREATE TYPE lecturer_status_enum AS ENUM('active', 'inactive', 'on-leave');
CREATE TYPE availability_preference_enum AS ENUM('preferred', 'acceptable', 'avoid');
CREATE TYPE special_event_type_enum AS ENUM('chapel', 'seminar', 'lunch');
CREATE TYPE special_event_day_enum AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'All');
CREATE TYPE setting_data_type_enum AS ENUM('string', 'integer', 'boolean', 'json');

-- =============================================
-- CORE TABLES
-- =============================================

-- Departments
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    status officer_status_enum DEFAULT 'active',
    created_by INTEGER NULL,
    updated_by INTEGER NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_departments_name ON departments(name);
CREATE INDEX idx_departments_status ON departments(status);

-- Officers (synchronized with Supabase Auth)
CREATE TABLE officers (
    officer_id SERIAL PRIMARY KEY,
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role role_enum NOT NULL,
    department VARCHAR(50),
    status officer_status_enum DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX idx_officers_email ON officers(email);
CREATE INDEX idx_officers_auth_user_id ON officers(auth_user_id);
CREATE INDEX idx_officers_department ON officers(department);
CREATE INDEX idx_officers_status ON officers(status);
CREATE INDEX idx_officers_role ON officers(role);

-- Sessions (Academic Years)
CREATE TABLE sessions (
    session_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status session_status_enum DEFAULT 'active',
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_name ON sessions(name);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_current ON sessions(is_current);
CREATE UNIQUE INDEX idx_sessions_current_unique ON sessions(is_current) WHERE is_current = TRUE;

-- Semesters
CREATE TABLE semesters (
    semester_id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status semester_status_enum DEFAULT 'active',
    timetable_status semester_timetable_status DEFAULT 'approved',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

CREATE INDEX idx_semesters_session ON semesters(session_id);
CREATE INDEX idx_semesters_status ON semesters(status);
CREATE UNIQUE INDEX idx_semesters_session_name ON semesters(session_id, name);

-- Lecturers
CREATE TABLE lecturers (
    lecturer_id SERIAL PRIMARY KEY,
    first_name VARCHAR(60) NOT NULL,
    last_name VARCHAR(60) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    department VARCHAR(50) NOT NULL,
    session_id INTEGER NOT NULL,
    title VARCHAR(50),
    status lecturer_status_enum DEFAULT 'active',
    max_classes_per_day INTEGER DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

CREATE INDEX idx_lecturers_department ON lecturers(department);
CREATE INDEX idx_lecturers_session ON lecturers(session_id);
CREATE INDEX idx_lecturers_status ON lecturers(status);
CREATE INDEX idx_lecturers_name ON lecturers(name);

-- Lecturer Availability
CREATE TABLE lecturer_availability (
    availability_id SERIAL PRIMARY KEY,
    lecturer_id INTEGER NOT NULL,
    day_of_week day_of_week_enum NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    preference_level availability_preference_enum DEFAULT 'acceptable',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (lecturer_id) REFERENCES lecturers(lecturer_id) ON DELETE CASCADE
);

CREATE INDEX idx_availability_lecturer ON lecturer_availability(lecturer_id);
CREATE INDEX idx_availability_day ON lecturer_availability(day_of_week);
CREATE UNIQUE INDEX idx_lecturer_time ON lecturer_availability(lecturer_id, day_of_week, start_time, end_time);

-- Courses
CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    credit_units INTEGER NOT NULL DEFAULT 1,
    category course_category_enum NOT NULL,
    department VARCHAR(50),
    session_id INTEGER NOT NULL,
    level INTEGER NOT NULL,
    semester course_semester_enum NOT NULL,
    description TEXT,
    prerequisites TEXT,
    status officer_status_enum DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

CREATE INDEX idx_courses_session ON courses(session_id);
CREATE INDEX idx_courses_department ON courses(department);
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_status ON courses(status);
CREATE UNIQUE INDEX idx_courses_code_session ON courses(course_code, session_id);

-- Venues
CREATE TABLE venues (
    venue_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    building VARCHAR(100),
    capacity INTEGER NOT NULL,
    type venue_type_enum DEFAULT 'Lecture room',
    equipment TEXT,
    status venue_status_enum DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_venues_name ON venues(name);
CREATE INDEX idx_venues_type ON venues(type);
CREATE INDEX idx_venues_status ON venues(status);
CREATE INDEX idx_venues_capacity ON venues(capacity);

-- Class Groups
CREATE TABLE class_groups (
    group_id SERIAL PRIMARY KEY,
    name VARCHAR(10) NOT NULL,
    level INTEGER NOT NULL,
    department VARCHAR(50) NOT NULL,
    student_count INTEGER DEFAULT 0,
    session_id INTEGER NOT NULL,
    status class_group_status_enum DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

CREATE INDEX idx_class_groups_session ON class_groups(session_id);
CREATE INDEX idx_class_groups_department ON class_groups(department);
CREATE INDEX idx_class_groups_level ON class_groups(level);
CREATE INDEX idx_class_groups_status ON class_groups(status);
CREATE UNIQUE INDEX idx_class_groups_unique ON class_groups(name, department, session_id);

-- Time Slots
CREATE TABLE time_slots (
    slot_id SERIAL PRIMARY KEY,
    day_of_week day_of_week_enum NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_name VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_timeslots_day ON time_slots(day_of_week);
CREATE INDEX idx_timeslots_time ON time_slots(start_time, end_time);
CREATE UNIQUE INDEX idx_timeslots_unique ON time_slots(day_of_week, start_time, end_time);

-- Special Events
CREATE TABLE special_events (
    event_id SERIAL PRIMARY KEY,
    event_type special_event_type_enum NOT NULL,
    day_of_week special_event_day_enum NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    event_name VARCHAR(100),
    description TEXT,
    session_id INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

CREATE INDEX idx_special_events_session ON special_events(session_id);
CREATE INDEX idx_special_events_day ON special_events(day_of_week);
CREATE INDEX idx_special_events_type ON special_events(event_type);
CREATE INDEX idx_special_events_active ON special_events(is_active);

-- Timetables
CREATE TABLE timetables (
    timetable_id SERIAL PRIMARY KEY,
    semester_id INTEGER NOT NULL,
    department VARCHAR(50) NOT NULL,
    level INTEGER,
    group_name VARCHAR(10),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status timetable_status_enum DEFAULT 'draft',
    created_by INTEGER NOT NULL,
    approved_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE,
    
    FOREIGN KEY (semester_id) REFERENCES semesters(semester_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES officers(officer_id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES officers(officer_id) ON DELETE SET NULL
);

CREATE INDEX idx_timetables_semester ON timetables(semester_id);
CREATE INDEX idx_timetables_department ON timetables(department);
CREATE INDEX idx_timetables_status ON timetables(status);
CREATE INDEX idx_timetables_level ON timetables(level);

-- Schedules (CORE - Links Everything)
CREATE TABLE schedules (
    schedule_id SERIAL PRIMARY KEY,
    timetable_id INTEGER,
    course_id INTEGER NOT NULL,
    lecturer_id INTEGER NOT NULL,
    venue_id INTEGER NOT NULL,
    slot_id INTEGER NOT NULL,
    session_id INTEGER NOT NULL,
    group_id INTEGER,
    class_size INTEGER DEFAULT 0,
    notes TEXT,
    status schedule_status_enum DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (timetable_id) REFERENCES timetables(timetable_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    FOREIGN KEY (lecturer_id) REFERENCES lecturers(lecturer_id),
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id),
    FOREIGN KEY (slot_id) REFERENCES time_slots(slot_id),
    FOREIGN KEY (group_id) REFERENCES class_groups(group_id),
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

CREATE INDEX idx_schedules_timetable ON schedules(timetable_id);
CREATE INDEX idx_schedules_course ON schedules(course_id);
CREATE INDEX idx_schedules_lecturer ON schedules(lecturer_id);
CREATE INDEX idx_schedules_venue ON schedules(venue_id);
CREATE INDEX idx_schedules_slot ON schedules(slot_id);
CREATE INDEX idx_schedules_group ON schedules(group_id);
CREATE INDEX idx_schedules_session ON schedules(session_id);
CREATE INDEX idx_schedules_lecturer_day ON schedules(lecturer_id, slot_id);
CREATE INDEX idx_schedules_venue_day ON schedules(venue_id, slot_id);

-- Unique constraints (CRITICAL - Prevents conflicts)
CREATE UNIQUE INDEX idx_unique_lecturer_slot ON schedules(lecturer_id, slot_id, session_id) WHERE status = 'scheduled';
CREATE UNIQUE INDEX idx_unique_venue_slot ON schedules(venue_id, slot_id, session_id) WHERE status = 'scheduled';
CREATE UNIQUE INDEX idx_unique_group_slot ON schedules(group_id, slot_id, session_id) WHERE status = 'scheduled';

-- Approvals
CREATE TABLE approvals (
    approval_id SERIAL PRIMARY KEY,
    timetable_id INTEGER NOT NULL,
    submitted_by INTEGER NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INTEGER,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    status approval_status_enum DEFAULT 'pending',
    comments TEXT,
    feedback TEXT,
    
    FOREIGN KEY (timetable_id) REFERENCES timetables(timetable_id) ON DELETE CASCADE,
    FOREIGN KEY (submitted_by) REFERENCES officers(officer_id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES officers(officer_id) ON DELETE SET NULL
);

CREATE INDEX idx_approvals_timetable ON approvals(timetable_id);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_approvals_submitted ON approvals(submitted_at);

-- Conflicts
CREATE TABLE conflicts (
    conflict_id SERIAL PRIMARY KEY,
    timetable_id INTEGER NOT NULL,
    conflict_type conflict_type_enum NOT NULL,
    severity conflict_severity_enum NOT NULL,
    description TEXT NOT NULL,
    affected_schedules JSONB,
    status conflict_status_enum DEFAULT 'unresolved',
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by INTEGER,
    
    FOREIGN KEY (timetable_id) REFERENCES timetables(timetable_id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES officers(officer_id) ON DELETE SET NULL
);

CREATE INDEX idx_conflicts_timetable ON conflicts(timetable_id);
CREATE INDEX idx_conflicts_type ON conflicts(conflict_type);
CREATE INDEX idx_conflicts_status ON conflicts(status);
CREATE INDEX idx_conflicts_severity ON conflicts(severity);

-- Audit Log
CREATE TABLE audit_log (
    log_id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    action audit_action_enum NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by INTEGER,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    FOREIGN KEY (changed_by) REFERENCES officers(officer_id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_table ON audit_log(table_name);
CREATE INDEX idx_audit_record ON audit_log(record_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_timestamp ON audit_log(changed_at);
CREATE INDEX idx_audit_user ON audit_log(changed_by);

-- System Settings
CREATE TABLE system_settings (
    setting_id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    data_type setting_data_type_enum DEFAULT 'string',
    is_public BOOLEAN DEFAULT FALSE,
    updated_by INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (updated_by) REFERENCES officers(officer_id) ON DELETE SET NULL
);

CREATE INDEX idx_settings_key ON system_settings(setting_key);
CREATE INDEX idx_settings_public ON system_settings(is_public);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to sync officer with auth user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role role_enum := 'department-officer';
    v_fullname text := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unnamed Officer');
    v_email text := NEW.email;
BEGIN
    -- Safely attempt to extract and cast role; fall back on default if missing/invalid
    BEGIN
        IF NEW.raw_user_meta_data ? 'role' THEN
            v_role := (NEW.raw_user_meta_data->>'role')::role_enum;
        END IF;
    EXCEPTION WHEN others THEN
        v_role := 'department-officer';
    END;

    INSERT INTO public.officers (auth_user_id, full_name, email, role, status)
    VALUES (
        NEW.id,
        v_fullname,
        v_email,
        v_role,
        'active'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_officers_updated_at ON officers;
CREATE TRIGGER update_officers_updated_at BEFORE UPDATE ON officers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_semesters_updated_at ON semesters;
CREATE TRIGGER update_semesters_updated_at BEFORE UPDATE ON semesters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lecturers_updated_at ON lecturers;
CREATE TRIGGER update_lecturers_updated_at BEFORE UPDATE ON lecturers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_venues_updated_at ON venues;
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_class_groups_updated_at ON class_groups;
CREATE TRIGGER update_class_groups_updated_at BEFORE UPDATE ON class_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_special_events_updated_at ON special_events;
CREATE TRIGGER update_special_events_updated_at BEFORE UPDATE ON special_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_timetables_updated_at ON timetables;
CREATE TRIGGER update_timetables_updated_at BEFORE UPDATE ON timetables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_schedules_updated_at ON schedules;
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
