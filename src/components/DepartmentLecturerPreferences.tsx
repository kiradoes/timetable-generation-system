import { Save, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface DepartmentLecturerPreferencesProps {
    departmentName: string;
    sessionId: number | null;
}

interface LecturerPreference {
    preference_id?: number;
    lecturer_id: number;
    lecturer_name: string;
    preferences: string;
}

export function DepartmentLecturerPreferences({ departmentName, sessionId }: DepartmentLecturerPreferencesProps) {
    const [lecturers, setLecturers] = useState<any[]>([]);
    const [preferences, setPreferences] = useState<Map<number, LecturerPreference>>(new Map());
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (departmentName && sessionId) {
            fetchData();
        }
    }, [departmentName, sessionId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.getLecturers({ department: departmentName, session_id: sessionId });
            if (response.success) {
                setLecturers(response.data || []);
                const prefMap = new Map();
                (response.data || []).forEach((lec: any) => {
                    let prefs: any = {};
                    if (lec.preferences) {
                        try {
                            prefs = typeof lec.preferences === 'string' ? JSON.parse(lec.preferences) : lec.preferences;
                        } catch (_) {}
                    }
                    prefMap.set(lec.lecturer_id, {
                        preference_id: lec.lecturer_id,
                        lecturer_id: lec.lecturer_id,
                        lecturer_name: `${lec.first_name || ''} ${lec.last_name || ''}`.trim() || lec.name,
                        preferences: prefs.preferences != null ? String(prefs.preferences) : '',
                    });
                });
                setPreferences(prefMap);
            }
        } catch (error: any) {
            toast.error('Failed to load lecturers');
        } finally {
            setLoading(false);
        }
    };

    const updatePreference = (lecturerId: number, field: string, value: any) => {
        const pref = preferences.get(lecturerId);
        if (pref) {
            setPreferences(new Map(preferences).set(lecturerId, { ...pref, [field]: value }));
        }
    };

    const handleSavePreference = async (lecturerId: number) => {
        const pref = preferences.get(lecturerId);
        if (!pref) return;

        try {
            const prefData = {
                lecturer_id: lecturerId,
                department: departmentName,
                session_id: sessionId,
                preferences: pref.preferences ?? '',
                preferred_times: [],
                unavailable_days: [],
                unavailable_times: [],
            };

            if (pref.preference_id) {
                await api.updateLecturerPreference(pref.preference_id, prefData);
                toast.success('Preference updated');
            } else {
                await api.createLecturerPreference(prefData);
                toast.success('Preference saved');
            }
            fetchData();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleDeletePreference = async (prefId?: number) => {
        if (!prefId) {
            toast.info('No preference saved yet');
            return;
        }

        if (confirm('Delete this preference?')) {
            try {
                await api.deleteLecturerPreference(prefId);
                toast.success('Preference deleted');
                fetchData();
            } catch (error: any) {
                toast.error(error.message);
            }
        }
    };

    const filteredLecturers = lecturers.filter(lec =>
        `${lec.first_name} ${lec.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">{departmentName} - Lecturer Preferences</h2>
                <p className="text-gray-600 mt-1">Set availability and scheduling preferences for department lecturers</p>
            </div>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        className="pl-10"
                        placeholder="Search lecturers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <p className="text-center py-8">Loading lecturers...</p>
                ) : filteredLecturers.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No lecturers found</p>
                ) : (
                    filteredLecturers.map(lecturer => {
                        const pref = preferences.get(lecturer.lecturer_id);
                        if (!pref) return null;

                        return (
                            <Card key={lecturer.lecturer_id} className="overflow-hidden">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">{pref.lecturer_name}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Preferences:</Label>
                                        <textarea
                                            className="w-full mt-2 min-h-[80px] px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b] text-sm"
                                            placeholder="e.g. Prefer morning slots; not available Wed afternoons"
                                            value={pref.preferences ?? ''}
                                            onChange={(e) => updatePreference(lecturer.lecturer_id, 'preferences', e.target.value)}
                                            rows={3}
                                        />
                                        <p className="text-xs text-slate-500 mt-1">This text is shown when scheduling so officers can take it into consideration.</p>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            onClick={() => handleSavePreference(lecturer.lecturer_id)}
                                            className="flex-1"
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Preference
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeletePreference(pref.preference_id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
