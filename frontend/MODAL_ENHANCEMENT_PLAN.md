# Unified Enhanced Modal System - Implementation Plan

## Current State Analysis

| Page | Modal Pattern | Status |
|------|--------------|--------|
| **ClassesPage** | Shared `Modal` + `react-hook-form` + `useMutation` + `toast` | ✅ **Best Practice** |
| **TeachersPage** | Shared `Modal` + `ModalFooter` + `useModalForm` | ✅ Refactored |
| **TeacherGradesPage** | Shared `Modal` + `ModalFooter` | ✅ Standardized |
| **StudentsPage** | No "Add Student" modal | 🔲 Pending (requires account/profile creation flow) |
| **ParentsPage** | No "Add Parent" modal | 🔲 Pending (requires account/profile creation flow) |
| **ClassesPage** | Shared `Modal` + `ModalFooter` for classes and subjects | ✅ Standardized; subject creation added |

## Implementation Progress

**Completed:** Shared portal-based modal with responsive sizing, backdrop, Escape handling, focus trapping/restoration, and loading protection; reusable `ModalFooter`; `useModalForm`; standardized teacher, class, subject, and assessment creation dialogs. The frontend production build passes.

**Deliberately pending:** Student and parent creation need a safe account-plus-profile creation workflow. Their profile endpoints currently require an existing user ID, so the frontend should not add those dialogs until the backend flow is defined to avoid partially-created accounts.

## Goal

Create a **reusable, enhanced modal system** with:
- Consistent UX/UI across all admin CRUD operations
- Built-in form validation with `react-hook-form`
- Optimistic updates with `useMutation` + `toast` notifications
- Accessible (ARIA, keyboard navigation)
- Responsive design
- Loading states and error handling
- **Focus trap & focus restoration**
- **Portal rendering for z-index management**
- **Animation system (framer-motion or CSS transitions)**

---

## Phase 1: Enhanced Shared Modal Component

### 1.1 Upgrade `Modal.jsx`
**File:** `frontend/src/components/common/Modal.jsx`

**Enhancements:**
- Size variants: `sm`, `md`, `lg`, `xl`, `full`
- Animation variants: `fade`, `slide-up`, `scale` (CSS-based, no extra deps)
- Footer slot for consistent action buttons
- `isLoading` prop to disable interactions
- `onOverlayClick` configurable (default: close)
- **Portal rendering** via `ReactDOM.createPortal` for proper z-index
- **Focus trap** using `focus-trap-react` or custom implementation
- **Focus restoration** - return focus to trigger element on close
- `closeOnEscape` prop (default: true)
- `closeOnOverlayClick` prop (default: true)
- `description` prop for `aria-describedby`

### 1.2 Create `ModalFooter.jsx`
**File:** `frontend/src/components/common/ModalFooter.jsx`

Standardized footer with:
- Cancel button (outline)
- Submit button (primary, loading state)
- Optional delete button for edit modals (destructive variant)
- Responsive layout (stack on mobile, inline on desktop)

### 1.3 Create `useModalForm` Hook
**File:** `frontend/src/hooks/useModalForm.js`

Reusable hook combining:
- `react-hook-form` setup with resolver support
- `useMutation` integration with TanStack Query
- Toast notifications (success/error)
- Auto-close on success
- Query invalidation
- **Optimistic updates** for instant UI feedback
- **Form dirty state tracking** (warn on unsaved changes)

```javascript
// Usage pattern
const { 
  form, 
  mutation, 
  isModalOpen, 
  openModal, 
  closeModal,
  isDirty,
  resetForm 
} = useModalForm({
  mutationFn: createTeacher,
  queryKey: ['adminTeachersList'],
  onSuccess: (data) => toast.success(data.message),
  onError: (error) => toast.error(error.message),
  defaultValues: { ... },
  validationResolver: zodResolver(teacherSchema), // optional zod
  mode: 'create', // 'create' | 'edit'
  initialData: null, // for edit mode
});
```

---

## Phase 2: Entity-Specific Form Components

### 2.1 Create Form Components (reusable, composable)
**Files:** `frontend/src/components/forms/`

