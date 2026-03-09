import { Edit2, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface SchoolComputingCoursesManagementProps {
    sessionId: number | null;
}

export function SchoolComputingCoursesManagement({ sessionId }: SchoolComputingCoursesManagementProps) {
    const [departments, setDepartments] = useState<{ department_id?: number; name: string }[]>([]);
    const [department, setDepartment] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        course_code: '', title: '', credit_units: 3, level: 100, semester: 'First',
        category: 'Core' as 'Core' | 'Elective',
    });

    useEffect(() => {
        const loadDepts = async () => {
            try {
                const res = await api.getDepartments() as any;
                if (res?.success && Array.isArray(res?.data)) setDepartments(res.data);
            } catch (e) {
                console.error('Failed to load departments:', e);
            }
        };
        loadDepts();
    }, []);

    useEffect(() => {
        if (department && sessionId) fetchCourses();
        else setCourses([]);
    }, [department, sessionId]);

    const fetchCourses = async () => {
        if (!department || !sessionId) return;
        setLoading(true);
        try {
            const response = await api.getCourses({ department, session_id: sessionId });
            const list = response.success ? response.data || [] : [];
            const computingOnly = Array.isArray(list) ? list.filter((c: any) => !['GEDS', 'SAT'].includes(c.category || '')) : [];
            setCourses(computingOnly);
        } catch (e: any) {
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionId) {
            toast.error('No active session');
            return;
        }
        if (!department) {
            toast.error('Select a department');
            return;
        }
        try {
            const existing = editingId ? courses.find((c: any) => (c.course_id ?? c.id) === editingId) : null;
            const data = {
                ...formData,
                department,
                session_id: sessionId,
                category: formData.category || existing?.category || 'Computing',
            };
            const response = editingId
                ? await api.updateCourse(editingId, data)
                : await api.createCourse(data);
            if (response.success) {
                toast.success(editingId ? 'Updated' : 'Created');
                resetForm();
                fetchCourses();
            } else {
                toast.error((response as any).error || 'Failed to save course');
            }
        } catch (e: any) {
            toast.error((e as Error)?.message || 'An error occurred');
        }
    };

    const resetForm = () => {
        setFormData({ course_code: '', title: '', credit_units: 3, level: 100, semester: 'First', category: 'Core' });
        setEditingId(null);
        setShowForm(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this course?')) return;
        try {
            await api.deleteCourse(id);
            toast.success('Deleted');
            fetchCourses();
        } catch (e: any) {
            toast.error((e as Error)?.message);
        }
    };

    const handleEdit = (c: any) => {
        setFormData({
            course_code: c.course_code,
            title: c.title,
            credit_units: c.credit_units ?? 3,
            level: c.level ?? 100,
            semester: c.semester ?? 'First',
            category: (c.category === 'Elective' ? 'Elective' : 'Core'),
        });
        setEditingId(c.course_id ?? c.id);
        setShowForm(true);
    };

    const semesterLabel = (s: string | undefined) => (s === 'First' || s === 'first' ? 'First' : s === 'Second' || s === 'second' ? 'Second' : s === 'Summer' || s === 'summer' ? 'Summer' : s?.toLowerCase().includes('post-siwes') ? 'Post-SIWES' : s ?? '—');

    const q = searchQuery.trim().toLowerCase();
    const filteredCourses = q
        ? courses.filter(
            (c: any) =>
                (c.course_code && String(c.course_code).toLowerCase().includes(q)) ||
                (c.title && String(c.title).toLowerCase().includes(q)) ||
                (c.level != null && String(c.level).toLowerCase().includes(q))
        )
        : courses;

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-bold text-lg text-[#0f2044]">Computing Course Management</h3>
                <p className="text-sm text-slate-600">Manage computing courses by department. Select a department and use search to filter. These courses appear in Schedule Lecture.</p>
            </div>

            <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1">
                    <Label className="text-xs text-slate-600">Department *</Label>
                    <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full min-w-[200px] px-3 py-2 border border-slate-300 rounded-md h-9 focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                    >
                        <option value="">Select Department</option>
                        {departments.map((d) => (
                            <option key={d.department_id ?? d.name} value={d.name}>{d.name}</option>
                        ))}
                    </select>
                </div>
                {department && (
                    <>
                        <div className="space-y-1 flex-1 min-w-[180px]">
                            <Label className="text-xs text-slate-600">Search</Label>
                            <div className="relative flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                    <input
                                        id="course-search"
                                        type="text"
                                        placeholder="Code, title, or level..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-md h-9 focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                                    />
                                </div>
                                <Button type="button" variant="outline" size="sm" className="h-9 shrink-0" onClick={() => document.getElementById('course-search')?.focus()}>
                                    <Search className="size-4 mr-1" /> Search
                                </Button>
                            </div>
                        </div>
                    </>
                )}
                {department && (
                    <Button onClick={() => { setShowForm(!showForm); editingId && resetForm(); }} size="sm" className="h-9 bg-[#0f2044] hover:bg-[#0f2044]/90 text-white">
                        <Plus className="h-3 w-3 mr-1" /> {showForm ? 'Done' : 'Add'}
                    </Button>
                )}
            </div>

            {showForm && department && (
                <Card className="border-l-4 border-l-[#ffb71b] bg-slate-50">
                    <CardContent className="pt-4 pb-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Course code *</Label>
                                    <Input value={formData.course_code} onChange={(e) => setFormData({ ...formData, course_code: e.target.value })} placeholder="e.g. CSC 101" required className="h-9" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Title *</Label>
                                    <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Introduction to Computing" required className="h-9" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Level *</Label>
                                    <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-slate-300 rounded-md h-9 focus:outline-none focus:ring-2 focus:ring-[#ffb71b]">
                                        <option value={100}>100</option>
                                        <option value={200}>200</option>
                                        <option value={300}>300</option>
                                        <option value={400}>400</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Credit unit *</Label>
                                    <Input type="number" value={formData.credit_units} onChange={(e) => setFormData({ ...formData, credit_units: parseInt(e.target.value) || 1 })} min={1} className="h-9" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Semester *</Label>
                                    <select value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md h-9 focus:outline-none focus:ring-2 focus:ring-[#ffb71b]">
                                        <option value="First">First</option>
                                        <option value="Second">Second</option>
                                        <option value="Summer">Summer</option>
                                        <option value="Post-SIWES">Post-SIWES</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Course type</Label>
                                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as 'Core' | 'Elective' })} className="w-full px-3 py-2 border border-slate-300 rounded-md h-9 focus:outline-none focus:ring-2 focus:ring-[#ffb71b]">
                                        <option value="Core">Core</option>
                                        <option value="Elective">Elective</option>
                                    </select>
                                    <p className="text-xs text-slate-500">Electives can share the same time slot.</p>
                                </div>
                            </div>
                            <Button type="submit" size="sm" className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white h-9">{editingId ? 'Update' : 'Add'}</Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {!department && (
                <Card className="border border-dashed border-slate-300">
                    <CardContent className="py-8 text-center text-slate-500">Select a department to view and manage computing courses.</CardContent>
                </Card>
            )}

            {department && loading && <p className="text-center text-sm py-3">Loading...</p>}

            {department && !loading && courses.length === 0 && (
                <p className="text-center text-sm font-bold text-slate-700 py-3">No courses for this department</p>
            )}

            {department && !loading && courses.length > 0 && (
                <div className="overflow-auto text-base">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b text-sm bg-slate-100">
                                <th className="text-left py-3 px-3 font-semibold text-[#0f2044]">Code</th>
                                <th className="text-left px-3 font-semibold text-[#0f2044]">Title</th>
                                <th className="text-left px-3 font-semibold text-[#0f2044]">Level</th>
                                <th className="text-left px-3 font-semibold text-[#0f2044]">Semester</th>
                                <th className="text-left px-3 font-semibold text-[#0f2044]">Type</th>
                                <th className="text-left px-3 font-semibold text-[#0f2044]">Credit unit</th>
                                <th className="text-center px-3 font-semibold text-[#0f2044]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCourses.map((c: any) => (
                                <tr key={c.course_id ?? c.id} className="border-b text-sm hover:bg-slate-50">
                                    <td className="py-3 px-3 font-semibold">{c.course_code}</td>
                                    <td className="px-3">{c.title}</td>
                                    <td className="px-3">{c.level}</td>
                                    <td className="px-3">{semesterLabel(c.semester)}</td>
                                    <td className="px-3"><span className={c.category === 'Elective' ? 'text-amber-600 font-medium' : 'text-slate-600'}>{c.category === 'Elective' ? 'Elective' : 'Core'}</span></td>
                                    <td className="px-3 text-center">{c.credit_units}</td>
                                    <td className="px-3 text-right">
                                        <Button size="sm" variant="outline" onClick={() => handleEdit(c)} title="Edit">
                                            <Edit2 className="size-4" />
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(c.course_id ?? c.id)} title="Delete">
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
