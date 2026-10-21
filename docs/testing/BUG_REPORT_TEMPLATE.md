# 🐛 Bug Report Template

> Copy this template for every new bug found during testing.
> Save as: `docs/testing/bugs/BUG-XXX.md` (increment the number)

---

## Bug Report: BUG-[NUMBER]

**Date Found**: YYYY-MM-DD  
**Found By**: sms_test_agent  
**Severity**: 🔴 Critical / 🟡 Medium / 🟢 Low  
**Status**: 🔲 Open / 🔄 In Progress / ✅ Fixed  
**Assigned To**: sms_be_agent / sms_fe_agent  

---

## Summary

_One sentence describing the bug._

---

## Environment

- **Layer**: Backend / Frontend / Both  
- **Endpoint / Component**: `POST /api/v1/auth/login/` or `<LoginForm />` etc.  
- **User Role Affected**: Admin / Teacher / Student / Parent / Staff / All  

---

## Steps to Reproduce

1. Step one
2. Step two
3. Step three

---

## Expected Behavior

_What SHOULD happen._

---

## Actual Behavior

_What ACTUALLY happens._

---

## Error Output

```
Paste any error messages, stack traces, or console logs here.
```

---

## Test Case That Caught This

```python
# Paste the failing test here (if applicable)
def test_example(self):
    response = self.client.post('/api/v1/auth/login/', {...})
    self.assertEqual(response.status_code, 200)  # This failed
```

---

## Fix Applied

_After the fix is applied, document what was changed here._

```
File: backend/apps/authentication/views.py
Line: 42
Change: ...
```

---

## Regression Test Added

- [ ] A new regression test was added to prevent this from re-occurring
- Test file: `backend/tests/test_auth.py`
- Test method: `test_XXX`
