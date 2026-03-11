# Quick Start Guide - Supabase Backend

Get the timetable system running with Supabase in under 10 minutes.

## Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm or yarn installed
- [ ] Supabase account created at https://app.supabase.com
- [ ] Supabase CLI installed (`npm install -g supabase`)

---

## 🚀 Quick Start (Cloud Deployment)

### Step 1: Create Supabase Project (3 mins)

1. Go to https://app.supabase.com → Click **"New Project"**
2. Fill in:
   - **Project Name**: `timetable-system`
   - **Database Password**: Create and **save this securely**
   - **Region**: Choose closest to you
3. Click **"Create new project"** and wait 2-3 minutes

### Step 2: Get Credentials (1 min)

1. In your new project, go to **Settings** (⚙️) → **API**
2. Copy these values:
   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGci...
   ```

### Step 3: Configure Environment (1 min)

```bash
# In project root
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co    # ← Paste your Project URL
VITE_SUPABASE_ANON_KEY=eyJhbGci...             # ← Paste your anon key
```

### Step 4: Push Database Schema (2 mins)

```bash
# Login to Supabase CLI
supabase login

# Link to your project (find ref in Project Settings → General)
supabase link --project-ref xxxxx

# Push all migrations to cloud
supabase db push
```

You should see:
```
✓ Applying migration 20260220000001_initial_schema.sql...
✓ Applying migration 20260220000002_initial_data.sql...
✓ Applying migration 20260220000003_rls_policies.sql...
```

### Step 5: Deploy Edge Functions (1 min)

```bash
supabase functions deploy validate-schedule
supabase functions deploy create-schedule
```

### Step 6: Create Admin User (1 min)

1. In Supabase Dashboard → **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Fill in:
   - **Email**: `admin@yourinstitution.edu`
   - **Password**: Create strong password
   - **Auto Confirm User**: ✅ Check this
4. Click **"Create user"**

### Step 7: Make User a School Officer (1 min)

1. Go to **Database** (icon) → **Table Editor** → **officers** table
2. Find your newly created officer (will have same email)
3. Click to edit the row
4. Change:
   - **role**: `school-officer` (dropdown)
   - **is_active**: `true` (checkbox)
5. Click **Save**

### Step 8: Install & Run Frontend (1 min)

```bash
cd frontend
npm install
npm run dev
```

### Step 9: Test Login! 🎉

1. Open http://localhost:5173
2. Sign in with:
   - Email: `admin@yourinstitution.edu`
   - Password: (the one you created)
3. You should see the dashboard!

---

## 🏠 Alternative: Local Development

Perfect for offline work or testing.

### Quick Local Setup

```bash
# Start all Supabase services locally (PostgreSQL, Studio, API)
supabase start

# This will display:
# - API URL: http://localhost:54321
# - Studio URL: http://localhost:54323
# - anon key: eyJhbGci... (copy this)
```

Create `frontend/.env.local`:
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGci...    # ← Copy from terminal
```

Run frontend:
```bash
cd frontend
npm install
npm run dev
```

Access:
- **Frontend**: http://localhost:5173
- **Supabase Studio**: http://localhost:54323 (database GUI)

---

## 📋 What Just Happened?

When you ran `supabase db push`, it created:

### 17 Database Tables
- ✅ `departments` - Academic departments (CS, SE, IT, IS, Cyber Security)
- ✅ `officers` - System users with roles (school-officer, department-officer)
- ✅ `sessions` - Academic sessions (e.g., "2023/2024")
- ✅ `semesters` - Semester types (First, Second, Summer)
- ✅ `lecturers` - Teaching staff
- ✅ `courses` - Course catalog (CS101, CS201, etc.)
- ✅ `venues` - Classrooms and lecture halls
- ✅ `class_groups` - Student groups (Level 100A, Level 200B)
- ✅ `time_slots` - Monday-Friday, 7AM-6PM
- ✅ `special_events` - Chapel, breaks, seminars
- ✅ `timetables` - Timetable containers
- ✅ `schedules` - Individual lecture allocations
- ✅ `approvals` - Workflow approvals
- ✅ `conflicts` - Conflict tracking
- ✅ `audit_log` - Activity logging
- ✅ `system_settings` - System configuration
- ✅ `lecturer_availability` - Lecturer time preferences

