-- =============================================
-- Software Engineering: Courses, Lecturers, Lecturer Preferences, Class Groups
-- =============================================

-- ---------- Software Engineering: Lecturers (current session) ----------
INSERT INTO lecturers (first_name, last_name, name, email, department, session_id, title, status)
SELECT 'Idowu', 'Sunday', 'Idowu Sunday', 'idowu.sunday@se.example.com', 'Software Engineering', s.session_id, 'Lecturer', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1 ON CONFLICT (email) DO NOTHING;

INSERT INTO lecturers (first_name, last_name, name, email, department, session_id, title, status)
SELECT 'EWEOYA IBUKUN', 'Onaolapo', 'EWEOYA IBUKUN Onaolapo', 'eweoya.ibukun@se.example.com', 'Software Engineering', s.session_id, 'Lecturer', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1 ON CONFLICT (email) DO NOTHING;

INSERT INTO lecturers (first_name, last_name, name, email, department, session_id, title, status)
SELECT 'ADENIYI', 'OLUWABAMISE', 'ADENIYI OLUWABAMISE', 'adeniyi.oluwabamise@se.example.com', 'Software Engineering', s.session_id, 'Lecturer', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1 ON CONFLICT (email) DO NOTHING;

INSERT INTO lecturers (first_name, last_name, name, email, department, session_id, title, status)
SELECT 'BASHWIRA-IDOWU', 'EMMANUELLA', 'BASHWIRA-IDOWU EMMANUELLA', 'bashwira.idowu@se.example.com', 'Software Engineering', s.session_id, 'Lecturer', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1 ON CONFLICT (email) DO NOTHING;

INSERT INTO lecturers (first_name, last_name, name, email, department, session_id, title, status)
SELECT 'Mgbeahuruike', 'Emmanuel Oluchukwu', 'Mgbeahuruike Emmanuel Oluchukwu', 'mgbeahuruike.emmanuel@se.example.com', 'Software Engineering', s.session_id, 'Lecturer', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1 ON CONFLICT (email) DO NOTHING;

INSERT INTO lecturers (first_name, last_name, name, email, department, session_id, title, status)
SELECT 'Adegbola', 'Adesoji', 'Adegbola Adesoji', 'adegbola.adesoji@se.example.com', 'Software Engineering', s.session_id, 'Lecturer', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1 ON CONFLICT (email) DO NOTHING;

-- ---------- Software Engineering: Courses (current session) ----------
INSERT INTO courses (course_code, title, credit_units, category, department, session_id, level, semester, status)
SELECT 'SENG412', 'Internet Technologies and Web Applications Development', 3, 'Computing', 'Software Engineering', s.session_id, 400, 'First', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1 ON CONFLICT (course_code, session_id) DO NOTHING;

INSERT INTO courses (course_code, title, credit_units, category, department, session_id, level, semester, status)
SELECT 'SENG490', 'Research Project', 6, 'Computing', 'Software Engineering', s.session_id, 400, 'First', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1 ON CONFLICT (course_code, session_id) DO NOTHING;

INSERT INTO courses (course_code, title, credit_units, category, department, session_id, level, semester, status)
SELECT 'SENG414', 'Cloud Computing Technologies', 2, 'Elective', 'Software Engineering', s.session_id, 400, 'First', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1 ON CONFLICT (course_code, session_id) DO NOTHING;

INSERT INTO courses (course_code, title, credit_units, category, department, session_id, level, semester, status)
SELECT 'SENG404', 'Human Computer Interaction and Emerging Technologies', 3, 'Computing', 'Software Engineering', s.session_id, 400, 'First', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1 ON CONFLICT (course_code, session_id) DO NOTHING;

INSERT INTO courses (course_code, title, credit_units, category, department, session_id, level, semester, status)
SELECT 'SENG406', 'Formal Methods Specifications in Software Engineering', 3, 'Computing', 'Software Engineering', s.session_id, 400, 'First', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1 ON CONFLICT (course_code, session_id) DO NOTHING;

INSERT INTO courses (course_code, title, credit_units, category, department, session_id, level, semester, status)
SELECT 'SENG402', 'Software Quality Engineering and Testing', 3, 'Computing', 'Software Engineering', s.session_id, 400, 'First', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1 ON CONFLICT (course_code, session_id) DO NOTHING;

-- ---------- Lecturer preferences: default profile so each lecturer appears in Lecturer Preferences ----------
-- Structure supports unavailable_days and unavailable_times; department officer sets these so lecturers are not scheduled against their will.
UPDATE lecturers
SET preferences = '{"preferences":"","preferred_times":[],"unavailable_days":[],"unavailable_times":[]}'
WHERE department = 'Software Engineering'
  AND (preferences IS NULL OR preferences = '');

-- ---------- Software Engineering: Class groups (400 level so courses can be scheduled) ----------
INSERT INTO class_groups (name, level, department, student_count, session_id, status)
SELECT 'A', 400, 'Software Engineering', 35, s.session_id, 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1 ON CONFLICT (name, department, session_id) DO NOTHING;

INSERT INTO class_groups (name, level, department, student_count, session_id, status)
SELECT 'B', 400, 'Software Engineering', 32, s.session_id, 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1 ON CONFLICT (name, department, session_id) DO NOTHING;
