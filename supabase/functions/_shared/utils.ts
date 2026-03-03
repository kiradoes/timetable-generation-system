// Shared utility functions for Supabase Edge Functions

export interface ConflictCheckResult {
    hasConflict: boolean;
    message?: string;
    conflictingSchedule?: any;
}

export function calculateEndTime(startTime: string, durationHours: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHour = hours + durationHours;
    return `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function checkTimeOverlap(
    startTime1: string,
    endTime1: string,
    startTime2: string,
    endTime2: string
): boolean {
    return (
        (startTime1 >= startTime2 && startTime1 < endTime2) ||
        (endTime1 > startTime2 && endTime1 <= endTime2) ||
        (startTime1 <= startTime2 && endTime1 >= endTime2)
    );
}

export function formatTimeForDisplay(time: string): string {
    return time.substring(0, 5);
}

export const DAY_ORDER = {
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5
};
