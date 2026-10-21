# 📊 Test Coverage Notes

> This file tracks test coverage status and known gaps.
> Updated by `sms_test_agent` after each testing phase.

---

## Coverage Targets

| Layer    | Target | Current | Status  |
|----------|--------|---------|---------|
| Backend  | ≥ 70%  | 0%      | 🔲 Not Started |
| Frontend | ≥ 60%  | 0%      | 🔲 Not Started |

---

## Backend Coverage by App

| Django App        | Tests Written | Coverage Est. | Notes                   |
|-------------------|---------------|---------------|-------------------------|
| authentication    | 🔲 No         | 0%            | Phase 1 priority        |
| users             | 🔲 No         | 0%            | Phase 1 priority        |
| classes           | 🔲 No         | 0%            | Phase 2                 |
| students          | 🔲 No         | 0%            | Phase 2                 |
| attendance        | 🔲 No         | 0%            | Phase 2                 |
| grades            | 🔲 No         | 0%            | Phase 2                 |
| assignments       | 🔲 No         | 0%            | Phase 2                 |
| fees              | 🔲 No         | 0%            | Phase 3 (post-MVP)      |
| announcements     | 🔲 No         | 0%            | Phase 3 (post-MVP)      |
| notifications     | 🔲 No         | 0%            | Phase 3 (post-MVP)      |
| reports           | 🔲 No         | 0%            | Phase 4 (post-MVP)      |
| ai_summary        | 🔲 No         | 0%            | Phase 4 (post-MVP)      |

---

## Frontend Coverage by Feature

| Feature/Component   | Tests Written | Notes                       |
|---------------------|---------------|-----------------------------|
| LoginForm           | 🔲 No         | Phase 3 priority            |
| ProtectedRoute      | 🔲 No         | Phase 3 priority            |
| RoleRoute           | 🔲 No         | Phase 3 priority            |
| Admin Dashboard     | 🔲 No         | Phase 3                     |
| Teacher Dashboard   | 🔲 No         | Phase 3                     |
| Student Dashboard   | 🔲 No         | Phase 3                     |
| Attendance UI       | 🔲 No         | Phase 3                     |
| Grades UI           | 🔲 No         | Phase 3                     |
| Utility functions   | 🔲 No         | formatters.js, validators.js|

---

## Known Coverage Gaps

_Updated as testing progresses. List areas we know are not tested yet._

- [ ] All backend endpoints (backend not yet built — tests written in parallel)
- [ ] All frontend pages (frontend scaffold in progress)
- [ ] Error boundary component behavior
- [ ] Token refresh flow in AuthContext

---

## How to Generate Coverage Reports

### Backend
```bash
cd backend
pip install coverage
coverage run manage.py test tests/
coverage report --omit="*/migrations/*,*/venv/*"
coverage html  # Opens htmlcov/index.html
```

### Frontend
```bash
cd frontend
npm run test -- --coverage
# Report appears in coverage/ folder
```

---

## Change Log

| Date       | Phase  | Change                         |
|------------|--------|--------------------------------|
| 2026-07-28 | Setup  | File created by sms_test_agent |
