# CHAPTER 5 — SUMMARY, DISCUSSION AND RECOMMENDATIONS

This chapter summarizes the project, discusses the implementation and results, draws conclusions, and suggests future improvements. **Screenshot or figure placeholders** indicate where you can attach diagrams or result screens in your report.

---

## 5.1 SUMMARY

The School of Computing Timetable System is a web-based, computer-aided timetable generation and management system built for the School of Computing. It provides:

- **Role-based access:** School Timetable Officers manage institution-wide data (sessions, semesters, venues, courses, officers); Department Timetable Officers manage department-specific courses, lecturers, class groups, and schedules; Students view published timetables without logging in.
- **Scheduling with constraints:** Scheduling respects lecturer, venue, and class-group conflicts; special events (e.g. break 1–2 PM, chapel); and semester-specific rules (e.g. credit hours for First/Second, max hours for Summer and Post-SIWES).
- **Public timetable and PDF export:** Students search by session, semester, course, level, and group (or by department/level) and view a weekly grid; timetables can be exported as PDF.
- **Semester-based lifecycle:** Summary and scheduling data are cleared after each semester. Each new semester starts with no schedule entries or summary data; officers create schedules afresh for that semester. What clears per semester versus what remains when a new session is created (e.g. departments, officers, venues) is documented in DATA_LIFECYCLE.md.

The system was implemented using **React** and **Vite** on the frontend and **Supabase** (PostgreSQL, Auth, PostgREST, RLS) on the backend. Development environment setup, software and hardware requirements, and the implementation of registration and authentication are documented in Chapter 4.

> **Screenshot/figure opportunity (5.1):** High-level system diagram or a single screenshot showing the three entry points (Student landing, Officer login, Dashboard).

---

## 5.2 DISCUSSION

Implementation choices and their rationale can be discussed under the following themes (expand as needed for your report):

- **Technology choice:** Use of React and Supabase for rapid development, type safety (TypeScript), and built-in auth and database with RLS.
- **Conflict prevention:** Combination of database unique constraints (lecturer-slot, venue-slot, group-slot) and application-level checks (venue capacity, special events, course hours limits, same-lecturer-per-course-class rule).
- **User experience:** Role-specific dashboards, clear validation messages, and a single-page department/level timetable view for easier browsing.
- **Limitations:** Dependency on Supabase; optional Edge Functions for validation; audit log possibly restricted by RLS for some roles (see project TROUBLESHOOTING).

Testing (if you have done it) can be discussed here: e.g. manual testing of login, registration, scheduling, conflict checks, and public timetable view; or any automated tests.

> **Screenshot/figure opportunity (5.2):** Screenshots of key flows (e.g. conflict error message, successful schedule save, published timetable view) or a short test-case table.

---

## 5.3 CONCLUSION

The project set out to deliver a computer-aided timetable system for the School of Computing with role-based access, constraint-aware scheduling, and public timetable viewing. The implemented system meets these objectives: School and Department officers can manage data and schedules within their scope, and students can view and download timetables by group, level, or department once a semester is published. Registration and authentication are implemented using Supabase Auth and the officers table, with RLS enforcing access by role and department.

> **Screenshot/figure opportunity (5.3):** Optional – summary table of “Objectives vs Delivered” or a final dashboard/home screenshot.

---

## 5.4 RECOMMENDATIONS

Possible directions for future work (adjust to match your report):

1. **Testing:** Introduce unit and integration tests (e.g. for conflict checks, API service, critical UI flows) and document test coverage.
2. **Audit and reporting:** Relax or adjust RLS so audit log entries can be written consistently for all roles; add simple reports (e.g. schedule summary by department or lecturer).
3. **Usability:** Add bulk actions (e.g. copy schedule from a previous semester), clearer “publish” workflow, and mobile-friendly improvements for the timetable grid.
4. **Backend flexibility:** Consider abstracting the backend behind an API layer so that, if needed, Supabase could be replaced or complemented by another service without changing the frontend contract.
5. **Documentation and deployment:** Keep the setup guide (e.g. QUICK_START, Chapter 4) updated; document deployment steps (e.g. Vercel/Netlify for frontend, Supabase production) and environment variables.

> **Screenshot/figure opportunity (5.4):** Optional – roadmap or list of recommendations as a figure.

---

**End of Chapter 5.**

*You can add or rename sections (e.g. 5.2 Limitations, 5.3 Future Work) to align with your institution’s template.*