| Component | Fields | Use Case |
|-----------|--------|----------|
| `TeacherForm.jsx` | user fields + teacher profile fields | Add/Edit Teacher |
| `StudentForm.jsx` | user fields + student profile fields | Add/Edit Student |
| `ParentForm.jsx` | user fields + parent profile fields | Add/Edit Parent |
| `ClassForm.jsx` | name, grade, section, year, room | Add/Edit Class |
| `SubjectForm.jsx` | name, code, description | Add/Edit Subject |
| `AssessmentForm.jsx` | name, type, subject, class, max_marks, date | Add/Edit Assessment |

Each form component:
- Accepts `register`, `errors`, `defaultValues`, `control`, `watch` from `useForm`
- Uses shared `Input`, `Select`, `FormSection`, `Button` components
- Handles both create and edit modes via `mode` prop
- Returns form fields as JSX
- **Includes field-level validation messages**
- **Supports conditional fields** (e.g., subject dropdown filtered by class)

### 2.2 Create `EntityModal` Wrapper
**File:** `frontend/src/components/common/EntityModal.jsx`

```jsx
<EntityModal
  isOpen={isOpen}
  onClose={close}
  title="Add Teacher"
  formComponent={<TeacherForm />}
  mutationFn={createTeacher}
  updateMutationFn={updateTeacher} // for edit mode
  queryKey={['adminTeachersList']}
  defaultValues={teacherDefaults}
  size="lg"
  onSuccess={() => { /* optional callback */ }}
/>
```

**Features:**
- Auto-switches between create/edit mode based on `initialData` prop
- Handles both `mutationFn` (create) and `updateMutationFn` (edit)
- Shows appropriate title: "Add Teacher" vs "Edit Teacher"
- Pre-populates form with `initialData` in edit mode
- Resets form on close

---

## Phase 3: Refactor Existing Pages

### 3.1 TeachersPage.jsx
- Replace inline modal with `EntityModal` + `TeacherForm`
- Use `useModalForm` hook
- Add **edit** and **delete** functionality to table (action column)
- Add search/filter to table

### 3.2 TeacherGradesPage.jsx
- Replace assessment inline modal with `EntityModal` + `AssessmentForm`
- Keep existing tab structure
- Add edit/delete for assessments

### 3.3 StudentsPage.jsx
- Add "Add Student" button to PageHeader
- Implement `EntityModal` + `StudentForm`
- Use `createStudent` API (exists in students.js)
- Add edit/delete to table
- Add search (already has)

### 3.4 ParentsPage.jsx
- Add "Add Parent" button to PageHeader
- Implement `EntityModal` + `ParentForm`
- Use `createParent` API (backend exists, need to add to students.js)
- Add edit/delete to table

### 3.5 ClassesPage.jsx (already good)
- Minor enhancements: add edit/delete to table with `ConfirmDialog`
- Use `EntityModal` for consistency (optional - already works well)

---

## Phase 4: Enhanced UX Features

### 4.1 Confirmation Dialogs
**File:** `frontend/src/components/common/ConfirmDialog.jsx` (exists - enhance)
- Standardize for delete actions
- Add "type" variants: `danger` (delete), `warning` (archive), `info` (confirm)
- Consistent button ordering: Cancel | Confirm
- Focus trap & keyboard accessible

### 4.2 Toast Integration
**Already using:** `react-hot-toast`
- Ensure consistent positioning (top-right)
- Add promise-based toasts for mutations
- Custom toast styles matching design system

### 4.3 Keyboard Shortcuts
- `Escape` to close (already in Modal)
- `Enter` to submit form (via `handleSubmit`)
- `Cmd/Ctrl + N` to open "Add" modal (optional, global listener)
- `Tab` navigation within modal (focus trap)

### 4.4 Loading & Empty States
- Skeleton loaders in table while fetching
- Empty state illustrations with action buttons
- Inline validation feedback on blur/submit

---

## Phase 5: Testing & Polish

### 5.1 Test Matrix
| Role | Page | Create | Edit | Delete |
|------|------|--------|------|--------|
| Admin | Teachers | ✅ | 🔲 | 🔲 |
| Admin | Students | 🔲 | 🔲 | 🔲 |
| Admin | Parents | 🔲 | 🔲 | 🔲 |
| Admin | Classes | ✅ | 🔲 | 🔲 |
| Teacher | Assessments | ✅ | 🔲 | 🔲 |

