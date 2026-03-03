-- Add created_by_role to schedules so department officers see only their own schedules;
-- school-created schedules are hidden from department list but still enforce conflicts.
CREATE TYPE schedule_creator_enum AS ENUM('school-officer', 'department-officer');

ALTER TABLE schedules
  ADD COLUMN IF NOT EXISTS created_by_role schedule_creator_enum NULL;

COMMENT ON COLUMN schedules.created_by_role IS 'Who created this schedule: school-officer (or NULL for legacy) = hidden from department Schedule Lecture list; department-officer = visible to that department. Conflict checks always consider all schedules.';

CREATE INDEX IF NOT EXISTS idx_schedules_created_by_role ON schedules(created_by_role);
