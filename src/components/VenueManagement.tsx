import { Edit, MapPin, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';

interface Venue {
  venue_id: number;
  name: string;
  type: 'Lecture Hall' | 'Laboratory';
  capacity: number;
  building?: string;
  status?: string;
  equipment?: string;
}

export function VenueManagement() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Lecture Hall' as 'Lecture Hall' | 'Laboratory',
    capacity: 0,
  });

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setIsLoading(true);
      const response = await api.getVenues({});
      if (response.success) {
        setVenues(Array.isArray(response.data) ? response.data : (response.data?.venues || []));
      } else {
        toast.error('Failed to fetch venues');
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
      toast.error('Failed to fetch venues');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (venue: Venue) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name,
      type: venue.type,
      capacity: venue.capacity,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.capacity <= 0) {
      toast.error('Capacity must be greater than 0');
      return;
    }

    setIsLoading(true);

    try {
      const response = editingVenue
        ? await api.updateVenue(editingVenue.venue_id, formData)
        : await api.createVenue(formData);

      if (response.success) {
        toast.success(editingVenue ? 'Venue updated successfully' : 'Venue added');
        resetForm();
        fetchVenues();
      } else {
        toast.error(response.error || 'Failed to save venue');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'Lecture Hall', capacity: 0 });
    setEditingVenue(null);
    setShowForm(false);
  };

  const handleDelete = async (venue: Venue) => {
    if (!confirm(`Are you sure you want to delete "${venue.name}"?`)) {
      return;
    }

    try {
      const response = await api.deleteVenue(venue.venue_id);
      if (response.success) {
        toast.success('Venue deleted successfully');
        fetchVenues();
      } else {
        toast.error(response.error || 'Failed to delete venue');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while deleting');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0f2044]">Venue Management</h2>
        <p className="text-slate-600 mt-1">Manage lecture halls and laboratories</p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-[#0f2044]">
            <span>Venues</span>
            <Button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
              size="sm"
            >
              <Plus className="size-4 mr-1" />
              Add Venue
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 rounded-lg space-y-4">
              <p className="text-sm font-medium text-[#0f2044]">{editingVenue ? 'Edit Venue' : 'Add Venue'}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="venue-type" className="text-[#0f2044] font-semibold">Venue Type *</Label>
                  <select
                    id="venue-type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Lecture Hall' | 'Laboratory' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b] focus:border-transparent"
                    required
                  >
                    <option value="Lecture Hall">Lecture Hall</option>
                    <option value="Laboratory">Laboratory</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venue-name" className="text-[#0f2044] font-semibold">Venue Name *</Label>
                  <input
                    id="venue-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., LT 1 or Lab 1"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b] focus:border-transparent"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venue-capacity" className="text-[#0f2044] font-semibold">Capacity *</Label>
                  <input
                    id="venue-capacity"
                    type="number"
                    value={formData.capacity || ''}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 50"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffb71b] focus:border-transparent"
                    required
                    min="1"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="bg-[#0f2044] hover:bg-[#0f2044]/90">
                  <MapPin className="mr-2 size-4" />
                  {editingVenue ? 'Update Venue' : 'Add Venue'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {isLoading && !venues.length && (
            <div className="text-center py-8 text-slate-500">Loading venues...</div>
          )}

          {!isLoading && venues.length === 0 && (
            <div className="text-center py-8 text-slate-500">No venues found. Create one to get started.</div>
          )}

          {venues.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#0f2044]">Capacity</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#0f2044]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {venues.map((venue) => (
                    <tr key={venue.venue_id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">{venue.type}</td>
                      <td className="py-3 px-4 font-medium">{venue.name}</td>
                      <td className="py-3 px-4">{venue.capacity}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(venue)} disabled={isLoading}>
                          <Edit className="size-4" />
                        </Button>
                        <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(venue)} disabled={isLoading}>
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
