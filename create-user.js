const { createClient } = require('@supabase/supabase-js');

// Get your SERVICE_ROLE_KEY from:
// Supabase Dashboard → Settings → API → Service role key
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY_HERE';
const SUPABASE_URL = 'https://znhqlurxcmptcsdkxhbm.supabase.co';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function createOfficer() {
    try {
        console.log('Creating school officer user...');

        const { data, error } = await supabase.auth.admin.createUser({
            email: 'school.officer@babcock.edu.ng',
            password: 'schooladmin123',
            user_metadata: {
                full_name: 'School Admin',
                role: 'school-officer'
            },
            email_confirm: true
        });

        if (error) {
            console.error('❌ Error creating user:', error.message);
            process.exit(1);
        }

        console.log('✅ User created successfully!');
        console.log('User ID:', data.user.id);
        console.log('Email:', data.user.email);
        console.log('\nLogin credentials:');
        console.log('Email: school.officer@babcock.edu.ng');
        console.log('Password: schooladmin123');

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

createOfficer();
