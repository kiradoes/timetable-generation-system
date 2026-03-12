# BUCC TIMETABLE MANAGEMENT SYSTEM - USER GUIDE

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [User Roles](#user-roles)
3. [School Timetable Officer](#school-timetable-officer)
4. [Department Timetable Officer](#department-timetable-officer)
5. [Students](#students)
6. [Feature Summary](#feature-summary)

---

## 🎓 System Overview

The **BUCC Timetable Management System** is a comprehensive, computer-aided solution for managing academic schedules at Babcock University Computer Club (BUCC). It supports three user roles with distinct capabilities.

**Brand Colors:**
- Navy Blue: `#0f2044`
- Gold: `#ffb71b`

**Academic Structure:**
- **5 Computing Departments:** Computer Science, Software Engineering, Information Technology, Information Systems, Cyber Security
- **Levels:** 100, 200, 300, 400
- **Groups:** A, B, C, D, E (except 400 Level which has only A, B)
- **Schedule:** Monday - Friday only (7:00 AM - 6:00 PM)
- **Protected Time:** Wednesday 10:00 AM - 12:00 PM (Chapel)

---

## 👥 User Roles

### 1. **School Timetable Officer** (System Administrator)
- Manages all non-computing courses (GEDS/GST/SAT)
- Registers Department Timetable Officers
- Manages venues and non-computing lecturers
- Sets academic sessions and semesters

### 2. **Department Timetable Officer** (Department Level)
- Manages department-specific computing courses
- Manages department lecturers
- Creates class groups
- Generates department timetables

### 3. **Students** (View Only)
- Search for their timetable by level and group
- View weekly schedule
- Export timetable as PDF
- Print timetable

---

## 🏫 School Timetable Officer

### Login Credentials (Mock)
- **Email:** `school.officer@babcock.edu.ng`
- **Password:** `schooladmin123`

### Dashboard Navigation

#### 1. **Dashboard Overview**
**Purpose:** View system statistics and recent activity

**Features:**
- Total computing departments: 5
- Total general lecturers (GEDS/GST/SAT)
- Total venues across all buildings
- Total general courses
- Recent activity log
- Quick action buttons

---

#### 2. **Register Officers** 
**Purpose:** Register Department Timetable Officers for each computing department

**Requirements (ALL REQUIRED):**
- ✅ Full Name
- ✅ Email Address (must be valid)
- ✅ Department (dropdown - 5 computing departments only)
- ✅ Password (minimum 6 characters)
- ✅ Confirm Password (must match)

**How to Use:**
1. Click "Register Officers" in sidebar
2. Click "Register New Officer" button
3. Fill in all required fields
4. Select department from dropdown:
   - Computer Science
   - Software Engineering
   - Information Technology
   - Information Systems
   - Cyber Security
5. Set a secure password
6. Click "Register Officer"

**Actions Available:**
- ✅ **Add** new department officers
- ✅ **View** all registered officers
- ✅ **Edit** officer details
- ✅ **Delete** officers
- ✅ **Search/Filter** by name, email, or department
- ✅ **Activate/Deactivate** officer accounts

**Current Officers (Mock Data):**
1. Dr. John Adeyemi - Computer Science
2. Dr. Sarah Okonkwo - Software Engineering
3. Prof. Michael Eze - Information Technology
4. Dr. Blessing Nwosu - Information Systems
5. Dr. Ibrahim Lawal - Cyber Security

---

#### 2️⃣ GEDS/GST/SAT Courses
Non-computing courses managed by the School Officer.

**Purpose:** Manage general education courses that are taken by all computing students.

**Features:**
- ✅ Add GEDS (General Education) courses
- ✅ Add GST (General Studies) courses  
- ✅ Add SAT (Spiritual Awareness) courses
- ✅ Assign credit units (1-6)
- ✅ Set level (100-400)
- ✅ Set semester (First/Second/Both)
- ✅ Assign lecturers from non-computing staff
- ✅ Full CRUD operations

**Course Categories:**
- **GEDS:** Research Methodology, Philosophy, etc.
- **GST:** Citizenship Education, Entrepreneurship, etc.
- **SAT:** Biblical Studies, Spiritual Development, etc.

---

#### 3️⃣ Computing Courses
Computing courses for all 5 departments managed by the School Officer.

**Purpose:** Central management of computing courses across all departments.

**Features:**
- ✅ Add courses for all 5 computing departments
- ✅ Filter by department (CS, SE, IT, IS, Cyber Security)
- ✅ View department statistics
- ✅ Assign course code, title, units
- ✅ Set level (100-500)
- ✅ Set semester (First/Second/Both)
- ✅ Full CRUD operations

**5 Computing Departments:**
1. **Computer Science** - COSC courses
2. **Software Engineering** - SENG courses
3. **Information Technology** - ITGY/ITM courses
4. **Information Systems** - INFS courses
5. **Cyber Security** - CYB courses

**Sample Courses:**
- **CS:** COSC424 - Advanced Algorithms (400L)
- **SE:** SENG406 - Software Testing (400L)
- **IT:** ITGY409 - IT Governance (400L)
- **IS:** INFS410 - Enterprise Systems (400L)
- **Cyber:** CYB408 - Ethical Hacking (400L)

---

#### 4️⃣ Venue Management
**Purpose:** Add and manage all lecture halls, laboratories, and seminar rooms

**Add Venue Form Fields:**
- ✅ **Venue Name** (Required) - e.g., "Bucodel Lab 1", "New Horizon", "LT 1"
- ✅ **Capacity** (Required) - Number (minimum 1) - e.g., 200 students
- ✅ **Type** (Required) - Dropdown:
  - Lecture Hall
  - Laboratory
  - Seminar Room
- ✅ **Building** (Required) - e.g., "Main Block", "Bucodel Building"
- ✅ **Status** - Auto-set to "Available"

**How to Use:**
1. Click "Venue Management" in sidebar
2. Click "Add New Venue" button
3. Enter venue name
4. Enter student capacity
5. Select venue type
6. Enter building name
7. Click "Add Venue"

**Actions Available:**
- ✅ **Add** new venues
- ✅ **Edit** existing venues
- ✅ **Delete** venues
- ✅ **Search/Filter** by name, type, or building
- ✅ **Set Maintenance Status** (Available/Maintenance)

**Sample Venues:**
- Bucodel Lab 1 (Laboratory, 50 capacity)
- Bucodel Lab 2 (Laboratory, 50 capacity)
- New Horizon (Lecture Hall, 200 capacity)
- Computing Lab 3 (Laboratory, 45 capacity)
- LT 1 (Lecture Hall, 180 capacity)
- LT 2 (Lecture Hall, 150 capacity)
- LT 3 (Lecture Hall, 180 capacity)
- Server Room (Laboratory, 25 capacity)
- Seminar Room A (Seminar Room, 40 capacity)

---

#### 5. **Non-Computing Lecturers**
**Purpose:** Manage lecturers who teach GEDS/GST/SAT courses

**Add Lecturer Form Fields:**
- ✅ **Name** (Required) - e.g., "Dr. Oluwaseun Adebayo"
- ✅ **Email** (Required) - Must be valid email format
- ✅ **Phone** (Required) - e.g., "+234 803 456 7890"
- ✅ **Department** (Required) - Dropdown:
  - GEDS
  - Business
  - Theology
  - Mathematics
  - English
  - Physics
  - Chemistry
  - Other departments
- ✅ **Courses Taught** - Comma-separated course codes (e.g., "GEDS 420, GEDS 310")

**How to Use:**
1. Click "Non-Computing Lecturers" in sidebar
2. Click "Add New Lecturer" button
3. Fill in lecturer personal details
4. Select their home department
5. List courses they can teach
6. Click "Add Lecturer"

**Actions Available:**
- ✅ **Add** new non-computing lecturers
- ✅ **Edit** lecturer information
- ✅ **Delete** lecturers
- ✅ **Search/Filter** by name, email, or department
- ✅ **Filter by Department**
- ✅ **View Assigned Courses**

**Sample Lecturers:**
1. Dr. Oluwaseun Adebayo (GEDS - GEDS 420)
2. Prof. Chioma Nwosu (Business - BU-GST 220, BU-GST 312)
3. Pastor Emmanuel Okafor (Theology - BU-SEN 212)

---

#### 6. **Academic Settings**
**Purpose:** Set the academic session, semester, and lecture time slots

**Configuration Options:**
- ✅ **Academic Session** - e.g., "2025-2026"
- ✅ **Current Semester** - First or Second
- ✅ **Active Lecture Days** - Monday to Friday (Saturday disabled)
- ✅ **Time Slots** - Add/remove lecture periods:
  - Default: 7:00 AM - 6:00 PM
  - Chapel Time Protected: Wednesday 10:00 AM - 12:00 PM

**How to Use:**
1. Click "Academic Settings" in sidebar
2. Click "Edit Settings" button
3. Update academic session (e.g., 2025-2026)
4. Select current semester
5. Add or remove time slots as needed
6. Ensure Wednesday 10-12pm is blocked for Chapel
7. Click "Save Changes"

**Default Time Slots:**
- 7:00 AM - 8:00 AM
- 8:00 AM - 10:00 AM
- 10:00 AM - 12:00 PM (BLOCKED on Wednesday for Chapel)
- 12:00 PM - 2:00 PM
- 2:00 PM - 4:00 PM
- 4:00 PM - 6:00 PM

---

### Summary: School Officer Capabilities

| Feature | Add | View | Edit | Delete |
|---------|-----|------|------|--------|
| Department Officers | ✅ | ✅ | ✅ | ✅ |
| GEDS/GST/SAT Courses | ✅ | ✅ | ✅ | ✅ |
| Venues | ✅ | ✅ | ✅ | ✅ |
| Non-Computing Lecturers | ✅ | ✅ | ✅ | ✅ |
| Academic Settings | - | ✅ | ✅ | - |

---

## 💻 Department Timetable Officer

### Login Credentials (Mock)
- **Email:** `department.cs@babcock.edu.ng` (Computer Science)
- **Password:** `dept123`

### Dashboard Navigation

#### 1. **Dashboard Overview**
**Purpose:** View department statistics and timetable status

**Features:**
- Total computing courses in your department
- Total department lecturers
- Total class groups
- Active schedules this semester
- Timetable approval status (Pending/Approved/Rejected)
- Scheduling control center
- Recent activity log

**Timetable Status Badges:**
- 🟢 **Approved** - Timetable is live, students can view it
- 🟡 **Pending Approval** - Waiting for School Officer review
- 🔴 **Rejected** - Needs revision and resubmission
- ⚪ **Not Generated** - Create your first timetable

---

#### 2. **Department Courses**
**Purpose:** Manage computing courses and department lecturers

**Tab 1: Courses**

**Add Course Form Fields:**
- ✅ **Course Code** (Required) - e.g., "COSC424"
- ✅ **Course Title** (Required) - e.g., "Advanced Algorithms"
- ✅ **Credit Units** (Required) - Number (1-6)
- ✅ **Level** (Required) - Dropdown:
  - 100 Level
  - 200 Level
  - 300 Level
  - 400 Level
- ✅ **Semester** (Required) - Dropdown:
  - First Semester
  - Second Semester
  - Both Semesters

**How to Add Course:**
1. Click "Department Courses" in sidebar
2. Click "Courses" tab
3. Click "Add New Course" button
4. Fill in course code (e.g., COSC424)
5. Enter course title
6. Select credit units (typically 3)
7. Select level (100-400)
8. Select semester
9. Click "Add Course"

**Sample Courses:**
- COSC424 - Advanced Algorithms (400 Level, 3 units)
- ITGY409 - IT Governance (400 Level, 3 units)
- SENG406 - Software Testing (400 Level, 3 units)
- COS202 - Data Structures (200 Level, 3 units)

---

**Tab 2: Lecturers**

**Add Lecturer Form Fields:**
- ✅ **Name** (Required) - e.g., "Dr. Adeyemi Johnson"
- ✅ **Email** (Required) - Must end with @babcock.edu.ng
- ✅ **Phone** (Required) - e.g., "+234 803 123 4567"
- ✅ **Courses Taught** - Comma-separated (e.g., "COSC424, COS202")

**How to Add Lecturer:**
1. Click "Lecturers" tab
2. Click "Add New Lecturer" button
3. Fill in lecturer name
4. Enter university email
5. Enter phone number
6. List courses they can teach
7. Click "Add Lecturer"

**Sample Lecturers:**
1. Dr. Adeyemi Johnson - Teaches COSC424, COS202
2. Prof. Grace Okonkwo - Teaches SENG406
3. Dr. Michael Eze - Teaches ITGY409

**Actions Available:**
- ✅ **Add** new courses and lecturers
- ✅ **Edit** existing data
- ✅ **Delete** courses/lecturers
- ✅ **Search/Filter** by code, name, or level
- ✅ **View Lecturer Workload**

---

#### 3. **Class Groups**
**Purpose:** Create and manage student class groups by level

**Add Class Group Form Fields:**
- ✅ **Department** - Auto-filled (your department)
- ✅ **Level** (Required) - Dropdown:
  - 100 Level
  - 200 Level
  - 300 Level
  - 400 Level
- ✅ **Group** (Required) - Auto-populated based on level:
  - 100-300 Level: Groups A, B, C, D, E
  - 400 Level: Groups A, B only
- ✅ **Class Size** (Required) - Number of students
- ✅ **Group Type** - Regular or Special

**How to Use:**
1. Click "Class Groups" in sidebar
2. Click "Add New Group" button
3. Select level (100-400)
4. Select group (A-E or A-B for 400 Level)
5. Enter number of students in group
6. Click "Add Group"

**Important:**
- 400 Level has only 2 groups (A and B)
- All other levels have 5 groups (A, B, C, D, E)

**Actions Available:**
- ✅ **Add** new class groups
- ✅ **Edit** group details
- ✅ **Delete** groups
- ✅ **Filter by Level**
- ✅ **View Group Size**

---

#### 4. **Lecturer Preferences**
**Purpose:** Set lecturer availability and preferred teaching times

**Preference Settings:**
- ✅ **Select Lecturer** - Dropdown of all department lecturers
- ✅ **Available Days** - Multi-select:
  - ☑ Monday
  - ☑ Tuesday
  - ☑ Wednesday
  - ☑ Thursday
  - ☑ Friday
- ✅ **Preferred Time Slots** - Select from available periods:
  - Morning (7am-12pm)
  - Afternoon (12pm-4pm)
  - Evening (4pm-6pm)
- ✅ **Unavailable Periods** - Block specific dates/times
- ✅ **Maximum Teaching Hours** - Set weekly limit

**How to Use:**
1. Click "Lecturer Preferences" in sidebar
2. Select a lecturer from dropdown
3. Check their available days
4. Select preferred time slots
5. Block any unavailable periods
6. Set maximum weekly teaching hours
7. Click "Save Preferences"

**Note:** The system automatically protects Wednesday 10-12pm for Chapel

**Actions Available:**
- ✅ **Set** lecturer availability
- ✅ **Edit** preferences
- ✅ **View** all preferences
- ✅ **Block** unavailable times

---

#### 5. **Schedule Timetable**
**Purpose:** Create and generate optimized teaching timetables

**Automated Scheduling Features:**
- ✅ **No Lecturer Overlaps** - Prevents double-booking
- ✅ **Venue Capacity Matching** - Matches room size to group size
- ✅ **Preference Respect** - Uses lecturer availability
- ✅ **Chapel Protection** - Blocks Wednesday 10-12pm
- ✅ **Conflict Detection** - Warns about scheduling issues
- ✅ **Manual Override** - Allows manual adjustments

**How to Generate:**
1. Click "Schedule Timetable" in sidebar
2. Review constraints:
   - All courses added ✓
   - All lecturers registered ✓
   - All class groups created ✓
   - Preferences set ✓
3. Click "Generate Timetable" button
4. System creates optimized schedule
5. Review generated timetable
6. Make manual adjustments if needed
7. Click "Submit for Approval"

**Manual Scheduling:**
- Select course, lecturer, venue, day, and time
- System checks for conflicts
- Add entry to timetable
- Save changes

**Actions Available:**
- ✅ **Auto-Generate** optimized timetable
- ✅ **Manual Schedule** individual classes
- ✅ **Edit** scheduled entries
- ✅ **Delete** entries
- ✅ **Check Conflicts** in real-time
- ✅ **Submit for Approval** to School Officer

---

#### 6. **View Timetable**
**Purpose:** View generated department timetables

**View Options:**
- Filter by Level (100-400)
- Filter by Group (A-E)
- Filter by Semester
- Traditional grid view (Monday-Friday)

**Display Information:**
- Course code and title
- Lecturer name
- Venue location
- Time slot
- Chapel time (highlighted)

**Actions Available:**
- ✅ **View** timetables by level/group
- ✅ **Filter** by various criteria
- ✅ **Export** as PDF (coming soon)
- ✅ **Print** timetables

---

### Summary: Department Officer Capabilities

| Feature | Add | View | Edit | Delete |
|---------|-----|------|------|--------|
| Department Courses | ✅ | ✅ | ✅ | ✅ |
| Department Lecturers | ✅ | ✅ | ✅ | ✅ |
| Class Groups | ✅ | ✅ | ✅ | ✅ |
| Lecturer Preferences | ✅ | ✅ | ✅ | - |
| Timetable Schedules | ✅ | ✅ | ✅ | ✅ |

---

## 🎓 Students

### Access Method
- Visit student landing page (no login required)
- Search for timetable using form

### Find Your Timetable Form

**Required Fields:**
1. ✅ **Academic Session** - e.g., "2025-2026"
2. ✅ **Semester** - 1st or 2nd
3. ✅ **Course of Study** - Select from:
   - Computer Science
   - Software Engineering
   - Information Technology
   - Information Systems
   - Cyber Security
4. ✅ **Level** - 100, 200, 300, or 400
5. ✅ **Group** - A-E (or A-B for 400 Level)

**How to Use:**
1. Visit BUCC Timetable System homepage
2. Fill in all 5 required fields
3. Click "View Timetable" button
4. View your weekly schedule

---

### Timetable View Features

**Display:**
- Full weekly grid (Monday-Friday)
- Time slots from 7:00 AM to 6:00 PM
- Course code, title, venue, and lecturer for each class
- Chapel time highlighted (Wednesday 10-12pm)
- Legend showing schedule colors

**Export Options:**
1. **📄 Export as PDF**
   - Professional PDF with BUCC branding
   - Includes all student details
   - Formatted for printing
   - Auto-named file (e.g., BUCC_Timetable_ComputerScience_400_GroupA_1st.pdf)
   
2. **🖨️ Print**
   - Browser print dialog
   - Print-optimized layout
   - Suitable for paper timetables

**Course Summary:**
- List of all courses with details
- Lecturer names
- Excludes Chapel from course list

**Actions Available:**
- ✅ **View** weekly timetable grid
- ✅ **Export PDF** of timetable
- ✅ **Print** timetable
- ✅ **Back to Search** - return to landing page

---

## 📊 Feature Summary

### Complete CRUD Operations

| Entity | School Officer | Dept Officer | Student |
|--------|---------------|--------------|---------|
| **Department Officers** | ✅ Full CRUD | - | - |
| **GEDS/GST/SAT Courses** | ✅ Full CRUD | - | - |
| **Venues** | ✅ Full CRUD | - | - |
| **Non-Computing Lecturers** | ✅ Full CRUD | - | - |
| **Department Courses** | - | ✅ Full CRUD | View Only |
| **Department Lecturers** | - | ✅ Full CRUD | View Only |
| **Class Groups** | - | ✅ Full CRUD | - |
| **Lecturer Preferences** | - | ✅ Add/View/Edit | - |
| **Timetables** | View/Approve | ✅ Full CRUD | View/Export |
| **Academic Settings** | ✅ View/Edit | - | - |

---

### System-Wide Features

✅ **Semester-based data**
- Summary and scheduling data are cleared after each semester.
- Each new semester starts with no schedule entries or timetable summary; officers build schedules afresh for that semester.

✅ **Conflict Detection**
- No lecturer double-booking
- No venue double-booking
- No class group overlaps

✅ **Chapel Time Protection**
- Wednesday 10:00 AM - 12:00 PM always blocked
- Automatically respected in scheduling

✅ **Capacity Matching**
- Venues matched to class sizes
- Warnings for capacity mismatches

✅ **Responsive Design**
- Works on desktop, tablet, and mobile
- Mobile-friendly navigation

✅ **Search & Filter**
- Search by name, code, department
- Filter by level, semester, type
- Sort by various criteria

✅ **Data Validation**
- Email format validation
- Password strength requirements
- Required field enforcement
- Numeric range validation

✅ **Toast Notifications**
- Success messages for actions
- Error messages for failures
- Warning messages for conflicts

✅ **Loading States**
- Spinners during operations
- Disabled buttons during processing
- Progress indicators

---

### Technical Stack

**Frontend:**
- React + TypeScript
- Tailwind CSS v4
- Shadcn/UI Components
- Lucide React Icons

**PDF Generation:**
- jsPDF
- jsPDF-AutoTable

**State Management:**
- React useState hooks
- Component-level state

**Data:**
- Mock/static data (ready for backend integration)
- All CRUD operations functional

---

## 🎯 Quick Start Guide

### For School Timetable Officers:
1. Login with school officer credentials
2. Go to "Academic Settings" - set session and semester
3. Go to "Venue Management" - add all lecture halls and labs
4. Go to "Non-Computing Lecturers" - add GEDS/GST/SAT staff
5. Go to "GEDS/GST/SAT Courses" - add all general courses
6. Go to "Register Officers" - register officers for each of the 5 departments

### For Department Timetable Officers:
1. Login with your department credentials
2. Go to "Department Courses" - add all your computing courses
3. Go to "Department Courses" > Lecturers tab - add your department lecturers
4. Go to "Class Groups" - create groups for each level
5. Go to "Lecturer Preferences" - set availability for each lecturer
6. Go to "Schedule Timetable" - generate your timetable
7. Review and submit for approval

### For Students:
1. Visit BUCC Timetable homepage
2. Select your academic session
3. Select your semester
4. Select your course of study
5. Select your level
6. Select your group
7. Click "View Timetable"
8. Export as PDF or print

---

## 💡 Tips & Best Practices

**For School Officers:**
- Set up academic settings first before anything else
- Add all venues before departments start scheduling
- Keep non-computing lecturer list updated
- Review and approve department timetables promptly

**For Department Officers:**
- Add all courses and lecturers before generating timetables
- Set lecturer preferences accurately to get better schedules
- Use auto-generate first, then manually adjust if needed
- Check for conflicts before submitting for approval
- Ensure venue capacities match class sizes

**For Students:**
- Double-check your level and group before viewing
- Export PDF for offline access
- Print a copy for backup
- Check back regularly for updates

---

## 📞 Support

For issues or questions about the BUCC Timetable System:
- Contact: School of Computing Office
- Email: computing@babcock.edu.ng
- Website: [BUCC Portal]

---

**System Version:** 1.0  
**Last Updated:** January 30, 2026  
**Maintained by:** Babcock University Computer Club (BUCC)

---

**© 2026 Babcock University Computer Club. All rights reserved.**