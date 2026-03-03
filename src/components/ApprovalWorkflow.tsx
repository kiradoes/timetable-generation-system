import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { 
  CheckCircle2, 
  XCircle, 
  Clock,
  AlertTriangle,
  Eye,
  Send,
  MessageSquare
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { toast } from 'sonner';

export function ApprovalWorkflow({
  scheduledClasses,
  currentStatus,
  hasConflicts,
  hasMissingCourses
}) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [approvalComments, setApprovalComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const canApprove = !hasConflicts && !hasMissingCourses && scheduledClasses.length > 0;
  const canSubmit = scheduledClasses.length > 0;

  const handleApprove = () => {
    onApprove(approvalComments);
    setIsApproveDialogOpen(false);
    setApprovalComments('');
    toast.success('Timetable approved successfully!');
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    onReject(rejectionReason);
    setIsRejectDialogOpen(false);
    setRejectionReason('');
    toast.error('Timetable rejected');
  };

  const getStatusBadge = () => {
    switch (currentStatus.status) {
      case 'approved':
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle2 className="size-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="size-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="size-3 mr-1" />
            Pending Review
          </Badge>
        );
    }
  };

  // Group classes by day for preview
  const classesByDay = scheduledClasses.reduce((acc, cls) => {
    if (!acc[cls.day]) {
      acc[cls.day] = [];
    }
    acc[cls.day].push(cls);
    return acc;
  }, {} as Record<string, ScheduledClass[]>);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <>
      <Card className="shadow-lg border-t-4 border-t-[#ffb71b]">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="size-5 text-[#0f2044]" />
              <span className="text-[#0f2044]">Timetable Approval</span>
            </div>
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Current Status Display */}
          {currentStatus.status !== 'pending' && (
            <div className="mb-6">
              <Alert className={currentStatus.status === 'approved' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}>
                {currentStatus.status === 'approved' ? (
                  <CheckCircle2 className="size-4 text-green-600" />
                ) : (
                  <XCircle className="size-4 text-red-600" />
                )}
                <AlertTitle className={currentStatus.status === 'approved' ? 'text-green-900' : 'text-red-900'}>
                  {currentStatus.status === 'approved' ? 'Timetable Approved' : 'Timetable Rejected'}
                </AlertTitle>
                <AlertDescription className={currentStatus.status === 'approved' ? 'text-green-800' : 'text-red-800'}>
                  <div className="space-y-1 text-sm mt-2">
                    <p>Reviewed by: <strong>{currentStatus.reviewedBy}</strong></p>
                    <p>Date: <strong>{currentStatus.reviewDate?.toLocaleDateString()}</strong></p>
                    {currentStatus.comments && (
                      <div className="mt-3 pt-3 border-t border-current/20">
                        <p className="font-medium mb-1">Comments:</p>
                        <p className="italic">{currentStatus.comments}</p>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Pre-Approval Checks */}
          {currentStatus.status === 'pending' && (
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-[#0f2044]">Pre-Approval Checklist</h3>
              
              <div className="space-y-2">
                <div className={`flex items-center gap-3 p-3 rounded-lg border ${scheduledClasses.length > 0 ? 'bg-green-50 border-green-300' : 'bg-slate-50 border-slate-300'}`}>
                  {scheduledClasses.length > 0 ? (
                    <CheckCircle2 className="size-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="size-5 text-slate-400 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">Classes Scheduled</p>
                    <p className="text-xs text-slate-600">{scheduledClasses.length} classes added to timetable</p>
                  </div>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg border ${!hasConflicts ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                  {!hasConflicts ? (
                    <CheckCircle2 className="size-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="size-5 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">No Scheduling Conflicts</p>
                    <p className="text-xs text-slate-600">
                      {hasConflicts ? 'Conflicts detected - must be resolved' : 'All conflicts resolved'}
                    </p>
                  </div>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg border ${!hasMissingCourses ? 'bg-green-50 border-green-300' : 'bg-orange-50 border-orange-300'}`}>
                  {!hasMissingCourses ? (
                    <CheckCircle2 className="size-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="size-5 text-orange-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">All Required Courses Included</p>
                    <p className="text-xs text-slate-600">
                      {hasMissingCourses ? 'Some required courses missing' : 'All required courses scheduled'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {currentStatus.status === 'pending' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setIsPreviewOpen(true)}
                variant="outline"
                className="flex-1 border-[#0f2044] text-[#0f2044] hover:bg-[#0f2044]/5"
                disabled={!canSubmit}
              >
                <Eye className="mr-2 size-4" />
                Preview Timetable
              </Button>

              {userRole === 'school-officer' && (
                <>
                  <Button
                    onClick={() => setIsRejectDialogOpen(true)}
                    variant="outline"
                    className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                    disabled={!canSubmit}
                  >
                    <XCircle className="mr-2 size-4" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => setIsApproveDialogOpen(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    disabled={!canApprove}
                  >
                    <CheckCircle2 className="mr-2 size-4" />
                    Approve Timetable
                  </Button>
                </>
              )}

              {userRole === 'department-officer' && (
                <Button
                  onClick={() => setIsApproveDialogOpen(true)}
                  className="flex-1 bg-[#0f2044] hover:bg-[#0f2044]/90 text-white"
                  disabled={!canApprove}
                >
                  <Send className="mr-2 size-4" />
                  Submit for Approval
                </Button>
              )}
            </div>
          )}

          {/* Blockage Warning */}
          {!canApprove && canSubmit && currentStatus.status === 'pending' && (
            <Alert className="mt-4 bg-amber-50 border-amber-300">
              <AlertTriangle className="size-4 text-amber-600" />
              <AlertTitle className="text-amber-900">Cannot Submit</AlertTitle>
              <AlertDescription className="text-amber-800 text-sm">
                Please resolve all conflicts, add missing courses, and fix validation errors before submitting for approval.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#0f2044] flex items-center gap-2">
              <Eye className="size-6 text-[#ffb71b]" />
              Timetable Preview
            </DialogTitle>
            <DialogDescription>
              Review all scheduled classes before submission
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {days.map(day => {
              const dayClasses = classesByDay[day] || [];
              if (dayClasses.length === 0) return null;
              
              return (
                <Card key={day}>
                  <CardHeader className="bg-[#0f2044] text-white py-3">
                    <CardTitle className="text-lg">{day}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      {dayClasses
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map(cls => (
                          <div key={cls.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="font-mono">
                                  {cls.courseCode}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {cls.group}
                                </Badge>
                              </div>
                              <p className="font-medium text-sm">{cls.courseName}</p>
                              <p className="text-xs text-slate-600 mt-1">
                                {cls.lecturer} • {cls.venue}
                              </p>
                            </div>
                            <Badge className="bg-[#ffb71b] text-[#0f2044]">
                              {cls.startTime} - {cls.endTime}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto bg-green-100 rounded-full p-3 mb-2">
              <CheckCircle2 className="size-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl text-center">
              {userRole === 'school-officer' ? 'Approve Timetable' : 'Submit for Approval'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {userRole === 'school-officer' 
                ? 'Confirm that you want to approve this timetable'
                : 'Submit this timetable to the School Timetable Officer for approval'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="comments">Comments (Optional)</Label>
              <Textarea
                id="comments"
                placeholder="Add any comments or notes..."
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>
              <CheckCircle2 className="mr-2 size-4" />
              {userRole === 'school-officer' ? 'Approve' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto bg-red-100 rounded-full p-3 mb-2">
              <XCircle className="size-8 text-red-600" />
            </div>
            <DialogTitle className="text-2xl text-center text-red-900">
              Reject Timetable
            </DialogTitle>
            <DialogDescription className="text-center">
              Please provide a reason for rejecting this timetable
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-red-900">
                Rejection Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Explain why this timetable is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="resize-none border-red-300 focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              <XCircle className="mr-2 size-4" />
              Reject Timetable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}