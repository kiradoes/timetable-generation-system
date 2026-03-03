-- =============================================
-- SEED: Lecturers, courses, and class groups for scheduling demo
-- Ensures Schedule Lecture has data to use (one department + current session).
-- =============================================

-- Lecturers for Computer Science (current session)
INSERT INTO lecturers (first_name, last_name, name, email, department, session_id, title, status)
SELECT 'John', 'Doe', 'Dr. John Doe', 'john.doe@cs.example.com', 'Computer Science', s.session_id, 'Senior Lecturer', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1
ON CONFLICT (email) DO NOTHING;

INSERT INTO lecturers (first_name, last_name, name, email, department, session_id, title, status)
SELECT 'Jane', 'Smith', 'Dr. Jane Smith', 'jane.smith@cs.example.com', 'Computer Science', s.session_id, 'Lecturer', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1
ON CONFLICT (email) DO NOTHING;

INSERT INTO lecturers (first_name, last_name, name, email, department, session_id, title, status)
SELECT 'David', 'Okon', 'Dr. David Okon', 'david.okon@cs.example.com', 'Computer Science', s.session_id, 'Professor', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1
ON CONFLICT (email) DO NOTHING;

-- Courses for Computer Science (Core + Elective; current session)
INSERT INTO courses (course_code, title, credit_units, category, department, session_id, level, semester, status)
SELECT 'CSC 101', 'Introduction to Programming', 3, 'Computing', 'Computer Science', s.session_id, 100, 'First', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1
ON CONFLICT (course_code, session_id) DO NOTHING;

INSERT INTO courses (course_code, title, credit_units, category, department, session_id, level, semester, status)
SELECT 'CSC 102', 'Data Structures', 3, 'Computing', 'Computer Science', s.session_id, 100, 'Second', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1
ON CONFLICT (course_code, session_id) DO NOTHING;

INSERT INTO courses (course_code, title, credit_units, category, department, session_id, level, semester, status)
SELECT 'CSC 201', 'Algorithms', 3, 'Computing', 'Computer Science', s.session_id, 200, 'First', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1
ON CONFLICT (course_code, session_id) DO NOTHING;

INSERT INTO courses (course_code, title, credit_units, category, department, session_id, level, semester, status)
SELECT 'CSC 210', 'Machine Learning (Elective)', 3, 'Elective', 'Computer Science', s.session_id, 200, 'First', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1
ON CONFLICT (course_code, session_id) DO NOTHING;

INSERT INTO courses (course_code, title, credit_units, category, department, session_id, level, semester, status)
SELECT 'CSC 211', 'Cloud Computing (Elective)', 3, 'Elective', 'Computer Science', s.session_id, 200, 'First', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1
ON CONFLICT (course_code, session_id) DO NOTHING;

-- Class groups for Computer Science (current session)
INSERT INTO class_groups (name, level, department, student_count, session_id, status)
SELECT 'A', 100, 'Computer Science', 45, s.session_id, 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1
ON CONFLICT (name, department, session_id) DO NOTHING;

INSERT INTO class_groups (name, level, department, student_count, session_id, status)
SELECT 'B', 100, 'Computer Science', 42, s.session_id, 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1
ON CONFLICT (name, department, session_id) DO NOTHING;

INSERT INTO class_groups (name, level, department, student_count, session_id, status)
SELECT 'A', 200, 'Computer Science', 38, s.session_id, 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1
ON CONFLICT (name, department, session_id) DO NOTHING;
