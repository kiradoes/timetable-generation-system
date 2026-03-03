import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DynamicTimetableGrid } from './DynamicTimetableGrid';
import { ConflictDetectionPanel } from './ConflictDetectionPanel';
import { MissingCoursesPanel } from './MissingCoursesPanel';
import { SmartValidationPanel } from './SmartValidationPanel';
import { ApprovalWorkflow } from './ApprovalWorkflow';
import { Calendar, AlertTriangle, CheckCircle, Send } from 'lucide-react';

export function EnhancedTimetableScheduling({ userRole = 'department-officer', userDepartment = 'Computer Science' }) {
  // Mock scheduled classes with capacity data
  const [scheduledClasses] = useState([
    {
      id: '1',
      courseCode: 'COSC424',
      courseName: 'Advanced Algorithms',
      lecturer: 'Dr. Adeyemi Johnson',
      venue: 'E102',
      venueCapacity: 50,
      classSize: 45,
      group: 'Group A',
      startTime: '08:00',
      endTime: '10:00',
      day: 'Monday',
    },
    {
      id: '2',
      courseCode: 'GEDS420',
      courseName: 'Research Methodology',
      lecturer: 'Dr. Adeyemi Johnson',
      venue: 'LT 3',
      venueCapacity: 100,
      classSize: 80,
      group: 'Group A',
      startTime: '08:00',
      endTime: '10:00',
      day: 'Monday',
    },
    {
      id: '3',
      courseCode: 'COS202',
      courseName: 'Data Structures',
      lecturer: 'Prof. Grace Okonkwo',
      venue: 'Lab 2',
      venueCapacity: 40,
      classSize: 42,
      group: 'Group A',
      startTime: '15:30',
      endTime: '17:30',
      day: 'Tuesday',
    },
    {
      id: '4',
      courseCode: 'BU-SEN212',
      courseName: 'Spiritual Emphasis (Practical)',
      lecturer: 'Pastor Emmanuel',
      venue: 'Chapel Hall',
      venueCapacity: 200,
      classSize: 85,
      group: 'Group A',
      startTime: '15:30',
      endTime: '17:30',
      day: 'Tuesday',
    },
    {
      id: '5',
      courseCode: 'BU-SEN212',
      courseName: 'Spiritual Emphasis (Practical)',
      lecturer: 'Pastor Emmanuel',
      venue: 'Chapel Hall',
      venueCapacity: 200,
      classSize: 85,
      group: 'Group A',
      startTime: '08:00',
      endTime: '10:00',
      day: 'Wednesday',
    },
    {
      id: '6',
      courseCode: 'BU-SEN212',
      courseName: 'Spiritual Emphasis (Practical)',
      lecturer: 'Pastor Emmanuel',
      venue: 'Chapel Hall',
      venueCapacity: 200,
      classSize: 85,
      group: 'Group A',
      startTime: '08:00',
      endTime: '10:00',
      day: 'Friday',
    },
  ]);

  // Mock required courses
  const requiredCourses: Course[] = [
    { code: 'COSC424', name: 'Advanced Algorithms', units: 3, required: true, level: '400' },
    { code: 'GEDS420', name: 'Research Methodology', units: 2, required: true, level: '400' },
    { code: 'COS202', name: 'Data Structures', units: 3, required: true, level: '400' },
    { code: 'BU-SEN212', name: 'Spiritual Emphasis', units: 1, required: true, level: '400' },
    { code: 'ITGY409', name: 'Information Technology Governance', units: 3, required: true, level: '400' },
    { code: 'BU-GST220', name: 'Entrepreneurship', units: 2, required: true, level: '400' },
  ];

  // Mock valid courses (for validation)
  const validCourses = [
    { code: 'COSC424', name: 'Advanced Algorithms' },
    { code: 'COSC406', name: 'Software Project Management' },
    { code: 'SENG406', name: 'Software Testing' },
    { code: 'GEDS420', name: 'Research Methodology' },
    { code: 'COS202', name: 'Data Structures' },
    { code: 'BU-SEN212', name: 'Spiritual Emphasis' },
    { code: 'ITGY409', name: 'Information Technology Governance' },
    { code: 'BU-GST220', name: 'Entrepreneurship' },
  ];

  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>({ status: 'pending' });

  // Detect conflicts
  const detectConflicts = () => {
    const conflicts: any[] = [];
    
    // Check for lecturer conflicts
    const lecturerTimeMap = new Map<string, ScheduledClass[]>();
    scheduledClasses.forEach(cls => {
      const key = `${cls.lecturer}-${cls.day}-${cls.startTime}`;
      if (!lecturerTimeMap.has(key)) {
        lecturerTimeMap.set(key, []);
      }
      lecturerTimeMap.get(key)!.push(cls);
    });

    lecturerTimeMap.forEach((classes) => {
      if (classes.length > 1) {
        conflicts.push(...classes);
      }
    });

    return conflicts.length > 0;
  };

  // Check missing courses
  const checkMissingCourses = () => {
    const scheduledCodes = new Set(scheduledClasses.map(c => c.courseCode.toUpperCase()));
    return requiredCourses.some(c => c.required && !scheduledCodes.has(c.code.toUpperCase()));
  };

  // Check validation errors
  const checkValidationErrors = () => {
    return scheduledClasses.some(cls => {
      if (cls.venueCapacity && cls.classSize) {
        return cls.classSize > cls.venueCapacity;
      }
      return false;
    });
  };

  const hasConflicts = detectConflicts();
  const hasMissingCourses = checkMissingCourses();
  const hasValidationErrors = checkValidationErrors();

  const handleApprove = (comments: string) => {
    setApprovalStatus({
      status: 'approved',
      reviewedBy: 'School Officer',
      reviewDate: new Date(),
      comments,
    });
  };

  const handleReject = (reason: string) => {
    setApprovalStatus({
      status: 'rejected',
      reviewedBy: 'School Officer',
      reviewDate: new Date(),
      comments: reason,
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="schedule" className="flex items-center gap-2 py-3">
            <Calendar className="size-4" />
            <span className="hidden sm:inline">Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="conflicts" className="flex items-center gap-2 py-3">
            <AlertTriangle className="size-4" />
            <span className="hidden sm:inline">Conflicts</span>
            {hasConflicts && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full size-5 flex items-center justify-center">
                !
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2 py-3">
            <CheckCircle className="size-4" />
            <span className="hidden sm:inline">Validation</span>
            {(hasMissingCourses || hasValidationErrors) && (
              <span className="ml-1 bg-orange-500 text-white text-xs rounded-full size-5 flex items-center justify-center">
                !
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approval" className="flex items-center gap-2 py-3">
            <Send className="size-4" />
            <span className="hidden sm:inline">Approval</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-6">
          <DynamicTimetableGrid />
        </TabsContent>

        <TabsContent value="conflicts" className="mt-6 space-y-6">
          <ConflictDetectionPanel scheduledClasses={scheduledClasses} />
        </TabsContent>

        <TabsContent value="validation" className="mt-6 space-y-6">
          <MissingCoursesPanel
            requiredCourses={requiredCourses}
            scheduledClasses={scheduledClasses}
            level="400"
            semester="First"
          />
          <SmartValidationPanel
            scheduledClasses={scheduledClasses}
            validCourses={validCourses}
          />
        </TabsContent>

        <TabsContent value="approval" className="mt-6">
          <ApprovalWorkflow
            scheduledClasses={scheduledClasses}
            currentStatus={approvalStatus}
            hasConflicts={hasConflicts}
            hasMissingCourses={hasMissingCourses}
            hasValidationErrors={hasValidationErrors}
            onApprove={handleApprove}
            onReject={handleReject}
            userRole={userRole}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}