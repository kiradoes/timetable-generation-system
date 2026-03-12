# CHAPTER FOUR  
# SYSTEM IMPLEMENTATION AND TESTING

## 4.1 Introduction

This chapter presents the implementation and testing of the School of Computing Timetable System. The system was developed as a computer-aided timetable generation and management application to support the School of Computing in the scheduling of lectures across multiple departments, the management of academic resources, and the publication of timetables for students. The implementation is built as a single-page web application using React with TypeScript and uses Supabase as the backend service for database, authentication, and authorisation. The chapter is organised as follows: Section 4.1 outlines the software and hardware requirements; Section 4.2 describes the development environment setup; Section 4.3 presents the implementation of the functional modules; Section 4.4 discusses additional considerations including best practices and future improvements; and Section 4.5 provides a summary of the implementation details.

### 4.1.1 Software Requirements

The development and deployment of the system required a set of software tools and runtimes. The following software requirements were identified and used throughout the implementation.

The application runs on Node.js version 16 or higher; Node.js version 18 or higher is recommended when using Supabase tooling. The package manager npm version 7 or higher (or yarn) was used for dependency management. The system is accessed through a web browser; therefore, a modern browser such as Google Chrome, Mozilla Firefox, Safari, or Microsoft Edge (latest versions) is required on the client side. The backend is provided by Supabase, which offers PostgreSQL database, authentication, and a REST API (PostgREST). Optional Edge Functions may be deployed for server-side validation. Version control was carried out using Git.

The key software dependencies of the project are defined in the `package.json` file. The user interface is built with React version 18 and React DOM. TypeScript is used for type-safe development. The build tool and development server used is Vite version 6. The Supabase client library (`@supabase/supabase-js`) is used for authentication, database access, and real-time features. Styling is achieved with Tailwind CSS version 4. The interface uses Radix UI–based components (in the shadcn/ui style) for accessible form controls and dialogs. Icons are provided by Lucide React. PDF generation is implemented using the jspdf and jspdf-autotable libraries. React Router DOM is used for client-side navigation where applicable. Toast notifications are displayed using the Sonner library. A complete list of the project dependencies is shown in the project root in the `package.json` file (see Figure 4.1).

**Figure 4.1:** Project dependencies as defined in `package.json`.  
*(Attach a screenshot of the `package.json` file or the dependency list in the project root.)*

### 4.1.2 Hardware Requirements

The system was designed to run on standard computing hardware. The minimum hardware requirements are as follows. A modern multi-core processor (such as an Intel Core i3 or AMD Ryzen 3 or equivalent) is sufficient for development and for running the application. A minimum of 4 GB RAM is required; 8 GB is recommended for comfortable development. At least 500 MB of free storage is needed for the project files and the `node_modules` directory. The application supports a minimum display resolution of 1280×720 pixels and is responsive so that it can be used on mobile devices. An internet connection is required for installing packages, connecting to Supabase cloud services, and optionally for running the Supabase CLI locally. The application is lightweight, and the main resource usage comes from the browser and, if used, local Supabase services.

---

## 4.2 Development Environment Setup

The development environment was set up to support both frontend and backend development. This section describes the steps taken to configure the frontend development environment, the backend (Supabase), and the development tools used.

### 4.2.1 Frontend Development

The frontend was developed using a standard Node.js-based workflow. The project was cloned from the repository (or obtained as a project folder). Node.js version 18 or higher was installed and verified using the commands `node --version` and `npm --version`. Project dependencies were installed by running the command `npm install` in the project root directory. Environment variables were configured by copying the `.env.example` file to `.env` or `.env.local` and setting the Supabase project URL (`VITE_SUPABASE_URL`) and the Supabase anonymous (public) key (`VITE_SUPABASE_ANON_KEY`). Optional variables such as `VITE_APP_NAME` and `VITE_ENVIRONMENT` may also be set. The development server was started with the command `npm run dev`. The application is then served at `http://localhost:5173` (or at the port displayed in the terminal). Figure 4.2 shows the terminal with the dependency installation and the development server running. Figure 4.3 shows the browser with the application landing page (student view) loaded at the local development URL.

**Figure 4.2:** Terminal showing `npm install` and `npm run dev` with the development server running.  
*(Attach a screenshot of the terminal.)*

**Figure 4.3:** Browser displaying the student landing page at the local development URL.  
*(Attach a screenshot of the browser.)*

### 4.2.2 Backend Development

