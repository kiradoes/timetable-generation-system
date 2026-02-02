import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Search, MoreVertical, Trash2, Edit, MapPin, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function VenueManagementTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [venues, setVenues] = useState([
    { id: '1', name: 'Bucodel Lab 1', capacity: 50, type: 'Laboratory', building: 'Bucodel Building', status: 'available' },
    { id: '2', name: 'Bucodel Lab 2', capacity: 50, type: 'Laboratory', building: 'Bucodel Building', status: 'available' },
    { id: '3', name: 'New Horizon', capacity: 200, type: 'Lecture Hall', building: 'New Horizon Building', status: 'available' },
    { id: '4', name: 'Computing Lab 3', capacity: 45, type: 'Laboratory', building: 'Bucodel Building', status: 'available' },
    { id: '5', name: 'Computing Lab 4', capacity: 45, type: 'Laboratory', building: 'Bucodel Building', status: 'available' },
    { id: '6', name: 'LT 1', capacity: 180, type: 'Lecture Hall', building: 'Main Block', status: 'available' },
    { id: '7', name: 'LT 2', capacity: 150, type: 'Lecture Hall', building: 'Main Block', status: 'available' },
    { id: '8', name: 'LT 3', capacity: 180, type: 'Lecture Hall', building: 'Main Block', status: 'available' },
    { id: '9', name: 'Server Room', capacity: 25, type: 'Laboratory', building: 'Bucodel Building', status: 'available' },
    { id: '10', name: 'Seminar Room A', capacity: 40, type: 'Seminar Room', building: 'Bucodel Building', status: 'available' },
  ]);

  const handleDelete = (id) => {
    setVenues(venues.filter(v => v.id !== id));
    toast.success('Venue removed successfully');
  };

  const handleEdit = (venue) => {
    setEditingVenue(venue);
    setIsAddModalOpen(true);
  };

  const filteredVenues = venues.filter(venue =>
    venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#0f2044]">Venue Management</h2>
            <p className="text-slate-600 mt-1">Manage lecture halls, laboratories, and seminar rooms</p>
          </div>
          <Button 
            className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
            onClick={() => {
              setEditingVenue(null);
              setIsAddModalOpen(true);
            }}
          >
            <MapPin className="mr-2 size-4" />
            Add New Venue
          </Button>
        </div>

        {/* Search */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  placeholder="Search by name, building, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-[#ffb71b] focus:ring-[#ffb71b]"
                />
              </div>
              <Badge variant="outline" className="bg-slate-100 px-4 py-2">
                {filteredVenues.length} {filteredVenues.length === 1 ? 'Venue' : 'Venues'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-[#0f2044] flex items-center gap-2">
              <MapPin className="size-5 text-[#ffb71b]" />
              All Venues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="font-semibold text-[#0f2044]">Venue Name</TableHead>
                    <TableHead className="font-semibold text-[#0f2044]">Type</TableHead>
                    <TableHead className="font-semibold text-[#0f2044]">Building</TableHead>
                    <TableHead className="font-semibold text-[#0f2044]">Capacity</TableHead>
                    <TableHead className="font-semibold text-[#0f2044]">Status</TableHead>
                    <TableHead className="text-right font-semibold text-[#0f2044]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVenues.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        {searchQuery ? 'No venues found matching your search' : 'No venues registered yet'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVenues.map((venue) => (
                      <TableRow key={venue.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="bg-[#ffb71b]/10 rounded-full p-2">
                              <MapPin className="size-4 text-[#ffb71b]" />
                            </div>
                            <span className="font-medium text-[#0f2044]">{venue.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              venue.type === 'Lecture Hall' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              venue.type === 'Laboratory' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              'bg-green-50 text-green-700 border-green-200'
                            }
                          >
                            {venue.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">{venue.building}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="size-4 text-slate-400" />
                            <span className="font-medium text-[#0f2044]">{venue.capacity}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              venue.status === 'available' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-orange-50 text-orange-700 border-orange-200'
                            }
                          >
                            {venue.status === 'available' ? '● Available' : '⚠ Maintenance'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={() => handleEdit(venue)}
                              >
                                <Edit className="mr-2 size-4" />
                                Edit Venue
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer text-red-600 focus:text-red-600"
                                onClick={() => handleDelete(venue.id)}
                              >
                                <Trash2 className="mr-2 size-4" />
                                Remove Venue
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <AddVenueModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingVenue(null);
        }}
        onSave={(venue) => {
          if (editingVenue) {
            setVenues(venues.map(v => v.id === editingVenue.id ? { ...venue, id: editingVenue.id } : v));
            toast.success('Venue updated successfully');
          } else {
            setVenues([...venues, { ...venue, id: String(venues.length + 1), status: 'available' }]);
            toast.success('Venue added successfully');
          }
          setIsAddModalOpen(false);
          setEditingVenue(null);
        }}
        editingVenue={editingVenue}
      />
    </>
  );
}

interface AddVenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (venue: Omit<Venue, 'id' | 'status'>) => void;
  editingVenue: Venue | null;
}

function AddVenueModal({ isOpen, onClose, onSave, editingVenue }: AddVenueModalProps) {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [type, setType] = useState<'Lecture Hall' | 'Laboratory' | 'Seminar Room'>('Lecture Hall');
  const [building, setBuilding] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (editingVenue) {
      setName(editingVenue.name);
      setCapacity(String(editingVenue.capacity));
      setType(editingVenue.type);
      setBuilding(editingVenue.building);
    } else {
      setName('');
      setCapacity('');
      setType('Lecture Hall');
      setBuilding('');
    }
  }, [editingVenue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSave({ name, capacity: Number(capacity), type, building });
    setLoading(false);
    setName('');
    setCapacity('');
    setType('Lecture Hall');
    setBuilding('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-t-4 border-t-[#ffb71b]">
        <DialogHeader>
          <div className="mx-auto bg-[#0f2044] rounded-full p-3">
            <MapPin className="size-8 text-[#ffb71b]" />
          </div>
          <DialogTitle className="text-2xl text-center text-[#0f2044]">
            {editingVenue ? 'Edit Venue' : 'Add New Venue'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {editingVenue ? 'Update venue information' : 'Create a new venue for scheduling'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="venue-name" className="text-[#0f2044] font-semibold">
              Venue Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="venue-name"
              placeholder="e.g., Bucodel Lab 1, New Horizon, LT 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="border-slate-300 focus:border-[#ffb71b] focus:ring-[#ffb71b]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity" className="text-[#0f2044] font-semibold">
                Capacity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="capacity"
                type="number"
                placeholder="e.g., 200"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
                min="1"
                disabled={loading}
                className="border-slate-300 focus:border-[#ffb71b] focus:ring-[#ffb71b]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-[#0f2044] font-semibold">
                Type <span className="text-red-500">*</span>
              </Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                required
                disabled={loading}
                className="w-full h-10 px-3 rounded-md border border-slate-300 focus:border-[#ffb71b] focus:ring-1 focus:ring-[#ffb71b] bg-white"
              >
                <option value="Lecture Hall">Lecture Hall</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Seminar Room">Seminar Room</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="building" className="text-[#0f2044] font-semibold">
              Building <span className="text-red-500">*</span>
            </Label>
            <Input
              id="building"
              placeholder="e.g., Main Block, Computing Block"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              required
              disabled={loading}
              className="border-slate-300 focus:border-[#ffb71b] focus:ring-[#ffb71b]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>{editingVenue ? 'Update' : 'Add'} Venue</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}