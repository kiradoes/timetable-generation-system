import { useState } from 'react';
import { TimetableDiscovery } from './TimetableDiscovery';
import { PublicTimetableGrid } from './PublicTimetableGrid';
import { Navbar } from './Navbar';
import { InfoSection } from './InfoSection';
import { generatePublicTimetablePDF } from '../utils/publicPdfGenerator';

export function Dashboard({ userState, onLogout }) {
  const [filters, setFilters] = useState(null);

  const handleDownloadPDF = () => {
    const timetable = role === 'student' ? studentTimetable : lecturerTimetable;
    generateTimetablePDF(timetable, name, role, id);
  };

  const handleNotifications = () => {
    alert('No new notifications at this time.');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-full p-2">
                <GraduationCap className="size-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl">Timetable System</h1>
                <p className="text-sm text-muted-foreground">
                  {role === 'student' ? 'Student Portal' : 'Lecturer Portal'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="mr-2 size-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="mb-2">Welcome, {name}</h2>
              <p className="text-muted-foreground">
                Here's your personalized timetable for this week
              </p>
            </div>
            <Button onClick={handleDownloadPDF} className="w-full md:w-auto">
              <Download className="mr-2 size-4" />
              Download Timetable (PDF)
            </Button>
          </div>
        </div>

        {/* Conflict-Free Badge */}
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="bg-green-500 rounded-full p-2">
              <svg
                className="size-5 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-green-900">Conflict-Free Schedule</h3>
              <p className="text-sm text-green-700">
                Your timetable has been verified and approved with no time conflicts
              </p>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              Verified
            </Badge>
          </CardContent>
        </Card>

        {/* Timetable */}
        <TimetableGrid role={role} />
      </main>
    </div>
  );
}