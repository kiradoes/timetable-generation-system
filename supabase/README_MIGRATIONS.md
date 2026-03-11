# Fix 404 when creating schedules

If you see **404** for `get_or_create_time_slot` or the message **"Could not get or create time slot"** when creating a schedule, the database is missing the RPC function.

**Fix (pick one):**

1. **Apply all migrations** (if using Supabase CLI and linked project):
   ```bash
   supabase db push
   ```

2. **Run the SQL by hand** (works for any Supabase project):
   - Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.
   - Click **New query**.
   - Open the file `supabase/run_get_or_create_time_slot.sql` in this repo, copy its full contents, paste into the editor, and click **Run**.

After the function is created, schedule creation (including for department officers) will work and the 404 will stop.
