-- =============================================
-- Schedule ALL classes for 400L Group A (Software Engineering)
-- so you can see the full timetable at the end of the day.
-- Uses only (lecturer_id, slot_id) not already used, and slot_id not already used by this group,
-- to satisfy idx_unique_lecturer_slot and idx_unique_group_slot.
-- =============================================

INSERT INTO schedules (session_id, group_id, course_id, lecturer_id, venue_id, slot_id, class_size, status, created_by_role)
WITH session AS (SELECT session_id FROM sessions WHERE is_current = true LIMIT 1),
grp AS (
  SELECT c.group_id FROM class_groups c
  INNER JOIN session s ON c.session_id = s.session_id
  WHERE c.department = 'Software Engineering' AND c.name = 'A' AND c.level = 400
  LIMIT 1
),
-- Courses needing schedule: Monday = SENG414, SENG412, SENG408 only (rn 1–3); rest Tue–Thu.
courses_needing AS (
  SELECT c.course_id, c.course_code,
    ROW_NUMBER() OVER (
      ORDER BY CASE c.course_code
        WHEN 'SENG414' THEN 1 WHEN 'SENG412' THEN 2 WHEN 'SENG408' THEN 3
        ELSE 4 END,
        c.course_code
    ) AS rn
  FROM courses c
  INNER JOIN session s ON c.session_id = s.session_id
  CROSS JOIN grp g
  WHERE c.department = 'Software Engineering' AND c.level = 400
    AND c.course_code IN ('SENG402', 'SENG404', 'SENG406', 'SENG408', 'SENG412', 'SENG414', 'SENG490', 'COSC408')
    AND NOT EXISTS (SELECT 1 FROM schedules ex WHERE ex.session_id = s.session_id AND ex.group_id = g.group_id AND ex.course_id = c.course_id)
),
-- Slots: 3 on Monday (spaced: 7-8, 9-10, 11-12), then Tue–Thu. Exclude 12-1 and 1-2 (lunch/break).
ordered_slots_by_day AS (
  SELECT slot_id, start_time, day_of_week,
    ROW_NUMBER() OVER (PARTITION BY day_of_week ORDER BY start_time) AS day_slot_rn
  FROM time_slots
  WHERE day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday')
    AND start_time::text NOT LIKE '12:%' AND start_time::text NOT LIKE '13:%'
),
all_slots AS (
  SELECT slot_id,
    ROW_NUMBER() OVER (
      ORDER BY
        CASE day_of_week WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4 END,
        day_slot_rn
    ) AS rn
  FROM ordered_slots_by_day
  WHERE (day_of_week = 'Monday' AND day_slot_rn IN (1, 3, 5)) OR (day_of_week != 'Monday')
),
all_lecturers AS (
  SELECT lecturer_id, ROW_NUMBER() OVER (ORDER BY lecturer_id) AS rn
  FROM lecturers l
  INNER JOIN session s ON l.session_id = s.session_id
  WHERE l.department = 'Software Engineering'
),
-- (lecturer_id, slot_id) already taken in this session (lecturer can't be in two places)
used_lecturer_slot AS (
  SELECT ex.lecturer_id, ex.slot_id
  FROM schedules ex
  INNER JOIN session s ON ex.session_id = s.session_id
  WHERE ex.status = 'scheduled'
),
-- slot_ids already used by this group in this session (group can't have two classes at same time)
slots_used_by_group AS (
  SELECT ex.slot_id
  FROM schedules ex
  INNER JOIN session s ON ex.session_id = s.session_id
  CROSS JOIN grp g
  WHERE ex.group_id = g.group_id AND ex.status = 'scheduled'
),
available AS (
  SELECT al.lecturer_id, sl.slot_id, ROW_NUMBER() OVER (ORDER BY sl.rn, al.rn) AS rn
  FROM all_slots sl
  CROSS JOIN all_lecturers al
  WHERE NOT EXISTS (SELECT 1 FROM used_lecturer_slot u WHERE u.lecturer_id = al.lecturer_id AND u.slot_id = sl.slot_id)
    AND NOT EXISTS (SELECT 1 FROM slots_used_by_group sug WHERE sug.slot_id = sl.slot_id)
),
venue AS (SELECT venue_id FROM venues WHERE name = 'Bucodel Lab 1' LIMIT 1)
SELECT
  s.session_id,
  g.group_id,
  cn.course_id,
  av.lecturer_id,
  v.venue_id,
  av.slot_id,
  35,
  'scheduled',
  'school-officer'
FROM session s
CROSS JOIN grp g
CROSS JOIN venue v
INNER JOIN courses_needing cn ON true
INNER JOIN available av ON av.rn = cn.rn
WHERE NOT EXISTS (
  SELECT 1 FROM schedules ex
  WHERE ex.session_id = s.session_id AND ex.group_id = g.group_id AND ex.course_id = cn.course_id
);
