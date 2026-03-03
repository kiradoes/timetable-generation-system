/// <reference types="../vite-env.d.ts" />
// Supabase client configuration for frontend
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. Please check your .env file.'
    );
}

// Create Supabase client with proper TypeScript support
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});

export type { Database };

// Helper function to get current user
export const getCurrentUser = async () => {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error) {
        console.error('Error getting current user:', error);
        return null;
    }

    return user;
};

// Helper function to get current officer
export const getCurrentOfficer = async () => {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('officers')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

    if (error) {
        console.error('Error getting current officer:', error);
        return null;
    }

    return data;
};

// Helper function to check if user is school officer
export const isSchoolOfficer = async () => {
    const officer = await getCurrentOfficer();
    return officer?.role === 'school-officer';
};

// Helper function to sign in
export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    return { data, error };
};

// Helper function to sign out
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};

// Helper function to sign up
export const signUp = async (
    email: string,
    password: string,
    metadata: { name: string; role: string; departmentId?: number }
) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: metadata,
        },
    });

    return { data, error };
};

// Realtime subscription helper
export const subscribeToScheduleChanges = (
    sessionId: number,
    callback: (payload: any) => void
) => {
    return supabase
        .channel('schedule-changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'schedules',
                filter: `session_id=eq.${sessionId}`,
            },
            callback
        )
        .subscribe();
};

export default supabase;