### 5.2 Accessibility Checklist
- [ ] ARIA labels on all form fields
- [ ] Focus trap in modal
- [ ] Focus return to trigger button on close
- [ ] Color contrast for all states (WCAG AA)
- [ ] Screen reader announcements for toasts
- [ ] Semantic HTML (fieldset, legend, label)
- [ ] Error messages linked via `aria-describedby`

---

## File Changes Summary

### New Files
```
frontend/src/hooks/useModalForm.js
frontend/src/components/forms/TeacherForm.jsx
frontend/src/components/forms/StudentForm.jsx
frontend/src/components/forms/ParentForm.jsx
frontend/src/components/forms/ClassForm.jsx
frontend/src/components/forms/SubjectForm.jsx
frontend/src/components/forms/AssessmentForm.jsx
frontend/src/components/common/EntityModal.jsx
frontend/src/components/common/ModalFooter.jsx
```

### Modified Files
```
frontend/src/components/common/Modal.jsx         (enhanced)
frontend/src/components/common/ConfirmDialog.jsx (enhanced)
frontend/src/pages/admin/TeachersPage.jsx        (refactor)
frontend/src/pages/admin/StudentsPage.jsx        (add modal + edit/delete)
frontend/src/pages/admin/ParentsPage.jsx         (add modal + edit/delete)
frontend/src/pages/admin/ClassesPage.jsx         (enhance with edit/delete)
frontend/src/pages/teacher/GradesPage.jsx        (refactor assessment modal)
```

---

## Implementation Order

1. **Enhance Modal component** (foundation - portal, focus trap, animations)
2. **Create `useModalForm` hook** (logic layer)
3. **Create `ModalFooter` component** (consistent actions)
4. **Create `EntityModal` wrapper** (composition)
5. **Build form components** (Teacher, Student, Parent, Class, Subject, Assessment)
6. **Refactor ClassesPage** (already close to pattern - add edit/delete)
7. **Refactor TeachersPage** (replace inline modal)
8. **Add StudentsPage modal** (new feature + edit/delete)
9. **Add ParentsPage modal** (new feature + edit/delete)
10. **Refactor TeacherGradesPage assessment modal**
11. **Enhance ConfirmDialog**
12. **Test & polish**

---

## Estimated Effort

| Phase | Effort |
|-------|--------|
| Phase 1: Enhanced Modal | ~1.5 hours |
| Phase 2: Form Components | ~2.5 hours |
| Phase 3: Page Refactors | ~2.5 hours |
| Phase 4: UX Features | ~1 hour |
| Phase 5: Testing | ~1 hour |
| **Total** | **~8.5 hours** |

---

## Design Decisions & Preferences

### Validation Library
**Recommendation:** Use **Zod + `@hookform/resolvers/zod`** for schema validation
- Type-safe schemas
- Reusable validation logic (frontend + backend parity)
- Better error messages
- Only ~3KB gzipped

```bash
npm install zod @hookform/resolvers
```

### Animation Approach
**Recommendation:** Pure CSS transitions (no Framer Motion)
- Zero dependencies
- Performant
- Tailwind-compatible (`transition`, `animate-in`, `animate-out`)
- Example: `animate-in fade-in-200 slide-in-from-top-4`

### Modal Sizing
| Size | Max Width | Use Case |
|------|-----------|----------|
| `sm` | `max-w-md` (448px) | Simple confirm, single field |
| `md` | `max-w-lg` (512px) | Default forms |
| `lg` | `max-w-xl` (640px) | Complex forms (Teacher, Student) |
| `xl` | `max-w-2xl` (768px) | Multi-section forms |
| `full` | `max-w-4xl` (896px) | Full-screen on mobile, large on desktop |

---

## Next Steps

1. **Approve this enhanced plan** - I'll start with Phase 1
2. **Install Zod** - `npm install zod @hookform/resolvers`
3. **Priority order** - Teachers → Students → Parents → Classes → Assessments
4. **Confirm design tokens** - Use existing Tailwind config colors/spacing

The `ClassesPage` already follows the target pattern - we just need to replicate it consistently across all admin pages with the enhanced Modal foundation.