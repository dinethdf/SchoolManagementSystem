# Project Memory & Agent Instructions

## 🚨 CORE PHILOSOPHY: BEGINNER-FRIENDLY CODING FOR UNDERGRADUATES

**CRITICAL INSTRUCTION FOR ALL AI AGENTS WORKING ON THIS PROJECT:**
This project is an undergraduate Final Year Project. The primary audience is university students
(undergraduates) and their professors. Every single line of code must be easy to read, understand,
and explain in a viva/presentation.

---

## ✅ CODING STANDARDS — ALL AGENTS MUST FOLLOW THESE ALWAYS

### 1. 📖 Simplicity Over Cleverness
- Write the **most straightforward version** of any logic — not the shortest or cleverest.
- If a beginner would be confused reading it, rewrite it in a simpler way.
- Avoid: complex array chaining, advanced functional programming tricks, obscure JS/Python features.

**❌ BAD (too clever):**
```js
const total = items.reduce((acc, i) => acc + i.price * i.qty, 0);
```
**✅ GOOD (beginner-friendly):**
```js
// Calculate the total price by looping through each item in the cart
let totalPrice = 0;
for (let i = 0; i < items.length; i++) {
  let itemTotal = items[i].price * items[i].quantity;
  totalPrice = totalPrice + itemTotal;
}
```

---

### 2. 💬 Heavy Commenting — Explain EVERYTHING
- Add a comment **above every function** explaining what it does and why.
- Add **inline comments** for any logic that isn't instantly obvious.
- Comments should explain the *purpose and reasoning*, not just repeat the code.

**✅ Example React component comment style:**
```jsx
// This component shows the student's attendance percentage on their dashboard.
// It receives the student's attendance data as a prop and calculates the percentage.
function StudentAttendanceCard({ attendanceData }) {

  // Count how many days the student was present
  let presentDays = 0;
  for (let i = 0; i < attendanceData.length; i++) {
    if (attendanceData[i].status === 'present') {
      presentDays = presentDays + 1;
    }
  }

  // Calculate percentage: (present days / total days) * 100
  let totalDays = attendanceData.length;
  let attendancePercentage = (presentDays / totalDays) * 100;

  return (
    <div>
      <p>Attendance: {attendancePercentage.toFixed(1)}%</p>
    </div>
  );
}
```

**✅ Example Django view comment style:**
```python
# This view handles the API request to get a student's attendance records.
# Only authenticated users with the 'teacher' or 'admin' role can access this.
class StudentAttendanceView(APIView):

    def get(self, request, student_id):
        # Try to find the student in the database using the ID from the URL
        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            # If no student found, return a clear error message
            return Response({'error': 'Student not found'}, status=404)

        # Get all attendance records for this student
        attendance_records = Attendance.objects.filter(student=student)

        # Serialize the data so it can be sent as JSON
        serializer = AttendanceSerializer(attendance_records, many=True)

        return Response(serializer.data)
```

---

### 3. 📛 Clear, Descriptive Naming
- Variable and function names must describe **exactly** what they hold or do.
- No abbreviations unless universally known (e.g., `id`, `url`, `api`).

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

### 4. 🚫 No Magic — Break Everything Into Steps
- No magic numbers (use named constants instead).
- No deeply nested ternary operators (use if/else).
- No complex one-liners — split into multiple readable lines.

**❌ BAD:**
```js
const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'F';
```
**✅ GOOD:**
```js
// Determine the letter grade based on the student's score
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

### 5. 📁 File & Folder Organization
- One component per file. Name the file exactly the same as the component.
- Group files by feature, not by type where possible.
- Keep files short — if a file is getting very long (300+ lines), consider splitting it.

**Frontend structure:**
```
src/
├── pages/          ← Full pages (one per route)
├── components/     ← Reusable UI pieces
├── api/            ← All Axios API call functions
├── hooks/          ← Custom React hooks
├── context/        ← React Context (global state)
└── utils/          ← Helper/utility functions
```

---

### 6. 🔄 Standard React Patterns Only
- Use **functional components** with hooks (no class components).
- Use **useState** for local state, **useContext** for global state.
- Use **useEffect** for side effects (API calls on page load etc.).
- Use **React Query (TanStack Query)** for server data fetching.
- Use **React Hook Form** for all forms.
- Use **React Router v6** for navigation (`useNavigate`, `useParams`).

---

### 7. 🐍 Standard Django Patterns Only
- Use **class-based APIViews** (from DRF) for all API endpoints.
- Use **serializers** for all data validation and conversion.
- Use **permissions classes** to protect every endpoint.
- Keep views thin — put business logic in helper functions or model methods.
- Use **Django's ORM** for all database queries (no raw SQL unless absolutely needed).

---

### 8. ⚠️ Error Handling — Always Handle Errors Visibly
- Every API call must have error handling.
- Show user-friendly error messages on the UI (not just console.log).
- On the backend, always return meaningful HTTP status codes and error messages.

---

### 9. 🎨 Frontend Styling Rules
- Use **Tailwind CSS** utility classes.
- Keep styles consistent — use the same color scheme, spacing, and font sizes throughout.
- Every page must be **responsive** (work on mobile and desktop).
- Use loading states (spinners) while data is being fetched.

---

### 10. 🔒 Security — Always Apply These
- Never store sensitive data (passwords, tokens) in localStorage without thought.
- Use JWT tokens for auth — access token (15 min), refresh token (7 days).
- Protect all API endpoints with permission classes.
- Validate all user input on both frontend and backend.

---

## 🎯 THE GOLDEN RULE

> **Write code as if a first-year Computer Science student will read it tomorrow and needs to understand every single line without asking anyone for help.**

If an agent violates any of these rules, the project owner should flag it immediately and the agent must rewrite the code following these standards.

---

## 📦 Current Feature Status (Update this as features are built)

| # | Feature | Status |
|---|---|---|
| 1 | Authentication & Authorization (Backend + Frontend) | 🟢 Implemented (JWT + Role Guards + Login UI) |
| 2 | User Management | 🟢 Backend Implemented |
| 3 | Class & Subject Management (Academics) | 🟢 Backend Implemented + Frontend Service |
| 4 | People Profiles (Students, Teachers, Parents) | 🟢 Backend Implemented + Frontend Service |
| 5 | Role-Specific Dashboards (Admin, Teacher, Student, Parent) | 🟢 Redesigned (Education-First + 10 Reusable Components) |
| 6 | Attendance System | 🟡 Next Planned Feature |
| 7 | Grades / Result Management | 🟢 MVP Planned |
| 8 | Assignments / Homework | 🟢 Post-MVP |
| 9 | Fee Management | 🟢 Post-MVP |
| 10 | Announcements | 🟢 Post-MVP |
| 11 | Reports & Analytics | 🟢 Post-MVP |
| 12 | Notifications (email + in-app) | 🟢 Post-MVP |
| 13 | AI Performance Summary | 🟢 Post-MVP |
| - | Timetable / Messaging | 🔴 Removed |

---

*Last updated: 2026-10-22 | All agents must re-read this file before starting any work.*

