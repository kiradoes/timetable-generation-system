import { useState } from 'react';
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
  DialogFooter,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Calendar, Plus, MoreVertical, Edit, Trash2, CheckCircle2, FolderOpen, BookOpen } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function SessionManagement() {
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [isNewSemesterModalOpen, setIsNewSemesterModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [expandedSessionId, setExpandedSessionId] = useState(null);

  const [sessions, setSessions] = useState([
    {
      id: '1',
      name: '2024-2025',
      startDate: '2024-09-01',
      endDate: '2025-08-31',
      status: 'completed',
      isActive: false,
      semesters: [
        {
          id: 's1',
          name: 'First Semester',
          startDate: '2024-09-01',
          endDate: '2025-01-15',
          status: 'completed',
          timetableStatus: 'published',
        },
        {
          id: 's2',
          name: 'Second Semester',
          startDate: '2025-01-20',
          endDate: '2025-06-15',
          status: 'completed',
          timetableStatus: 'published',
        },
      ],
    },
    {
      id: '2',
      name: '2025-2026',
      startDate: '2025-09-01',
      endDate: '2026-08-31',
      status: 'active',
      isActive: true,
      semesters: [
        {
          id: 's3',
          name: 'First Semester',
          startDate: '2025-09-01',
          endDate: '2026-01-15',
          status: 'active',
          timetableStatus: 'draft',
        },
      ],
    },
  ]);

  const [newSessionForm, setNewSessionForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
  });

  const [newSemesterForm, setNewSemesterForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
  });

  const handleCreateSession = () => {
    if (!newSessionForm.name || !newSessionForm.startDate || !newSessionForm.endDate) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate dates
    if (new Date(newSessionForm.startDate) >= new Date(newSessionForm.endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    const newSession = {
      id: Date.now().toString(),
      name: newSessionForm.name,
      startDate: newSessionForm.startDate,
      endDate: newSessionForm.endDate,
      status: 'upcoming',
      isActive: false,
      semesters: [],
    };

    setSessions([...sessions, newSession]);
    setNewSessionForm({ name: '', startDate: '', endDate: '' });
    setIsNewSessionModalOpen(false);
    toast.success(`Session "${newSessionForm.name}" created successfully`);
  };

  const handleCreateSemester = () => {
    if (!newSemesterForm.name || !newSemesterForm.startDate || !newSemesterForm.endDate) {
      toast.error('Please fill in all fields');
      return;
    }

    if (new Date(newSemesterForm.startDate) >= new Date(newSemesterForm.endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    const newSemester = {
      id: `s${Date.now()}`,
      name: newSemesterForm.name,
      startDate: newSemesterForm.startDate,
      endDate: newSemesterForm.endDate,
      status: 'upcoming',
      timetableStatus: 'draft',
    };

    setSessions(sessions.map(session => {
      if (session.id === selectedSession.id) {
        return {
          ...session,
          semesters: [...session.semesters, newSemester],
        };
      }
      return session;
    }));

    setNewSemesterForm({ name: '', startDate: '', endDate: '' });
    setIsNewSemesterModalOpen(false);
    setSelectedSession(null);
    toast.success(`Semester "${newSemesterForm.name}" created successfully`);
  };

  const handleSetActiveSession = (sessionId) => {
    setSessions(sessions.map(session => ({
      ...session,
      isActive: session.id === sessionId,
      status: session.id === sessionId ? 'active' : session.status === 'active' ? 'completed' : session.status,
    })));
    toast.success('Active session updated');
  };

  const handleDeleteSession = (sessionId) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
    toast.success('Session deleted successfully');
  };

  const handleDeleteSemester = (sessionId, semesterId) => {
    setSessions(sessions.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          semesters: session.semesters.filter(sem => sem.id !== semesterId),
        };
      }
      return session;
    }));
    toast.success('Semester deleted successfully');
  };

  const openNewSemesterModal = (session) => {
    setSelectedSession(session);
    setNewSemesterForm({
      name: '',
      startDate: session.startDate,
      endDate: session.endDate,
    });
    setIsNewSemesterModalOpen(true);
  };

  const toggleSessionExpansion = (sessionId) => {
    setExpandedSessionId(expandedSessionId === sessionId ? null : sessionId);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'upcoming':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getTimetableStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <Badge variant="default">Published</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending Review</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0f2044]">Session Management</h2>
          <p className="text-gray-600 mt-1">
            Manage academic sessions and semesters for timetable scheduling
          </p>
        </div>
        <Button
          onClick={() => setIsNewSessionModalOpen(true)}
          className="bg-[#0f2044] hover:bg-[#0f2044]/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Session
        </Button>
      </div>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Academic Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Semesters</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    No sessions created yet. Click "New Session" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => (
                  <>
                    <TableRow key={session.id} className="cursor-pointer hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSessionExpansion(session.id)}
                            className="p-0 h-auto"
                          >
                            <FolderOpen className={`w-4 h-4 transition-transform ${expandedSessionId === session.id ? 'rotate-0' : '-rotate-90'}`} />
                          </Button>
                          <div>
                            <div className="font-medium text-[#0f2044]">{session.name}</div>
                            {session.isActive && (
                              <Badge variant="default" className="mt-1 bg-[#ffb71b] text-[#0f2044]">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Active Session
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(session.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                          <div className="text-gray-500">
                            to {new Date(session.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(session.status)}>
                          {session.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{session.semesters.length}</span>
                          <span className="text-gray-500">semester(s)</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openNewSemesterModal(session)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Semester
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!session.isActive && (
                                <DropdownMenuItem onClick={() => handleSetActiveSession(session.id)}>
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Set as Active
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleDeleteSession(session.id)} variant="destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Session
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Semesters Sub-table */}
                    {expandedSessionId === session.id && session.semesters.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="bg-gray-50 p-0">
                          <div className="px-12 py-4">
                            <div className="bg-white rounded-lg border">
                              <div className="px-4 py-3 border-b bg-gray-50">
                                <h4 className="font-medium text-[#0f2044] flex items-center gap-2">
                                  <BookOpen className="w-4 h-4" />
                                  Semesters in {session.name}
                                </h4>
                              </div>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Semester Name</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Timetable</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {session.semesters.map((semester) => (
                                    <TableRow key={semester.id}>
                                      <TableCell className="font-medium">{semester.name}</TableCell>
                                      <TableCell>
                                        <div className="text-sm">
                                          <div>{new Date(semester.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                          <div className="text-gray-500">
                                            to {new Date(semester.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant={getStatusBadgeVariant(semester.status)}>
                                          {semester.status}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>{getTimetableStatusBadge(semester.timetableStatus)}</TableCell>
                                      <TableCell className="text-right">
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                              <MoreVertical className="w-4 h-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                              <Edit className="w-4 h-4 mr-2" />
                                              Edit Semester
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={() => handleDeleteSemester(session.id, semester.id)}
                                              variant="destructive"
                                            >
                                              <Trash2 className="w-4 h-4 mr-2" />
                                              Delete Semester
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Session Modal */}
      <Dialog open={isNewSessionModalOpen} onOpenChange={setIsNewSessionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Academic Session</DialogTitle>
            <DialogDescription>
              Add a new academic session to manage timetables and semesters.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="session-name">Session Name *</Label>
              <Input
                id="session-name"
                placeholder="e.g., 2026-2027"
                value={newSessionForm.name}
                onChange={(e) => setNewSessionForm({ ...newSessionForm, name: e.target.value })}
              />
              <p className="text-sm text-gray-500">Use format: YYYY-YYYY (e.g., 2026-2027)</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="session-start">Start Date *</Label>
                <Input
                  id="session-start"
                  type="date"
                  value={newSessionForm.startDate}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-end">End Date *</Label>
                <Input
                  id="session-end"
                  type="date"
                  value={newSessionForm.endDate}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewSessionModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSession} className="bg-[#0f2044] hover:bg-[#0f2044]/90">
              Create Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Semester Modal */}
      <Dialog open={isNewSemesterModalOpen} onOpenChange={setIsNewSemesterModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Semester</DialogTitle>
            <DialogDescription>
              Add a new semester to {selectedSession?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="semester-name">Semester Name *</Label>
              <Input
                id="semester-name"
                placeholder="e.g., First Semester, Second Semester"
                value={newSemesterForm.name}
                onChange={(e) => setNewSemesterForm({ ...newSemesterForm, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="semester-start">Start Date *</Label>
                <Input
                  id="semester-start"
                  type="date"
                  value={newSemesterForm.startDate}
                  onChange={(e) => setNewSemesterForm({ ...newSemesterForm, startDate: e.target.value })}
                  min={selectedSession?.startDate}
                  max={selectedSession?.endDate}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester-end">End Date *</Label>
                <Input
                  id="semester-end"
                  type="date"
                  value={newSemesterForm.endDate}
                  onChange={(e) => setNewSemesterForm({ ...newSemesterForm, endDate: e.target.value })}
                  min={selectedSession?.startDate}
                  max={selectedSession?.endDate}
                />
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Semester dates must fall within the session period: {' '}
                {selectedSession && `${new Date(selectedSession.startDate).toLocaleDateString()} - ${new Date(selectedSession.endDate).toLocaleDateString()}`}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewSemesterModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSemester} className="bg-[#0f2044] hover:bg-[#0f2044]/90">
              Create Semester
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
