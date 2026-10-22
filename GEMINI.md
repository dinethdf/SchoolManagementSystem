# 🏫 School Management System — Agent Rules & Standards

> **IMPORTANT:** This file is automatically loaded by AI agents (Antigravity/Gemini) at the start
> of every session. All agents MUST read and follow every rule in this file before writing any code.

---

## 🎯 Project Overview

- **Type:** Undergraduate Final Year Project (FYP)
- **System:** School Management System (SMS)
- **Frontend:** React (JavaScript) + Vite + Tailwind CSS
- **Backend:** Python 3.11 + Django 5 + Django REST Framework
- **Database:** MySQL
- **Auth:** JWT via `djangorestframework-simplejwt`
- **API Client:** Axios + TanStack Query (React Query v5)
- **Forms:** React Hook Form
- **Routing:** React Router v6

---

## 🚨 BEGINNER-FRIENDLY CODING STANDARDS (NON-NEGOTIABLE)

This codebase is reviewed by undergraduate students and university professors.
**Every single line of code must be easy to read, understand, and explain in a viva/presentation.**

---

### Rule 1 — 📖 Simplicity Over Cleverness

Write the **most straightforward version** of any logic. If a beginner would be confused, rewrite it.

**❌ DO NOT write:**
```js
const total = items.reduce((acc, i) => acc + i.price * i.qty, 0);
```

**✅ WRITE THIS INSTEAD:**
```js
// Calculate the total price by looping through each item
let totalPrice = 0;
for (let i = 0; i < items.length; i++) {
  let itemTotal = items[i].price * items[i].quantity;
  totalPrice = totalPrice + itemTotal;
}
```

---

### Rule 2 — 💬 Heavy Commenting (Explain EVERYTHING)

- Add a comment **above every function** explaining what it does and why.
- Add **inline comments** for any logic that isn't instantly obvious.
- Comments explain *purpose and reasoning*, not just what the code does.

**✅ React Example:**
```jsx
// This component displays the student's attendance percentage.
// It receives attendance records as a prop and calculates the percentage.
function StudentAttendanceCard({ attendanceData }) {

  // Count how many days the student was marked as present
  let presentDays = 0;
  for (let i = 0; i < attendanceData.length; i++) {
    if (attendanceData[i].status === 'present') {
      presentDays = presentDays + 1;
    }
  }

  // Calculate percentage: (present / total) * 100
  let totalDays = attendanceData.length;
  let attendancePercentage = (presentDays / totalDays) * 100;

  return <p>Attendance: {attendancePercentage.toFixed(1)}%</p>;
}
```

**✅ Django Example:**
```python
# This view returns all attendance records for a specific student.
# Only teachers and admins are allowed to access this endpoint.
class StudentAttendanceView(APIView):

    def get(self, request, student_id):
        # Try to find the student using the ID from the URL
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            # Return a clear error if the student doesn't exist
            return Response({'error': 'Student not found'}, status=404)

        # Fetch all attendance records linked to this student
        attendance_records = Attendance.objects.filter(student=student)

        # Convert the records to JSON format using the serializer
        serializer = AttendanceSerializer(attendance_records, many=True)
        return Response(serializer.data)
```

---

### Rule 3 — 📛 Clear, Descriptive Naming

No abbreviations. Names must describe exactly what they hold or do.

| ❌ Bad Name | ✅ Good Name |
|---|---|
| `calcAttPct` | `calculateAttendancePercentage` |
| `d` | `currentDate` |
| `s` | `selectedStudent` |
| `handleBtn` | `handleSubmitGradeForm` |
| `getData` | `fetchStudentProfileData` |
| `res` | `apiResponse` |
| `temp` | `temporaryStudentList` |

---

### Rule 4 — 🚫 No Magic — Break Everything Into Steps

- No magic numbers — use named constants.
- No deeply nested ternary operators — use if/else.
- No complex one-liners — split into multiple readable lines.

**❌ DO NOT write:**
```js
const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'F';
```

