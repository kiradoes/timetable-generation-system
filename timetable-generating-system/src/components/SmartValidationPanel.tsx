import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export function SmartValidationPanel({ 
  scheduledClasses, 
  requiredCourses 
}) {
  
  const detectValidationIssues = (): ValidationIssue[] => {
    const issues: ValidationIssue[] = [];

    // Check for course code naming errors (typos)
    scheduledClasses.forEach(cls => {
      const cleanCode = cls.courseCode.toUpperCase().trim();
      
      // Check if code exists in valid courses list
      if (requiredCourses.length > 0) {
        const exactMatch = requiredCourses.find(c => c.code.toUpperCase() === cleanCode);
        
        if (!exactMatch) {
          // Find similar courses (potential typos)
          const similar = requiredCourses.find(c => {
            const validCode = c.code.toUpperCase();
            // Check if codes are very similar (e.g., SENG406 vs SENG409)
            const prefix = cleanCode.substring(0, 4);
            const validPrefix = validCode.substring(0, 4);
            
            return prefix === validPrefix && cleanCode !== validCode;
          });

          if (similar) {
            issues.push({
              id: `naming-${cls.id}`,
              type: 'naming-error',
              severity: 'error',
              message: `Course code "${cls.courseCode}" may be incorrect`,
              suggestion: `Did you mean "${similar.code}"? (${similar.name})`,
              affectedClass: cls,
            });
          }
        }
      }

      // Check for capacity issues
      if (cls.venueCapacity && cls.classSize) {
        const utilizationPercentage = (cls.classSize / cls.venueCapacity) * 100;
        
        if (cls.classSize > cls.venueCapacity) {
          issues.push({
            id: `capacity-${cls.id}`,
            type: 'capacity',
            severity: 'error',
            message: `Venue capacity exceeded for ${cls.courseCode}`,
            suggestion: `${cls.venue} (capacity: ${cls.venueCapacity}) cannot accommodate ${cls.classSize} students. Consider splitting the class or using a larger venue.`,
            affectedClass: cls,
          });
        } else if (utilizationPercentage < 30) {
          issues.push({
            id: `underutilized-${cls.id}`,
            type: 'capacity',
            severity: 'warning',
            message: `Low venue utilization for ${cls.courseCode}`,
            suggestion: `${cls.venue} (capacity: ${cls.venueCapacity}) is only ${utilizationPercentage.toFixed(0)}% utilized with ${cls.classSize} students. Consider using a smaller venue to optimize space.`,
            affectedClass: cls,
          });
        }
      }
    });

    // Check for courses that may need repetition (practical courses)
    const courseFrequency = new Map<string, ScheduledClass[]>();
    scheduledClasses.forEach(cls => {
      const code = cls.courseCode.toUpperCase();
      if (!courseFrequency.has(code)) {
        courseFrequency.set(code, []);
      }
      courseFrequency.get(code)!.push(cls);
    });

    courseFrequency.forEach((classes, code) => {
      // Check if course name suggests it needs multiple sessions (e.g., contains "Lab", "Practical", "Studio")
      const firstClass = classes[0];
      const needsMultipleSessions = 
        firstClass.courseName.toLowerCase().includes('lab') ||
        firstClass.courseName.toLowerCase().includes('practical') ||
        firstClass.courseName.toLowerCase().includes('studio') ||
        firstClass.courseName.toLowerCase().includes('workshop');

      if (needsMultipleSessions && classes.length === 1) {
        issues.push({
          id: `repetition-${code}`,
          type: 'repetition-needed',
          severity: 'info',
          message: `${code} may require multiple weekly sessions`,
          suggestion: `Practical/Lab courses typically need 2-3 sessions per week. Currently scheduled only once.`,
          affectedClass: firstClass,
        });
      }
    });

    return issues;
  };

  const issues = detectValidationIssues();
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const infos = issues.filter(i => i.severity === 'info');

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-slate-50">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {errors.length > 0 ? (
              <>
                <AlertTriangle className="size-5 text-red-600" />
                <span className="text-red-900">Smart Validation</span>
              </>
            ) : warnings.length > 0 ? (
              <>
                <AlertCircle className="size-5 text-orange-600" />
                <span className="text-orange-900">Smart Validation</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-5 text-green-600" />
                <span className="text-green-900">Smart Validation</span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            {errors.length > 0 && (
              <Badge variant="destructive">{errors.length} Error{errors.length > 1 ? 's' : ''}</Badge>
            )}
            {warnings.length > 0 && (
              <Badge className="bg-orange-500">{warnings.length} Warning{warnings.length > 1 ? 's' : ''}</Badge>
            )}
            {infos.length > 0 && (
              <Badge variant="secondary">{infos.length} Suggestion{infos.length > 1 ? 's' : ''}</Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {issues.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle2 className="size-12 text-green-500 mx-auto mb-3" />
            <p className="text-slate-700 font-medium">All Validations Passed</p>
            <p className="text-sm text-slate-500 mt-1">
              No naming errors, capacity issues, or other validation problems detected
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Errors */}
            {errors.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-red-900 flex items-center gap-2">
                  <AlertTriangle className="size-4" />
                  Critical Issues ({errors.length})
                </h3>
                {errors.map((issue) => (
                  <Alert key={issue.id} variant="destructive" className="bg-red-50 border-red-300">
                    <AlertTriangle className="size-4" />
                    <AlertTitle className="flex items-center justify-between">
                      <span>{issue.message}</span>
                      <Badge variant="outline" className="font-mono text-xs ml-2">
                        {issue.affectedClass.courseCode}
                      </Badge>
                    </AlertTitle>
                    <AlertDescription className="mt-2">
                      <div className="space-y-2">
                        <div className="bg-white/50 p-3 rounded">
                          <p className="text-sm font-medium mb-1">Affected Class:</p>
                          <p className="text-sm">
                            {issue.affectedClass.courseName} • {issue.affectedClass.day} {issue.affectedClass.startTime}-{issue.affectedClass.endTime} • {issue.affectedClass.venue}
                          </p>
                        </div>
                        {issue.suggestion && (
                          <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                            <p className="text-sm font-medium text-blue-900 mb-1">💡 Suggestion:</p>
                            <p className="text-sm text-blue-800">{issue.suggestion}</p>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-orange-900 flex items-center gap-2">
                  <AlertCircle className="size-4" />
                  Warnings ({warnings.length})
                </h3>
                {warnings.map((issue) => (
                  <Alert key={issue.id} className="bg-orange-50 border-orange-300">
                    <AlertCircle className="size-4 text-orange-600" />
                    <AlertTitle className="flex items-center justify-between text-orange-900">
                      <span>{issue.message}</span>
                      <Badge variant="outline" className="font-mono text-xs ml-2 border-orange-300">
                        {issue.affectedClass.courseCode}
                      </Badge>
                    </AlertTitle>
                    <AlertDescription className="text-orange-800 mt-2">
                      <div className="space-y-2">
                        <div className="bg-white/50 p-3 rounded">
                          <p className="text-sm font-medium mb-1">Details:</p>
                          <p className="text-sm">
                            {issue.affectedClass.courseName} • {issue.affectedClass.venue}
                          </p>
                        </div>
                        {issue.suggestion && (
                          <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                            <p className="text-sm font-medium text-blue-900 mb-1">💡 Suggestion:</p>
                            <p className="text-sm text-blue-800">{issue.suggestion}</p>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Info/Suggestions */}
            {infos.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                  <Info className="size-4" />
                  Suggestions ({infos.length})
                </h3>
                {infos.map((issue) => (
                  <Alert key={issue.id} className="bg-blue-50 border-blue-300">
                    <Info className="size-4 text-blue-600" />
                    <AlertTitle className="flex items-center justify-between text-blue-900">
                      <span>{issue.message}</span>
                      <Badge variant="outline" className="font-mono text-xs ml-2 border-blue-300">
                        {issue.affectedClass.courseCode}
                      </Badge>
                    </AlertTitle>
                    {issue.suggestion && (
                      <AlertDescription className="text-blue-800 mt-2">
                        <p className="text-sm">{issue.suggestion}</p>
                      </AlertDescription>
                    )}
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