-- Add level to special_events so events can be assigned to a specific level (timetable).
ALTER TABLE special_events
ADD COLUMN IF NOT EXISTS level INTEGER NULL;

COMMENT ON COLUMN special_events.level IS 'Level (100,200,300,400) this event applies to; NULL = all levels';
