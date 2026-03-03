-- =============================================
-- Add a second schedule slot for every (session, group, course) that currently has only one.
-- Once each course has 2 slots, it disappears from the "Select course" list in Schedule Lecture (STTO/DTTO).
-- Run after any seed that creates one slot per course (e.g. 400L Group A seed).
-- Assigns distinct slot_id per (session, group) so no duplicate (group_id, slot_id, session_id).
-- =============================================

WITH single_schedules AS (
  SELECT
    sc.session_id,
    sc.group_id,
    sc.course_id,
    sc.lecturer_id,
    sc.venue_id,
    sc.slot_id AS current_slot,
    sc.class_size,
    sc.created_by_role,
    ROW_NUMBER() OVER (PARTITION BY sc.session_id, sc.group_id ORDER BY sc.course_id) AS rn
  FROM schedules sc
  INNER JOIN (
    SELECT session_id, group_id, course_id
    FROM schedules
    WHERE status = 'scheduled'
    GROUP BY session_id, group_id, course_id
    HAVING COUNT(*) = 1
  ) single
    ON sc.session_id = single.session_id
   AND sc.group_id = single.group_id
   AND sc.course_id = single.course_id
  WHERE sc.status = 'scheduled'
),
-- Prefer Mon–Thu only (no Friday). Exclude 12–1 and 1–2 PM (lunch/break) so no course is scheduled then.
ordered_slots AS (
  SELECT slot_id, rn FROM (
    SELECT slot_id,
      ROW_NUMBER() OVER (
        ORDER BY
          CASE day_of_week WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4 ELSE 5 END,
          start_time
      ) AS rn
    FROM time_slots
    WHERE day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday')
      AND (start_time IS NULL OR (start_time::text NOT LIKE '12:%' AND start_time::text NOT LIKE '13:%'))
  ) x
),
-- Slots already used by each group in each session (so we don't double-book the group)
group_used AS (
  SELECT DISTINCT session_id, group_id, slot_id
  FROM schedules
  WHERE status = 'scheduled'
),
-- For each (session, group), list slot_ids that are free for that group (ordered)
free_slots_per_group AS (
  SELECT
    ss.session_id,
    ss.group_id,
    os.slot_id,
    ROW_NUMBER() OVER (PARTITION BY ss.session_id, ss.group_id ORDER BY os.rn) AS slot_rn
  FROM (SELECT DISTINCT session_id, group_id FROM single_schedules) ss
  CROSS JOIN ordered_slots os
  WHERE NOT EXISTS (
    SELECT 1 FROM group_used gu
    WHERE gu.session_id = ss.session_id AND gu.group_id = ss.group_id AND gu.slot_id = os.slot_id
  )
),
-- For each single_schedule row: only use slots free for this group AND free for this lecturer and venue.
-- Rank each course's allowed slots by slot_rn; assign the rn-th allowed slot to the course with row number rn (so course 1 gets 1st allowed, course 2 gets 2nd allowed, etc. — distinct per group).
candidates AS (
  SELECT
    ss.session_id,
    ss.group_id,
    ss.course_id,
    ss.lecturer_id,
    ss.venue_id,
    ss.class_size,
    ss.created_by_role,
    ss.rn,
    f.slot_id AS new_slot_id,
    ROW_NUMBER() OVER (PARTITION BY ss.session_id, ss.group_id, ss.course_id ORDER BY f.slot_rn) AS slot_rank
  FROM single_schedules ss
  INNER JOIN free_slots_per_group f
    ON f.session_id = ss.session_id AND f.group_id = ss.group_id
  WHERE f.slot_id != ss.current_slot
    AND NOT EXISTS (
      SELECT 1 FROM schedules s2
      WHERE s2.session_id = ss.session_id AND s2.status = 'scheduled' AND s2.slot_id = f.slot_id
        AND (s2.lecturer_id = ss.lecturer_id OR s2.venue_id = ss.venue_id)
    )
),
-- Take the rn-th allowed slot for each course so (session, group) get distinct slot_ids
assigned AS (
  SELECT
    session_id,
    group_id,
    course_id,
    lecturer_id,
    venue_id,
    new_slot_id,
    class_size,
    created_by_role
  FROM candidates
  WHERE slot_rank = rn
)
INSERT INTO schedules (session_id, group_id, course_id, lecturer_id, venue_id, slot_id, class_size, status, created_by_role)
SELECT
  session_id,
  group_id,
  course_id,
  lecturer_id,
  venue_id,
  new_slot_id,
  class_size,
  'scheduled',
  COALESCE(created_by_role, 'school-officer')
FROM assigned;
