# Semester hours – where they are and static logic

## Single source of truth (API)

**File:** `src/services/api.js`  
**Location:** Near the top of the API class, before `canPublishSemester`:

```javascript
// ========== SEMESTER HOURS (static logic) ==========
static SEMESTER_HOURS = {
  SUMMER_HOURS: 2,
  POST_SIWES_HOURS: 6,
  FIRST_SECOND_SLOTS_PER_WEEK: 2
};
```

All backend rules use `ApiService.SEMESTER_HOURS`. To change Summer to 3 hours or Post-SIWES to 8 hours, edit only this object.

---

## Static logic by semester

| Semester   | How it’s detected | Limit per (course, class group) | Publish rule |
|-----------|-------------------|----------------------------------|--------------|
| **First / Second** | Semester name is not “summer” and not “post-siwes” | **2 slots per week** (count of schedule rows) | Every required course scheduled **at least once** per class |
| **Summer**        | `name === 'summer'` or `name.includes('summer')`   | **2 hours total** (sum of slot durations)     | Every required (course, class) has **≥ 2 hours** in that semester |
| **Post-SIWES**    | `name.includes('post-siwes')` or `name === 'post siwes'` | **6 hours total** (sum of slot durations)     | Every required (course, class) has **≥ 6 hours** in that semester |

- “Required” = computing courses (excluding GEDS/SAT) for each class group (same department and level).
- Hours/slots are counted **only for the active semester** (schedules filtered by `semester_id`).

---

## Where the hours are used

### 1. Backend – `src/services/api.js`

| Function | What it does |
|----------|----------------|
| **`canPublishSemester(semesterId)`** | Checks if the timetable can be published. For Summer calls `checkHoursSemester(2)` (from `SUMMER_HOURS`), for Post-SIWES `checkHoursSemester(6)` (from `POST_SIWES_HOURS`). First/Second: at least one schedule per (course, class). |
| **`checkCourseHoursForGroup(..., semesterId)`** | When adding/editing a schedule, enforces the limit. Post-SIWES: `maxMinutes = 6 * 60`. Summer: `maxMinutes = 2 * 60`. First/Second: `maxSlotsPerWeek = 2` (slot count). |

Semester type is determined by the **semester name** from the DB (`semesters.name`), lowercased:

- **Summer:** `name === 'summer'` or `name.includes('summer')`
- **Post-SIWES:** `name.includes('post-siwes')` or `name === 'post siwes'`
- **First/Second:** anything else

### 2. Frontend – DTTO (`DepartmentTimetableScheduling.tsx`)

- **`isSummerSemester`** = `activeSemester?.name` includes `"summer"`.
- **`isPostSiwesSemester`** = `activeSemester?.name` includes `"post-siwes"`.
- **Course list:**  
  - Post-SIWES: hide course when `scheduledHoursByCourseGroup >= 6`.  
  - Summer: hide course when `scheduledHoursByCourseGroup >= 2`.  
  - First/Second: hide when `scheduledCountByCourseGroup >= 2` (2 slots).
- **Hint under course dropdown:** “Summer: 2 hours…”, “Post-SIWES: 6 hours…”, or “twice per week”.

### 3. Frontend – STTO (`LectureScheduler.tsx`)

- Same **`isSummerSemester`** / **`isPostSiwesSemester`** from `activeSemester?.name`.
- **`requiredHoursForSemester`** = `6` if Post-SIWES, `2` if Summer, `null` for First/Second.
- **Course dropdown:** same thresholds (6, 2, or 2 slots).
- **Finalize / Publish:** “6 hours” / “2 hours” messaging and checks use the same logic; backend still enforces via `canPublishSemester` and `checkCourseHoursForGroup`.

---

## Summary

- **Hours are defined in one place:** `ApiService.SEMESTER_HOURS` in `src/services/api.js`.
- **Semester type** is inferred from **semester name** (summer / post-siwes / else).
- **First/Second:** 2 slots per week; publish = every course at least once per class.
- **Summer:** 2 hours per (course, class); publish = every required pair ≥ 2 hours.
- **Post-SIWES:** 6 hours per (course, class); publish = every required pair ≥ 6 hours.
