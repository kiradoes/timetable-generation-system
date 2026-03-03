-- =============================================
-- SEED INITIAL DATA
-- =============================================

-- Insert default departments
INSERT INTO departments (name, status) VALUES
('Computer Science', 'active'),
('Software Engineering', 'active'),
('Information Technology', 'active'),
('Information Systems', 'active'),
('Cyber Security', 'active')
ON CONFLICT (name) DO NOTHING;

-- Insert default session (2025-2026)
INSERT INTO sessions (name, start_date, end_date, status, is_current) VALUES
('2025-2026', '2025-09-01', '2026-07-31', 'active', true)
ON CONFLICT (name) DO NOTHING;

-- Insert semesters for current session
INSERT INTO semesters (session_id, name, start_date, end_date, status, timetable_status)
SELECT 
  s.session_id,
  sem.name,
  sem.start_date,
  sem.end_date,
  'active',
  'approved'
FROM sessions s
CROSS JOIN (
  VALUES 
    ('First Semester', '2025-09-01'::date, '2025-12-20'::date),
    ('Second Semester', '2026-01-12'::date, '2026-07-31'::date)
) AS sem(name, start_date, end_date)
WHERE s.is_current = true
ON CONFLICT (session_id, name) DO NOTHING;

-- Insert time slots (7 AM - 6 PM, 1-hour slots)
INSERT INTO time_slots (day_of_week, start_time, end_time, slot_name, is_active) VALUES
('Monday', '07:00:00', '08:00:00', '7:00 AM - 8:00 AM', true),
('Monday', '08:00:00', '09:00:00', '8:00 AM - 9:00 AM', true),
('Monday', '09:00:00', '10:00:00', '9:00 AM - 10:00 AM', true),
('Monday', '10:00:00', '11:00:00', '10:00 AM - 11:00 AM', true),
('Monday', '11:00:00', '12:00:00', '11:00 AM - 12:00 PM', true),
('Monday', '12:00:00', '13:00:00', '12:00 PM - 1:00 PM', true),
('Monday', '13:00:00', '14:00:00', '1:00 PM - 2:00 PM', true),
('Monday', '14:00:00', '15:00:00', '2:00 PM - 3:00 PM', true),
('Monday', '15:00:00', '16:00:00', '3:00 PM - 4:00 PM', true),
('Monday', '16:00:00', '17:00:00', '4:00 PM - 5:00 PM', true),
('Monday', '17:00:00', '18:00:00', '5:00 PM - 6:00 PM', true),
('Tuesday', '07:00:00', '08:00:00', '7:00 AM - 8:00 AM', true),
('Tuesday', '08:00:00', '09:00:00', '8:00 AM - 9:00 AM', true),
('Tuesday', '09:00:00', '10:00:00', '9:00 AM - 10:00 AM', true),
('Tuesday', '10:00:00', '11:00:00', '10:00 AM - 11:00 AM', true),
('Tuesday', '11:00:00', '12:00:00', '11:00 AM - 12:00 PM', true),
('Tuesday', '12:00:00', '13:00:00', '12:00 PM - 1:00 PM', true),
('Tuesday', '13:00:00', '14:00:00', '1:00 PM - 2:00 PM', true),
('Tuesday', '14:00:00', '15:00:00', '2:00 PM - 3:00 PM', true),
('Tuesday', '15:00:00', '16:00:00', '3:00 PM - 4:00 PM', true),
('Tuesday', '16:00:00', '17:00:00', '4:00 PM - 5:00 PM', true),
('Tuesday', '17:00:00', '18:00:00', '5:00 PM - 6:00 PM', true),
('Wednesday', '07:00:00', '08:00:00', '7:00 AM - 8:00 AM', true),
('Wednesday', '08:00:00', '09:00:00', '8:00 AM - 9:00 AM', true),
('Wednesday', '09:00:00', '10:00:00', '9:00 AM - 10:00 AM', true),
('Wednesday', '12:00:00', '13:00:00', '12:00 PM - 1:00 PM', true),
('Wednesday', '13:00:00', '14:00:00', '1:00 PM - 2:00 PM', true),
('Wednesday', '14:00:00', '15:00:00', '2:00 PM - 3:00 PM', true),
('Wednesday', '15:00:00', '16:00:00', '3:00 PM - 4:00 PM', true),
('Wednesday', '16:00:00', '17:00:00', '4:00 PM - 5:00 PM', true),
('Wednesday', '17:00:00', '18:00:00', '5:00 PM - 6:00 PM', true),
('Thursday', '07:00:00', '08:00:00', '7:00 AM - 8:00 AM', true),
('Thursday', '08:00:00', '09:00:00', '8:00 AM - 9:00 AM', true),
('Thursday', '09:00:00', '10:00:00', '9:00 AM - 10:00 AM', true),
('Thursday', '10:00:00', '11:00:00', '10:00 AM - 11:00 AM', true),
('Thursday', '11:00:00', '12:00:00', '11:00 AM - 12:00 PM', true),
('Thursday', '12:00:00', '13:00:00', '12:00 PM - 1:00 PM', true),
('Thursday', '13:00:00', '14:00:00', '1:00 PM - 2:00 PM', true),
('Thursday', '14:00:00', '15:00:00', '2:00 PM - 3:00 PM', true),
('Thursday', '15:00:00', '16:00:00', '3:00 PM - 4:00 PM', true),
('Thursday', '16:00:00', '17:00:00', '4:00 PM - 5:00 PM', true),
('Thursday', '17:00:00', '18:00:00', '5:00 PM - 6:00 PM', true),
('Friday', '07:00:00', '08:00:00', '7:00 AM - 8:00 AM', true),
('Friday', '08:00:00', '09:00:00', '8:00 AM - 9:00 AM', true),
('Friday', '09:00:00', '10:00:00', '9:00 AM - 10:00 AM', true),
('Friday', '10:00:00', '11:00:00', '10:00 AM - 11:00 AM', true),
('Friday', '11:00:00', '12:00:00', '11:00 AM - 12:00 PM', true),
('Friday', '12:00:00', '13:00:00', '12:00 PM - 1:00 PM', true),
('Friday', '13:00:00', '14:00:00', '1:00 PM - 2:00 PM', true),
('Friday', '14:00:00', '15:00:00', '2:00 PM - 3:00 PM', true),
('Friday', '15:00:00', '16:00:00', '3:00 PM - 4:00 PM', true),
('Friday', '16:00:00', '17:00:00', '4:00 PM - 5:00 PM', true),
('Friday', '17:00:00', '18:00:00', '5:00 PM - 6:00 PM', true)
ON CONFLICT (day_of_week, start_time, end_time) DO NOTHING;

