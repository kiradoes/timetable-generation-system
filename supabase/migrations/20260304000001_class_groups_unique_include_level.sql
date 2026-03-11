-- Allow same group name at different levels (e.g. 300L Group A and 400L Group A in same department/session).
-- Replace unique on (name, department, session_id) with (name, department, session_id, level).

DROP INDEX IF EXISTS idx_class_groups_unique;

CREATE UNIQUE INDEX idx_class_groups_unique ON class_groups(name, department, session_id, level);
