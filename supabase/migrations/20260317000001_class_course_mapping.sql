-- Class to Course Management: map which courses are available for a given (department, level).
-- When mappings exist for (session_id, department, level), Schedule Lecture only shows those courses in the dropdown.
CREATE TABLE class_course_mapping (
    mapping_id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
    department VARCHAR(50) NOT NULL,
    level INTEGER NOT NULL,
    course_id INTEGER NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (session_id, department, level, course_id)
);

CREATE INDEX idx_class_course_mapping_session ON class_course_mapping(session_id);
CREATE INDEX idx_class_course_mapping_class ON class_course_mapping(session_id, department, level);
CREATE INDEX idx_class_course_mapping_course ON class_course_mapping(course_id);

ALTER TABLE class_course_mapping ENABLE ROW LEVEL SECURITY;

-- School officers: full access
CREATE POLICY "school_officers_class_course_mapping"
ON class_course_mapping FOR ALL
TO authenticated
USING (is_school_officer())
WITH CHECK (is_school_officer());

-- Department officers: select/insert/update/delete only for their department
CREATE POLICY "department_officers_class_course_mapping"
ON class_course_mapping FOR ALL
TO authenticated
USING (is_department_officer() AND department = get_officer_department())
WITH CHECK (is_department_officer() AND department = get_officer_department());

-- Public/anon: no access (only officers manage mappings)
-- No policy for anon; default deny.

COMMENT ON TABLE class_course_mapping IS 'Maps (session, department, level) to allowed course_ids. When present, Schedule Lecture filters course dropdown to these only.';
