# Frontend Folder Structure

This document explains the organization of the frontend codebase.

## 📁 Root Directory

```
frontend/
├── docs/                    # Documentation files
├── public/                  # Static assets
├── src/                     # Source code
├── build/                   # Production build output
├── .env.local              # Environment variables (local)
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
└── README.md               # Project overview
```

## 📂 src/ Directory

### `src/components/`
React components organized by feature and role:

#### Main Dashboard Components
- `Dashboard.tsx` - Landing page
- `DashboardLayout.tsx` - Main layout wrapper
- `Navbar.tsx` - Navigation bar

#### School Officer Components
- `SchoolOfficerDashboard.tsx` - School officer main dashboard
- `OfficerManagement.tsx` - Manage department officers
- `RegisterOfficerModal.tsx` - Register new officers
- `OfficerLoginModal.tsx` - Officer authentication modal
- `GEDSCourseManagement.tsx` - GEDS/GST/SAT courses management
- `ComputingCoursesManagement.tsx` - Computing courses management
- `VenueManagement.tsx` - Venue management
- `NonComputingLecturerRegistry.tsx` - Non-computing lecturer management
- `AcademicSettings.tsx` / `AcademicSettingsPanel.tsx` - Academic settings

#### Department Officer Components
- `DepartmentOfficerDashboard.tsx` - Department officer main dashboard
- `DepartmentManagement.tsx` - Department-specific management
- `DepartmentCoursesLecturers.tsx` - Course and lecturer assignment
- `ClassGroupManagement.tsx` - Class group management
- `LecturerPreferences.tsx` - Lecturer availability settings

#### Timetable Components
- `EnhancedTimetableScheduling.tsx` - Main timetable scheduling interface
- `TimetableScheduler.tsx` - Timetable creation and editing
- `TimetableViewer.tsx` - View timetables
- `TimetableGrid.tsx` - Grid display component
- `DynamicTimetableGrid.tsx` - Dynamic grid with interactions
- `PublicTimetableGrid.tsx` - Public-facing timetable view

#### Student Components
- `StudentLandingPage.tsx` - Student entry point
- `StudentTimetableView.tsx` - Student timetable viewer
- `TimetableDiscovery.tsx` - Discover and browse timetables

#### Support Components
- `ConflictDetectionPanel.tsx` - Detect scheduling conflicts
- `SmartValidationPanel.tsx` - Validation checks
- `MissingCoursesPanel.tsx` - Track missing course assignments
- `ApprovalWorkflow.tsx` - Timetable approval process
- `NotificationBell.tsx` - Notification system
- `InfoSection.tsx` - Information display component
- `StatCard.tsx` - Statistics card component

#### Course & Data Management
- `CourseManagementTable.tsx` - Course CRUD operations
- `NonComputingCourseManagement.tsx` - Non-computing courses
- `OfficerManagementTable.tsx` - Officer data table
- `VenueManagementTable.tsx` - Venue data table

### `src/components/ui/`
Reusable UI components from shadcn/ui:
- Form elements: `button.tsx`, `input.tsx`, `select.tsx`, `checkbox.tsx`, etc.
- Layout: `card.tsx`, `dialog.tsx`, `sheet.tsx`, `tabs.tsx`, etc.
- Display: `table.tsx`, `badge.tsx`, `avatar.tsx`, `alert.tsx`, etc.
- Navigation: `dropdown-menu.tsx`, `navigation-menu.tsx`, `breadcrumb.tsx`, etc.

### `src/services/`
API and backend communication:
- `api.js` - Axios instance and API endpoints

### `src/utils/`
Utility functions:
- `pdfGenerator.ts` - Generate PDF timetables
- `publicPdfGenerator.ts` - PDF generation for public view

### `src/styles/`
Global styles:
- `globals.css` - CSS variables and theme configuration

### Root Level Files
- `App.tsx` - Main app component with routing
- `main.tsx` - Application entry point
- `index.css` - Tailwind CSS and global styles

## 🎨 Styling

- **CSS Framework**: Tailwind CSS v4
- **Component Library**: shadcn/ui
- **Theme**: Custom theme based on Babcock University colors
  - Primary: Navy Blue (#0f2044)
  - Secondary: Gold (#ffb71b)

## 🔑 Environment Variables

Create a `.env.local` file with:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Timetable Generation System
VITE_ENVIRONMENT=development
```

## 📦 Key Dependencies

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons
- **html2canvas & jspdf** - PDF generation

## 🚀 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Notes

- Components are organized by user role and feature for easy navigation
- UI components in `components/ui/` are from shadcn/ui and follow their conventions
- All API calls go through the centralized `services/api.js`
- Environment variables are prefixed with `VITE_` for Vite compatibility
