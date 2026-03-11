-- Copy the user ID from Supabase Auth, then run this query in SQL Editor
-- Replace '8c60badb-28c8-4765-abdd-9b50013d23e0' with your actual user ID

INSERT INTO officers (auth_user_id, full_name, email, role, status)
VALUES (
  '8c60badb-28c8-4765-abdd-9b50013d23e0',  -- Replace with your auth user ID
  'School Officer',
  'your.email@school.edu',  -- Replace with your email
  'school-officer',
  'active'
)
ON CONFLICT (auth_user_id) DO NOTHING;

-- Verify the officer was created:
SELECT * FROM officers WHERE email = 'your.email@school.edu';
