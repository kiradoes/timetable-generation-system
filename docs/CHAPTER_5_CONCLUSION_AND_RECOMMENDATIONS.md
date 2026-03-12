# CHAPTER FIVE  
# CONCLUSION AND RECOMMENDATIONS

This chapter presents the conclusion of the project and the recommendations derived from the development and evaluation of the School of Computing Timetable System. The chapter is organised into five sections: Section 5.1 discusses the results achieved; Section 5.2 summarises the main findings; Section 5.3 outlines the implications for practice; Section 5.4 presents recommendations for future research; and Section 5.5 provides the concluding remarks.

---

## 5.1 Discussion of Results

The implementation of the School of Computing Timetable System has resulted in a working computer-aided timetable solution that meets the objectives set out at the beginning of the project. The results are discussed under the following headings.

**Role-based access.** The system provides distinct interfaces and permissions for School Timetable Officers, Department Timetable Officers, and Students. The login process, the resolution of the user’s role and department from the `officers` table, and the routing to the appropriate dashboard function as designed. Row Level Security (RLS) policies enforce data access according to role and department, so that school officers can manage global settings and all departments while department officers are restricted to their own department’s data.

**Conflict-free scheduling.** The combination of database unique constraints (on lecturer–slot–session, venue–slot–session, and group–slot–session) and application-layer checks (for venue, lecturer, class group, special events, course hours, same lecturer per course–class, venue capacity, and the 1:00 PM to 2:00 PM break) prevents double-booking and over-allocation of resources. When a constraint is violated, the user receives a clear, user-friendly error message rather than a raw database or API error.

**Multi-semester support.** The system supports the First, Second, Summer, and Post-SIWES semesters with different course-hour limits (for example, 2 hours for Summer and 6 hours for Post-SIWES per course per class group) and with the concept of concurrent semesters (Summer and Post-SIWES share the same venue pool for conflict checking). This allows room usage to be managed consistently across the academic calendar.

**Public timetables.** Students and the public can view timetables by group, level, or department only after a semester has been marked as published. The same data is used for the on-screen timetable and for PDF export, which carries the institution’s branding (School of Computing, Babcock University).

**Integration.** The system is built on a single front-end stack (React, TypeScript, Vite) and a single backend (Supabase: PostgreSQL, Auth, RLS). Configuration is driven by environment variables, and the codebase is documented so that setup, business logic, and constraints can be understood and maintained.

**Limitations.** Some limitations were observed. The project does not currently include an automated test suite; testing was carried out manually. In some configurations, Row Level Security may prevent certain roles from inserting into the audit log, which can affect the “recent activity” feature on the dashboard (this is described in the TROUBLESHOOTING documentation). First-time setup requires the correct application of database migrations and the configuration of environment variables. These limitations do not undermine the core functionality of the system but indicate areas where future work could add value (see Section 5.4). An optional figure may be used to illustrate a conflict-free timetable view and an example of a validation message (e.g. “This venue is already booked”) to show both successful scheduling and the system’s validation behaviour (Figure 5.1).

**Figure 5.1:** Illustration of conflict-free timetable and validation message (optional).  
*(Attach a screenshot if desired.)*

---

## 5.2 Summary of Findings

The following findings were drawn from the implementation and evaluation of the system.

**First,** the implemented system meets the stated requirements. These include registration and authentication for timetable officers; separate dashboards for school officers and department officers; management of courses (both GEDS/SAT and computing courses), venues, lecturers, class groups, and special events; scheduling with conflict detection; publication of timetables; and student-facing search and PDF export. The requirements and feature checklist are documented in the project’s README and QUICK_REFERENCE.

**Second,** conflict prevention is enforced in two complementary layers. At the database level, unique indexes on the `schedules` table ensure that a lecturer, venue, or class group cannot be double-booked for the same slot (and session, and semester where applicable). At the application level, the API and user interface perform validation before insert and update operations and return user-friendly messages. This dual layer ensures both data integrity and a clear user experience.

