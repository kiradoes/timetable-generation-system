-- RPC so DTTO (and any authenticated user creating schedules) can get or create a time_slot
-- without needing INSERT on time_slots. Runs with definer rights so RLS is bypassed for this op.

CREATE OR REPLACE FUNCTION get_or_create_time_slot(
  p_day_of_week text,
  p_start_time text,
  p_end_time text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slot_id integer;
  v_start time;
  v_end time;
BEGIN
  v_start := p_start_time::time;
  v_end   := p_end_time::time;

  SELECT slot_id INTO v_slot_id
  FROM time_slots
  WHERE day_of_week::text = p_day_of_week
    AND start_time = v_start
    AND end_time = v_end
  LIMIT 1;

  IF v_slot_id IS NOT NULL THEN
    RETURN v_slot_id;
  END IF;

  INSERT INTO time_slots (day_of_week, start_time, end_time, slot_name, is_active)
  VALUES (
    p_day_of_week::day_of_week_enum,
    v_start,
    v_end,
    COALESCE(p_start_time || ' - ' || p_end_time, ''),
    true
  )
  RETURNING slot_id INTO v_slot_id;

  RETURN v_slot_id;
END;
$$;

COMMENT ON FUNCTION get_or_create_time_slot(text, text, text) IS 'Get existing slot_id or create a new time_slot; allows DTTO/STTO to create schedules without direct INSERT on time_slots.';

GRANT EXECUTE ON FUNCTION get_or_create_time_slot(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_time_slot(text, text, text) TO service_role;
