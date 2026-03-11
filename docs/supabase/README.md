# Supabase Backend

This directory contains the complete Supabase backend configuration for the Computer-Aided Timetable Generation System.

## Structure

```
supabase/
├── config.toml                              # Supabase project configuration
├── migrations/                              # Database migrations (applied in order)
│   ├── 20260220000001_initial_schema.sql   # Core schema: tables, ENUMs, indexes, views
│   ├── 20260220000002_initial_data.sql     # Seed data: departments, time slots, settings
│   └── 20260220000003_rls_policies.sql     # Row Level Security policies
└── functions/                               # Edge Functions (Deno runtime)
    ├── validate-schedule/                   # Schedule validation with conflict detection
    │   └── index.ts
    ├── create-schedule/                     # Create schedule with automatic validation
    │   └── index.ts
    └── _shared/                             # Shared utilities across functions
        └── utils.ts
```

---

## Migrations

### 20260220000001_initial_schema.sql (518 lines)

**Purpose**: Creates the complete database schema

**Contains**:
- 24 ENUM types (user_role, day_of_week, semester_type, etc.)
- 17 core tables with proper constraints and relationships
- 35+ indexes (including partial unique indexes for conflict prevention)
- 2 views (v_schedule_details, v_timetable_summary)
- Trigger function for updated_at timestamps
- Auth integration function (on_auth_user_created)

**Key Tables**:
```sql
departments          → Academic departments
officers             → System users (synced with auth.users)
sessions             → Academic sessions (2023/2024)
semesters            → Semester types
lecturers            → Teaching staff
courses              → Course catalog
venues               → Classrooms and halls
class_groups         → Student groups
time_slots           → Time allocations
special_events       → Chapel, breaks, seminars
timetables           → Timetable containers
schedules            → Lecture assignments (core table)
approvals            → Workflow approvals
conflicts            → Conflict tracking
lecturer_availability → Lecturer preferences
audit_log            → Activity logging
system_settings      → System configuration
```

**Critical Indexes**:
```sql
-- Prevent double-booking at database level
CREATE UNIQUE INDEX idx_lecturer_slot ON schedules(lecturer_id, slot_id) 
WHERE status = 'scheduled';

CREATE UNIQUE INDEX idx_venue_slot ON schedules(venue_id, slot_id) 
WHERE status = 'scheduled';

CREATE UNIQUE INDEX idx_group_slot ON schedules(group_id, slot_id) 
WHERE status = 'scheduled' AND group_id IS NOT NULL;
```

---

### 20260220000002_initial_data.sql (115 lines)

**Purpose**: Seeds the database with essential data

**Inserts**:
1. **5 Departments**:
   - Computer Science
   - Software Engineering
   - Information Technology
   - Information Systems
   - Cyber Security

2. **55 Time Slots** (Monday-Friday):
   - 07:00 - 08:00 (Early morning)
   - 08:00 - 09:00
   - 09:00 - 10:00
   - 10:00 - 11:00
   - 11:00 - 12:00
   - 12:00 - 13:00 (Lunch)
   - 13:00 - 14:00
   - 14:00 - 15:00
   - 15:00 - 16:00
   - 16:00 - 17:00
   - 17:00 - 18:00 (Late evening)

3. **7 System Settings**:
   - max_classes_per_day: 5
   - chapel_day: Wednesday
   - chapel_start: 10:00
   - chapel_end: 12:00
   - lunch_start: 12:00
   - lunch_end: 13:00
   - institution_name: Valley View University

---

### 20260220000003_rls_policies.sql (285 lines)

**Purpose**: Implements Row Level Security for authorization

**Contains**:
- Helper functions:
  - `get_current_officer_id()` - Gets officer ID from auth.uid()
  - `get_current_officer_role()` - Gets officer role
  - `is_school_officer()` - Checks if user is school officer
  - `is_department_officer(dept_id)` - Checks if user manages department

- **50+ RLS Policies** covering:
  - School officers: Full access to all data
  - Department officers: Restricted to their department
  - Public access: Read-only for schedules, courses, venues, time slots

**Policy Examples**:
```sql
-- School officers can manage all departments
CREATE POLICY "School officers can update any department"
ON departments FOR UPDATE
TO authenticated
USING (is_school_officer());

-- Department officers can only see their lecturers
CREATE POLICY "Department officers can read their lecturers"
ON lecturers FOR SELECT
TO authenticated
USING (
  department_id IN (
    SELECT department_id FROM officers 
    WHERE user_id = auth.uid()
  )
);

-- Anyone can view published schedules
CREATE POLICY "Public read access for schedules"
ON schedules FOR SELECT
USING (status = 'scheduled');
```

---

## Edge Functions

### validate-schedule (201 lines)

**Purpose**: Real-time schedule validation with conflict detection

