import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

export function MissingCoursesPanel({ 
  requiredCourses, 
  scheduledClasses 
}) {
  // Get list of scheduled course codes
  const scheduledCourseCodes = new Set(
    scheduledClasses.map(cls => cls.courseCode.toUpperCase())
  );

  // Find missing required courses
  const missingCourses = requiredCourses.filter(
    course => course.required && !scheduledCourseCodes.has(course.code.toUpperCase())
  );

  // Find scheduled courses
  const scheduledRequiredCourses = requiredCourses.filter(
    course => course.required && scheduledCourseCodes.has(course.code.toUpperCase())
  );

  // Calculate total units
  const totalRequiredUnits = requiredCourses
    .filter(c => c.required)
    .reduce((sum, c) => sum + c.units, 0);
  
  const scheduledUnits = scheduledRequiredCourses.reduce((sum, c) => sum + c.units, 0);
  const missingUnits = totalRequiredUnits - scheduledUnits;

  return (
    <Card className={`shadow-md ${missingCourses.length > 0 ? 'border-orange-300' : 'border-green-300'}`}>
      <CardHeader className={missingCourses.length > 0 ? 'bg-orange-50' : 'bg-green-50'}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {missingCourses.length > 0 ? (
              <>
                <AlertCircle className="size-5 text-orange-600" />
                <span className="text-orange-900">Course Coverage Analysis</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-5 text-green-600" />
                <span className="text-green-900">All Courses Scheduled</span>
              </>
            )}
          </div>
          <Badge variant={missingCourses.length > 0 ? "destructive" : "default"} className="ml-2">
            {scheduledRequiredCourses.length}/{requiredCourses.filter(c => c.required).length} Courses
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-700 mb-1">Total Required</p>
            <p className="text-2xl font-bold text-blue-900">
              {requiredCourses.filter(c => c.required).length}
            </p>
            <p className="text-xs text-blue-600 mt-1">{totalRequiredUnits} units</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-sm text-green-700 mb-1">Scheduled</p>
            <p className="text-2xl font-bold text-green-900">
              {scheduledRequiredCourses.length}
            </p>
            <p className="text-xs text-green-600 mt-1">{scheduledUnits} units</p>
          </div>
          <div className={`${missingCourses.length > 0 ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200'} border rounded-lg p-4 text-center`}>
            <p className={`text-sm ${missingCourses.length > 0 ? 'text-orange-700' : 'text-slate-600'} mb-1`}>
              Missing
            </p>
            <p className={`text-2xl font-bold ${missingCourses.length > 0 ? 'text-orange-900' : 'text-slate-700'}`}>
              {missingCourses.length}
            </p>
            <p className={`text-xs ${missingCourses.length > 0 ? 'text-orange-600' : 'text-slate-500'} mt-1`}>
              {missingUnits} units
            </p>
          </div>
        </div>

        {/* Missing Courses Alert */}
        {missingCourses.length > 0 ? (
          <div className="space-y-3">
            <Alert className="bg-orange-50 border-orange-300">
              <AlertCircle className="size-4 text-orange-600" />
              <AlertTitle className="text-orange-900">
                {missingCourses.length} Required Course{missingCourses.length > 1 ? 's' : ''} Not on Timetable
              </AlertTitle>
              <AlertDescription className="text-orange-800 text-sm">
                The following required courses have not been scheduled yet:
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              {missingCourses.map((course) => (
                <div 
                  key={course.code}
                  className="flex items-center justify-between bg-white border border-orange-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 rounded-full p-2">
                      <BookOpen className="size-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#0f2044] font-mono">
                        {course.code}
                      </p>
                      <p className="text-sm text-slate-600">
                        {course.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-orange-300 text-orange-700">
                      {course.units} {course.units === 1 ? 'unit' : 'units'}
                    </Badge>
                    <Badge variant="destructive" className="bg-orange-500">
                      Required
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900">
                <strong>Action Required:</strong> Please schedule these courses before submitting the timetable for approval.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircle2 className="size-12 text-green-500 mx-auto mb-3" />
            <p className="text-slate-700 font-medium">All Required Courses Scheduled</p>
            <p className="text-sm text-slate-500 mt-1">
              All {requiredCourses.filter(c => c.required).length} required courses have been added to the timetable
            </p>
          </div>
        )}

        {/* Scheduled Courses List */}
        {scheduledRequiredCourses.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h4 className="font-semibold text-[#0f2044] mb-3 flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-600" />
              Scheduled Required Courses
            </h4>
            <div className="space-y-2">
              {scheduledRequiredCourses.map((course) => (
                <div 
                  key={course.code}
                  className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3 text-green-600" />
                    <span className="font-mono font-medium text-[#0f2044]">
                      {course.code}
                    </span>
                    <span className="text-slate-600">
                      {course.name}
                    </span>
                  </div>
                  <Badge variant="outline" className="border-green-300 text-green-700 text-xs">
                    {course.units} units
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}