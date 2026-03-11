import { supabase } from '../lib/supabase';

export async function createOfficer(
    email: string,
    password: string,
    fullName: string,
    role: 'school-officer' | 'department-officer' = 'department-officer'
) {
    try {
        // Get current session token for auth
        const { data: { session } } = await supabase.auth.getSession();

        const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-officer`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token || ''}`,
                },
                body: JSON.stringify({
                    email,
                    password,
                    full_name: fullName,
                    role,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create officer');
        }

        return {
            success: true,
            user: data.user,
            message: data.message,
        };
    } catch (error) {
        console.error('Error creating officer:', error);
        throw error;
    }
}

export async function createSchoolOfficer(
    email: string,
    password: string,
    fullName: string
) {
    return createOfficer(email, password, fullName, 'school-officer');
}
