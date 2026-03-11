// =============================================
// CREATE OFFICER WITH AUTH USER
// Edge Function for creating officers with Supabase Auth integration
// =============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: any;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-token",
};

interface CreateOfficerRequest {
    full_name: string;
    email: string;
    department: string;
    password: string;
}

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Read user token from x-user-token header (preferred) or fallback to Authorization header
        // The Authorization header is used by the Supabase API gateway for verification (anon key),
        // so the actual user JWT is passed via x-user-token to avoid gateway rejection.
        const userToken = req.headers.get("x-user-token") || req.headers.get("Authorization");
        if (!userToken) {
            return new Response(
                JSON.stringify({ error: "No user token provided. Send x-user-token header." }),
                { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
            );
        }

        // Ensure it has Bearer prefix for the client
        const bearerToken = userToken.startsWith("Bearer ") ? userToken : `Bearer ${userToken}`;

        // Create client with user's auth context
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") || "",
            Deno.env.get("SUPABASE_ANON_KEY") || "",
            {
                global: {
                    headers: { Authorization: bearerToken },
                },
            }
        );

        // Create admin client for auth operations
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") || "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // Verify requesting user is a school officer
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            return new Response(
                JSON.stringify({ error: "Not authenticated" }),
                { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
            );
        }

        const { data: requester } = await supabaseClient
            .from('officers')
            .select('role, status')
            .eq('auth_user_id', user.id)
            .single();

        if (!requester || requester.status !== 'active' || requester.role !== 'school-officer') {
            return new Response(
                JSON.stringify({ error: "Unauthorized: Only active school officers can create officers" }),
                { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
            );
        }

        // Parse request body
        const body: CreateOfficerRequest = await req.json();
        const { full_name, email, department, password } = body;
        const role = 'department-officer'; // All officers created via UI are department officers

        // Validate required fields
        if (!full_name || !email || !department || !password) {
            return new Response(
                JSON.stringify({ error: "Missing required fields: full_name, email, department, password" }),
                { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new Response(
                JSON.stringify({ error: "Invalid email format" }),
                { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
            );
        }

        // Validate password strength
        if (password.length < 8) {
            return new Response(
                JSON.stringify({ error: "Password must be at least 8 characters long" }),
                { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
            );
        }
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            return new Response(
                JSON.stringify({ error: "Password must contain uppercase, lowercase, and number" }),
                { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
            );
        }

        // Check if email already exists
        const { data: existingOfficer } = await supabaseClient
            .from('officers')
            .select('officer_id')
            .eq('email', email)
            .maybeSingle();

        if (existingOfficer) {
            return new Response(
                JSON.stringify({ error: "An officer with this email already exists." }),
                { status: 409, headers: { "Content-Type": "application/json", ...corsHeaders } }
            );
        }

        // Check if full name already exists in the same department (no two officers with same full name in same department)
        const deptForCheck = (department || "").trim();
        const { data: sameNameOfficers } = await supabaseClient
            .from('officers')
            .select('officer_id, department')
            .eq('full_name', full_name.trim());
        if (sameNameOfficers && sameNameOfficers.length > 0) {
            const hasSameDept = sameNameOfficers.some((o: { department?: string | null }) => (o.department || "").trim() === deptForCheck);
            if (hasSameDept) {
                return new Response(
                    JSON.stringify({ error: "An officer with this full name already exists in this department. No two officers can have the same full name in the same department." }),
                    { status: 409, headers: { "Content-Type": "application/json", ...corsHeaders } }
                );
            }
        }

        // Only one department officer per department
        const { data: existingDeptOfficer } = await supabaseClient
            .from('officers')
            .select('officer_id')
            .eq('role', 'department-officer')
            .eq('department', deptForCheck)
            .maybeSingle();

        if (existingDeptOfficer) {
            return new Response(
                JSON.stringify({ error: "Only one department officer can be created per department. This department already has a department officer." }),
                { status: 409, headers: { "Content-Type": "application/json", ...corsHeaders } }
            );
        }

        // Step 1: Create auth user (pass metadata so it's stored on the user record)
        // NOTE: The on_auth_user_created trigger on auth.users MUST be dropped,
        // otherwise it will try to also insert into officers and conflict.
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name,
                department,
                role
            }
        });

        if (authError || !authData.user) {
            console.error('Auth creation error:', authError);
            return new Response(
                JSON.stringify({ error: `Failed to create auth user: ${authError?.message || 'Unknown error'}` }),
                { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
            );
        }

        console.log('Auth user created:', authData.user.id);

        // Step 2: Create officer record using admin client (bypass RLS)
        const { data: officer, error: officerError } = await supabaseAdmin
            .from('officers')
            .insert({
                auth_user_id: authData.user.id,
                full_name,
                email,
                department,
                role,
                status: 'active'
            })
            .select()
            .single();

        if (officerError) {
            // Rollback: Delete auth user if officer creation fails
            console.error('Officer creation error:', officerError);
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            const isDuplicate = officerError.code === "23505" || (officerError.message || "").toLowerCase().includes("unique");
            const friendlyMessage = isDuplicate
                ? "An officer with this full name already exists in this department. No two officers can have the same full name in the same department."
                : `Failed to create officer record: ${officerError.message}`;
            return new Response(
                JSON.stringify({ error: friendlyMessage }),
                { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
            );
        }

        // Success
        return new Response(
            JSON.stringify({
                success: true,
                data: officer,
                message: "Officer created successfully"
            }),
            { status: 201, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );

    } catch (error) {
        console.error('Error in create-officer function:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return new Response(
            JSON.stringify({ error: errorMessage }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    }
});