The backend of the system is provided by Supabase. Two modes of operation were supported: cloud deployment and local development. For cloud deployment, a Supabase project was created at the Supabase website. The project URL and the anon key were obtained from the project settings (Settings → API) and configured in the frontend environment file. Database schema and policies were applied by running the migrations located in the `supabase/migrations` directory (for example, `20260221000001_complete_schema.sql`). Row Level Security (RLS) was enabled on the relevant tables, and the policies were defined in a separate migration (for example, `20260222000002_comprehensive_rls_policies.sql`). Optional Edge Functions (such as `validate-schedule` and `create-schedule`) may be deployed for server-side validation. For local development, the Supabase CLI was installed and the command `supabase start` was used to run local Supabase services. The local API URL and anon key were then used in the `.env` file. The command `supabase db push` was used to apply migrations to the local database. Figure 4.4 shows the Supabase Dashboard with the project overview or the Table Editor displaying key tables. Figure 4.5 shows the Supabase SQL Editor or the list of applied migrations.

**Figure 4.4:** Supabase Dashboard showing project overview or Table Editor with key tables.  
*(Attach a screenshot of the Supabase Dashboard.)*

**Figure 4.5:** Supabase SQL Editor or migrations list showing applied migrations.  
*(Attach a screenshot of the migrations or SQL Editor.)*

### 4.2.3 Development Tools

The following development tools were used during the implementation. Visual Studio Code or Cursor was used as the primary code editor; the project may include workspace settings in the `.vscode` folder. Browser Developer Tools were used for debugging, network inspection, and for the React Developer Tools extension. Supabase Studio (available both in the cloud dashboard and when running Supabase locally) was used for browsing the database, managing authentication users, and testing Row Level Security policies. Git was used for version control. The Supabase CLI was used for local Supabase services, for applying migrations, and for deploying Edge Functions. Figure 4.6 shows the code editor with the project structure and key directories such as `src`, `supabase`, and `docs`.

**Figure 4.6:** Code editor with project structure visible.  
*(Attach a screenshot of the editor.)*

---

## 4.3 Implementation of Functional Modules

This section describes the implementation of the main functional modules of the system: registration and authentication, the main entry point of the application, the programming languages and frameworks used, the database design and connector, the configuration file, and the heuristic-based algorithms that enforce the business rules.

### 4.3.1 Registration and Authentication

The registration and authentication module allows authorised users (timetable officers) to log in and to be directed to the appropriate dashboard based on their role. The flow is as follows. The user opens the Officer Login page and enters his or her email address and password. The application calls the Supabase Authentication service using the `signInWithPassword` method. Upon successful authentication, the application looks up the corresponding record in the `officers` table using the authenticated user’s identifier (`auth_user_id`). If no officer record exists, one is created using the user metadata. The officer record contains the user’s role (school-officer or department-officer) and department. The application then switches the view to the appropriate dashboard: the School Officer Dashboard or the Department Officer Dashboard. The user’s email, role, and department are stored in the browser’s local storage, and the current view is stored in session storage so that a page refresh preserves the same view.

The implementation consists of the following components. The Officer Login Page component presents the login form and handles form submission. The ApiService module (in `src/services/api.js`) implements the `login` method, which calls `supabase.auth.signInWithPassword`, then queries or inserts into the `officers` table and updates the `last_login` timestamp. The main application component (`App.tsx`) maintains the current view state and the user’s email, role, and department, and it renders either the Student Landing Page, the Officer Login Page, the School Officer Dashboard, or the Department Officer Dashboard as appropriate. School officers can register department officers through the Register Officer modal or the Officer Management interface; this process creates an authentication user and an officer record, subject to the constraint that the officer’s email must be unique and the officer’s full name must be unique within a department (enforced by the database index `idx_officers_fullname_department`). Row Level Security policies ensure that school officers can manage all officers, while department officers can only read officer data and update their own profile. Figure 4.7 shows the Officer Login page. Figure 4.8 shows the School Officer Dashboard with the Register Officers option. Figure 4.9 shows the Department Officer Dashboard after login.

**Figure 4.7:** Officer Login page.  
*(Attach a screenshot of the login page.)*

**Figure 4.8:** School Officer Dashboard showing Register Officers.  
*(Attach a screenshot of the School Officer Dashboard.)*

**Figure 4.9:** Department Officer Dashboard after login.  
*(Attach a screenshot of the Department Officer Dashboard.)*

### 4.3.2 Main Entry Point (Index)

The main entry point of the application is the HTML file that loads the root React component. The `index.html` file in the project root contains the root element `<div id="root"></div>` and includes the script tag that loads the application: `<script type="module" src="/src/main.tsx"></script>`. The file `src/main.tsx` is the JavaScript/TypeScript entry point; it renders the root React component (typically the `App` component) into the element with id `root`, and it imports the global styles (for example, `index.css`) and any necessary providers (such as theme or router). Figure 4.10 shows the contents of `index.html`. Figure 4.11 shows the contents of `src/main.tsx` with the render call and the App component.

