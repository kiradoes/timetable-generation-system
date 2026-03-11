import { AlertCircle, BookOpen, Calendar, Clock, Download, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface Department {
    id: number;
    name: string;
    code: string;
}

interface ClassGroup {
    id: number;
    name: string;
    level: string;
    student_count: number;
    department_name?: string;
}

interface TimetableEntry {
    id: number;
    lecturer_name: string;
    course_code: string;
    course_title: string;
    class_name: string;
    venue_name: string;
    day: string;
    start_time: string;
    end_time: string;
}

interface TimetableData {
    classGroup: ClassGroup;
    session: { name: string; id: number };
    timetable: TimetableEntry[];
}

export default function TimetableSearch() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
    const [levels, setLevels] = useState<string[]>([]);
    const [timetable, setTimetable] = useState<TimetableData | null>(null);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [sessions, setSessions] = useState<{ session_id: number; name: string; status: string; is_current?: boolean }[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);

    // Form state
    const [selectedDepartment, setSelectedDepartment] = useState<number | ''>('');
    const [selectedLevel, setSelectedLevel] = useState<string>('');
    const [selectedClass, setSelectedClass] = useState<number | ''>('');

    // Fetch departments and current session on mount
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                setLoading(true);
                const response = await api.getPublicDepartments() as any;
                if (response.success) {
                    setDepartments(response.data || []);
                } else {
                    toast.error('Failed to load departments');
                    console.error('Error fetching departments:', response);
                }
            } catch (error) {
                console.error('Error fetching departments:', error);
                toast.error('Error fetching departments');
            } finally {
                setLoading(false);
            }
        };
        const fetchSessions = async () => {
            try {
                const res = await api.getSessions({}) as any;
                if (res?.success && Array.isArray(res.data)) {
                    setSessions(res.data);
                    const current = res.data.find((s: any) => s.is_current && s.status === 'active')
                        || res.data.find((s: any) => s.status === 'active')
                        || res.data[0];
                    setCurrentSessionId(current?.session_id ?? null);
                }
            } catch {
                setCurrentSessionId(null);
            }
        };

        fetchDepartments();
        fetchSessions();
    }, []);

    // Fetch levels when department changes
    useEffect(() => {
        if (!selectedDepartment) {
            setLevels([]);
            setSelectedLevel('');
            return;
        }

        const fetchLevels = async () => {
            try {
                const response = await api.getLevelsByDepartment(selectedDepartment.toString()) as any;
                if (response.success) {
                    setLevels(response.data || []);
                    setSelectedLevel('');
                } else {
                    console.error('Error fetching levels:', response);
                }
            } catch (error) {
                console.error('Error fetching levels:', error);
            }
        };

        fetchLevels();
    }, [selectedDepartment]);

    // Fetch class groups when department and level change
    useEffect(() => {
        if (!selectedDepartment || !selectedLevel) {
            setClassGroups([]);
            setSelectedClass('');
            return;
        }

        const fetchClassGroups = async () => {
            try {
                const response = await api.getClassGroupsByDepartmentAndLevel(
                    selectedDepartment.toString(),
                    selectedLevel
                ) as any;

                if (response.success) {
                    const groups = response.data || [];
                    setClassGroups(groups.map((g: any) => ({ ...g, id: g.group_id })));
                    setSelectedClass('');
                } else {
                    console.error('Error fetching class groups:', response);
                }
            } catch (error) {
                console.error('Error fetching class groups:', error);
            }
        };

        fetchClassGroups();
    }, [selectedDepartment, selectedLevel]);

    const handleSearch = async () => {
        if (!selectedDepartment || !selectedLevel || !selectedClass) {
            toast.error('Please select department, level, and class');
            return;
        }

        setSearching(true);
        const sessionId = currentSessionId ?? 1;
        try {
            const response = await api.getPublicTimetable(
                Number(selectedClass),
                sessionId
            ) as any;
            const sessionName = sessions.find((s: any) => s.session_id === sessionId)?.name ?? 'Current';

            if (response.success) {
                setTimetable({
                    classGroup: (classGroups.find((cg: any) => cg.group_id === selectedClass) || {}) as ClassGroup,
                    session: { name: sessionName, id: sessionId },
                    timetable: response.data || []
                });
            } else {
                toast.error('Failed to load timetable');
                console.error('Error fetching timetable:', response);
            }
        } catch (error) {
            console.error('Error fetching timetable:', error);
            toast.error('Error loading timetable');
        } finally {
            setSearching(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!timetable) return;

        // Create a simple HTML representation for printing
        const htmlContent = generateTimetableHTML(timetable);
        const printWindow = window.open('', '', 'height=600,width=800');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Search Section */}
            <Card className="border border-slate-200 shadow-md">
                <CardHeader className="bg-gradient-to-r from-[#0f2044] to-[#1a3a5c] text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-6 h-6" />
                        View Your Timetable
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Department Selector */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Department *
                            </label>
                            <select
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value ? Number(e.target.value) : '')}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffb71b] focus:border-transparent"
                                disabled={loading}
                            >
                                <option value="">Select Department</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Level Selector */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Level *
                            </label>
                            <select
                                value={selectedLevel}
                                onChange={(e) => setSelectedLevel(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffb71b] focus:border-transparent"
                                disabled={!selectedDepartment || levels.length === 0}
                            >
                                <option value="">Select Level</option>
                                {levels.map((level) => (
                                    <option key={level} value={level}>
                                        {level}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Class Selector */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Class *
                            </label>
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value ? Number(e.target.value) : '')}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffb71b] focus:border-transparent"
                                disabled={!selectedLevel || classGroups.length === 0}
                            >
                                <option value="">Select Class</option>
                                {classGroups.map((group) => (
                                    <option key={group.id} value={group.id}>
                                        {group.department_name ?? group.department ?? 'Unassigned'} - {group.level} - {group.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Search Button */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">&nbsp;</label>
                            <Button
                                onClick={handleSearch}
                                disabled={searching || !selectedClass}
                                className="w-full px-6 py-2 bg-[#0f2044] text-white hover:bg-[#1a3a5c] disabled:bg-slate-400"
                            >
                                {searching ? (
                                    <Clock className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <BookOpen className="w-4 h-4 mr-2" />
                                )}
                                Search Timetable
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Timetable Results Section */}
            {timetable && (
                <Card className="border border-slate-200 shadow-md">
                    <CardHeader className="bg-gradient-to-r from-[#0f2044] to-[#1a3a5c] text-white rounded-t-lg">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-6 h-6" />
                                Timetable for {timetable.classGroup.name}
                            </CardTitle>
                            <Button
                                onClick={handleDownloadPDF}
                                className="flex items-center gap-2 bg-[#ffb71b] text-[#0f2044] hover:bg-[#ffb71b]/90"
                            >
                                <Download className="w-4 h-4" />
                                Download PDF
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {/* Session Info */}
                        {timetable.session && (
                            <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                <p className="text-sm text-slate-600">
                                    <span className="font-medium">Session:</span> {timetable.session.name}
                                </p>
                            </div>
                        )}

                        {/* Timetable Table */}
                        {timetable.timetable.length === 0 ? (
                            <div className="text-center py-12">
                                <AlertCircle className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                <p className="text-slate-500">No timetable available for this class</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b-2 border-slate-200 bg-slate-50">
                                            <th className="text-left px-4 py-3 font-medium text-slate-700">Day</th>
                                            <th className="text-left px-4 py-3 font-medium text-slate-700">Time</th>
                                            <th className="text-left px-4 py-3 font-medium text-slate-700">Course</th>
                                            <th className="text-left px-4 py-3 font-medium text-slate-700">Lecturer</th>
                                            <th className="text-left px-4 py-3 font-medium text-slate-700">Venue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {timetable.timetable.map((entry) => (
                                            <tr key={entry.id} className="border-b border-slate-200 hover:bg-slate-50">
                                                <td className="px-4 py-3 text-slate-900">
                                                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                                        {entry.day}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-900">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-slate-400" />
                                                        {entry.start_time} - {entry.end_time}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-900">
                                                    <div>
                                                        <p className="font-medium">{entry.course_code}</p>
                                                        <p className="text-xs text-slate-500">{entry.course_title}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-900">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-slate-400" />
                                                        {entry.lecturer_name}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-900">
                                                    <div className="flex items-center gap-2">
                                                        <BookOpen className="w-4 h-4 text-slate-400" />
                                                        {entry.venue_name}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Class Info Footer */}
                        <div className="mt-6 pt-4 border-t border-slate-200 text-sm text-slate-600">
                            <p>
                                <span className="font-medium">Class:</span> {timetable.classGroup.name} • Level:{' '}
                                {timetable.classGroup.level} • Students: {timetable.classGroup.student_count}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// Helper function to generate printable HTML
function generateTimetableHTML(timetable: TimetableData): string {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = new Set<string>();

    // Collect all time slots
    timetable.timetable.forEach((entry) => {
        timeSlots.add(entry.start_time);
    });

    const sortedTimes = Array.from(timeSlots).sort();

    // Group entries by day and time
    const grid: { [key: string]: { [key: string]: TimetableEntry } } = {};
    days.forEach((day) => {
        grid[day] = {};
        sortedTimes.forEach((time) => {
            grid[day][time] = null as any;
        });
    });

    timetable.timetable.forEach((entry) => {
        grid[entry.day][entry.start_time] = entry;
    });

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Timetable - ${timetable.classGroup.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #0f2044; text-align: center; margin-bottom: 10px; }
        .info { text-align: center; margin-bottom: 20px; color: #666; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #333; padding: 8px; text-align: left; }
        th { background-color: #0f2044; color: white; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .course { font-weight: bold; }
        .time { font-weight: bold; color: #0f2044; }
      </style>
    </head>
    <body>
      <h1>Timetable</h1>
      <div class="info">
        <p><strong>${timetable.classGroup.name}</strong> | Level: ${timetable.classGroup.level} | ${timetable.session?.name || 'N/A'}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            ${days.map((day) => `<th>${day}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${sortedTimes
            .map(
                (time) => `
            <tr>
              <td class="time">${time}</td>
              ${days
                        .map(
                            (day) => `
                <td>
                  ${grid[day][time]
                                    ? `
                    <div class="course">${grid[day][time].course_code}</div>
                    <div>${grid[day][time].course_title}</div>
                    <div>Lecturer: ${grid[day][time].lecturer_name}</div>
                    <div>Venue: ${grid[day][time].venue_name}</div>
                    <div>${grid[day][time].start_time} - ${grid[day][time].end_time}</div>
                  `
                                    : '-'
                                }
                </td>
              `
                        )
                        .join('')}
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
      <p style="margin-top: 30px; text-align: center; color: #999; font-size: 12px;">
        Generated on ${new Date().toLocaleString()}
      </p>
    </body>
    </html>
  `;

    return html;
}
