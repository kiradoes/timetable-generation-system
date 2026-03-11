-- =============================================
-- Schedule all courses for Software Engineering Group A except one
-- (Leave COSC408 unscheduled so you can schedule it, then view / reject / approve timetable.)
-- =============================================

INSERT INTO schedules (session_id, group_id, course_id, lecturer_id, venue_id, slot_id, class_size, status, created_by_role)
WITH session AS (SELECT session_id FROM sessions WHERE is_current = true LIMIT 1),
grp AS (
  SELECT c.group_id FROM class_groups c
  INNER JOIN session s ON c.session_id = s.session_id
  WHERE c.department = 'Software Engineering' AND c.name = 'A'
  LIMIT 1
),
-- 7 courses: Monday = SENG414, SENG412, SENG408 only (rn 1–3); rest Tue–Thu.
courses_to_schedule AS (
  SELECT course_id, course_code,
    ROW_NUMBER() OVER (
      ORDER BY CASE course_code
        WHEN 'SENG414' THEN 1 WHEN 'SENG412' THEN 2 WHEN 'SENG408' THEN 3
        ELSE 4 END,
        course_code
    ) AS rn
  FROM courses c
  INNER JOIN session s ON c.session_id = s.session_id
  WHERE c.department = 'Software Engineering' AND c.level = 400
    AND c.course_code IN ('SENG412', 'SENG490', 'SENG414', 'SENG404', 'SENG406', 'SENG402', 'SENG408')
),
-- Slots: 3 on Monday (spaced: 7-8, 9-10, 11-12), rest Tue–Thu. Exclude 12-1 and 1-2 (lunch/break).
ordered_slots AS (
  SELECT slot_id, start_time, day_of_week,
    ROW_NUMBER() OVER (PARTITION BY day_of_week ORDER BY start_time) AS day_slot_rn
  FROM time_slots
  WHERE day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday')
    AND start_time::text NOT LIKE '12:%' AND start_time::text NOT LIKE '13:%'
),
slots AS (
  SELECT slot_id, rn FROM (
    SELECT slot_id,
      ROW_NUMBER() OVER (
        ORDER BY
          CASE day_of_week WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4 END,
          day_slot_rn
      ) AS rn
    FROM ordered_slots
    WHERE (day_of_week = 'Monday' AND day_slot_rn IN (1, 3, 5)) OR (day_of_week != 'Monday')
  ) x
  WHERE rn <= 7
),
lecturers_ranked AS (
  SELECT lecturer_id, rn FROM (
    SELECT lecturer_id, ROW_NUMBER() OVER (ORDER BY lecturer_id) AS rn
    FROM lecturers l
    INNER JOIN session s ON l.session_id = s.session_id
    WHERE l.department = 'Software Engineering'
  ) x WHERE rn <= 7
),
venue AS (SELECT venue_id FROM venues WHERE name = 'CIT' LIMIT 1)
SELECT
  s.session_id,
  g.group_id,
  ct.course_id,
  lr.lecturer_id,
  v.venue_id,
  sl.slot_id,
  35,
  'scheduled',
  'school-officer'
FROM session s
CROSS JOIN grp g
CROSS JOIN venue v
INNER JOIN courses_to_schedule ct ON true
INNER JOIN slots sl ON sl.rn = ct.rn
INNER JOIN lecturers_ranked lr ON lr.rn = ct.rn
WHERE NOT EXISTS (
  SELECT 1 FROM schedules ex
  WHERE ex.session_id = s.session_id AND ex.group_id = g.group_id AND ex.course_id = ct.course_id
);
