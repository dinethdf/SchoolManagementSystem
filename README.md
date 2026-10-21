# 🏫 School Management System

> **Final Year Project** — A comprehensive web-based platform that digitizes core school operations, replacing manual/paper-based processes.

---

## 📋 Overview

This system provides a secure, role-based platform for managing:
- **Student Records** — enrollment, profiles, academic history
- **Attendance** — daily/per-period tracking with auto-calculated percentages
- **Grades & Results** — multi-format grading (marks/letter/GPA), exam terms, report cards
- **Assignments** — teacher-posted homework with student file submissions and grading
- **Fees** — payment tracking, invoice generation, online + manual slip support
- **Announcements** — school-wide and class-specific notice board
- **Notifications** — email + in-app alerts for key events
- **AI Performance Summary** — LLM-powered academic performance insights

## 🚨 Coding Philosophy
This project is built as an undergraduate Final Year Project. The codebase strictly adheres to the following principles:
- **Simplicity over complexity:** Code must be straightforward and easy to understand for beginners.
- **Heavy Commenting:** All core logic must be clearly documented in-line.
- **Standard Patterns:** Avoid overly abstract or advanced architectural patterns; stick to standard Django and React methodologies.

---

## 👥 User Roles

| Role | Capabilities |
|---|---|
| **Admin** | Full control: users, classes, subjects, fees, announcements, reports |
| **Teacher** | Mark attendance, enter grades, post/grade assignments |
| **Student** | View grades, attendance, assignments; submit work; pay fees |
| **Parent** | View child's performance, attendance, fee status |
| **Staff** | Scope TBD (librarian / accountant / receptionist) |

---

## 🏗️ Architecture

```
┌─────────────────────┐         REST API (HTTPS)         ┌─────────────────────────────┐
│   React + Vite      │  ←────────────────────────────→  │   Django REST Framework     │
│   (Frontend)        │         JWT Auth Tokens           │   (Backend)                 │
└─────────────────────┘                                   └──────────────┬──────────────┘
                                                                         │
                                             ┌───────────────────────────┼───────────────────┐
                                             │                           │                   │
                                    ┌────────▼──────┐          ┌────────▼──────┐   ┌─────────▼──────┐
                                    │  PostgreSQL   │          │ Email Service │   │  LLM API       │
                                    │  (Database)   │          │    (SMTP)     │   │  (AI Summary)  │
                                    └───────────────┘          └───────────────┘   └────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (JavaScript) + Vite |
| **Styling** | Tailwind CSS |
| **Routing** | React Router v6 |
| **API Client** | Axios + TanStack Query (React Query v5) |
| **Backend** | Python 3.11 + Django 5 + Django REST Framework |
| **Auth** | JWT via `djangorestframework-simplejwt` |
| **Database** | PostgreSQL |
| **Task Queue** | Celery + Redis *(optional)* |
| **AI** | LLM API *(provider TBD)* |
| **Deployment** | Frontend: Vercel |

---

## 📁 Project Structure

```
SchoolManagementSystem/
├── README.md
├── .gitignore
├── .env.example
│
├── frontend/          ← React + Vite application
└── backend/           ← Django REST Framework API
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+

### Manual Setup
**Frontend (React/Vite):**
```bash
cd frontend
npm install
npm run dev       # → http://localhost:5173
```

**Backend (Django):**
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver  # → http://localhost:8000
```

---

## 📦 Feature Status

| # | Feature | Status |
|---|---|---|
| 1 | Authentication & Authorization | 🟢 MVP |
| 2 | User Management | 🟡 MVP (details pending) |
| 3 | Class & Subject Management | 🟢 MVP |
| 4 | Student Management | 🟡 MVP (details pending) |
| 5 | Attendance System | 🟡 MVP (needs input) |
| 6 | Grades / Result Management | 🟢 MVP |
| 7 | Role-specific Dashboards | 🟡 MVP (deferred) |
| 8 | Assignments / Homework | 🟢 Post-MVP |
| 9 | Fee Management | 🟢 Post-MVP |
| 10 | Announcements | 🟢 Post-MVP |
| 11 | Reports & Analytics | 🟢 Post-MVP |
| 12 | Notifications (email + in-app) | 🟢 Post-MVP |
| 13 | AI Performance Summary | 🟢 Post-MVP |
| - | Timetable Management | 🔴 Removed |
| - | Messaging | 🔴 Removed |

---

## 📐 Diagrams

### Entity Relationship Overview
```mermaid
erDiagram
    USER ||--o| STUDENT : "is a"
    USER ||--o| TEACHER : "is a"
    USER ||--o| PARENT : "is a"
    USER ||--o| STAFF : "is a"
    CLASS ||--o{ STUDENT : enrolls
    CLASS ||--o{ SUBJECT : offers
    TEACHER ||--o{ SUBJECT : teaches
    STUDENT ||--o{ ATTENDANCE : has
    STUDENT ||--o{ GRADE : receives
    SUBJECT ||--o{ GRADE : "graded in"
    TEACHER ||--o{ ASSIGNMENT : posts
    STUDENT ||--o{ ASSIGNMENT_SUBMISSION : submits
    ASSIGNMENT ||--o{ ASSIGNMENT_SUBMISSION : receives
    STUDENT ||--o{ FEE_PAYMENT : makes
    PARENT ||--o{ STUDENT : "guardian of"
```

---

## 🔒 Security
- Password hashing (Django PBKDF2)
- JWT access tokens: 15-min expiry | Refresh tokens: 7-day expiry
- Role-based route protection on both frontend and backend
- Input validation: frontend (React Hook Form) + backend (DRF serializers)
- File upload validation (type and size limits)

---

## 📄 License
This project is an academic submission for Final Year Project requirements.
