-- Add preferences field to lecturers table
ALTER TABLE lecturers
ADD COLUMN preferences TEXT DEFAULT NULL;

-- Create index for faster queries
CREATE INDEX idx_lecturers_preferences ON lecturers(preferences);

-- Comment for documentation
COMMENT ON COLUMN lecturers.preferences IS 'Lecturer preferences, constraints, or notes (e.g., preferred teaching times, special requirements)';
