const bcrypt = require('bcryptjs');

const password = 'schooladmin123';
const saltRounds = 10;

async function generateHash() {
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        console.log('✅ Bcrypt hash generated:');
        console.log(hash);
        console.log('\nUse this SQL query:');
        console.log(`
UPDATE auth.users 
SET encrypted_password = '${hash}',
    updated_at = NOW()
WHERE email = 'admin@school.edu';
    `);
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

generateHash();