**✅ WRITE THIS INSTEAD:**
```js
// Assign a letter grade based on the student's numeric score
let letterGrade;
if (score >= 90) {
  letterGrade = 'A';
} else if (score >= 80) {
  letterGrade = 'B';
} else if (score >= 70) {
  letterGrade = 'C';
} else {
  letterGrade = 'F';
}
```

---

### Rule 5 — 📁 File & Folder Organization

- One component per file. File name = component name.
- Keep files under 300 lines. Split if getting too long.

```
frontend/src/
├── pages/        ← Full page components (one per route)
├── components/   ← Reusable UI components
├── api/          ← All Axios API call functions
├── hooks/        ← Custom React hooks
├── context/      ← React Context (global state like Auth)
└── utils/        ← Helper/utility functions
```

---

### Rule 6 — 🔄 Standard React Patterns Only

- ✅ Functional components with hooks only (NO class components)
- ✅ `useState` for local component state
- ✅ `useEffect` for side effects and API calls on mount
- ✅ `useContext` for global state (auth, user info)
- ✅ React Query (TanStack Query) for server data fetching
- ✅ React Hook Form for all forms
- ✅ React Router v6 (`useNavigate`, `useParams`, `<Link>`)

---

### Rule 7 — 🐍 Standard Django Patterns Only

- ✅ Class-based APIViews (from Django REST Framework)
- ✅ Serializers for all data validation and conversion
- ✅ Permission classes on every endpoint
- ✅ Django ORM for all database queries (no raw SQL)
- ✅ Keep views thin — logic goes in helper functions

---

### Rule 8 — ⚠️ Error Handling — Always Visible

- Every API call must have a `try/catch` or `.catch()` handler.
- Show user-friendly error messages on the UI (not just `console.log`).
- Backend must return meaningful HTTP status codes + error messages.

---

### Rule 9 — 🎨 Frontend Styling Rules

- Use **Tailwind CSS** utility classes for all styling.
- Keep a consistent color scheme, spacing, and font sizes throughout.
- Every page must be **responsive** (works on mobile AND desktop).
- Show a **loading spinner** while data is being fetched from the API.
- Show an **empty state message** when a list has no items.

---

### Rule 10 — 🔒 Security — Always Apply These

- Use JWT tokens: access token (15 min expiry), refresh token (7 days).
- Protect all API endpoints with DRF permission classes.
- Validate all user input on BOTH frontend (React Hook Form) AND backend (DRF serializers).
- Never expose passwords or secret keys in the frontend code.

---

## 🎯 THE GOLDEN RULE

> **Write code as if a first-year Computer Science student will read it tomorrow
> and needs to understand every single line without asking anyone for help.**

---

## 👥 User Roles Summary

| Role | Key Permissions |
|---|---|
| **Admin** | Full control — users, classes, subjects, fees, reports |
| **Teacher** | Mark attendance, enter grades, post/grade assignments |
| **Student** | View grades/attendance, submit assignments, pay fees |
| **Parent** | View child's grades, attendance, fee status |

---

## 📦 Feature Status

| # | Feature | Status |
|---|---|---|
| 1 | Authentication & Authorization | 🟢 Backend Implemented |
| 2 | User Management | 🟢 Backend Implemented |
| 3 | Class & Subject Management | 🟢 Backend Implemented |
| 4 | Student Management | 🟢 Backend Implemented |
| 5 | Attendance System | 🟡 Needs Input |
| 6 | Grades / Result Management | 🟢 MVP Planned |
| 7 | Role-specific Dashboards | 🟡 Deferred |
| 8 | Assignments / Homework | 🟢 Post-MVP |
| 9 | Fee Management | 🟢 Post-MVP |
| 10 | Announcements | 🟢 Post-MVP |
| 11 | Reports & Analytics | 🟢 Post-MVP |
| 12 | Notifications (email + in-app) | 🟢 Post-MVP |
| 13 | AI Performance Summary | 🟢 Post-MVP |
| - | Timetable / Messaging | 🔴 Removed |

---

*Last updated: 2026-08-05 | Read MEMORY.md for full project context.*
