-- Allow department officers to create time_slots when creating schedules.
-- getOrCreateTimeSlot in the API inserts a new slot if one doesn't exist for (day, start, end).
-- Without INSERT, department officers get 403 when creating a schedule with a new time slot.

CREATE POLICY "department_officers_insert_time_slots"
ON time_slots FOR INSERT
TO authenticated
WITH CHECK (is_department_officer());
