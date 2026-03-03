import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function CoursesManagementPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [formData, setFormData] = useState({
        course_code: '',
        title: '',
        credit_units: 3,
        category: 'Computing',
        department: '',
        session_id: '',
        level: 100,
        semester: 'First',
        description: '',
        prerequisites: '',
    });

    useEffect(() => {
        fetchCourses();
        fetchSessions();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await api.getCourses({ computing_only: true });
            if (response.success) {
                setCourses(response.data || []);
            }
        } catch (error: any) {
            toast.error('Failed to load courses');
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
        try {
            const response = editingId
                ? await api.updateCourse(editingId, formData)
                : await api.createCourse(formData);
            if (response.success) {
                toast.success(editingId ? 'Course updated successfully' : 'Course created successfully');
                resetForm();
                fetchCourses();
            } else {
                toast.error((response as any).error || 'Failed to save course');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const resetForm = () => {
        setFormData({
            course_code: '',
            title: '',
            credit_units: 3,
            category: 'Computing',
            department: '',
            session_id: '',
            level: 100,
            semester: 'First',
            description: '',
            prerequisites: '',
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (course: any) => {
        setFormData(course);
        setEditingId(course.course_id);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this course?')) {
            try {
                await api.deleteCourse(id);
                toast.success('Course deleted');
                fetchCourses();
            } catch (error: any) {
                toast.error(error.message);
            }
        }
    };

    const filteredCourses = selectedCategory === 'all'
        ? courses
        : courses.filter(c => c.category === selectedCategory);

    const categories = ['Computing', 'Core', 'Elective'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Courses Management</h2>
                <Button onClick={() => { setShowForm(!showForm); setEditingId(null); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    {showForm ? 'Cancel' : 'Add Course'}
                </Button>
            </div>

            {showForm && (
                <Card className="bg-slate-50">
                    <CardHeader>
                        <CardTitle>{editingId ? 'Edit Course' : 'Add New Course'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="course_code">Course Code *</Label>
                                    <Input
                                        id="course_code"
                                        value={formData.course_code}
                                        onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                                        placeholder="e.g., CS101"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="title">Course Title *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="category">Category *</Label>
                                    <select
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                        required
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <Label htmlFor="credit_units">Credit Units</Label>
                                    <Input
                                        id="credit_units"
                                        type="number"
                                        value={formData.credit_units}
                                        onChange={(e) => setFormData({ ...formData, credit_units: parseInt(e.target.value) })}
                                        min="1"
                                        max="6"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="level">Level</Label>
                                    <select
                                        id="level"
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-md"
                                    >
                                        <option value={100}>100</option>
                                        <option value={200}>200</option>
                                        <option value={300}>300</option>
                                        <option value={400}>400</option>
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="semester">Semester</Label>
                                    <select
                                        id="semester"
                                        value={formData.semester}
                                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                    >
                                        <option value="First">First</option>
                                        <option value="Second">Second</option>
                                        <option value="Both">Both</option>
                                    </select>
                                </div>
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
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="department">Department</Label>
                                    <Input
                                        id="department"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        placeholder="e.g., Computer Science"
                                    />
                                </div>
                                <div>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    rows={2}
                                    placeholder="Course description"
                                />
                            </div>

                            <div>
                                <Label htmlFor="prerequisites">Prerequisites</Label>
                                <Input
                                    id="prerequisites"
                                    value={formData.prerequisites}
                                    onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                                    placeholder="e.g., CS101, Math101"
                                />
                            </div>

                            <Button type="submit" className="w-full">
                                {editingId ? 'Update Course' : 'Add Course'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="flex gap-2 flex-wrap">
                <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory('all')}
                    size="sm"
                >
                    All ({courses.length})
                </Button>
                {categories.map(cat => (
                    <Button
                        key={cat}
                        variant={selectedCategory === cat ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(cat)}
                        size="sm"
                    >
                        {cat} ({courses.filter(c => c.category === cat).length})
                    </Button>
                ))}
            </div>

            <div className="overflow-x-auto text-base">
                <table className="w-full">
                    <thead>
                        <tr className="border-b text-sm">
                            <th className="text-left py-3 px-4">Code</th>
                            <th className="text-left py-3 px-4">Title</th>
                            <th className="text-left py-3 px-4">Category</th>
                            <th className="text-left py-3 px-4">Level</th>
                            <th className="text-left py-3 px-4">Semester</th>
                            <th className="text-left py-3 px-4">Credits</th>
                            <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="text-center py-5">Loading...</td>
                            </tr>
                        ) : filteredCourses.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-5 text-gray-500">No courses found</td>
                            </tr>
                        ) : (
                            filteredCourses.map(course => (
                                <tr key={course.course_id} className="border-b hover:bg-gray-50">
                                    <td className="py-4 px-4 font-semibold">{course.course_code}</td>
                                    <td className="py-4 px-4">{course.title}</td>
                                    <td className="py-4 px-4">{course.category}</td>
                                    <td className="py-4 px-4">{course.level}</td>
                                    <td className="py-4 px-4">{course.semester === 'First' || course.semester === 'first' ? 'First' : course.semester === 'Second' || course.semester === 'second' ? 'Second' : course.semester ?? '—'}</td>
                                    <td className="py-4 px-4 text-center">{course.credit_units}</td>
                                    <td className="py-4 px-4 flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => handleEdit(course)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(course.course_id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