### Initial Seed Data
- 5 departments (Computer Science, Software Engineering, IT, IS, Cyber Security)
- 55 time slots (Monday-Friday, 7AM-6PM)
- 7 system settings (institution name, schedule times)

### Security Policies (RLS)
- School officers can access all data
- Department officers restricted to their department
- Automatic authorization on every query

### Business Logic (Edge Functions)
- `validate-schedule` - Conflict detection (6 types)
- `create-schedule` - Schedule creation with validation

---

## ✅ Verification Steps

### 1. Check Database Setup

```bash
supabase db dump --local > test.sql
```
If successful, your database is ready.

### 2. Check Tables in Studio

1. Open http://localhost:54323 (local) or your Dashboard (cloud)
2. Go to **Table Editor**
3. You should see all 17 tables with data in:
   - departments (5 rows)
   - time_slots (55 rows)
   - system_settings (7 rows)

### 3. Test Edge Function

```bash
curl -X POST 'http://localhost:54321/functions/v1/validate-schedule' \
  -H "Content-Type: application/json" \
  -d '{"session_id": 1, "lecturer_id": 1, "course_id": 1, "venue_id": 1, "day": "Monday", "start_time": "08:00:00", "duration_hours": 2}'
```

Expected: `{"success":true,"end_time":"10:00:00"}`

### 4. Check Frontend Connection

Open browser console at http://localhost:5173 and run:
```javascript
// Test Supabase connection
const { data } = await supabase.from('departments').select('*');
console.log(data); // Should show 5 departments
```

---

## 🐛 Troubleshooting

### "Migration failed: relation already exists"

**Solution**:
```bash
supabase db reset        # Local only
# Then: supabase db push  # For cloud
```

### "Invalid API key"

**Solution**: Double-check `.env` file has correct keys from Supabase Dashboard → Settings → API

### "RLS policy blocks query"

**Solution**: Make sure you're signed in and user exists in `officers` table with proper role

### Functions return 404

**Solution**:
```bash
supabase functions deploy validate-schedule --project-ref your-ref
supabase functions deploy create-schedule --project-ref your-ref
```

### Can't login

**Solution**:
1. Check user exists in Dashboard → Authentication → Users
2. Check `officers` table has matching email
3. Make sure `is_active = true` and `role = 'school-officer'`

---

## 📚 Next Steps

Now that backend is running:

1. **Explore the Database**: Open Supabase Studio and browse tables
2. **Test Functionality**: Try creating departments, lecturers, courses
3. **Read Architecture**: See `RECREATION_GUIDE_SUPABASE_REACT.md` for full system details
4. **Customize**: Add your institution's departments, venues, and courses
5. **Deploy**: When ready, deploy frontend to Vercel/Netlify

---

## 📖 Documentation Index

- **This file** - Quick start (you are here)
- `SUPABASE_SETUP_GUIDE.md` - Detailed setup with all options
- `BACKEND_MIGRATION_SUMMARY.md` - What changed from Express.js
- `RECREATION_GUIDE_SUPABASE_REACT.md` - Complete system architecture
- `frontend/src/lib/supabase.ts` - Supabase client usage examples

---

## 🆘 Need Help?

- **Supabase Issues**: https://github.com/supabase/supabase/discussions
- **Supabase Discord**: https://discord.supabase.com
- **Check Logs**: 
  - Local: `supabase functions serve --debug`
  - Cloud: Dashboard → Edge Functions → Logs

---

## 🎉 Success Checklist

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Database migrations applied (17 tables created)
- [ ] Edge functions deployed (2 functions)
- [ ] Admin user created and promoted to school officer
- [ ] Frontend running on http://localhost:5173
- [ ] Successfully logged in
- [ ] Can see dashboard with 5 departments

**All checked?** You're ready to generate timetables! 🚀
