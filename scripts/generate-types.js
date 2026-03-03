#!/usr/bin/env node
/**
 * Generate Supabase TypeScript types using REST API
 * This script introspects your Supabase database schema and generates types
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'ksbakicdkizciuivkujk';
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzYmFraWNka2l6Y2l1aXZrdWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyNzUyNDYsImV4cCI6MTg5NzA0MTI0Nn0.Ls2rrpj4ISkdDVHa_bBxrBxP-qvMV5F5Y2sI3FQpM-4';

function httpsGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'apikey': ANON_KEY,
                'Accept': 'application/json'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function generateTypes() {
    try {
        console.log('🔄 Fetching database schema from Supabase...');

        const url = `${SUPABASE_URL}/rest/v1/?apikey=${ANON_KEY}`;
        const schema = await httpsGet(url);

        console.log('✅ Schema fetched successfully');
        console.log('📊 Available tables:', Object.keys(schema.definitions || {}).length);

        // Just regenerate using npx with proper authentication
        const { execSync } = require('child_process');

        // Try to use Supabase CLI if available
        try {
            console.log('\n🔑 Attempting to generate types using Supabase CLI...');
            const result = execSync(`npx supabase gen types typescript --project-id ${PROJECT_ID}`, {
                timeout: 30000,
                stdio: 'pipe'
            }).toString();

            const outputPath = path.join(__dirname, '../src/lib/database.types.ts');
            fs.writeFileSync(outputPath, result);
            console.log(`✅ Types generated successfully at ${outputPath}`);
        } catch (cliError) {
            console.log('⚠️  CLI method failed, using direct approach...');

            // Fallback: Show instructions for manual token setup
            console.log(`\n📋 To generate types with the Supabase CLI, follow these steps:\n`);
            console.log(`1️⃣  Get your Supabase Personal Access Token:`);
            console.log(`   • Go to: https://app.supabase.com/account/tokens`);
            console.log(`   • Create a new token (or copy existing one)`);
            console.log(`   • Copy the token value\n`);

            console.log(`2️⃣  Set environment variable (Windows PowerShell):`);
            console.log(`   $env:SUPABASE_ACCESS_TOKEN = "your-token-here"\n`);

            console.log(`3️⃣  Then run the type generation command:`);
            console.log(`   npx supabase gen types typescript --project-id ${PROJECT_ID} > src/lib/database.types.ts\n`);

            console.log(`💡 Or use persistent setup (add to profile):`);
            console.log(`   1. Open: $PROFILE in PowerShell`);
            console.log(`   2. Add: $env:SUPABASE_ACCESS_TOKEN = "your-token-here"`);
            console.log(`   3. Save and reload PowerShell\n`);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

generateTypes();
