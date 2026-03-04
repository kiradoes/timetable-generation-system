import { Edit2, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface DepartmentVenuesManagementProps {
    departmentName: string;
    sessionId: number | null;
}

export function DepartmentVenuesManagement({ departmentName, sessionId }: DepartmentVenuesManagementProps) {
    const [venues, setVenues] = useState<any[]>([]);
    const [venueSearch, setVenueSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        venue_name: '',
        capacity: 0,
        location: '',
        venue_type: 'Classroom',
        status: 'available',
    });

    useEffect(() => {
        if (departmentName && sessionId) {
            fetchVenues();
        }
    }, [departmentName, sessionId]);

    const fetchVenues = async () => {
        setLoading(true);
        try {
            // Venues are school-wide: same list for both school and department timetable officers
            const response = await api.getVenues({});
            if (response.success) {
                setVenues(response.data || []);
            }
        } catch (error: any) {
            toast.error('Failed to load venues');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const venueData = {
            ...formData,
            department: departmentName,
            session_id: sessionId,
        };
        try {
            const response = editingId
                ? await api.updateVenue(editingId, venueData)
                : await api.createVenue(venueData);
            if (response.success) {
                toast.success(editingId ? 'Venue updated successfully' : 'Venue created successfully');
                resetForm();
                fetchVenues();
            } else {
                toast.error((response as any).error || 'Failed to save venue');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const resetForm = () => {
        setFormData({
            venue_name: '',
            capacity: 0,
            location: '',
            venue_type: 'Classroom',
            status: 'available',
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (venue: any) => {
        setFormData(venue);
        setEditingId(venue.venue_id);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this venue?')) {
            try {
                const res = await api.deleteVenue(id) as { success?: boolean; error?: string };
                if (res?.success) {
                    toast.success('Venue deleted');
                    fetchVenues();
                } else {
                    toast.error(res?.error || 'Failed to delete venue');
                }
            } catch (error: any) {
                toast.error(error?.message || 'Failed to delete venue');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">{departmentName} - Venues</h2>
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                    <Input
                        placeholder="Search venue by name..."
                        value={venueSearch}
                        onChange={(e) => setVenueSearch(e.target.value)}
                        className="pr-14"
                    />
                </div>
                <Button onClick={() => { setShowForm(!showForm); setEditingId(null); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    {showForm ? 'Cancel' : 'Add Venue'}
                </Button>
            </div>

            {showForm && (
                <Card className="bg-slate-50">
                    <CardHeader>
                        <CardTitle>{editingId ? 'Edit Venue' : 'Add New Venue'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="venue_name">Venue Name *</Label>
                                    <Input
                                        id="venue_name"
                                        value={formData.venue_name}
                                        onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                                        placeholder="e.g., Lab 1, Hall A"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="capacity">Capacity *</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="e.g., Block A, 3rd Floor"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="venue_type">Venue Type</Label>
                                    <select
                                        id="venue_type"
                                        value={formData.venue_type}
                                        onChange={(e) => setFormData({ ...formData, venue_type: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                    >
                                        <option value="Classroom">Classroom</option>
                                        <option value="Lab">Lab</option>
                                        <option value="Lecture Hall">Lecture Hall</option>
                                        <option value="Seminar Room">Seminar Room</option>
                                        <option value="Studio">Studio</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                >
                                    <option value="available">Available</option>
                                    <option value="under_maintenance">Under Maintenance</option>
                                    <option value="unavailable">Unavailable</option>
                                </select>
                            </div>

                            <Button type="submit" className="w-full">
                                {editingId ? 'Update Venue' : 'Add Venue'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-2 px-4">Venue Name</th>
                            <th className="text-left py-2 px-4">Type</th>
                            <th className="text-left py-2 px-4">Location</th>
                            <th className="text-left py-2 px-4">Capacity</th>
                            <th className="text-left py-2 px-4">Status</th>
                            <th className="text-left py-2 px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="text-center py-4">Loading...</td>
                            </tr>
                        ) : venues.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-4 text-gray-500">No venues found</td>
                            </tr>
                        ) : (() => {
                            const q = (venueSearch || '').trim().replace(/\s+/g, '').toLowerCase();
                            const filtered = q ? venues.filter((v: any) => {
                                const text = (v.venue_name || v.name || '').replace(/\s+/g, '').toLowerCase();
                                return text.includes(q);
                            }) : venues;
                            return filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-4 text-gray-500">No venues found matching your search</td>
                                </tr>
                            ) : (
                            filtered.map((venue: any) => (
                                <tr key={venue.venue_id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4 font-semibold">{venue.venue_name}</td>
                                    <td className="py-3 px-4 text-sm">{venue.venue_type}</td>
                                    <td className="py-3 px-4 text-sm">{venue.location}</td>
                                    <td className="py-3 px-4 text-sm">{venue.capacity}</td>
                                    <td className="py-3 px-4 text-sm">
                                        <span className={`${venue.status === 'available' ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {venue.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => handleEdit(venue)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(venue.venue_id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            )));
                        })()}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
