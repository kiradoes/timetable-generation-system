-- =============================================
-- Replace SE 400L Group A schedules with the exact list for STTO/DTTO.
-- Ensures timetable matches Schedule Lecture. No class at 1-2 PM (break).
-- =============================================

-- Remove existing schedules for Software Engineering 400L A (current session)
DELETE FROM schedules
WHERE session_id = (SELECT session_id FROM sessions WHERE is_current = true LIMIT 1)
  AND group_id = (
    SELECT group_id FROM class_groups
    WHERE session_id = (SELECT session_id FROM sessions WHERE is_current = true LIMIT 1)
      AND department = 'Software Engineering' AND name = 'A' AND level = 400
    LIMIT 1
  );

-- Insert the 15 exact schedule rows (slot_id via get_or_create_time_slot for 2-hour slots)
INSERT INTO schedules (session_id, group_id, course_id, lecturer_id, venue_id, slot_id, class_size, status, created_by_role)
WITH session AS (SELECT session_id FROM sessions WHERE is_current = true LIMIT 1),
grp AS (
  SELECT group_id FROM class_groups c
  INNER JOIN session s ON c.session_id = s.session_id
  WHERE c.department = 'Software Engineering' AND c.name = 'A' AND c.level = 400
  LIMIT 1
),
rows AS (
  SELECT 'SENG412' AS course_code, 'Idowu Sunday' AS lecturer_name, 'Bucodel Lab 1' AS venue_name, 'Tuesday' AS day, '12:00' AS start_t, '13:00' AS end_t
  UNION ALL SELECT 'SENG414', 'ADENIYI OLUWABAMISE', 'CIT', 'Monday', '12:00', '13:00'
  UNION ALL SELECT 'SENG404', 'ADENIYI OLUWABAMISE', 'Bucodel Lab 3', 'Wednesday', '15:00', '17:00'
  UNION ALL SELECT 'SENG404', 'ADENIYI OLUWABAMISE', 'Bucodel Lab 1', 'Wednesday', '07:00', '09:00'
  UNION ALL SELECT 'SENG406', 'BASHWIRA-IDOWU EMMANUE', 'CIT', 'Monday', '09:00', '10:00'
  UNION ALL SELECT 'SENG406', 'BASHWIRA-IDOWU EMMANUE', 'Bucodel Lab 1', 'Tuesday', '09:00', '10:00'
  UNION ALL SELECT 'COSC408', 'BANKOLE OLORUNTOBI', 'Bucodel Lab 1', 'Monday', '08:00', '09:00'
  UNION ALL SELECT 'COSC408', 'BANKOLE OLORUNTOBI', 'Bucodel Lab 1', 'Tuesday', '07:00', '08:00'
  UNION ALL SELECT 'SENG402', 'Adegbola Adesoji', 'CIT', 'Thursday', '16:00', '17:00'
  UNION ALL SELECT 'SENG412', 'Idowu Sunday', 'Bucodel Lab 1', 'Thursday', '11:00', '12:00'
  UNION ALL SELECT 'SENG490', 'EWEOYA LEUKUN Onaolapo', 'CIT', 'Thursday', '14:00', '15:00'
  UNION ALL SELECT 'SENG408', 'BASHWIRA-IDOWU EMMANUE', 'CIT', 'Thursday', '17:00', '18:00'
  UNION ALL SELECT 'SENG402', 'Adegbola Adesoji', 'CIT', 'Friday', '07:00', '08:00'
  UNION ALL SELECT 'SENG490', 'EWEOYA LEUKUN Onaolapo', 'CIT', 'Monday', '17:00', '18:00'
  UNION ALL SELECT 'SENG414', 'ADENIYI OLUWABAMISE', 'CIT', 'Tuesday', '15:00', '16:00'
)
SELECT
  s.session_id,
  g.group_id,
  c.course_id,
  l.lecturer_id,
  v.venue_id,
  get_or_create_time_slot(r.day, r.start_t, r.end_t) AS slot_id,
  35,
  'scheduled',
  'school-officer'
FROM session s
CROSS JOIN grp g
INNER JOIN rows r ON true
INNER JOIN courses c ON c.course_code = r.course_code AND c.session_id = s.session_id AND c.department = 'Software Engineering' AND c.level = 400
INNER JOIN lecturers l ON l.session_id = s.session_id AND l.department = 'Software Engineering'
  AND l.name ILIKE r.lecturer_name
INNER JOIN venues v ON v.name = r.venue_name;
