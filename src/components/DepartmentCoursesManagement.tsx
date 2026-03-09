import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface DepartmentCoursesManagementProps {
    departmentName: string;
    sessionId: number | null;
}

export function DepartmentCoursesManagement({ departmentName, sessionId }: DepartmentCoursesManagementProps) {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        course_code: '', title: '', credit_units: 3, level: 100, semester: 'First',
        category: 'Core' as 'Core' | 'Elective',
    });

    useEffect(() => {
        if (departmentName && sessionId) fetchCourses();
    }, [departmentName, sessionId]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await api.getCourses({ department: departmentName, session_id: sessionId });
            const list = response.success ? response.data || [] : [];
            // Only show computing department courses (exclude GEDS, SAT) in department course management
            const computingOnly = Array.isArray(list) ? list.filter((c: any) => !['GEDS', 'SAT'].includes(c.category || '')) : [];
            setCourses(computingOnly);
        } catch (e: any) {
            toast.error('Failed loading');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const existing = editingId ? courses.find((c: any) => c.course_id === editingId) : null;
            const data = { ...formData, department: departmentName, session_id: sessionId, category: formData.category || existing?.category || 'Core' };
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
            toast.error(e.message || 'An error occurred');
        }
    };

    const resetForm = () => {
        setFormData({ course_code: '', title: '', credit_units: 3, level: 100, semester: 'First', category: 'Core' });
        setEditingId(null); setShowForm(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete?')) return;
        try {
            await api.deleteCourse(id);
            toast.success('Deleted');
            fetchCourses();
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleEdit = (c: any) => {
        setFormData({ course_code: c.course_code, title: c.title, credit_units: c.credit_units ?? 3, level: c.level ?? 100, semester: c.semester ?? 'First', category: (c.category === 'Elective' ? 'Elective' : 'Core') });
        setEditingId(c.course_id);
        setShowForm(true);
    };

    const semesterLabel = (s: string | undefined) => (s === 'First' || s === 'first' ? 'First' : s === 'Second' || s === 'second' ? 'Second' : s === 'Summer' || s === 'summer' ? 'Summer' : s?.toLowerCase().includes('post-siwes') ? 'Post-SIWES' : s ?? '—');

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg text-[#0f2044]">{departmentName} – Course Management</h3>
                    <p className="text-sm text-slate-600">Add, edit, or remove department courses using the form below. These courses appear in Schedule Lecture.</p>
                    <p className="text-xs text-gray-500 mt-1">{courses.length} total</p>
                </div>
                <Button onClick={() => { setShowForm(!showForm); editingId && resetForm(); }} size="sm" className="h-8">
                    <Plus className="h-3 w-3 mr-1" /> {showForm ? 'Done' : 'Add'}
                </Button>
            </div>

            {showForm && (
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
                                        <option value="Elective">Elective (can be scheduled same time as other electives)</option>
                                    </select>
                                    <p className="text-xs text-slate-500">Electives can share the same time slot; students choose one.</p>
                                </div>
                            </div>
                            <Button type="submit" size="sm" className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white h-9">{editingId ? 'Update' : 'Add'}</Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <p className="text-center text-sm py-3">Loading...</p>
            ) : courses.length === 0 ? (
                <p className="text-center text-sm font-bold text-slate-700 py-3">No courses</p>
            ) : (
                <>
                    <div className="overflow-auto text-base">
                        <table className="w-full">
                            <thead><tr className="border-b text-sm"><th className="text-left py-3 px-3">Code</th><th className="text-left px-3">Title</th><th className="text-left px-3">Level</th><th className="text-left px-3">Semester</th><th className="text-left px-3">Type</th><th className="text-left px-3">Credit unit</th><th className="text-center px-3">Actions</th></tr></thead>
                            <tbody>
                                {courses.map(c => (
                                    <tr key={c.course_id} className="border-b text-sm hover:bg-blue-50">
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
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(c.course_id)} title="Delete">
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
