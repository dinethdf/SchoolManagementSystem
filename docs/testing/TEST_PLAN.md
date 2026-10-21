# 🧪 School Management System — Test Plan

> **Version**: 1.0  
> **Author**: sms_test_agent  
> **Project**: School Management System (Final Year Project)  
> **Date**: 2026-07-28

---

## 1. Overview

This document defines the complete testing strategy for the School Management System.
The goal is to ensure that all features work correctly, all role-based access rules are enforced,
and the application is stable enough for academic demonstration and submission.

---

## 2. Scope

### In Scope
- Backend REST API endpoints (Django REST Framework)
- JWT Authentication flow
- Role-based permission enforcement
- Frontend React component rendering
- Critical user journeys (end-to-end flows)

### Out of Scope (for MVP)
- Performance / Load testing
- Accessibility (WCAG) testing
- Mobile browser testing
- Celery background task testing (marked optional in project)

---

## 3. User Roles Under Test

| Role    | Access Level                                      |
|---------|---------------------------------------------------|
| Admin   | Full access to all features and all data          |
| Teacher | Own class attendance, grades, assignments         |
| Student | Read-only own data; submit assignments            |
| Parent  | Read-only their child's data                      |
| Staff   | TBD (limited scope)                               |

---

## 4. Test Categories

### 4.1 Backend — API Tests (Django TestCase / pytest)

| Category              | File                   | Priority |
|-----------------------|------------------------|----------|
| Authentication        | test_auth.py           | 🔴 High  |
| User Management       | test_users.py          | 🔴 High  |
| Role Permissions      | test_permissions.py    | 🔴 High  |
| Classes & Subjects    | test_classes.py        | 🟡 Med   |
| Attendance            | test_attendance.py     | 🟡 Med   |
| Grades & Results      | test_grades.py         | 🟡 Med   |
| Assignments           | test_assignments.py    | 🟡 Med   |
| Fee Management        | test_fees.py           | 🟢 Low   |
| Announcements         | test_announcements.py  | 🟢 Low   |

### 4.2 Frontend — Component Tests (Vitest + React Testing Library)

| Category              | Location                          | Priority |
|-----------------------|-----------------------------------|----------|
| LoginForm             | components/auth/                  | 🔴 High  |
| ProtectedRoute guard  | routes/                           | 🔴 High  |
| RoleRoute guard       | routes/                           | 🔴 High  |
| Dashboard renders     | pages/admin, teacher, student...  | 🟡 Med   |
| Utility functions     | utils/formatters, validators      | 🟡 Med   |

---

## 5. Test Scenarios — Authentication (Priority: HIGH)

| # | Test Case                                   | Expected Result       |
|---|---------------------------------------------|-----------------------|
| 1 | Login with valid credentials                | 200 OK + JWT tokens   |
| 2 | Login with wrong password                   | 401 Unauthorized      |
| 3 | Login with non-existent email               | 401 Unauthorized      |
| 4 | Access protected endpoint without token     | 401 Unauthorized      |
| 5 | Access protected endpoint with expired token| 401 Unauthorized      |
| 6 | Refresh token with valid refresh token      | 200 OK + new access   |
| 7 | Refresh token with invalid refresh token    | 401 Unauthorized      |
| 8 | Logout invalidates token                    | 205 Reset Content     |
| 9 | Register new student account                | 201 Created           |
| 10| Register with duplicate email               | 400 Bad Request       |

---

## 6. Test Scenarios — Role Permission Boundaries (Priority: HIGH)

| # | Test Case                                          | Expected Result  |
|---|----------------------------------------------------|------------------|
| 1 | Student accesses /api/v1/users/ (admin-only)       | 403 Forbidden    |
| 2 | Parent accesses /api/v1/grades/ (write)            | 403 Forbidden    |
| 3 | Teacher accesses another teacher's attendance data | 403 Forbidden    |
| 4 | Admin accesses all users                           | 200 OK           |
| 5 | Student reads own grades                           | 200 OK           |
| 6 | Student reads another student's grades             | 403 Forbidden    |
| 7 | Teacher marks attendance for own class             | 201 Created      |
| 8 | Teacher marks attendance for another teacher's class| 403 Forbidden   |

---

## 7. Test Data Strategy

All test data is created using **factory_boy** factories defined in `backend/tests/factories.py`.

**Key factories:**
- `UserFactory` — creates a base user
- `AdminUserFactory` — user with role='admin'
- `TeacherUserFactory` — user with role='teacher'
- `StudentUserFactory` — user with role='student'
- `ParentUserFactory` — user with role='parent'
- `ClassFactory` — a school class/grade
- `SubjectFactory` — a subject
- `AttendanceFactory` — an attendance record
- `GradeFactory` — a grade record

---

## 8. Running Tests

### Backend
```bash
# Run all tests
cd backend
python manage.py test tests/

# Run a specific test file
python manage.py test tests.test_auth

# Run with pytest (if installed)
pytest tests/ -v

# With coverage report
coverage run manage.py test tests/
coverage report
coverage html
```

### Frontend
```bash
# Run all tests
cd frontend
npm run test

# Run with coverage
npm run test -- --coverage

# Run in watch mode
npm run test -- --watch
```

---

## 9. Coverage Targets

| Layer    | Target Coverage |
|----------|----------------|
| Backend  | ≥ 70%          |
| Frontend | ≥ 60%          |

> Note: For a Final Year Project, 70% backend coverage and 60% frontend coverage
> is a solid, demonstrable target. Focus on critical paths first.

---

## 10. Bug Reporting

All bugs found during testing must be documented using the template in:
`docs/testing/BUG_REPORT_TEMPLATE.md`

---

## 11. Test Phases & Timeline

| Phase | Focus                          | Status  |
|-------|--------------------------------|---------|
| 0     | Setup — test structure + plan  | ✅ Done |
| 1     | Auth & Permission tests        | 🔲 Todo |
| 2     | Core feature API tests         | 🔲 Todo |
| 3     | Frontend component tests       | 🔲 Todo |
| 4     | Coverage review & gap filling  | 🔲 Todo |
