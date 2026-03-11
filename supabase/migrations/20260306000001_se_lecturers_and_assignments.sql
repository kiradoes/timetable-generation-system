-- =============================================
-- Software Engineering: Assign lecturers to courses per official list
-- (SENG402 -> Adegbola Adesoji, SENG412 -> Idowu Sunday, SENG490 -> EWEOYA LEUKUN Onaolapo,
--  SENG414/SENG404 -> ADENIYI OLUWABAMISE, SENG406 -> BASHWIRA-IDOWU EMMANUE, etc.)
-- Also add missing lecturers (BANKOLE OLORUNTOBI, ABIOYE Funke Victoria, Eregare Emmanuel)
-- and fix names to match (EWEOYA LEUKUN, BASHWIRA-IDOWU EMMANUE).
-- =============================================

-- Fix lecturer names to match official list
UPDATE lecturers SET first_name = 'EWEOYA LEUKUN', last_name = 'Onaolapo', name = 'EWEOYA LEUKUN Onaolapo'
WHERE department = 'Software Engineering' AND (name ILIKE 'EWEOYA%Onaolapo' OR email = 'eweoya.ibukun@se.example.com');

UPDATE lecturers SET last_name = 'EMMANUE', name = 'BASHWIRA-IDOWU EMMANUE'
WHERE department = 'Software Engineering' AND (name ILIKE 'BASHWIRA-IDOWU%' OR email = 'bashwira.idowu@se.example.com');

-- Add missing lecturers (Software Engineering / GEDS)
INSERT INTO lecturers (first_name, last_name, name, email, department, session_id, title, status)
SELECT 'BANKOLE', 'OLORUNTOBI', 'BANKOLE OLORUNTOBI', 'bankole.oloruntobi@se.example.com', 'Software Engineering', s.session_id, 'Lecturer', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1
ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, name = EXCLUDED.name;

INSERT INTO lecturers (first_name, last_name, name, email, department, session_id, title, status)
SELECT 'ABIOYE', 'Funke Victoria', 'ABIOYE Funke Victoria', 'abioye.funke@babcock.edu.ng', 'Software Engineering', s.session_id, 'Lecturer', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1
ON CONFLICT (email) DO NOTHING;

INSERT INTO lecturers (first_name, last_name, name, email, department, session_id, title, status)
SELECT 'Eregare', 'Emmanuel', 'Eregare Emmanuel', 'eregare.emmanuel@babcock.edu.ng', 'Software Engineering', s.session_id, 'Lecturer', 'active'
FROM sessions s WHERE s.is_current = true LIMIT 1
ON CONFLICT (email) DO NOTHING;

-- Assign lecturers to courses by updating schedules (only when lecturer exists to avoid null lecturer_id)
-- Official list (verified against seed lecturers):
--   SENG402 -> Adegbola Adesoji   | SENG412 -> Idowu Sunday
--   SENG490 -> EWEOYA LEUKUN Onaolapo | SENG414 -> ADENIYI OLUWABAMISE
--   SENG404 -> ADENIYI OLUWABAMISE | SENG406 -> BASHWIRA-IDOWU EMMANUE
--   SENG408 -> Mrs. Okesola       | COSC408 -> BANKOLE OLORUNTOBI
-- SENG402 -> Adegbola Adesoji
UPDATE schedules
SET lecturer_id = l.lecturer_id
FROM courses c, lecturers l
WHERE schedules.course_id = c.course_id AND c.department = 'Software Engineering' AND c.course_code = 'SENG402'
  AND l.department = 'Software Engineering' AND l.name ILIKE 'Adegbola%Adesoji';

-- SENG412 -> Idowu Sunday
UPDATE schedules
SET lecturer_id = l.lecturer_id
FROM courses c, lecturers l
WHERE schedules.course_id = c.course_id AND c.department = 'Software Engineering' AND c.course_code = 'SENG412'
  AND l.department = 'Software Engineering' AND l.name ILIKE 'Idowu%Sunday';

-- SENG490 -> EWEOYA LEUKUN Onaolapo (name fixed above to EWEOYA LEUKUN Onaolapo)
UPDATE schedules
SET lecturer_id = l.lecturer_id
FROM courses c, lecturers l
WHERE schedules.course_id = c.course_id AND c.department = 'Software Engineering' AND c.course_code = 'SENG490'
  AND l.department = 'Software Engineering' AND (l.name ILIKE 'EWEOYA%Onaolapo' OR l.email = 'eweoya.ibukun@se.example.com');

-- SENG414 -> ADENIYI OLUWABAMISE
UPDATE schedules
SET lecturer_id = l.lecturer_id
FROM courses c, lecturers l
WHERE schedules.course_id = c.course_id AND c.department = 'Software Engineering' AND c.course_code = 'SENG414'
  AND l.department = 'Software Engineering' AND l.name ILIKE 'ADENIYI%OLUWABAMISE';

-- SENG404 -> ADENIYI OLUWABAMISE
UPDATE schedules
SET lecturer_id = l.lecturer_id
FROM courses c, lecturers l
WHERE schedules.course_id = c.course_id AND c.department = 'Software Engineering' AND c.course_code = 'SENG404'
  AND l.department = 'Software Engineering' AND l.name ILIKE 'ADENIYI%OLUWABAMISE';

-- SENG406 -> BASHWIRA-IDOWU EMMANUE (name fixed above)
UPDATE schedules
SET lecturer_id = l.lecturer_id
FROM courses c, lecturers l
WHERE schedules.course_id = c.course_id AND c.department = 'Software Engineering' AND c.course_code = 'SENG406'
  AND l.department = 'Software Engineering' AND (l.name ILIKE 'BASHWIRA-IDOWU%' OR l.email = 'bashwira.idowu@se.example.com');

-- SENG408 -> Mrs. Okesola (elective)
UPDATE schedules
SET lecturer_id = l.lecturer_id
FROM courses c, lecturers l
WHERE schedules.course_id = c.course_id AND c.department = 'Software Engineering' AND c.course_code = 'SENG408'
  AND l.department = 'Software Engineering' AND l.name ILIKE 'Mrs.%Okesola';

-- COSC408 -> BANKOLE OLORUNTOBI (only if lecturer exists)
UPDATE schedules
SET lecturer_id = l.lecturer_id
FROM courses c, lecturers l
WHERE schedules.course_id = c.course_id AND c.department = 'Software Engineering' AND c.course_code = 'COSC408'
  AND l.department = 'Software Engineering' AND l.name ILIKE 'BANKOLE%OLORUNTOBI';
