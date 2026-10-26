#!/usr/bin/env python3
"""
Automated API Test Script for SchoolManagementSystem
Run: python test_api.py
Tests all role-based endpoints for Teacher, Student, Parent
"""

import sys
import requests
import json

BASE = "http://127.0.0.1:8000/api"
CREDENTIALS = {
    "admin": ("admin", "adminpassword123"),
    "teacher": ("teacher1", "teacherpassword123"),
    "student": ("student1", "studentpassword123"),
    "parent": ("parent1", "parentpassword123"),
}

def login(username, password):
    """Login and return access token"""
    resp = requests.post(f"{BASE}/auth/login/", json={"username": username, "password": password})
    if resp.status_code != 200:
        raise Exception(f"Login failed for {username}: {resp.text}")
    return resp.json()["access"]

def auth_header(token):
    return {"Authorization": f"Bearer {token}"}

def test_endpoint(name, method, url, token=None, data=None, expected_status=200):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    func = getattr(requests, method.lower())
    resp = func(url, headers=headers, json=data)

    passed = resp.status_code == expected_status
    status = "✅ PASS" if passed else f"❌ FAIL (got {resp.status_code})"
    print(f"  {status} {method} {name}")
    if not passed:
        print(f"    Response: {resp.text[:200]}")
    return passed, resp.json() if resp.content else None

def run_tests():
    print("=" * 60)
    print("SchoolManagementSystem API Test Suite")
    print("=" * 60)

    # Login all roles
    tokens = {}
    for role, (user, pwd) in CREDENTIALS.items():
        try:
            tokens[role] = login(user, pwd)
            print(f"✅ Logged in as {role} ({user})")
        except Exception as e:
            print(f"❌ Login failed for {role}: {e}")
            return False

    all_passed = True

    # ============================================================
    # TEACHER / ADMIN TESTS
    # ============================================================
    print("\n📚 TEACHER/ADMIN ENDPOINTS")
    t_token = tokens["teacher"]

    tests = [
        ("Classes list", "get", f"{BASE}/academics/classes/"),
        ("Students list", "get", f"{BASE}/people/students/"),
        ("Subjects list", "get", f"{BASE}/academics/subjects/"),
        ("Assessments list", "get", f"{BASE}/grades/assessments/"),
        ("Class attendance (today)", "get", f"{BASE}/attendance/class/1/?date=2026-10-26"),
    ]

    for name, method, url in tests:
        passed, _ = test_endpoint(name, method, url, t_token)
        all_passed = all_passed and passed

    # Teacher WRITE tests
    print("\n  ✍️  Teacher WRITE operations:")

    # Bulk attendance
    passed, _ = test_endpoint(
        "Bulk mark attendance", "post", f"{BASE}/attendance/bulk/",
        t_token,
        {"school_class": 1, "date": "2026-10-26", "attendance_list": [{"student": 1, "status": "present", "remarks": "Auto test"}]},
        expected_status=201
    )
    all_passed = all_passed and passed

    # Bulk grades
    passed, _ = test_endpoint(
        "Bulk enter grades", "post", f"{BASE}/grades/records/bulk/",
        t_token,
        {"assessment": 2, "grade_list": [{"student": 1, "marks_obtained": 20, "remarks": "Auto test"}]},
        expected_status=201
    )
    all_passed = all_passed and passed

    # ============================================================
    # STUDENT TESTS
    # ============================================================
    print("\n🎓 STUDENT ENDPOINTS")
    s_token = tokens["student"]

    tests = [
        ("My attendance summary", "get", f"{BASE}/attendance/my-attendance/summary/"),
        ("My report card", "get", f"{BASE}/grades/my-report-card/"),
        ("My grades list", "get", f"{BASE}/grades/my-grades/"),
        ("My attendance history", "get", f"{BASE}/attendance/my-attendance/"),
    ]

    for name, method, url in tests:
        passed, _ = test_endpoint(name, method, url, s_token)
        all_passed = all_passed and passed

    # ============================================================
    # PARENT TESTS
    # ============================================================
    print("\n👨‍👩‍👧 PARENT ENDPOINTS")
    p_token = tokens["parent"]

    tests = [
        ("My children attendance", "get", f"{BASE}/attendance/my-children/"),
        ("My children grades", "get", f"{BASE}/grades/my-children-grades/"),
    ]

    for name, method, url in tests:
        passed, _ = test_endpoint(name, method, url, p_token)
        all_passed = all_passed and passed

    # ============================================================
    # ADMIN TESTS (full access)
    # ============================================================
    print("\n👑 ADMIN ENDPOINTS")
    a_token = tokens["admin"]

    tests = [
        ("Classes list", "get", f"{BASE}/academics/classes/"),
        ("Students list", "get", f"{BASE}/people/students/"),
        ("Teachers list", "get", f"{BASE}/people/teachers/"),
        ("Parents list", "get", f"{BASE}/people/parents/"),
    ]

    for name, method, url in tests:
        passed, _ = test_endpoint(name, method, url, a_token)
        all_passed = all_passed and passed

    # ============================================================
    # PERMISSION BOUNDARY TESTS
    # ============================================================
    print("\n🔒 PERMISSION BOUNDARY TESTS (should 403)")

    # Student trying teacher endpoint
    passed, _ = test_endpoint(
        "Student → Teacher endpoint (403 expected)",
        "get", f"{BASE}/attendance/class/1/?date=2026-10-26",
        tokens["student"],
        expected_status=403
    )
    all_passed = all_passed and passed

    # Parent trying teacher endpoint
    passed, _ = test_endpoint(
        "Parent → Teacher endpoint (403 expected)",
        "get", f"{BASE}/grades/assessments/",
        tokens["parent"],
        expected_status=403
    )
    all_passed = all_passed and passed

    # ============================================================
    # SUMMARY
    # ============================================================
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 ALL TESTS PASSED")
    else:
        print("⚠️  SOME TESTS FAILED")
    print("=" * 60)

    return all_passed

if __name__ == "__main__":
    try:
        success = run_tests()
        sys.exit(0 if success else 1)
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Is Django running on port 8000?")
        print("   Run: cd backend && python manage.py runserver")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Test error: {e}")
        sys.exit(1)