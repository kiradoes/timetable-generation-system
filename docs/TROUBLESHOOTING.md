# Troubleshooting common errors

## 409 – Duplicate key (department or lecturer)

**What it means:** You're creating a record that already exists.

- **`departments_name_key`** – A department with that name already exists. Use a different name or edit the existing department.
- **`idx_lecturers_name_department_session`** – A lecturer with that full name already exists in that department and session. Use a different name or edit the existing lecturer.

The app shows a friendly message for these; the underlying Supabase error may still appear in the console.

---

## 400 – Invalid enum (courses: Post-SIWES / Summer)

**What it means:** The `courses` table has a `semester` column with type `course_semester_enum`. The database only allows certain values (e.g. `First`, `Second`, `Both`). Saving "Post-SIWES" or "Summer" causes this error until the enum is updated.

**Fix:** Run the migration that adds the new enum values in **Supabase → SQL Editor**:

```sql
ALTER TYPE course_semester_enum ADD VALUE IF NOT EXISTS 'Summer';
ALTER TYPE course_semester_enum ADD VALUE IF NOT EXISTS 'Post-SIWES';
```

Or apply the project migration: `supabase/migrations/20260315000001_course_semester_enum_summer_post_siwes.sql`

---

## 403 – Audit log (row-level security)

**What it means:** The app tries to write to the `audit_log` table so the dashboard can show “recent activity”. The insert is rejected because of Row Level Security (RLS): the current user is not allowed to insert into `audit_log`.

**Impact:** Schedule create/update/delete still works. Only the audit trail (recent activity on the dashboard) may be missing.

**Options:**

1. **Ignore** – The app now suppresses these 403 audit errors in the console. You can leave RLS as-is if you don’t need audit entries.
2. **Fix RLS** – In Supabase, add an RLS policy on `audit_log` that allows `INSERT` for authenticated users (e.g. `auth.role() = 'authenticated'` or a policy that allows inserts for your app’s service role / authenticated users).

---

## Summary

| Error | Cause | Action |
|-------|--------|--------|
| 409 departments_name_key | Duplicate department name | Use another name or edit existing |
| 409 idx_lecturers_name_department_session | Duplicate lecturer (name + dept + session) | Use another name or edit existing |
| 400 course_semester_enum | Post-SIWES/Summer not in enum | Run SQL above or migration |
| 403 audit_log | RLS blocks audit insert | Optional: add INSERT policy or ignore |
