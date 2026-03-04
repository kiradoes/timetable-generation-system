import { ChevronLeft, ChevronRight, Edit2, Plus, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';

interface DepartmentClassGroupsManagementProps {
    departmentName: string;
    sessionId: number | null;
}

const GROUP_OPTIONS = ['A', 'B', 'C', 'D', 'E'];
const LEVEL_OPTIONS = [100, 200, 300, 400];

export function DepartmentClassGroupsManagement({ departmentName, sessionId }: DepartmentClassGroupsManagementProps) {
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const itemsPerPage = 8;

    const [formData, setFormData] = useState({
        level: 200,
        name: 'A',
        student_count: 0,
    });

    useEffect(() => {
        if (departmentName && sessionId) fetchGroups();
    }, [departmentName, sessionId]);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const response = await api.getClassGroups({ department: departmentName, session_id: sessionId });
            if (response.success) setGroups(Array.isArray(response.data) ? response.data : (response.data?.class_groups || []));
        } catch (error: any) {
            toast.error('Failed to load class groups');
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
        if (formData.student_count < 0) {
            toast.error('Class size must be 0 or more');
            return;
        }
        try {
            const data = {
                name: formData.name,
                level: formData.level,
                department: departmentName,
                session_id: sessionId,
                student_count: formData.student_count,
                status: 'active',
            };
            const response = editingId
                ? await api.updateClassGroup(editingId, data)
                : await api.createClassGroup(data);
            if (response.success) {
                toast.success(editingId ? 'Class group updated' : 'Class group added');
                resetForm();
                fetchGroups();
            } else {
                toast.error((response as any).error || 'Failed to save class group');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to save');
        }
    };

    const resetForm = () => {
        setFormData({ level: 200, name: 'A', student_count: 0 });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (g: any) => {
        setFormData({
            level: g.level ?? 200,
            name: g.name ?? 'A',
            student_count: g.student_count ?? 0,
        });
        setEditingId(g.group_id);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this class group?')) return;
        try {
            await api.deleteClassGroup(id);
            toast.success('Deleted');
            fetchGroups();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const paged = groups.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const maxPage = Math.ceil(groups.length / itemsPerPage);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg text-[#0f2044] flex items-center gap-2">
                        <Users className="size-5 text-[#ffb71b]" />
                        Class Management
                    </h3>
                    <p className="text-sm text-slate-600">Manage class groups for your department. Add, edit, or remove groups (level, group name, class size). These groups appear in Schedule Lecture.</p>
                </div>
                <Button
                    onClick={() => { setShowForm(!showForm); if (editingId) resetForm(); }}
                    className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
                    size="sm"
                >
                    <Plus className="size-4 mr-1" /> {showForm ? 'Cancel' : 'Add Class'}
                </Button>
            </div>

            {showForm && (
                <Card className="border-l-4 border-l-[#ffb71b] bg-slate-50">
                    <CardContent className="pt-4 pb-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Level *</Label>
                                    <select
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                                        required
                                    >
                                        {LEVEL_OPTIONS.map((l) => (
                                            <option key={l} value={l}>{l}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Group *</Label>
                                    <select
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                                        required
                                    >
                                        {GROUP_OPTIONS.map((g) => (
                                            <option key={g} value={g}>{g}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Class Size *</Label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={formData.student_count}
                                        onChange={(e) => setFormData({ ...formData, student_count: Number(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b]"
                                        required
                                    />
                                    <p className="text-xs text-slate-500">Used to check venue capacity when scheduling</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white">
                                    {editingId ? 'Update' : 'Add'} Class Group
                                </Button>
                                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <p className="text-center text-sm py-6 text-slate-500">Loading...</p>
            ) : groups.length === 0 ? (
                <Card className="border border-dashed border-slate-300">
                    <CardContent className="py-8 text-center text-slate-500">
                        No class groups yet. Add level, group, and class size to use in Schedule Lecture.
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-slate-100 text-left">
                                    <th className="p-3 font-semibold text-[#0f2044]">Level</th>
                                    <th className="p-3 font-semibold text-[#0f2044]">Group</th>
                                    <th className="p-3 font-semibold text-[#0f2044]">Class Size</th>
                                    <th className="p-3 font-semibold text-[#0f2044] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paged.map((g) => (
                                    <tr key={g.group_id} className="border-b hover:bg-slate-50">
                                        <td className="p-3">{g.level}</td>
                                        <td className="p-3">{g.name}</td>
                                        <td className="p-3">{g.student_count}</td>
                                        <td className="p-3 text-right">
                                            <Button size="sm" variant="outline" onClick={() => handleEdit(g)} title="Edit">
                                                <Edit2 className="size-4" />
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(g.group_id)} title="Delete">
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {maxPage > 1 && (
                        <div className="flex justify-between items-center text-sm mt-2">
                            <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} size="sm" variant="outline">
                                <ChevronLeft className="size-4" />
                            </Button>
                            <span className="text-slate-600">Page {page} of {maxPage}</span>
                            <Button onClick={() => setPage((p) => Math.min(maxPage, p + 1))} disabled={page === maxPage} size="sm" variant="outline">
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
