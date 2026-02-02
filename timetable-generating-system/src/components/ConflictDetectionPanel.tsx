import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { AlertTriangle, Clock, MapPin, User, AlertCircle } from 'lucide-react';

export function ConflictDetectionPanel({ scheduledClasses }) {
  // Detect conflicts
  const detectConflicts = (): Conflict[] => {
    const conflicts: Conflict[] = [];
    
    // Check for lecturer conflicts (same lecturer, same time, different classes)
    const lecturerTimeMap = new Map<string, ScheduledClass[]>();
    scheduledClasses.forEach(cls => {
      const key = `${cls.lecturer}-${cls.day}-${cls.startTime}`;
      if (!lecturerTimeMap.has(key)) {
        lecturerTimeMap.set(key, []);
      }
      lecturerTimeMap.get(key)!.push(cls);
    });

    lecturerTimeMap.forEach((classes, key) => {
      if (classes.length > 1) {
        conflicts.push({
          id: `lecturer-${key}`,
          type: 'lecturer',
          severity: 'high',
          description: `${classes[0].lecturer} is scheduled for multiple classes at the same time`,
          affectedClasses: classes,
        });
      }
    });

    // Check for venue conflicts (same venue, same time, different classes)
    const venueTimeMap = new Map<string, ScheduledClass[]>();
    scheduledClasses.forEach(cls => {
      const key = `${cls.venue}-${cls.day}-${cls.startTime}`;
      if (!venueTimeMap.has(key)) {
        venueTimeMap.set(key, []);
      }
      venueTimeMap.get(key)!.push(cls);
    });

    venueTimeMap.forEach((classes, key) => {
      if (classes.length > 1) {
        conflicts.push({
          id: `venue-${key}`,
          type: 'venue',
          severity: 'high',
          description: `${classes[0].venue} is double-booked at the same time`,
          affectedClasses: classes,
        });
      }
    });

    // Check for class/group conflicts (same group, same time, different courses)
    const groupTimeMap = new Map<string, ScheduledClass[]>();
    scheduledClasses.forEach(cls => {
      const key = `${cls.group}-${cls.day}-${cls.startTime}`;
      if (!groupTimeMap.has(key)) {
        groupTimeMap.set(key, []);
      }
      groupTimeMap.get(key)!.push(cls);
    });

    groupTimeMap.forEach((classes, key) => {
      if (classes.length > 1) {
        conflicts.push({
          id: `group-${key}`,
          type: 'class-group',
          severity: 'high',
          description: `${classes[0].group} has overlapping classes at the same time`,
          affectedClasses: classes,
        });
      }
    });

    return conflicts;
  };

  // Check for capacity violations
  const detectCapacityIssues = (): ScheduledClass[] => {
    return scheduledClasses.filter(cls => {
      if (cls.venueCapacity && cls.classSize) {
        return cls.classSize > cls.venueCapacity;
      }
      return false;
    });
  };

  const conflicts = detectConflicts();
  const capacityIssues = detectCapacityIssues();
  const hasConflicts = conflicts.length > 0;
  const hasCapacityIssues = capacityIssues.length > 0;

  return (
    <Card className={`shadow-md ${hasConflicts || hasCapacityIssues ? 'border-red-300' : 'border-green-300'}`}>
      <CardHeader className={hasConflicts || hasCapacityIssues ? 'bg-red-50' : 'bg-green-50'}>
        <CardTitle className="flex items-center gap-2">
          {hasConflicts || hasCapacityIssues ? (
            <>
              <AlertTriangle className="size-5 text-red-600" />
              <span className="text-red-900">Conflicts Detected</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="size-5 text-green-600" />
              <span className="text-green-900">No Conflicts Found</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {!hasConflicts && !hasCapacityIssues ? (
          <div className="text-center py-4">
            <CheckCircle2 className="size-12 text-green-500 mx-auto mb-3" />
            <p className="text-slate-700 font-medium">All Clear!</p>
            <p className="text-sm text-slate-500 mt-1">
              No scheduling conflicts or capacity issues detected
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Scheduling Conflicts */}
            {conflicts.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-[#0f2044] flex items-center gap-2">
                  <Clock className="size-4 text-red-600" />
                  Scheduling Conflicts ({conflicts.length})
                </h3>
                {conflicts.map((conflict) => (
                  <Alert key={conflict.id} variant="destructive" className="bg-red-50 border-red-300">
                    <AlertTriangle className="size-4" />
                    <AlertTitle className="flex items-center gap-2">
                      {conflict.type === 'lecturer' && <Users className="size-4" />}
                      {conflict.type === 'venue' && <MapPin className="size-4" />}
                      {conflict.type === 'class-group' && <Users className="size-4" />}
                      <span className="capitalize">{conflict.type.replace('-', ' ')} Conflict</span>
                      <Badge variant="destructive" className="ml-auto">
                        {conflict.severity.toUpperCase()}
                      </Badge>
                    </AlertTitle>
                    <AlertDescription className="mt-2">
                      <p className="font-medium mb-2">{conflict.description}</p>
                      <div className="space-y-1 text-sm">
                        {conflict.affectedClasses.map((cls, idx) => (
                          <div key={cls.id} className="flex items-center gap-2 bg-white/50 p-2 rounded">
                            <Badge variant="outline" className="font-mono text-xs">
                              {cls.courseCode}
                            </Badge>
                            <span className="flex-1">{cls.courseName}</span>
                            <Badge variant="secondary" className="text-xs">
                              {cls.day} {cls.startTime}-{cls.endTime}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Capacity Issues */}
            {capacityIssues.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-[#0f2044] flex items-center gap-2">
                  <AlertCircle className="size-4 text-orange-600" />
                  Venue Capacity Issues ({capacityIssues.length})
                </h3>
                {capacityIssues.map((cls) => (
                  <Alert key={cls.id} className="bg-orange-50 border-orange-300">
                    <AlertCircle className="size-4 text-orange-600" />
                    <AlertTitle className="text-orange-900">
                      Capacity Exceeded: {cls.venue}
                    </AlertTitle>
                    <AlertDescription className="text-orange-800">
                      <div className="mt-2 space-y-1">
                        <p className="font-medium">{cls.courseCode} - {cls.courseName}</p>
                        <p className="text-sm">
                          Class Size: <span className="font-bold">{cls.classSize}</span> students |
                          Venue Capacity: <span className="font-bold">{cls.venueCapacity}</span> seats
                        </p>
                        <Badge variant="outline" className="mt-2 border-orange-400 text-orange-700">
                          Overflow: {cls.classSize! - cls.venueCapacity!} students
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}