**Third,** the heuristic and business rules (semester-specific course-hour limits, the Elective-overlap exception, concurrent-semester venue pooling, the same-lecturer-per-course-class rule, and the fixed 1:00 PM to 2:00 PM break) are implemented in a consistent manner and are documented in the codebase and in the SYSTEM_DIAGRAMS_AND_IMPLEMENTATION document (Section 8). They are traceable and can be explained or modified when necessary.

**Fourth,** the system is usable in practice. Officers can create and edit schedules with immediate feedback, and students can search by session, semester, course, level, and group and view or download a single timetable. The use of a single API layer and centralised error mapping contributes to predictable behaviour and easier support.

**Fifth,** the project is maintainable. The structure (components, services, library code, migrations), the documentation (README, QUICK_START, QUICK_REFERENCE, TROUBLESHOOTING, SYSTEM_DIAGRAMS_AND_IMPLEMENTATION, and the present chapter set), and the configuration (environment variables and Supabase) support future changes and the onboarding of new developers. An optional figure may show the navigation structure or a diagram of the modules or constraints (Figure 5.2).

**Figure 5.2:** Navigation or module diagram (optional).  
*(Attach a screenshot or diagram if desired.)*

---

## 5.3 Implications for Practice

The results of this project have several implications for practice within the School of Computing and for similar institutions.

### 5.3.1 Enhanced Operational Efficiency

The system supports enhanced operational efficiency in several ways. Department officers can build timetables in a single, centralised interface with real-time validation, reducing the need for manual cross-checks and spreadsheet-based scheduling. Automated checks for lecturer, venue, and class group conflicts (and for special events such as break and chapel) reduce the incidence of double-booking and last-minute changes. Once schedules are approved, publishing a semester makes timetables immediately visible to students, and PDF export allows students to save a copy without additional manual steps. Where Row Level Security permits, the audit log records schedule-related actions (such as insert, update, and delete), supporting accountability and troubleshooting. An optional figure may show the Department Officer schedule screen with a list of scheduled lectures (Figure 5.3).

**Figure 5.3:** Department Officer schedule screen (optional).  
*(Attach a screenshot if desired.)*

### 5.3.2 Accessibility and Transparency

The system improves accessibility and transparency. Role-based access ensures that school officers oversee global setup and publishing, department officers manage only their department’s data, and students see only published timetables. This supports clear responsibilities and data governance. The public timetable feature allows students (and, where applicable, parents or advisors) to view timetables by group, level, or department without logging in, improving transparency and reducing reliance on informal channels. The use of friendly error messages (for example, “This venue is already booked for that day and time”) makes it easier for officers to correct scheduling issues without interpreting technical error codes. An optional figure may show the student landing page with the search form and the options to view the timetable by group or by department (Figure 5.4).

**Figure 5.4:** Student landing page with search and view options (optional).  
*(Attach a screenshot if desired.)*

### 5.3.3 Support for Institutional Growth

The design of the system supports institutional growth. It accommodates five computing departments and multiple semesters (First, Second, Summer, and Post-SIWES), so that the same system can scale as programmes or semesters are added. Sessions, semesters, venues, courses, and class groups are data-driven; within the existing schema, new departments, levels, or groups can be added without code changes. The backend (Supabase and PostgreSQL) can handle increased load, and the front-end can be deployed to static hosting (such as Vercel or Netlify) with environment-based configuration for different environments. An optional figure may show the Academic Settings or a list of sessions, semesters, and departments (Figure 5.5).

**Figure 5.5:** Academic Settings or list of sessions and departments (optional).  
*(Attach a screenshot if desired.)*

### 5.3.4 Model for Nigerian Universities

