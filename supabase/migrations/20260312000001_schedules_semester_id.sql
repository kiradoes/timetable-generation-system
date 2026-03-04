-- Add semester_id to schedules so venue conflict can be scoped by semester.
-- When a semester ends, its schedules no longer block venues for other semesters.
-- Summer and Post-SIWES run concurrently and share the same venue pool.
ALTER TABLE schedules
  ADD COLUMN IF NOT EXISTS semester_id INTEGER NULL REFERENCES semesters(semester_id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_schedules_semester ON schedules(semester_id);

COMMENT ON COLUMN schedules.semester_id IS 'Semester this schedule belongs to. NULL = legacy (treated as blocking all). Used for venue conflict: only schedules in active/concurrent semesters block.';

-- Allow same venue+slot+session in different semesters (e.g. First ended, Summer uses same room).
DROP INDEX IF EXISTS idx_unique_venue_slot;
CREATE UNIQUE INDEX idx_unique_venue_slot_semester ON schedules(venue_id, slot_id, session_id, semester_id) WHERE status = 'scheduled' AND semester_id IS NOT NULL;
CREATE UNIQUE INDEX idx_unique_venue_slot_legacy ON schedules(venue_id, slot_id, session_id) WHERE status = 'scheduled' AND semester_id IS NULL;
