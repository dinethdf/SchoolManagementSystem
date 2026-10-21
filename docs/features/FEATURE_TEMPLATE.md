# 🎯 Feature Request Template

> Copy this file when creating a new feature spec.
> Save as: `docs/features/TASK-XXX.md`

---

## TASK-[NUMBER]: [Feature Name]

**Created**: YYYY-MM-DD  
**Requested By**: User  
**Written By**: sms_test_agent (Orchestration Chat)  
**Priority**: 🔴 High / 🟡 Medium / 🟢 Low  

---

## 📝 Feature Description

_What the user wants. Plain English description of the feature._

---

## 🎨 Frontend Requirements (sms_fe_agent)

**Pages / Components to build:**
- [ ] Component 1
- [ ] Component 2

**API calls needed:**
- `GET /api/v1/...`
- `POST /api/v1/...`

**User Flows:**
1. User does X
2. System shows Y
3. User does Z

**UI Notes:**
- Use Tailwind CSS
- Follow existing component patterns
- Handle loading and error states

---

## ⚙️ Backend Requirements (sms_be_agent)

**Endpoints to build:**
- [ ] `GET /api/v1/...` — Description
- [ ] `POST /api/v1/...` — Description

**Models needed:**
- Model name + fields

**Business Logic:**
- Rule 1
- Rule 2

**Permissions:**
- Admin: full access
- Teacher: ...
- Student: ...
- Parent: ...

---

## 🚀 Deployment Notes (sms_deploy_agent)

_Any environment variable changes, new services, or config updates needed._

- [ ] New env variables: `VARIABLE_NAME=...`
- [ ] No deployment changes needed

---

## 🧪 Testing Requirements (sms_test_agent)

**Backend tests to write:**
- [ ] `test_<feature>_success`
- [ ] `test_<feature>_unauthorized`
- [ ] `test_<feature>_forbidden_wrong_role`

**Frontend tests to write:**
- [ ] Component renders correctly
- [ ] Form validation works
- [ ] API error state shown

---

## ✅ Acceptance Criteria

_The feature is DONE when all of these are true:_
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

---

## 📎 Related Files

- Backend: `backend/apps/.../`
- Frontend: `frontend/src/pages/.../`
- Tests: `backend/tests/test_....py`
