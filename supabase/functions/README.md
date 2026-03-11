# Supabase Edge Functions Deployment Guide

## Prerequisites
- Supabase Project URL
- Supabase Service Role Key (from Project Settings > API)
- Supabase CLI installed

## Functions Available

### 1. create-officer
Creates a new officer with associated Supabase Auth user account.

**Endpoint**: `/functions/v1/create-officer`

**Method**: POST

**Auth Required**: Yes (School Officer only)

**Request Body**:
```json
{
  "full_name": "Dr. John Doe",
  "email": "john.doe@babcock.edu.ng",
  "department": "Computer Science",
  "password": "SecurePass123",
  "role": "department-officer"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "officer_id": 1,
    "auth_user_id": "uuid-here",
    "full_name": "Dr. John Doe",
    "email": "john.doe@babcock.edu.ng",
    "department": "Computer Science",
    "role": "department-officer",
    "status": "active"
  },
  "message": "Officer created successfully"
}
```

## Deployment Instructions

### Step 1: Install Supabase CLI (if not installed)
```bash
npm install -g supabase
```

### Step 2: Login to Supabase
```bash
supabase login
```

### Step 3: Link to Your Project
```bash
supabase link --project-ref ksbakicdkizciuivkujk
```

### Step 4: Deploy All Functions
```bash
supabase functions deploy
```

Or deploy a specific function:
```bash
supabase functions deploy create-officer
```

### Step 5: Set Environment Variables (One-time setup)
The Edge Function needs access to your Service Role Key. Set it via Supabase Dashboard:

1. Go to: **Project Settings** > **Edge Functions**
2. Add these secrets:
   - `SUPABASE_URL`: Your project URL (e.g., https://ksbakicdkizciuivkujk.supabase.co)
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key from API settings
   - `SUPABASE_ANON_KEY`: Your anon/public key

Or via CLI:
```bash
supabase secrets set SUPABASE_URL=https://ksbakicdkizciuivkujk.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
supabase secrets set SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 6: Test the Function
```bash
curl -i --location --request POST 'https://ksbakicdkizciuivkujk.supabase.co/functions/v1/create-officer' \
  --header 'Authorization: Bearer YOUR_USER_JWT_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
    "full_name": "Test Officer",
    "email": "test@babcock.edu.ng",
    "department": "Computer Science",
    "password": "TestPass123",
    "role": "department-officer"
  }'
```

## Troubleshooting

### Error: "No authorization header"
- Make sure you're logged in as a school officer
- Check that the `Authorization: Bearer <token>` header is present

### Error: "Unauthorized: Only active school officers can create officers"
- Verify the requesting user has `role = 'school-officer'` AND `status = 'active'` in officers table

### Error: "Failed to create auth user"
- Check that `SUPABASE_SERVICE_ROLE_KEY` is correctly set
- Verify email doesn't already exist in auth.users

### Error: "Failed to create officer record"
- Check RLS policies on officers table
- Verify all required fields are provided
- Check database constraints

## Local Development

To test functions locally:

```bash
# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve create-officer

# In another terminal, test:
curl -i --location --request POST 'http://localhost:54321/functions/v1/create-officer' \
  --header 'Authorization: Bearer YOUR_LOCAL_JWT' \
  --header 'Content-Type: application/json' \
  --data '{"full_name":"Test","email":"test@test.com","department":"CS","password":"Pass123","role":"department-officer"}'
```

## Security Notes

1. **Service Role Key**: NEVER expose this key in client-side code. It's only used in Edge Functions (server-side).

2. **Password Validation**: The function enforces:
   - Minimum 8 characters
   - At least 1 uppercase letter
   - At least 1 lowercase letter
   - At least 1 number

3. **Email Validation**: Proper email format checked before auth user creation.

4. **Authorization**: Only active school officers can create new officers.

5. **Rollback**: If officer record creation fails after auth user is created, the auth user is automatically deleted to maintain consistency.

## Next Steps

After deploying Edge Functions:
1. Apply RLS policies: Run `/supabase/migrations/20260222000002_comprehensive_rls_policies.sql`
2. Test officer creation in the UI
3. Monitor function logs in Supabase Dashboard: **Edge Functions** > **Logs**