The project can serve as a model for other Nigerian universities. The technology stack (React, TypeScript, Vite, Supabase) is widely used and well documented, and the project documentation (QUICK_START, QUICK_REFERENCE, SYSTEM_DIAGRAMS_AND_IMPLEMENTATION) provides a template for requirements, setup, logic, and constraints that other institutions can adapt. The support for GEDS/SAT and non-computing lecturers, for chapel and break slots, and for level and group structures aligns with common Nigerian university patterns; the same logic and constraints can be reused or adjusted for similar institutions. Supabase offers a free tier, and the front-end can be hosted on low-cost static hosting. The technologies used (JavaScript/TypeScript, React, SQL) are commonly taught in Nigerian computer science and information technology programmes, which can facilitate local maintenance and extension. An optional figure may show a high-level architecture or the entry points for both School and Department officers (Figure 5.6).

**Figure 5.6:** High-level architecture or officer entry points (optional).  
*(Attach a screenshot or diagram if desired.)*

---

## 5.4 Recommendations for Research

The following recommendations are offered for future research and development.

**Formal evaluation.** A user study could be conducted with School and Department Timetable Officers and a sample of students to measure perceived efficiency, ease of use, and satisfaction. The study could compare the system with the current (or previous) manual process or with alternative tools.

**Algorithmic comparison.** The current rule-based and heuristic approach could be compared with other methods (such as genetic algorithms or constraint programming) on the same dataset. Metrics could include the number of conflicts, fairness in the distribution of lecturers and venues, and run time.

**Automated testing.** The introduction of unit tests for the conflict-check and course-hours logic, and of integration tests for login, schedule creation and update, and public timetable retrieval, would improve reliability. Test coverage and the prevention of regressions could be reported.

**Accessibility and usability.** An accessibility audit (e.g. aligned with WCAG) and usability testing (including keyboard navigation, screen reader use, and mobile use) could be carried out. The findings and any improvements could be documented.

**Replication studies.** A variant of the system could be deployed in another faculty or institution in Nigeria. The adaptations (e.g. to semesters, events, or roles) could be documented, and the adoption and operational outcomes could be reported. An optional figure may list recommended test cases (e.g. venue conflict, lecturer conflict, course hours limit) as in the SYSTEM_DIAGRAMS_AND_IMPLEMENTATION document (Figure 5.7).

**Figure 5.7:** Recommended test cases (optional).  
*(Attach a list or screenshot if desired.)*

---

## 5.5 Conclusion

The School of Computing Timetable System demonstrates that a computer-aided timetable application can be successfully developed and operated using a modern web stack (React, TypeScript, Vite) and a managed backend (Supabase). The system provides registration and authentication for timetable officers, role-based dashboards for school and department officers, scheduling with conflict detection and business rules, and public timetable viewing and PDF export for students. The logic and constraints—including the uniqueness of lecturer, venue, and class group per slot (and session and semester where applicable), course hours limits by semester type, the same-lecturer-per-course-class rule, special events (break and chapel), and the 1:00 PM to 2:00 PM break—are implemented in both the application and the database and are documented in the project (in particular in SYSTEM_DIAGRAMS_AND_IMPLEMENTATION, Section 8).

The project shows that such a system can enhance operational efficiency, improve accessibility and transparency for students, support institutional growth through its multi-department and multi-semester design, and serve as a reusable model for other Nigerian universities. Addressing automated testing, accessibility, and optional enhancements (such as notifications and offline support) would strengthen the system further and provide a solid foundation for future research and deployment. An optional closing figure may show the system homepage or a one-page diagram summarising the actors and main features (Figure 5.8).

**Figure 5.8:** System overview or summary diagram (optional).  
*(Attach a screenshot or diagram if desired.)*

---

*For implementation details and the locations of figures, see **docs/CHAPTER_4_IMPLEMENTATION_AND_TESTING.md**. For full logic, constraints, and heuristics, see **docs/SYSTEM_DIAGRAMS_AND_IMPLEMENTATION.md**, Section 8.*
