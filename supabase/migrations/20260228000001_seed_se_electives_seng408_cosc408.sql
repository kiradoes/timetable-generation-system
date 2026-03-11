-- =============================================
-- Software Engineering: Mark SENG414 as Elective + add electives SENG408, COSC408 and lecturers
-- =============================================

-- Ensure Cloud Computing (SENG414) is Elective
UPDATE courses
SET category = 'Elective'
WHERE course_code = 'SENG414' AND department = 'Software Engineering';

-- ---------- Additional SE lecturers for electives ----------
INSERT INTO lecturers (first_name, last_name, name, email, department, session_id, title, status)
SELECT 'Mrs.', 'Okesola', 'Mrs. Okesola', 'mrs.okesola@se.example.com', 'Software Engineering', s.session_id, 'Lecturer', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1 ON CONFLICT (email) DO NOTHING;

INSERT INTO lecturers (first_name, last_name, name, email, department, session_id, title, status)
SELECT 'Dr.', 'Sanusi', 'Dr. Sanusi', 'dr.sanusi@se.example.com', 'Software Engineering', s.session_id, 'Lecturer', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1 ON CONFLICT (email) DO NOTHING;

-- ---------- SE Electives: SENG408, COSC408 ----------
INSERT INTO courses (course_code, title, credit_units, category, department, session_id, level, semester, status)
SELECT 'SENG408', 'Real Time System', 2, 'Elective', 'Software Engineering', s.session_id, 400, 'First', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1 ON CONFLICT (course_code, session_id) DO NOTHING;

INSERT INTO courses (course_code, title, credit_units, category, department, session_id, level, semester, status)
SELECT 'COSC408', 'Modelling and Simulations', 3, 'Elective', 'Software Engineering', s.session_id, 400, 'First', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1 ON CONFLICT (course_code, session_id) DO NOTHING;

-- Default lecturer preferences for new SE lecturers
UPDATE lecturers
SET preferences = '{"preferences":"","preferred_times":[],"unavailable_days":[],"unavailable_times":[]}'
WHERE department = 'Software Engineering'
  AND (preferences IS NULL OR preferences = '')
  AND name IN ('Mrs. Okesola', 'Dr. Sanusi');
