-- Enforce: no two lecturers with the same full name in the same department and session.
-- Enforce: no two officers with the same full name in the same department (empty string for null department).

-- Lecturers: unique (name, department, session_id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_lecturers_name_department_session
ON lecturers(name, department, session_id);

-- Officers: unique (full_name, department) treating null department as ''
CREATE UNIQUE INDEX IF NOT EXISTS idx_officers_fullname_department
ON officers(full_name, COALESCE(department, ''));
