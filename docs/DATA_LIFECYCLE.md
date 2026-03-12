# Data Lifecycle: What Clears vs What Persists

This document clarifies what data is cleared after each semester and what remains when a new session is created.

---

## What clears after each semester

The following are **cleared or reset** for each new semester (i.e. each semester starts with none of this until officers add it):

| Data | Description |
|------|-------------|
| **Schedule entries** | All rows in `schedules` for that semester. When you start a new semester (e.g. Second Semester), there are no schedule entries until officers use Schedule Lecture to create them. |
| **Timetable summary** | The summary view (and any coverage report) for that semester is empty until schedules are built. |

So: **summary and scheduling data clear after each semester.** Each new semester begins with no schedule entries and no timetable summary; officers build the schedule afresh for that semester.

---

## What is still there when a new session is created

When you **create a new academic session** (e.g. 2027/2028), the following **remain** and are **not** deleted:

| Data | Description |
|------|-------------|
| **Departments** | All departments (e.g. Computer Science, Software Engineering). Not tied to a session. |
| **Officers** | All timetable officers (school and department). Not tied to a session. |
| **Venues** | All venues (lecture halls, labs). Not tied to a session. |
| **Time slots** | The global set of time slots (e.g. Monday 7–8, 8–9, …). Not tied to a session. |
| **Previous sessions and their data** | Old sessions (e.g. 2025/2026, 2026/2027) and all their semesters, courses, lecturers, class groups, and schedules remain in the database. They are not removed when you create a new session. |

The **new session** itself starts with:

- No semesters (you create them: First, Second, Summer, Post-SIWES, etc.).
- No courses, lecturers, or class groups for that session until you add them (via Course Management, Lecturer Management, Class Management).
- No schedules or timetable summary for that session until you build them (Schedule Lecture).

So: creating a new session does **not** clear departments, officers, venues, or time slots. It only adds a new session row; you then create semesters and session-scoped data (courses, lecturers, class groups, schedules) for that session as needed.

---

## Summary table

| When | What happens |
|------|----------------|
| **End of semester** | Schedule entries and timetable summary for that semester are effectively “cleared” (new semester has none until rebuilt). Courses, lecturers, class groups, and session/semester metadata for that session remain. |
| **New session created** | A new session row is added. Departments, officers, venues, and time slots are unchanged. The new session has no semesters, courses, lecturers, class groups, or schedules until you create them. |

---

*For implementation details, see `docs/SYSTEM_DIAGRAMS_AND_IMPLEMENTATION.md` and Chapter 4 (Implementation and Testing).*
