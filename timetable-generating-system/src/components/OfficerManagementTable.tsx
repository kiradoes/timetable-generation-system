import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Search, MoreVertical, Trash2, Edit, UserPlus, Building2, Mail } from 'lucide-react';
import { RegisterOfficerModal } from './RegisterOfficerModal';
import { toast } from 'sonner';

export function OfficerManagementTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [officers, setOfficers] = useState([
    {
      id: '1',
      name: 'Dr. John Adeyemi',
      email: 'j.adeyemi@babcock.edu.ng',
      department: 'Computer Science',
      registeredDate: '2025-01-15',
      status: 'active',
    },
    {
      id: '2',
      name: 'Dr. Sarah Okonkwo',
      email: 's.okonkwo@babcock.edu.ng',
      department: 'Software Engineering',
      registeredDate: '2025-01-18',
      status: 'active',
    },
    {
      id: '3',
      name: 'Prof. Michael Eze',
      email: 'm.eze@babcock.edu.ng',
      department: 'Information Technology',
      registeredDate: '2025-01-20',
      status: 'active',
    },
    {
      id: '4',
      name: 'Dr. Blessing Nwosu',
      email: 'b.nwosu@babcock.edu.ng',
      department: 'Information Systems',
      registeredDate: '2025-01-22',
      status: 'active',
    },
    {
      id: '5',
      name: 'Dr. Ibrahim Lawal',
      email: 'i.lawal@babcock.edu.ng',
      department: 'Cyber Security',
      registeredDate: '2025-01-25',
      status: 'active',
    },
  ]);

  const handleRegister = (officer: { email: string; name: string; department: string; password: string }) => {
    const newOfficer: Officer = {
      id: String(officers.length + 1),
      name: officer.name,
      email: officer.email,
      department: officer.department,
      registeredDate: new Date().toISOString().split('T')[0],
      status: 'active',
    };
    setOfficers([...officers, newOfficer]);
  };

  const handleDelete = (id: string) => {
    setOfficers(officers.filter(o => o.id !== id));
    toast.success('Officer removed successfully');
  };

  const filteredOfficers = officers.filter(officer =>
    officer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    officer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    officer.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#0f2044]">Department Officers</h2>
            <p className="text-slate-600 mt-1">Manage department timetable officers</p>
          </div>
          <Button 
            className="bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
            onClick={() => setIsRegisterModalOpen(true)}
          >
            <UserPlus className="mr-2 size-4" />
            Register New Officer
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-[#ffb71b] focus:ring-[#ffb71b]"
                />
              </div>
              <Badge variant="outline" className="bg-slate-100 px-4 py-2">
                {filteredOfficers.length} {filteredOfficers.length === 1 ? 'Officer' : 'Officers'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-[#0f2044] flex items-center gap-2">
              <Building2 className="size-5 text-[#ffb71b]" />
              Registered Officers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="font-semibold text-[#0f2044]">Name</TableHead>
                    <TableHead className="font-semibold text-[#0f2044]">Email</TableHead>
                    <TableHead className="font-semibold text-[#0f2044]">Department</TableHead>
                    <TableHead className="font-semibold text-[#0f2044]">Registered</TableHead>
                    <TableHead className="font-semibold text-[#0f2044]">Status</TableHead>
                    <TableHead className="text-right font-semibold text-[#0f2044]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOfficers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        {searchQuery ? 'No officers found matching your search' : 'No officers registered yet'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOfficers.map((officer) => (
                      <TableRow key={officer.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="bg-[#ffb71b]/10 rounded-full p-2">
                              <Building2 className="size-4 text-[#ffb71b]" />
                            </div>
                            <span className="font-medium text-[#0f2044]">{officer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Mail className="size-3 text-slate-400" />
                            {officer.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {officer.department}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {new Date(officer.registeredDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              officer.status === 'active' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }
                          >
                            {officer.status === 'active' ? '● Active' : '○ Inactive'}
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
                              <DropdownMenuItem className="cursor-pointer">
                                <Edit className="mr-2 size-4" />
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer text-red-600 focus:text-red-600"
                                onClick={() => handleDelete(officer.id)}
                              >
                                <Trash2 className="mr-2 size-4" />
                                Remove Officer
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

      <RegisterOfficerModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegister={handleRegister}
      />
    </>
  );
}