**HTTP Method**: POST
**Endpoint**: `/functions/v1/validate-schedule`

**Request Body**:
```json
{
  "session_id": 1,
  "lecturer_id": 5,
  "course_id": 10,
  "venue_id": 3,
  "class_group_id": 2,
  "day": "Monday",
  "start_time": "08:00:00",
  "duration_hours": 2,
  "exclude_schedule_id": null
}
```

**Validation Checks**:
1. ✅ Time window (7 AM - 6 PM)
2. ✅ Special events (Chapel, breaks, lunch)
3. ✅ Lecturer conflict (no double-booking)
4. ✅ Venue conflict (one class per venue per slot)
5. ✅ Class group conflict (students can't be in two places)
6. ✅ Venue capacity (students must fit in venue)

**Response (Success)**:
```json
{
  "success": true,
  "end_time": "10:00:00"
}
```

**Response (Conflict)**:
```json
{
  "success": false,
  "error": "Lecturer already has a class at this time (08:00 - 10:00)"
}
```

**Usage in Frontend**:
```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/validate-schedule`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify(scheduleData)
  }
);
```

---

### create-schedule (133 lines)

**Purpose**: Create a new lecture schedule with automatic validation

**HTTP Method**: POST
**Endpoint**: `/functions/v1/create-schedule`

**Request Body**:
```json
{
  "session_id": 1,
  "course_id": 10,
  "lecturer_id": 5,
  "venue_id": 3,
  "class_group_id": 2,
  "day": "Monday",
  "start_time": "08:00:00",
  "duration_hours": 2,
  "timetable_id": 1,
  "notes": "Practical session"
}
```

**Process**:
1. Validates required fields
2. Calls `validate-schedule` function internally
3. Returns error if validation fails
4. Creates or finds matching time slot
5. Inserts schedule record
6. Returns full schedule with related data

**Response (Success)**:
```json
{
  "success": true,
  "message": "Lecture scheduled successfully",
  "data": {
    "schedule": {
      "schedule_id": 42,
      "course_id": 10,
      "lecturer_id": 5,
      "venue_id": 3,
      "slot_id": 15,
      "group_id": 2,
      "status": "scheduled",
      "courses": {
        "course_code": "CS201",
        "title": "Data Structures"
      },
      "lecturers": {
        "name": "Dr. John Doe"
      },
      "venues": {
        "name": "NAB 101",
        "capacity": 100
      },
      "time_slots": {
        "day_of_week": "Monday",
        "start_time": "08:00:00",
        "end_time": "10:00:00"
      }
    }
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Cannot schedule during Chapel (10:00 - 12:00)"
}
```

---

### _shared/utils.ts (31 lines)

**Purpose**: Shared utility functions for Edge Functions

**Exports**:
```typescript
// Calculate end time from start + duration
calculateEndTime(startTime: string, durationHours: number): string

// Check if two time ranges overlap
checkTimeOverlap(start1: string, end1: string, start2: string, end2: string): boolean

// Format time for display (HH:MM)
formatTimeForDisplay(time: string): string

// Day ordering constants
DAY_ORDER = { 'Monday': 1, 'Tuesday': 2, ... }
```

**Usage**:
```typescript
import { calculateEndTime, checkTimeOverlap } from '../_shared/utils.ts';

const endTime = calculateEndTime('08:00:00', 2); // '10:00:00'
const hasConflict = checkTimeOverlap('08:00', '10:00', '09:00', '11:00'); // true
```

---

## Configuration

### config.toml

**Purpose**: Supabase local development configuration

**Key Settings**:
```toml
[api]
port = 54321                    # Local API server
schemas = ["public", "storage"] # Exposed schemas

[db]
port = 54322                    # Local PostgreSQL
major_version = 15              # PostgreSQL version

[studio]
port = 54323                    # Supabase Studio GUI

[auth]
site_url = "http://localhost:5173"      # Frontend URL
enable_signup = true                    # Allow new registrations
jwt_expiry = 86400                      # 24 hours
```

**Usage**:
- Automatically used by `supabase start`
- Can be customized for different environments
- See: https://supabase.com/docs/guides/cli/config

---

## Deployment

### Local Development

```bash
# Start all services (PostgreSQL, API, Studio, Auth)
supabase start

# Outputs:
# API URL: http://localhost:54321
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio URL: http://localhost:54323
# Inbucket URL: http://localhost:54324 (email testing)
# anon key: eyJhbGci...
# service_role key: eyJhbGci...
```

### Cloud Deployment

```bash
# Login
supabase login

# Link to cloud project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push

# Deploy Edge Functions
supabase functions deploy validate-schedule
supabase functions deploy create-schedule

# OR deploy all functions at once
supabase functions deploy
```

---

## Database Commands

### Run Migrations

```bash
# Cloud
supabase db push

# Local (automatic on start, but can force):
supabase db reset
```

### Generate TypeScript Types

```bash
# For local database
supabase gen types typescript --local > frontend/src/types/database.types.ts

# For cloud database
supabase gen types typescript --linked > frontend/src/types/database.types.ts
```

### Database Dump

```bash
# Export schema and data
supabase db dump --local -f backup.sql

# Schema only
supabase db dump --local --schema-only -f schema.sql

# Data only
supabase db dump --local --data-only -f data.sql
```

### Database Reset (Local Only)

```bash
# ⚠️ WARNING: Deletes all data and reapplies migrations
supabase db reset
```

---

## Function Commands

### Serve Functions Locally

```bash
# Serve all functions
supabase functions serve

# Serve specific function with debug logs
supabase functions serve validate-schedule --debug

# With environment variables
supabase functions serve --env-file .env.local
```

### Test Functions

```bash
# Using curl (validate-schedule)
curl -X POST http://localhost:54321/functions/v1/validate-schedule \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"session_id":1,"lecturer_id":1,"course_id":1,"venue_id":1,"day":"Monday","start_time":"08:00:00","duration_hours":2}'

# Using curl (create-schedule)
curl -X POST http://localhost:54321/functions/v1/create-schedule \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"session_id":1,"course_id":1,"lecturer_id":1,"venue_id":1,"class_group_id":1,"day":"Monday","start_time":"08:00:00","duration_hours":2}'
```

### View Function Logs

```bash
# Local
supabase functions serve --debug

# Cloud
supabase functions logs validate-schedule --project-ref your-ref
```

### Delete Function

```bash
supabase functions delete function-name --project-ref your-ref
```

---

## Security Notes

### RLS is Always Enforced

All queries through Supabase client automatically enforce RLS policies. There's no way to bypass them from frontend.

### Service Role Key

⚠️ **Never expose service role key in frontend** - it bypasses RLS policies
- Use for admin scripts only
- Store in backend environment variables
- Used in Edge Functions for elevated permissions

### Anon Key

✅ **Safe to expose** - Public key for client-side use
- Always enforces RLS policies
- Cannot bypass security rules
- Used in frontend Supabase client

### Authentication

- Passwords automatically hashed with bcrypt
- JWT tokens automatically managed
- Session refresh automatic
- Email verification available (configure in Supabase dashboard)

---

## Monitoring

### Performance Metrics (Cloud)

Dashboard → Database → Performance
- Query performance
- Slow queries
- Cache hit rate
- Connection pool usage

### Function Metrics (Cloud)

Dashboard → Edge Functions → [function name]
- Invocations per minute
- Execution time (p50, p95, p99)
- Error rate
- Logs

### Database Size

```bash
# Check database size
supabase db size --linked
```

---

## Troubleshooting

### Migration Fails

**Error**: `relation "departments" already exists`

**Solution**:
```bash
# Local: Reset and reapply
supabase db reset

# Cloud: Check migration status
supabase migration list --linked
```

### Function Deploy Fails

**Error**: `Invalid import map`

**Solution**: Check that imports use full URLs with version:
```typescript
// ❌ Wrong
import { serve } from "std/http/server.ts"

// ✅ Correct
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
```

### RLS Blocking Queries

**Error**: `new row violates row-level security policy`

**Solution**:
1. Check user is authenticated: `await supabase.auth.getUser()`
2. Check user exists in officers table
3. Check officer.is_active = true
4. Check officer role has proper permissions

### Can't Connect Locally

**Error**: `ConnectionError: Connection refused`

**Solution**:
```bash
# Check services are running
supabase status

# If not, start them
supabase start
```

---

## Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/15/
- **Deno Docs** (for Edge Functions): https://deno.land/manual
- **PostgREST API Reference**: https://postgrest.org/en/stable/

---

## Migration from Express.js

This backend replaces ~5000 lines of Express.js code. See:
- `../BACKEND_MIGRATION_SUMMARY.md` - Detailed comparison
- `../RECREATION_GUIDE_SUPABASE_REACT.md` - Full system architecture
- `../SUPABASE_SETUP_GUIDE.md` - Complete setup instructions

---

## Contributing

When adding new features:

1. **Database Changes**: Create new migration file
   ```bash
   supabase migration new feature_name
   ```

2. **Edge Functions**: Add to `functions/` directory
   ```bash
   mkdir supabase/functions/new-function
   # Create index.ts inside
   ```

3. **RLS Policies**: Add to relevant migration or create new one

4. **Test Locally**: Always test with `supabase start` before deploying

5. **Deploy**: Push migrations and functions to cloud
   ```bash
   supabase db push
   supabase functions deploy new-function
   ```

---

## License

See main project LICENSE file.
