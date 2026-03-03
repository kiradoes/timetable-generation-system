-- =============================================
-- No class can be scheduled at 1-2 PM (break).
-- Database trigger: any INSERT or UPDATE that would assign a 1-2 PM slot
-- to a schedule is rejected with an error. Applies to all schedules.
-- =============================================

CREATE OR REPLACE FUNCTION check_no_class_at_break()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM time_slots
    WHERE slot_id = NEW.slot_id
      AND start_time::text LIKE '13:%'
  ) THEN
    RAISE EXCEPTION 'No class can be scheduled at 1-2 PM (break).';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS schedules_no_break_slot ON schedules;
CREATE TRIGGER schedules_no_break_slot
  BEFORE INSERT OR UPDATE OF slot_id ON schedules
  FOR EACH ROW EXECUTE FUNCTION check_no_class_at_break();

COMMENT ON FUNCTION check_no_class_at_break() IS 'Ensures no schedule uses the 1-2 PM break slot.';