-- Special events: Chapel Wednesday 9-10, Break 1-2 PM only (all days). Level 400 set in later migration.
INSERT INTO special_events (event_type, day_of_week, start_time, end_time, event_name, description, session_id, is_active)
SELECT 'chapel'::special_event_type_enum, 'Wednesday'::special_event_day_enum, '09:00:00'::time, '10:00:00'::time, 'University Chapel', 'Level 400. University Chapel', session_id, true
FROM sessions WHERE is_current = true;
INSERT INTO special_events (event_type, day_of_week, start_time, end_time, event_name, description, session_id, is_active)
SELECT 'lunch'::special_event_type_enum, 'All'::special_event_day_enum, '13:00:00'::time, '14:00:00'::time, 'Break', 'Break 1-2 PM - no classes', session_id, true
FROM sessions WHERE is_current = true;

-- Insert sample venues
INSERT INTO venues (name, building, capacity, type, status) VALUES
('Lab A1', 'Computer Building', 45, 'Laboratory', 'available'),
('Lab A2', 'Computer Building', 45, 'Laboratory', 'available'),
('Room 101', 'Science Block', 60, 'Lecture room', 'available'),
('Room 102', 'Science Block', 60, 'Lecture room', 'available'),
('Room 103', 'Science Block', 80, 'Lecture room', 'available'),
('Room 201', 'Main Building', 100, 'Lecture room', 'available'),
('Room 202', 'Main Building', 100, 'Lecture room', 'available')
ON CONFLICT (name) DO NOTHING;
