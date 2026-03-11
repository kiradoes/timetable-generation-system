import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function LecturersManagementPage() {
    const [lecturers, setLecturers] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        department: '',
        title: '',
        session_id: '',
        status: 'active',
        max_classes_per_day: 4,
    });

    useEffect(() => {
        fetchLecturers();
        fetchSessions();
    }, []);

    const fetchLecturers = async () => {
        setLoading(true);
        try {
            const response = await api.getLecturers({});
            if (response.success) {
                setLecturers(response.data || []);
            }
        } catch (error: any) {
            toast.error('Failed to load lecturers');
        } finally {
            setLoading(false);
        }
    };

    const fetchSessions = async () => {
        try {
            const response = await api.getSessions({});
            if (response.success) {
                setSessions(response.data || []);
            }
        } catch (error: any) {
            console.error('Failed to load sessions');
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const lecturerData = {
            ...formData,
            name: `${formData.first_name} ${formData.last_name}`,
        };
        try {
            const response = editingId
                ? await api.updateLecturer(editingId, lecturerData)
                : await api.createLecturer(lecturerData);
            if (response.success) {
                toast.success(editingId ? 'Lecturer updated successfully' : 'Lecturer created successfully');
                setFormData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    department: '',
                    title: '',
                    session_id: '',
                    status: 'active',
                    max_classes_per_day: 4,
                });
                setEditingId(null);
                setShowForm(false);
                fetchLecturers();
            } else {
                toast.error((response as any).error || 'Failed to save lecturer');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const handleEdit = (lecturer: any) => {
        setFormData({
            first_name: lecturer.first_name,
            last_name: lecturer.last_name,
            email: lecturer.email,
            phone: lecturer.phone,
            department: lecturer.department,
            title: lecturer.title,
            session_id: lecturer.session_id,
            status: lecturer.status,
            max_classes_per_day: lecturer.max_classes_per_day || 4,
        });
        setEditingId(lecturer.lecturer_id);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this lecturer?')) {
            try {
                await api.deleteLecturer(id);
                toast.success('Lecturer deleted');
                fetchLecturers();
            } catch (error: any) {
                toast.error(error.message);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Lecturers Management</h2>
                <Button onClick={() => { setShowForm(!showForm); setEditingId(null); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    {showForm ? 'Cancel' : 'Add Lecturer'}
                </Button>
            </div>

            {showForm && (
                <Card className="bg-slate-50">
                    <CardHeader>
                        <CardTitle>{editingId ? 'Edit Lecturer' : 'Add New Lecturer'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="first_name">First Name *</Label>
                                    <Input
                                        id="first_name"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="last_name">Last Name *</Label>
                                    <Input
                                        id="last_name"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="department">Department *</Label>
                                    <Input
                                        id="department"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        placeholder="e.g., Computer Science"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g., Dr., Assoc. Prof."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="session_id">Session *</Label>
                                    <select
                                        id="session_id"
                                        value={formData.session_id}
                                        onChange={(e) => setFormData({ ...formData, session_id: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    >
                                        <option value="">Select Session</option>
                                        {sessions.map((s) => (
                                            <option key={s.session_id} value={s.session_id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="max_classes">Max Classes/Day</Label>
                                    <Input
                                        id="max_classes"
                                        type="number"
                                        value={formData.max_classes_per_day}
                                        onChange={(e) => setFormData({ ...formData, max_classes_per_day: parseInt(e.target.value) })}
                                        min="1"
                                        max="10"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <select
                                        id="status"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="on-leave">On Leave</option>
                                    </select>
                                </div>
                            </div>

                            <Button type="submit" className="w-full">
                                {editingId ? 'Update Lecturer' : 'Add Lecturer'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                    <p>Loading lecturers...</p>
                ) : lecturers.length === 0 ? (
                    <p className="text-gray-500">No lecturers yet.</p>
                ) : (
                    lecturers.map((lecturer) => (
                        <Card key={lecturer.lecturer_id}>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Lecturer name</p>
                                            <h3 className="font-semibold text-lg">
                                                {lecturer.title ? `${lecturer.title} ` : ''}{lecturer.name}
                                            </h3>
                                            <p className="text-sm text-gray-600">{lecturer.department}</p>
                                            <p className="text-xs text-gray-500 mt-1">{lecturer.email}</p>
                                            {lecturer.phone && <p className="text-xs text-gray-500">{lecturer.phone}</p>}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => handleEdit(lecturer)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDelete(lecturer.lecturer_id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="text-xs border-t pt-2 mt-2">
                                        <p>Max Classes/Day: <span className="font-semibold">{lecturer.max_classes_per_day}</span></p>
                                        <p>Status: <span className={`font-semibold ${lecturer.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>{lecturer.status}</span></p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
