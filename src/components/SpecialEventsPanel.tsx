import { AlertCircle, Clock, Edit2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

type SpecialEventType = 'break' | 'chapel_seminar';

interface SpecialEvent {
    event_id: number;
    event_type: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    event_name?: string;
    description?: string;
}

function parseLevelFromDescription(description: string | null | undefined): number | null {
    if (!description) return null;
    const m = description.match(/Level\s*(\d+)/i);
    return m ? parseInt(m[1], 10) : null;
}

interface SpecialEventsPanelProps {
    activeSessionId: number | null;
}

const BREAK_START = '13:00';
const BREAK_END = '14:00';

export function SpecialEventsPanel({ activeSessionId }: SpecialEventsPanelProps) {
    const [events, setEvents] = useState<SpecialEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingEventId, setEditingEventId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        event_type: 'break' as SpecialEventType,
        day_of_week: 'All',
        start_time: BREAK_START,
        end_time: BREAK_END,
        event_name: 'Break',
        level: null as number | null
    });

    useEffect(() => {
        if (activeSessionId) {
            fetchSpecialEvents();
        }
    }, [activeSessionId]);

    const fetchSpecialEvents = async () => {
        if (!activeSessionId) return;

        try {
            setLoading(true);
            const response = await api.getSpecialEvents({ session_id: activeSessionId }) as any;
            if (response.success) {
                setEvents(response.data || []);
            } else {
                toast.error(response.error || 'Failed to load special events');
            }
        } catch (error) {
            toast.error('Failed to load special events');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!activeSessionId) {
            toast.error('No active session');
            return;
        }

        if (formData.event_type === 'chapel_seminar' && formData.level == null) {
            toast.error('Level is required for Chapel Seminar');
            return;
        }

        if (formData.start_time >= formData.end_time) {
            toast.error('Start time must be before end time');
            return;
        }

        try {
            setLoading(true);
            const isBreak = formData.event_type === 'break';
            const chapelDay = formData.day_of_week === 'All' ? 'Monday' : formData.day_of_week;
            const payload: Record<string, unknown> = {
                session_id: activeSessionId,
                event_type: isBreak ? 'lunch' : 'chapel',
                day_of_week: isBreak ? 'All' : chapelDay,
                start_time: isBreak ? BREAK_START : formData.start_time,
                end_time: isBreak ? BREAK_END : formData.end_time,
                event_name: isBreak ? 'Break' : 'Chapel Seminar',
                description: formData.event_type === 'chapel_seminar' && formData.level != null ? `Level ${formData.level}` : null
            };

            const response = editingEventId
                ? await api.updateSpecialEvent(editingEventId, {
                    event_type: payload.event_type,
                    day_of_week: payload.day_of_week,
                    start_time: payload.start_time,
                    end_time: payload.end_time,
                    event_name: payload.event_name,
                    description: payload.description
                }) as any
                : await api.createSpecialEvent(payload) as any;

            if (response.success) {
                toast.success(editingEventId ? 'Special event updated successfully' : 'Special event created successfully');
                setShowForm(false);
                setEditingEventId(null);
                setFormData({
                    event_type: 'break',
                    day_of_week: 'All',
                    start_time: BREAK_START,
                    end_time: BREAK_END,
                    event_name: 'Break',
                    level: null
                });
                fetchSpecialEvents();
            } else {
                toast.error(response.error || (editingEventId ? 'Failed to update special event' : 'Failed to create special event'));
            }
        } catch (error: any) {
            toast.error(error.message || (editingEventId ? 'Error updating special event' : 'Error creating special event'));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (event: SpecialEvent) => {
        const isBreak = event.event_type === 'lunch';
        setFormData({
            event_type: isBreak ? 'break' : 'chapel_seminar',
            day_of_week: event.day_of_week === 'All' ? 'All' : event.day_of_week,
            start_time: event.start_time ? String(event.start_time).slice(0, 5) : BREAK_START,
            end_time: event.end_time ? String(event.end_time).slice(0, 5) : BREAK_END,
            event_name: event.event_name || (isBreak ? 'Break' : 'Chapel Seminar'),
            level: parseLevelFromDescription(event.description)
        });
        setEditingEventId(event.event_id);
        setShowForm(true);
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingEventId(null);
        setFormData({
            event_type: 'break',
            day_of_week: 'All',
            start_time: BREAK_START,
            end_time: BREAK_END,
            event_name: 'Break',
            level: null
        });
    };

    const handleDelete = async (eventId: number) => {
        if (!confirm('Are you sure you want to delete this special event?')) return;

        try {
            setLoading(true);
            const response = await api.deleteSpecialEvent(eventId) as any;
            if (response.success) {
                toast.success('Special event deleted successfully');
                fetchSpecialEvents();
            } else {
                toast.error(response.error || 'Failed to delete special event');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error deleting special event');
        } finally {
            setLoading(false);
        }
    };

    const displayType = (ev: SpecialEvent) => ev.event_name || (ev.event_type === 'lunch' ? 'Break' : ev.event_type === 'chapel' ? 'Chapel Seminar' : ev.event_type);

    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center justify-between text-[#0f2044]">
                    <span className="flex items-center gap-2">
                        <Clock className="size-5 text-[#ffb71b]" />
                        Special Event
                    </span>
                    <Button
                        onClick={() => { setEditingEventId(null); setShowForm(!showForm); }}
                        className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
                        size="sm"
                    >
                        <Plus className="mr-2 size-4" />
                        Add Event
                    </Button>
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">Add Break (all days) or Chapel Seminar (per day and level). Once set, no lecture can be scheduled during that time and the event will appear on the timetable.</p>
            </CardHeader>
            <CardContent className="space-y-6">
                {showForm && (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <h3 className="text-sm font-semibold text-[#0f2044] mb-3">{editingEventId ? 'Edit special event' : 'Add special event'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Event type *</label>
                                <select
                                    value={formData.event_type}
                                    onChange={(e) => {
                                        const v = e.target.value as SpecialEventType;
                                        setFormData({
                                            ...formData,
                                            event_type: v,
                                            day_of_week: v === 'break' ? 'All' : (formData.day_of_week === 'All' ? 'Monday' : formData.day_of_week),
                                            start_time: v === 'break' ? BREAK_START : formData.start_time,
                                            end_time: v === 'break' ? BREAK_END : formData.end_time,
                                            event_name: v === 'break' ? 'Break' : 'Chapel Seminar',
                                            level: v === 'break' ? null : formData.level
                                        });
                                    }}
                                    className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                                    required
                                >
                                    <option value="break">Break</option>
                                    <option value="chapel_seminar">Chapel Seminar</option>
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Select the type; then fill in the fields below for that type.</p>
                            </div>

                            {formData.event_type === 'break' && (
                                <div className="flex items-start gap-3 text-sm text-slate-700 bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <Clock className="size-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-amber-900">Break — All days</p>
                                        <p className="mt-1">Time: 1:00 PM – 2:00 PM (fixed). No lectures can be scheduled during this slot on any day. The event will appear on the timetable.</p>
                                    </div>
                                </div>
                            )}

                            {formData.event_type === 'chapel_seminar' && (
                                <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <p className="text-sm font-medium text-slate-700">Chapel Seminar — set day, level, and time. No lectures can be scheduled for that level on that day and time; the event will appear on the timetable.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Level *</label>
                                            <select
                                                value={formData.level ?? ''}
                                                onChange={(e) => setFormData({ ...formData, level: e.target.value === '' ? null : Number(e.target.value) })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                                                required
                                            >
                                                <option value="">Select level</option>
                                                <option value="100">100</option>
                                                <option value="200">200</option>
                                                <option value="300">300</option>
                                                <option value="400">400</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Day of week *</label>
                                            <select
                                                value={formData.day_of_week === 'All' ? 'Monday' : formData.day_of_week}
                                                onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                                            >
                                                <option value="Monday">Monday</option>
                                                <option value="Tuesday">Tuesday</option>
                                                <option value="Wednesday">Wednesday</option>
                                                <option value="Thursday">Thursday</option>
                                                <option value="Friday">Friday</option>
                                            </select>
                                            <p className="text-xs text-slate-500 mt-1">Chapel Seminar is per day, not all days.</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Start time *</label>
                                            <input
                                                type="time"
                                                value={formData.start_time}
                                                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">End time *</label>
                                            <input
                                                type="time"
                                                value={formData.end_time}
                                                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button type="submit" disabled={loading} className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white">
                                    {editingEventId ? 'Update Event' : 'Create Event'}
                                </Button>
                                <Button type="button" onClick={handleCancelForm} variant="outline">
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {events.length > 0 ? (
                    <div className="space-y-3">
                        {events.map((event) => (
                            <div
                                key={event.event_id}
                                className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                            >
                                <div className={`p-3 rounded-lg ${event.event_type === 'lunch' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'}`}>
                                    <span className="text-xl">{event.event_type === 'lunch' ? '☕' : '⛪'}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-semibold text-slate-900">
                                            {displayType(event)}
                                        </h3>
                                        <span className="text-sm text-slate-500">
                                            {event.day_of_week === 'All' ? 'All Days' : event.day_of_week}
                                        </span>
                                        {parseLevelFromDescription(event.description) != null && (
                                            <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                                                {parseLevelFromDescription(event.description)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1">
                                        {event.start_time} – {event.end_time}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-[#0f2044] border-[#0f2044]/30 hover:bg-[#0f2044]/5"
                                        onClick={() => handleEdit(event)}
                                        disabled={loading}
                                        title="Edit"
                                    >
                                        <Edit2 className="size-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDelete(event.event_id)}
                                        disabled={loading}
                                        title="Delete"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <AlertCircle className="size-5 text-blue-600" />
                        <p className="text-blue-800">
                            No special events. Add <strong>Break</strong> (1–2pm daily) or <strong>Chapel Seminar</strong> (by level) so they show on the timetable.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
