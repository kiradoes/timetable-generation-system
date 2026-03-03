# Supabase Backend Setup Guide

This guide covers setting up the Supabase backend for the Computer-Aided Timetable Generation System.

## Prerequisites

- Node.js 18+ installed
- Supabase account (create at https://app.supabase.com)
- Supabase CLI installed globally: `npm install -g supabase`

## Option 1: Using Supabase Cloud (Recommended for Production)

### Step 1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in project details:
   - Name: `timetable-system`
   - Database Password: (create a strong password)
   - Region: Choose closest to your users
4. Wait for project initialization (2-3 minutes)

### Step 2: Get Project Credentials

1. Go to Project Settings > API
2. Copy the following values:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **Anon/Public Key**: `eyJhbGci...` (safe for client-side)
   - **Service Role Key**: `eyJhbGci...` (keep secret, server-only)

### Step 3: Configure Environment Variables

1. Create `.env` file in project root:
```bash
# Copy from .env.example
cp .env.example .env
```

2. Edit `.env` with your credentials:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Run Database Migrations

Navigate to the project root and run:

```bash
# Login to Supabase CLI
supabase login

# Link to your cloud project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

This will execute all migration files in order:
1. `20260220000001_initial_schema.sql` - Creates all tables, ENUMs, indexes, views
2. `20260220000002_initial_data.sql` - Seeds initial departments, time slots, settings
3. `20260220000003_rls_policies.sql` - Enables Row Level Security policies

### Step 5: Deploy Edge Functions

```bash
# Deploy validation function
supabase functions deploy validate-schedule

# Deploy schedule creation function
supabase functions deploy create-schedule
```

### Step 6: Create First User

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add user" > "Create new user"
3. Fill in:
   - Email: admin@yourinstitution.edu
   - Password: (create strong password)
   - Auto Confirm User: ✓ (check this)
4. Click "Create user"

The `on_auth_user_created` trigger will automatically create an officer record.

### Step 7: Update Officer Role (Make School Officer)

1. Go to Supabase Dashboard > Table Editor > officers
2. Find the newly created officer
3. Edit the row:
   - role: `school-officer`
   - is_active: `true`
4. Save changes

---

## Option 2: Local Development with Supabase CLI

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 2: Initialize Local Supabase

```bash
# Start local Supabase services (PostgreSQL, Studio, Edge Functions)
supabase start
```

This will:
- Start PostgreSQL on `localhost:54322`
- Start Studio on `http://localhost:54323`
- Start API on `http://localhost:54321`
- Display access credentials

### Step 3: Configure Local Environment

Create `.env.local`:
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGci... # Displayed after `supabase start`
```

### Step 4: Run Migrations Locally

Migrations are automatically applied when you run `supabase start` if they're in `supabase/migrations/`.

To manually reset and reapply:
```bash
supabase db reset
```

### Step 5: Serve Edge Functions Locally

```bash
# Serve all functions
supabase functions serve

# Or specific function with auto-reload
supabase functions serve validate-schedule --debug
```

### Step 6: Access Local Services

- **Supabase Studio**: http://localhost:54323 (GUI for database, auth, storage)
- **API Endpoint**: http://localhost:54321
- **Database Direct**: `postgresql://postgres:postgres@localhost:54322/postgres`

---

## Testing the Setup

### 1. Test Database Connection

```bash
supabase db dump --local > test-dump.sql
```

If successful, your database is properly set up.

### 2. Test Edge Function (Validation)

Using curl:
```bash
curl -X POST 'http://localhost:54321/functions/v1/validate-schedule' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": 1,
    "lecturer_id": 1,
    "course_id": 1,
    "venue_id": 1,
    "day": "Monday",
    "start_time": "08:00:00",
    "duration_hours": 2
  }'
```

Expected response:
```json
{
  "success": true,
  "end_time": "10:00:00"
}
```

### 3. Test Authentication

Go to http://localhost:54323 > Authentication > Add user manually

Then test sign in from frontend.

---

## Database Seeding (Optional Additional Data)

Create a `supabase/seed.sql` file for more test data:

```sql
-- Insert test lecturers
INSERT INTO lecturers (name, email, department_id, title, is_active)
VALUES 
  ('Dr. John Doe', 'john.doe@example.com', 1, 'Professor', true),
  ('Dr. Jane Smith', 'jane.smith@example.com', 1, 'Senior Lecturer', true);

-- Insert test courses
INSERT INTO courses (course_code, title, credit_hours, course_type, department_id, level)
VALUES
  ('CS101', 'Introduction to Programming', 3, 'Core', 1, 100),
  ('CS201', 'Data Structures', 3, 'Core', 1, 200);

-- Insert test venues
INSERT INTO venues (name, building, capacity, venue_type, is_available)
VALUES
  ('NAB 101', 'New Academic Block', 100, 'Lecture Hall', true),
  ('NAB 201', 'New Academic Block', 50, 'Classroom', true);

-- Insert test class groups
INSERT INTO class_groups (name, level, department_id, student_count)
VALUES
  ('CS Level 100A', 100, 1, 45),
  ('CS Level 200B', 200, 1, 38);
```

Run it:
```bash
supabase db execute --file supabase/seed.sql
```

---

## Frontend Integration

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Configure Environment

Create `frontend/.env`:
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key
```

### Step 3: Run Frontend

```bash
npm run dev
```

Access at http://localhost:5173

---

## Deployment to Production

### Option A: Deploy to Vercel/Netlify (Frontend)

1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Add environment variables in dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

### Option B: Deploy to Supabase Edge Functions (Backend)

Already covered in Step 5 of Cloud setup.

---

## Monitoring & Debugging

### View Logs (Cloud)

```bash
# Function logs
supabase functions logs validate-schedule --project-ref your-ref

# Database logs  
supabase db logs --project-ref your-ref
```

### View Logs (Local)

```bash
# Real-time function logs
supabase functions serve --debug

# Database logs
supabase db logs
```

### Common Issues

**Issue**: Migrations fail with "relation already exists"
- **Solution**: Run `supabase db reset` to start fresh

**Issue**: Edge Function returns 401 Unauthorized
- **Solution**: Check Authorization header has correct bearer token

**Issue**: RLS policies blocking queries
- **Solution**: Verify user is authenticated and has correct role in officers table

**Issue**: Frontend can't connect to Supabase
- **Solution**: Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env

---

## Security Checklist

✅ Service Role Key kept secret (never in frontend)
✅ RLS policies enabled on all tables
✅ Auth users automatically synced to officers table
✅ Department officers can only access their department data
✅ Public endpoints properly restricted (schedules read-only)
✅ CORS configured in Edge Functions

---

## Next Steps

1. ✅ Complete backend setup
2. ✅ Test all Edge Functions
3. Update frontend to use Supabase client (see `frontend/src/lib/supabase.ts`)
4. Implement authentication flow in React
5. Update all API calls to use Supabase client instead of fetch/axios
6. Test conflict detection with real data
7. Deploy to production

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **Project Documentation**: See `RECREATION_GUIDE_SUPABASE_REACT.md`
