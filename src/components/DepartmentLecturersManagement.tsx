import { ChevronLeft, ChevronRight, Edit2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface DepartmentLecturersManagementProps {
    departmentName: string;
    sessionId: number | null;
}

export function DepartmentLecturersManagement({ departmentName, sessionId }: DepartmentLecturersManagementProps) {
    const [lecturers, setLecturers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const itemsPerPage = 8;

    const [formData, setFormData] = useState({ first_name: '', last_name: '' });

    useEffect(() => {
        if (departmentName && sessionId) fetchLecturers();
    }, [departmentName, sessionId]);

    const fetchLecturers = async () => {
        setLoading(true);
        try {
            const response = await api.getLecturers({ department: departmentName, session_id: sessionId });
            if (response.success) setLecturers(response.data || []);
        } catch (error: any) {
            toast.error('Failed to load');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const data = {
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                name: `${formData.first_name.trim()} ${formData.last_name.trim()}`.trim(),
                department: departmentName,
                session_id: sessionId,
            };
            const response = editingId
                ? await api.updateLecturer(editingId, data)
                : await api.createLecturer(data);
            if (response.success) {
                toast.success(editingId ? 'Updated' : 'Created');
                resetForm();
                fetchLecturers();
            } else {
                toast.error((response as any).error || 'Failed to save lecturer');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const resetForm = () => {
        setFormData({ first_name: '', last_name: '' });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (lec: any) => {
        const first = lec.first_name ?? (lec.name ? lec.name.trim().split(/\s+/)[0] : '') ?? '';
        const last = lec.last_name ?? (lec.name ? lec.name.trim().split(/\s+/).slice(1).join(' ') : '') ?? '';
        setFormData({ first_name: first, last_name: last });
        setEditingId(lec.lecturer_id);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete?')) {
            try {
                await api.deleteLecturer(id);
                toast.success('Deleted');
                fetchLecturers();
            } catch (error: any) {
                toast.error(error.message);
            }
        }
    };

    const paged = lecturers.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const maxPage = Math.ceil(lecturers.length / itemsPerPage);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg text-[#0f2044]">{departmentName} – Lecturer Management</h3>
                    <p className="text-sm text-slate-600">Manage lecturers for your department. Add, edit, or remove lecturers; they appear in Schedule Lecture when assigning courses.</p>
                </div>
                <Button onClick={() => { setShowForm(!showForm); editingId && resetForm(); }} size="sm" className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white h-9">
                    <Plus className="h-4 w-4 mr-1" /> {showForm ? 'Done' : 'Add Lecturer'}
                </Button>
            </div>

            {showForm && (
                <Card className="border-l-4 border-l-[#ffb71b] bg-slate-50">
                    <CardContent className="pt-4 pb-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>First Name *</Label>
                                    <Input value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} placeholder="e.g. John" required className="h-9" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name *</Label>
                                    <Input value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} placeholder="e.g. Doe" required className="h-9" />
                                </div>
                            </div>
                            <Button type="submit" size="sm" className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white h-9">{editingId ? 'Update' : 'Add'}</Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <p className="text-center text-sm py-4">Loading...</p>
            ) : lecturers.length === 0 ? (
                <p className="text-center text-sm font-bold text-slate-700 py-4">No lecturers</p>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="text-left px-4 py-3 font-medium text-slate-700">Lecturer name</th>
                                    <th className="text-right px-4 py-3 font-medium text-slate-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paged.map(lec => (
                                    <tr key={lec.lecturer_id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-4">{[lec.first_name, lec.last_name].filter(Boolean).join(' ') || lec.name || '—'}</td>
                                        <td className="py-3 px-4 text-right">
                                            <Button size="sm" variant="outline" onClick={() => handleEdit(lec)} title="Edit">
                                                <Edit2 className="size-4" />
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(lec.lecturer_id ?? lec.id)} title="Delete">
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {maxPage > 1 && (
                        <div className="flex justify-between items-center text-xs mt-2 px-1">
                            <Button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} size="sm" variant="outline" className="h-7 w-7 p-0">
                                <ChevronLeft className="h-3 w-3" />
                            </Button>
                            <span className="text-gray-600">Page {page}/{maxPage}</span>
                            <Button onClick={() => setPage(Math.min(maxPage, page + 1))} disabled={page === maxPage} size="sm" variant="outline" className="h-7 w-7 p-0">
                                <ChevronRight className="h-3 w-3" />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
