const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://znhqlurxcmptcsdkxhbm.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_ID = process.argv[2]; // Pass user ID as argument

if (!SERVICE_ROLE_KEY || !USER_ID) {
    console.error('❌ Error: SERVICE_ROLE_KEY not set or USER_ID not provided');
    console.error('Usage: $env:SUPABASE_SERVICE_ROLE_KEY="key"; node set-password.js USER_ID');
    process.exit(1);
}

console.log('Service key length:', SERVICE_ROLE_KEY.length);
console.log('User ID:', USER_ID);

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function setPassword() {
    try {
        console.log('Setting password for user...');

        const { data, error } = await supabase.auth.admin.updateUserById(
            USER_ID,
            { password: 'schooladmin123' }
        );

        if (error) {
            console.error('❌ Error:', error);
            process.exit(1);
        }

        console.log('✅ Password set successfully!');
        console.log('\nLogin credentials:');
        console.log('Email: school.officer@babcock.edu.ng');
        console.log('Password: schooladmin123');
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

setPassword();