**Figure 4.10:** Contents of `index.html` showing the root div and script tag.  
*(Attach a screenshot of the file.)*

**Figure 4.11:** Contents of `src/main.tsx` showing the render call and App component.  
*(Attach a screenshot of the file.)*

### 4.3.3 The Tools Used (JavaScript, React with TypeScript)

The system was implemented using JavaScript and TypeScript. TypeScript was used for type safety in the React components and in the library code; some modules (such as `api.js`) are written in JavaScript with JSDoc or type definition files where needed. The user interface was built with React version 18. The components are implemented as function components using React hooks such as `useState`, `useEffect`, and `useMemo`. The build tool and development server used is Vite version 6, which provides fast hot module replacement, ES modules support, and access to environment variables through `import.meta.env` (for example, `VITE_SUPABASE_URL`). Styling was done with Tailwind CSS version 4, using utility classes and design tokens (including the primary colour #0f2044 and the accent colour #ffb71b as specified in the project documentation). The user interface components are based on Radix UI and follow the shadcn/ui style; they are located under `src/components/ui` and include buttons, cards, dialogs, and select controls. Icons are from the Lucide React library. PDF generation for timetable export is implemented in the browser using the jsPDF and jspdf-autotable libraries. Toast notifications (for example, success or error messages when saving a schedule) are displayed using the Sonner library. Figure 4.12 shows a typical component file with imports, hooks, and JSX structure. Figure 4.13 shows the use of Tailwind CSS in a component or in the global styles.

**Figure 4.12:** A typical component file showing structure and hooks.  
*(Attach a screenshot of a component file such as StudentLandingPage.tsx or LectureScheduler.tsx.)*

**Figure 4.13:** Use of Tailwind CSS in a component or in global styles.  
*(Attach a screenshot of className usage or index.css.)*

### 4.3.4 Database

The persistent data store for the system is a PostgreSQL database hosted by Supabase. All database access is performed through the Supabase client, which uses the PostgREST API. Row Level Security is enabled on the relevant tables to enforce role-based and department-based access control.

#### 4.3.4.1 Database Connector

The database connector is the Supabase JavaScript client, which is configured once and reused throughout the application. The configuration is located in the file `src/lib/supabase.ts`. The client is created by calling `createClient` with the Supabase project URL and the anonymous key, which are read from the environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Additional options are set for authentication, including automatic token refresh, session persistence, and detection of the session in the URL. The application throws an error at load time if these environment variables are missing. All database and authentication calls in the application use this client. The ApiService module in `src/services/api.js` wraps these calls and provides consistent response handling and user-friendly error messages. Figure 4.14 shows the Supabase client configuration in `src/lib/supabase.ts`.

**Figure 4.14:** Database connector configuration in `src/lib/supabase.ts`.  
*(Attach a screenshot of the file.)*

#### 4.3.4.2 Database Tables

The database schema was defined and applied using migration files in the `supabase/migrations` directory. The main tables include the following. The `departments` table stores department names and status. The `officers` table stores user accounts linked to Supabase Auth and includes role, department, and status. The `sessions` table stores academic sessions (for example, 2026/2027), with at most one session marked as current. The `semesters` table stores semesters per session (First, Second, Summer, Post-SIWES) and includes a timetable status (e.g. approved or published). The `lecturers` table stores lecturer information with department and session; a unique constraint ensures that the same full name cannot be used twice in the same department and session. The `lecturer_availability` table stores lecturer day and time preferences. The `courses` table stores course information including department, level, semester, and category (Core, Elective, GEDS, or SAT); the combination of course code and session is unique. The `venues` table stores venue names, capacity, and type; venue names are unique. The `class_groups` table stores class groups with name, level, department, and session; the combination of name, department, session, and level is unique so that the same group name can exist at different levels (for example, 300 A and 400 A). The `time_slots` table stores time slot definitions (day, start time, end time) and is unique per combination. The `special_events` table stores events such as chapel and break, with session, day, time, and optional level. The `timetables` table stores timetable containers. The `schedules` table is the core table that stores each schedule entry, linking course, lecturer, venue, time slot, session, and class group; it includes optional semester identification. Unique constraints on the `schedules` table ensure that a lecturer cannot be assigned to two classes at the same time, a venue cannot be double-booked for the same slot (and semester where applicable), and a class group cannot have two courses at the same time. Additional tables include `approvals`, `conflicts`, `audit_log`, and `system_settings`. Figure 4.15 shows the Supabase Table Editor with key tables. Figure 4.16 shows an entity-relationship or table-relationship diagram for the database.

**Figure 4.15:** Supabase Table Editor showing key tables.  
*(Attach a screenshot of the Table Editor.)*

**Figure 4.16:** Entity-relationship or table-relationship diagram.  
*(Attach a diagram from the project documentation or a custom diagram.)*

### 4.3.5 Configuration File

The application is configured using environment variables. The configuration file is the `.env` or `.env.local` file in the project root; this file is not committed to version control. The following variables are used. The variable `VITE_SUPABASE_URL` holds the Supabase project URL. The variable `VITE_SUPABASE_ANON_KEY` holds the Supabase anonymous (public) key. Optional variables include `VITE_APP_NAME` for the application name and `VITE_ENVIRONMENT` for the environment (e.g. development). Only variables prefixed with `VITE_` are exposed to the frontend code through Vite’s `import.meta.env` object. The Supabase client reads the URL and key from these variables and will throw an error if they are missing when the application loads. Figure 4.17 shows an example of the environment file (with values redacted) or the `.env.example` file.

**Figure 4.17:** Environment configuration file (values redacted).  
*(Attach a screenshot of .env.example or a redacted .env.)*

### 4.3.6 Algorithms (Heuristic-Based)

The system uses rule-based and heuristic logic to enforce business rules and to guide scheduling. No genetic or heavy optimisation algorithms were implemented; instead, the system relies on explicit checks and constraints. The following algorithms and heuristics were implemented.

**Conflict avoidance.** Before a schedule entry is saved, the system checks for conflicts. The venue conflict check ensures that the same venue is not used at overlapping times within the same session; when a semester is specified, only schedules in that semester or in “concurrent” semesters (Summer and Post-SIWES are treated as sharing the same venue pool) are considered. The lecturer conflict check ensures that the same lecturer is not assigned to two classes at overlapping times. The class group conflict check ensures that the same class group does not have two courses at overlapping times, with an exception: two Elective courses may be scheduled at the same time for the same group so that students may choose one. Assignments of GEDS/SAT (non-computing) courses to a group are also considered so that computing and non-computing slots do not clash. A class day limits check enforces that, for each class on each day, the total scheduled time does not exceed 6 hours and no single continuous block exceeds 3 hours (e.g. 7–9 and 9–10 is 3 hours; adding 10–11 would create a 4-hour stretch and is rejected). The special events check ensures that no class is scheduled during a break (e.g. 1:00 PM to 2:00 PM) or during chapel or seminar for the relevant day and level. The rule that no class may be scheduled during the 1:00 PM to 2:00 PM break is enforced in the user interface (and optionally in the API).

**Semester lifecycle.** Summary and scheduling data are cleared after each semester. Each new semester starts with no schedule entries or timetable summary; officers build schedules afresh for that semester. For a full list of what clears per semester versus what persists when a new session is created (e.g. departments, officers, venues), see **docs/DATA_LIFECYCLE.md**.

**Course hours limits.** The system enforces maximum hours per course per class group depending on the semester type. For the Post-SIWES semester, the maximum is 6 hours per (course, class group). For the Summer semester, the maximum is 2 hours. For the First and Second semesters, the maximum is the course’s credit units (default 2). These limits are enforced in the application layer in the function `checkCourseHoursForGroup` and are defined by the constants in `ApiService.SEMESTER_HOURS`.

**Same lecturer for same course and class.** For a given course and class group, all schedule slots must use the same lecturer. This is enforced in the API by the function `_getRequiredLecturerForCourseGroup` and in the create and update schedule logic; the user interface restricts the lecturer dropdown and displays a validation message when a different lecturer is selected.

**Venue suggestion.** When adding a schedule entry, the system suggests venues that are free at the chosen day and time and that have capacity at least equal to the class size; suggested venues are sorted by capacity in ascending order so that smaller adequate rooms are preferred. This heuristic is implemented in the Lecture Scheduler component.

**Display rules.** In the student and department/level timetable views, the 1:00 PM to 2:00 PM slot is always displayed as “BREAK” regardless of stored data. The department and level timetable views display a single grid with entries labelled by level and group (e.g. “300 A”, “400 B”). The public timetable is only returned when at least one semester in the session has been marked as published. Figure 4.18 shows a code snippet of one of the conflict-check functions. Figure 4.19 shows the user interface when a validation error is displayed (e.g. “No class can be scheduled at 1–2 PM” or “This venue is already booked”).

**Figure 4.18:** Code snippet of a conflict-check function.  
*(Attach a screenshot of api.js showing checkVenueConflict or checkCourseHoursForGroup.)*

**Figure 4.19:** Validation error message in the schedule form.  
*(Attach a screenshot of the error message.)*

---

## 4.4 Additional Considerations

### 4.4.1 Best Practices

During the implementation, a number of best practices were followed. All backend calls are centralised in the ApiService module (`src/services/api.js`), so that error handling and the mapping of database errors to user-friendly messages (e.g. duplicate key and foreign key errors) are consistent across the application. Row Level Security is enabled on all sensitive tables so that school officers have the appropriate broad access and department officers are restricted to their department’s data. The database enforces unique constraints on schedule entries to prevent double-booking; the API performs additional checks before insert and update and returns clear messages when a constraint would be violated. The project structure separates feature components in `src/components` from reusable UI components in `src/components/ui`, and forms and validation logic are co-located with the components that use them. Sensitive configuration (such as API keys) is kept in environment variables and is not stored in source code. The project includes documentation (README, QUICK_REFERENCE, QUICK_START, TROUBLESHOOTING, and SYSTEM_DIAGRAMS_AND_IMPLEMENTATION) that describes requirements, setup, logic, and constraints. Figure 4.20 shows the services directory and a snippet of the API response handling or error-mapping code.

**Figure 4.20:** Centralised API layer and error handling.  
*(Attach a screenshot of src/services and a snippet of api.js.)*

### 4.4.2 Future Improvements

Several areas for future improvement were identified. The introduction of automated tests (e.g. unit tests for conflict checks and course-hours logic using Jest or Vitest, and integration tests for login, schedule creation, and timetable retrieval) would improve reliability and regression prevention. End-to-end tests using tools such as Playwright or Cypress could cover critical user flows. Performance could be improved by adding pagination or virtualisation for very large schedule lists and by caching public timetable data for a session. An accessibility audit (e.g. using axe or Lighthouse) and improvements to keyboard navigation and screen reader support would enhance usability. The addition of a service worker and offline caching would allow students to view a previously loaded timetable without an internet connection. Notifications (in-app or by email) when a timetable is published or when conflicts are detected could improve communication. Finally, the Row Level Security policies for the audit log could be adjusted so that all relevant roles can insert audit entries, ensuring that the “recent activity” feature on the dashboard is complete (as noted in the TROUBLESHOOTING documentation).

---

## 4.5 Summary of Implementation Details

Summary and scheduling data are cleared after each semester; each new semester begins with no schedule entries or timetable summary until officers build the schedule for that semester.

This chapter has presented the implementation and testing of the School of Computing Timetable System. The system was built using React 18 with TypeScript, Vite as the build tool, Tailwind CSS for styling, and Supabase for the backend (PostgreSQL database, authentication, and Row Level Security). The main entry point of the application is the `index.html` file, which loads the script `src/main.tsx`; the React application is then rendered from the `App` component, which manages three main views: the Student Landing Page, the Officer Login Page, and the Officer Dashboard (School or Department based on role). Authentication is implemented using Supabase Auth and the `officers` table for role and department; registration of department officers by school officers is supported. The database consists of 17 or more tables defined in Supabase migrations, with unique constraints on the `schedules` table to prevent double-booking of lecturers, venues, and class groups. The database connector is the Supabase client configured in `src/lib/supabase.ts`, and all data access is channelled through the ApiService in `src/services/api.js`. The business logic and constraints—including venue, lecturer, and class group conflict checks, course hours limits by semester type, the same-lecturer-per-course-class rule, venue capacity checks, the 1:00 PM to 2:00 PM break rule, the Elective-overlap exception, and the concurrent-semester venue pool—are implemented in the application layer and documented in the project documentation (see SYSTEM_DIAGRAMS_AND_IMPLEMENTATION, Section 8). Testing was carried out manually through the development server and the Supabase dashboard; the locations for attaching screenshots have been indicated in the figures referenced throughout this chapter. Figure 4.21 provides an overview of the system, showing the student landing page, the officer login, and one of the dashboards.

**Figure 4.21:** Overview of the system (landing page, login, and dashboard).  
*(Attach a composite or multiple screenshots.)*

---

*For detailed logic, constraints, and heuristics, refer to **docs/SYSTEM_DIAGRAMS_AND_IMPLEMENTATION.md**, Section 8. For what clears per semester versus what persists when a new session is created, see **docs/DATA_LIFECYCLE.md**. For setup instructions, refer to **docs/QUICK_START.md** and **docs/QUICK_REFERENCE.md**.*
