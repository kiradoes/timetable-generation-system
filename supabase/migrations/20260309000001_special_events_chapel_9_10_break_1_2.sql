-- =============================================
-- Special events: Chapel Wednesday 10-12 (like timetable), Break 1-2 PM only.
-- Remove any 12-1 break/lunch so only 1-2 PM shows as break on the timetable.
-- =============================================

-- Remove any special event at 12:00-13:00 (12-1) so it never shows as break on the timetable
DELETE FROM special_events
WHERE start_time = '12:00:00' AND end_time = '13:00:00';

-- Chapel: Wednesday 9:00-10:00 for 400 level, display as "University Chapel"
UPDATE special_events
SET start_time = '09:00:00',
    end_time = '10:00:00',
    event_name = 'University Chapel',
    description = 'Level 400. University Chapel - no classes scheduled',
    level = 400
WHERE event_type = 'chapel'
  AND session_id IN (SELECT session_id FROM sessions WHERE is_current = true);

-- Ensure Break exists only at 1-2 PM (all days). Remove any other break/lunch at different times.
DELETE FROM special_events
WHERE event_type = 'lunch'
  AND (start_time != '13:00:00' OR end_time != '14:00:00');

-- Insert Break 1-2 PM for current session if not present (all days)
INSERT INTO special_events (event_type, day_of_week, start_time, end_time, event_name, description, session_id, is_active)
SELECT
  'lunch'::special_event_type_enum,
  'All'::special_event_day_enum,
  '13:00:00'::time,
  '14:00:00'::time,
  'Break',
  'Break 1-2 PM - no classes',
  session_id,
  true
FROM sessions WHERE is_current = true
WHERE NOT EXISTS (
  SELECT 1 FROM special_events se
  WHERE se.session_id = sessions.session_id
    AND se.start_time = '13:00:00' AND se.end_time = '14:00:00'
    AND se.event_type = 'lunch'
);

COMMENT ON TABLE special_events IS 'Chapel Wednesday 9-10 for 400 level (University Chapel); Break 1-2 PM only. No break at 12-1.';
