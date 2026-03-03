// @ts-nocheck - Deno Edge Function (types available in Deno runtime)
// Supabase Edge Function: Validate Schedule
// Deno runtime for conflict detection

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ValidationRequest {
    session_id: number;
    lecturer_id: number;
    course_id: number;
    venue_id: number;
    class_group_id?: number;
    day: string;
    start_time: string;
    duration_hours: number;
    exclude_schedule_id?: number;
}

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Create Supabase client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        )

        // Parse request body
        const validation: ValidationRequest = await req.json()

        const {
            session_id,
            lecturer_id,
            course_id,
            venue_id,
            class_group_id,
            day,
            start_time,
            duration_hours,
            exclude_schedule_id
        } = validation

        // Calculate end time
        const [hours, minutes] = start_time.split(':').map(Number)
        const endHour = hours + duration_hours
        const end_time = `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

        // 1. Check time window (7 AM - 6 PM)
        if (hours < 7 || endHour > 18) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Lectures must be between 07:00 and 18:00'
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 2. Check special events
        const { data: specialEvents, error: specialEventsError } = await supabaseClient
            .from('special_events')
            .select('*')
            .eq('session_id', session_id)
            .eq('is_active', true)
            .or(`day_of_week.eq.${day},day_of_week.eq.All`)

        if (specialEventsError) throw specialEventsError

        for (const event of specialEvents || []) {
            const eventStart = event.start_time
            const eventEnd = event.end_time

            // Check overlap
            if (
                (start_time >= eventStart && start_time < eventEnd) ||
                (end_time > eventStart && end_time <= eventEnd) ||
                (start_time <= eventStart && end_time >= eventEnd)
            ) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: `Cannot schedule during ${event.event_type} (${eventStart.substring(0, 5)} - ${eventEnd.substring(0, 5)})`
                    }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }
        }

        // 3. Check lecturer conflict
        const { data: lecturerSchedules, error: lecturerError } = await supabaseClient
            .from('schedules')
            .select(`
        schedule_id,
        time_slots!inner(day_of_week, start_time, end_time)
      `)
            .eq('lecturer_id', lecturer_id)
            .eq('session_id', session_id)
            .eq('time_slots.day_of_week', day)
            .eq('status', 'scheduled')
            .neq('schedule_id', exclude_schedule_id || 0)

        if (lecturerError) throw lecturerError

        for (const schedule of lecturerSchedules || []) {
            const ts = schedule.time_slots as any
            const existingStart = ts.start_time
            const existingEnd = ts.end_time

            if (
                (start_time >= existingStart && start_time < existingEnd) ||
                (end_time > existingStart && end_time <= existingEnd) ||
                (start_time <= existingStart && end_time >= existingEnd)
            ) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: `Lecturer already has a class at this time (${existingStart.substring(0, 5)} - ${existingEnd.substring(0, 5)})`
                    }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }
        }

        // 4. Check venue conflict
        const { data: venueSchedules, error: venueError } = await supabaseClient
            .from('schedules')
            .select(`
        schedule_id,
        time_slots!inner(day_of_week, start_time, end_time)
      `)
            .eq('venue_id', venue_id)
            .eq('session_id', session_id)
            .eq('time_slots.day_of_week', day)
            .eq('status', 'scheduled')
            .neq('schedule_id', exclude_schedule_id || 0)

        if (venueError) throw venueError

        for (const schedule of venueSchedules || []) {
            const ts = schedule.time_slots as any
            const existingStart = ts.start_time
            const existingEnd = ts.end_time

            if (
                (start_time >= existingStart && start_time < existingEnd) ||
                (end_time > existingStart && end_time <= existingEnd) ||
                (start_time <= existingStart && end_time >= existingEnd)
            ) {
                return new Response(
                    JSON.stringify({
                        success: false,
                        error: `Venue already booked at this time (${existingStart.substring(0, 5)} - ${existingEnd.substring(0, 5)})`
                    }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }
        }

        // 5. Check class group conflict
        if (class_group_id) {
            const { data: classSchedules, error: classError } = await supabaseClient
                .from('schedules')
                .select(`
          schedule_id,
          time_slots!inner(day_of_week, start_time, end_time)
        `)
                .eq('group_id', class_group_id)
                .eq('session_id', session_id)
                .eq('time_slots.day_of_week', day)
                .eq('status', 'scheduled')
                .neq('schedule_id', exclude_schedule_id || 0)

            if (classError) throw classError

            for (const schedule of classSchedules || []) {
                const ts = schedule.time_slots as any
                const existingStart = ts.start_time
                const existingEnd = ts.end_time

                if (
                    (start_time >= existingStart && start_time < existingEnd) ||
                    (end_time > existingStart && end_time <= existingEnd) ||
                    (start_time <= existingStart && end_time >= existingEnd)
                ) {
                    return new Response(
                        JSON.stringify({
                            success: false,
                            error: `Class group already has a lecture at this time (${existingStart.substring(0, 5)} - ${existingEnd.substring(0, 5)})`
                        }),
                        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                    )
                }
            }

            // 6. Check venue capacity
            const { data: venueData } = await supabaseClient
                .from('venues')
                .select('capacity')
                .eq('venue_id', venue_id)
                .single()

            const { data: classData } = await supabaseClient
                .from('class_groups')
                .select('student_count')
                .eq('group_id', class_group_id)
                .single()

            if (venueData && classData) {
                if (classData.student_count > venueData.capacity) {
                    return new Response(
                        JSON.stringify({
                            success: false,
                            error: `Venue capacity (${venueData.capacity}) is less than class size (${classData.student_count})`
                        }),
                        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                    )
                }
            }
        }

        // All checks passed
        return new Response(
            JSON.stringify({
                success: true,
                end_time
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
            {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
})
