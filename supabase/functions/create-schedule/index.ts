// @ts-nocheck - Deno Edge Function (types available in Deno runtime)
// Supabase Edge Function: Create Schedule
// Handles schedule creation with validation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScheduleRequest {
    session_id: number;
    course_id: number;
    lecturer_id: number;
    venue_id: number;
    class_group_id?: number;
    day: string;
    start_time: string;
    duration_hours: number;
    timetable_id?: number;
    notes?: string;
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
        const scheduleData: ScheduleRequest = await req.json()

        const {
            session_id,
            course_id,
            lecturer_id,
            venue_id,
            class_group_id,
            day,
            start_time,
            duration_hours,
            timetable_id,
            notes
        } = scheduleData

        // Validate required fields
        if (!session_id || !course_id || !lecturer_id || !venue_id || !day || !start_time || !duration_hours) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'All required fields must be provided'
                }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // First, validate the schedule by calling our validation function
        const validationResponse = await fetch(
            `${Deno.env.get('SUPABASE_URL')}/functions/v1/validate-schedule`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': req.headers.get('Authorization') || '',
                },
                body: JSON.stringify(scheduleData)
            }
        )

        const validation = await validationResponse.json()

        if (!validation.success) {
            return new Response(
                JSON.stringify(validation),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            )
        }

        // Calculate end time
        const end_time = validation.end_time

        // Find or create time slot
        let { data: timeSlot, error: slotError } = await supabaseClient
            .from('time_slots')
            .select('slot_id')
            .eq('day_of_week', day)
            .eq('start_time', start_time)
            .eq('end_time', end_time)
            .single()

        let slot_id: number

        if (slotError || !timeSlot) {
            // Create new time slot
            const { data: newSlot, error: createSlotError } = await supabaseClient
                .from('time_slots')
                .insert({
                    day_of_week: day,
                    start_time,
                    end_time,
                    slot_name: `${start_time} - ${end_time}`,
                    is_active: true
                })
                .select('slot_id')
                .single()

            if (createSlotError) throw createSlotError
            slot_id = newSlot.slot_id
        } else {
            slot_id = timeSlot.slot_id
        }

        // Get class size
        let class_size = 0
        if (class_group_id) {
            const { data: classData } = await supabaseClient
                .from('class_groups')
                .select('student_count')
                .eq('group_id', class_group_id)
                .single()

            class_size = classData?.student_count || 0
        }

        // Create schedule
        const { data: schedule, error: scheduleError } = await supabaseClient
            .from('schedules')
            .insert({
                timetable_id: timetable_id || null,
                course_id,
                lecturer_id,
                venue_id,
                slot_id,
                group_id: class_group_id || null,
                session_id,
                class_size,
                notes: notes || null,
                status: 'scheduled'
            })
            .select(`
        *,
        courses(course_code, title),
        lecturers(name),
        venues(name, capacity),
        time_slots(day_of_week, start_time, end_time),
        class_groups(name, level, department)
      `)
            .single()

        if (scheduleError) throw scheduleError

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Lecture scheduled successfully',
                data: { schedule }
            }),
            {
                status: 201,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )

    } catch (error) {
        console.error('Error creating schedule:', error)
        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            }),
            {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        )
    }
})
