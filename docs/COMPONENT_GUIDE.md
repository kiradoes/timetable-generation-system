# Component Overview

This document provides a quick reference for all major components in the system.

## 🏠 Main Entry Points

### Dashboard (`Dashboard.tsx`)
The landing page with role-based navigation:
- School Timetable Officer access
- Department Timetable Officer access
- Student timetable discovery

### App (`App.tsx`)
Main routing and authentication wrapper

## 👔 School Officer Components

### SchoolOfficerDashboard
**Purpose**: Main dashboard for school timetable officers  
**Key Features**:
- Overview statistics
- Access to all management panels
- System-wide settings

### OfficerManagement / RegisterOfficerModal
**Purpose**: Register and manage department officers  
**Features**:
- Create officer accounts
- Assign to departments
- View all officers

### GEDSCourseManagement
**Purpose**: Manage GEDS/GST/SAT courses (non-computing courses)  
**Features**:
- Add/edit/delete courses
- Set course credits and hours
- Assign lecturers

### ComputingCoursesManagement
**Purpose**: Manage computing department courses  
**Features**:
- Course CRUD operations
- Department assignment
- Level and semester settings

### VenueManagement / VenueManagementTable
**Purpose**: Manage venues/classrooms  
**Features**:
- Add venues with capacity
- Set venue types
- Building assignment

### NonComputingLecturerRegistry
**Purpose**: Manage lecturers for non-computing courses  
**Features**:
- Lecturer profile management
- Contact information
- Course assignments

## 👨‍🏫 Department Officer Components

### DepartmentOfficerDashboard
**Purpose**: Main dashboard for department officers  
**Features**:
- Department-specific view
- Quick access to timetabling tools
- Session management

### DepartmentManagement
**Purpose**: Manage department-specific data  
**Features**:
- View department courses
- Manage class groups
- Lecturer assignments

### DepartmentCoursesLecturers
**Purpose**: Assign lecturers to courses  
**Features**:
- Course-lecturer mapping
- View assignments by semester
- Handle conflicts

### ClassGroupManagement
**Purpose**: Manage student class groups  
**Features**:
- Create groups (A, B, C, D, E)
- Set group sizes
- Level-based organization

### LecturerPreferences / LecturerAvailability
**Purpose**: Set lecturer availability  
**Features**:
- Day and time preferences
- Unavailable periods
- Teaching load management

## 📅 Timetable Components

### EnhancedTimetableScheduling
**Purpose**: Main timetable creation interface  
**Features**:
- Drag-and-drop scheduling
- Conflict detection
- Real-time validation
- Save and publish

### TimetableScheduler
**Purpose**: Core scheduling logic  
**Features**:
- Manual slot assignment
- Auto-scheduling suggestions
- Constraint checking

### TimetableViewer
**Purpose**: View completed timetables  
**Features**:
- Filter by department/level/group
- Print/export options
- Public sharing

### TimetableGrid / DynamicTimetableGrid
**Purpose**: Display timetable in grid format  
**Features**:
- Weekly view (Mon-Fri, 7 AM - 6 PM)
- Color-coded courses
- Interactive cells

### PublicTimetableGrid
**Purpose**: Public-facing timetable view  
**Features**:
- Read-only display
- Clean interface
- PDF export

## 🎓 Student Components

### StudentLandingPage
**Purpose**: Student entry point  
**Features**:
- Quick timetable access
- Department/level/group selection
- Announcements

### StudentTimetableView
**Purpose**: View student timetables  
**Features**:
- Personal timetable display
- Course details
- PDF download

### TimetableDiscovery
**Purpose**: Browse available timetables  
**Features**:
- Search by criteria
- Filter options
- Preview mode

## 🔧 Utility Components

### ConflictDetectionPanel
**Purpose**: Identify scheduling conflicts  
**Features**:
- Lecturer conflicts
- Venue conflicts
- Time overlap detection
- Suggested resolutions

### SmartValidationPanel
**Purpose**: Validate timetable completeness  
**Features**:
- Check all courses scheduled
- Verify credit hours
- Ensure constraints met

### MissingCoursesPanel
**Purpose**: Track unscheduled courses  
**Features**:
- List pending courses
- Priority indicators
- Quick schedule action

### ApprovalWorkflow
**Purpose**: Timetable approval process  
**Features**:
- Submit for approval
- Review status
- Approval history

### NotificationBell
**Purpose**: System notifications  
**Features**:
- Alert badge
- Notification list
- Mark as read

## 📊 Data Management Components

### CourseManagementTable
**Purpose**: Generic course data table  
**Features**:
- CRUD operations
- Sorting and filtering
- Bulk actions

### OfficerManagementTable
**Purpose**: Officer data display  
**Features**:
- List all officers
- Edit permissions
- Deactivate accounts

### VenueManagementTable
**Purpose**: Venue data table  
**Features**:
- Venue list
- Capacity information
- Availability status

## 🎨 UI Components (`components/ui/`)

These are reusable components from shadcn/ui:

### Form Elements
- `Button` - Clickable actions
- `Input` - Text input fields
- `Select` - Dropdown selection
- `Checkbox` - Boolean selection
- `Radio Group` - Single selection from options
- `Switch` - Toggle on/off
- `Textarea` - Multi-line text input

### Layout
- `Card` - Container with header/content/footer
- `Dialog` - Modal popup
- `Sheet` - Slide-in panel
- `Tabs` - Tabbed content
- `Accordion` - Collapsible sections

### Display
- `Table` - Data tables
- `Badge` - Status indicators
- `Alert` - Important messages
- `Avatar` - User profile images
- `Tooltip` - Hover information

### Navigation
- `Dropdown Menu` - Contextual actions
- `Navigation Menu` - Top navigation
- `Breadcrumb` - Navigation path
- `Pagination` - Page navigation

## 🔄 Component Relationships

```
App.tsx
├── Dashboard.tsx
│   ├── SchoolOfficerDashboard
│   │   ├── OfficerManagement
│   │   ├── GEDSCourseManagement
│   │   ├── ComputingCoursesManagement
│   │   ├── VenueManagement
│   │   └── NonComputingLecturerRegistry
│   ├── DepartmentOfficerDashboard
│   │   ├── DepartmentManagement
│   │   ├── ClassGroupManagement
│   │   ├── LecturerPreferences
│   │   └── EnhancedTimetableScheduling
│   │       ├── TimetableScheduler
│   │       ├── ConflictDetectionPanel
│   │       ├── SmartValidationPanel
│   │       └── MissingCoursesPanel
│   └── StudentLandingPage
│       ├── TimetableDiscovery
│       └── StudentTimetableView
└── DashboardLayout (wraps authenticated routes)
```

## 📝 Component Naming Conventions

- **Dashboard**: Main entry points for user roles
- **Management**: CRUD operations for entities
- **Panel**: Specialized feature panels
- **Table**: Data display components
- **Modal**: Popup forms
- **View**: Read-only displays
- **Grid**: Timetable grid displays
