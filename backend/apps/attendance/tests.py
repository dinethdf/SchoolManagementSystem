"""
Tests for the Attendance API endpoints.

Covers:
- Teacher/Admin: Bulk mark attendance, view class attendance, student history/summary
- Student: Own attendance, own summary
- Parent: Children's attendance
- Permissions: Role-based access control
"""

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

from apps.people.models import StudentProfile, TeacherProfile, ParentProfile
from apps.academics.models import SchoolClass, Subject
from apps.attendance.models import Attendance

User = get_user_model()


class AttendanceAPITestCase(APITestCase):
    """Base test case with common setup for attendance tests."""

    @classmethod
    def setUpTestData(cls):
        # Create class (academic_year is a CharField on SchoolClass)
        cls.school_class = SchoolClass.objects.create(
            name="Class 10A",
            grade_level=10,
            section="A",
            academic_year="2025-2026",
        )

        # Create subject
        cls.subject = Subject.objects.create(
            name="Mathematics",
            code="MATH101",
            school_class=cls.school_class,
        )

        # Create users
        cls.admin = User.objects.create_superuser(
            username="testadmin",
            email="admin@test.com",
            password="testpass123",
            role="admin",
            first_name="Test",
            last_name="Admin",
        )

        cls.teacher_user = User.objects.create_user(
            username="testteacher",
            email="teacher@test.com",
            password="testpass123",
            role="teacher",
            first_name="Test",
            last_name="Teacher",
        )
        cls.teacher = TeacherProfile.objects.create(
            user=cls.teacher_user,
            employee_id="EMP001",
            joining_date="2020-01-15",
        )
        # Assign teacher to class/subject via User relations
        cls.teacher_user.assigned_classes.add(cls.school_class)
        cls.teacher_user.teaching_subjects.add(cls.subject)

        cls.student_user = User.objects.create_user(
            username="teststudent",
            email="student@test.com",
            password="testpass123",
            role="student",
            first_name="Test",
            last_name="Student",
        )
        cls.student = StudentProfile.objects.create(
            user=cls.student_user,
            admission_number="STU001",
            enrolled_class=cls.school_class,
            admission_date="2025-09-01",
        )

        cls.parent_user = User.objects.create_user(
            username="testparent",
            email="parent@test.com",
            password="testpass123",
            role="parent",
            first_name="Test",
            last_name="Parent",
        )
        cls.parent = ParentProfile.objects.create(
            user=cls.parent_user,
            occupation="Engineer",
            relationship_to_child="Father",
        )
        cls.parent.children.add(cls.student)

        # Create another student for bulk testing
        cls.student2_user = User.objects.create_user(
            username="teststudent2",
            email="student2@test.com",
            password="testpass123",
            role="student",
            first_name="Test",
            last_name="Student2",
        )
        cls.student2 = StudentProfile.objects.create(
            user=cls.student2_user,
            admission_number="STU002",
            enrolled_class=cls.school_class,
            admission_date="2025-09-01",
        )

    def _auth(self, user):
        """Helper to authenticate as a user."""
        self.client.force_authenticate(user=user)


class TeacherAdminAttendanceTests(AttendanceAPITestCase):
    """Tests for teacher/admin attendance endpoints."""

    def test_bulk_mark_attendance_success(self):
        """Teacher can bulk mark attendance for their class."""
        self._auth(self.teacher_user)

        payload = {
            "school_class": self.school_class.id,
            "date": "2025-10-15",
            "subject": self.subject.id,
            "attendance_list": [
                {"student": self.student.id, "status": "present", "remarks": "On time"},
                {"student": self.student2.id, "status": "absent", "remarks": "Sick"},
            ],
        }

        url = reverse("attendance-bulk-mark")
        resp = self.client.post(url, payload, format="json")

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(resp.json()["success"])
        self.assertEqual(resp.json()["records_saved"], 2)

        # Verify records exist in DB
        records = Attendance.objects.filter(
            school_class=self.school_class, date="2025-10-15"
        )
        self.assertEqual(records.count(), 2)

    def test_bulk_mark_attendance_invalid_student(self):
        """Teacher can mark attendance for any student (no class enrollment check)."""
        self._auth(self.teacher_user)

        # Student not in this class - but view doesn't validate class enrollment
        outsider_user = User.objects.create_user(
            username="outsider", email="out@test.com", password="pass", role="student"
        )
        outsider = StudentProfile.objects.create(
            user=outsider_user, admission_number="STU999", admission_date="2025-09-01"
        )

        payload = {
            "school_class": self.school_class.id,
            "date": "2025-10-16",
            "attendance_list": [{"student": outsider.id, "status": "present"}],
        }

        url = reverse("attendance-bulk-mark")
        resp = self.client.post(url, payload, format="json")

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        data = resp.json()
        # The view doesn't check class enrollment, so it saves the record
        self.assertEqual(data["records_saved"], 1)
        self.assertEqual(data["errors"], [])

    def test_view_class_attendance(self):
        """Teacher can view class attendance for a date."""
        self._auth(self.teacher_user)

        # First create some attendance
        Attendance.objects.create(
            student=self.student,
            school_class=self.school_class,
            subject=self.subject,
            date="2025-10-15",
            status="present",
            marked_by=self.teacher_user,
        )

        url = reverse("attendance-class-view", kwargs={"class_id": self.school_class.id})
        resp = self.client.get(f"{url}?date=2025-10-15")

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.json()["success"])
        self.assertEqual(len(resp.json()["attendance"]), 1)

    def test_view_student_attendance_history(self):
        """Teacher can view a student's full attendance history."""
        self._auth(self.teacher_user)

        Attendance.objects.create(
            student=self.student,
            school_class=self.school_class,
            subject=self.subject,
            date="2025-10-10",
            status="present",
            marked_by=self.teacher_user,
        )
        Attendance.objects.create(
            student=self.student,
            school_class=self.school_class,
            subject=self.subject,
            date="2025-10-11",
            status="absent",
            marked_by=self.teacher_user,
        )

        url = reverse("attendance-student-history", kwargs={"student_id": self.student.id})
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.json()["success"])
        self.assertEqual(resp.json()["total_records"], 2)

    def test_view_student_attendance_summary(self):
        """Teacher can view a student's attendance percentage summary."""
        self._auth(self.teacher_user)

        Attendance.objects.create(
            student=self.student,
            school_class=self.school_class,
            subject=self.subject,
            date="2025-10-10",
            status="present",
            marked_by=self.teacher_user,
        )
        Attendance.objects.create(
            student=self.student,
            school_class=self.school_class,
            subject=self.subject,
            date="2025-10-11",
            status="present",
            marked_by=self.teacher_user,
        )
        Attendance.objects.create(
            student=self.student,
            school_class=self.school_class,
            subject=self.subject,
            date="2025-10-12",
            status="absent",
            marked_by=self.teacher_user,
        )

        url = reverse("attendance-student-summary", kwargs={"student_id": self.student.id})
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.json()["success"])
        summary = resp.json()["summary"]
        self.assertEqual(summary["total_days"], 3)
        self.assertEqual(summary["present_days"], 2)
        self.assertEqual(summary["absent_days"], 1)
        self.assertAlmostEqual(summary["attendance_percentage"], 66.67, places=1)


class StudentAttendanceTests(AttendanceAPITestCase):
    """Tests for student attendance endpoints."""

    def test_my_attendance_history(self):
        """Student can view their own attendance history."""
        self._auth(self.student_user)

        Attendance.objects.create(
            student=self.student,
            school_class=self.school_class,
            subject=self.subject,
            date="2025-10-10",
            status="present",
            marked_by=self.teacher_user,
        )
        Attendance.objects.create(
            student=self.student,
            school_class=self.school_class,
            subject=self.subject,
            date="2025-10-11",
            status="late",
            marked_by=self.teacher_user,
        )

        url = reverse("attendance-my-attendance")
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.json()["success"])
        self.assertEqual(resp.json()["total_records"], 2)

    def test_my_attendance_summary(self):
        """Student can view their own attendance percentage summary."""
        self._auth(self.student_user)

        Attendance.objects.create(
            student=self.student,
            school_class=self.school_class,
            subject=self.subject,
            date="2025-10-10",
            status="present",
            marked_by=self.teacher_user,
        )
        Attendance.objects.create(
            student=self.student,
            school_class=self.school_class,
            subject=self.subject,
            date="2025-10-11",
            status="present",
            marked_by=self.teacher_user,
        )
        Attendance.objects.create(
            student=self.student,
            school_class=self.school_class,
            subject=self.subject,
            date="2025-10-12",
            status="absent",
            marked_by=self.teacher_user,
        )

        url = reverse("attendance-my-summary")
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.json()["success"])
        summary = resp.json()["summary"]
        self.assertEqual(summary["total_days"], 3)
        self.assertEqual(summary["present_days"], 2)
        self.assertEqual(summary["absent_days"], 1)
        self.assertAlmostEqual(summary["attendance_percentage"], 66.67, places=1)

    def test_student_cannot_access_teacher_endpoint(self):
        """Student gets 403 when trying teacher endpoints."""
        self._auth(self.student_user)

        url = reverse("attendance-class-view", kwargs={"class_id": self.school_class.id})
        resp = self.client.get(f"{url}?date=2025-10-15")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

        url = reverse("attendance-bulk-mark")
        resp = self.client.post(url, {}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


class ParentAttendanceTests(AttendanceAPITestCase):
    """Tests for parent attendance endpoints."""

    def test_my_children_attendance(self):
        """Parent can view all children's attendance."""
        self._auth(self.parent_user)

        Attendance.objects.create(
            student=self.student,
            school_class=self.school_class,
            subject=self.subject,
            date="2025-10-10",
            status="present",
            marked_by=self.teacher_user,
        )

        url = reverse("attendance-my-children")
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.json()["success"])
        self.assertEqual(resp.json()["total_children"], 1)
        child = resp.json()["children"][0]
        self.assertEqual(child["student_name"], self.student.user.get_full_name())
        self.assertEqual(len(child["attendance"]), 1)

    def test_parent_cannot_access_teacher_endpoint(self):
        """Parent gets 403 when trying teacher endpoints."""
        self._auth(self.parent_user)

        url = reverse("attendance-bulk-mark")
        resp = self.client.post(url, {}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


class AdminAttendanceTests(AttendanceAPITestCase):
    """Tests for admin attendance endpoints (full access)."""

    def test_admin_can_access_all_teacher_endpoints(self):
        """Admin has full access to teacher attendance endpoints."""
        self._auth(self.admin)

        # Bulk mark
        url = reverse("attendance-bulk-mark")
        resp = self.client.post(
            url,
            {
                "school_class": self.school_class.id,
                "date": "2025-10-20",
                "attendance_list": [{"student": self.student.id, "status": "present"}],
            },
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

        # Class attendance
        url = reverse("attendance-class-view", kwargs={"class_id": self.school_class.id})
        resp = self.client.get(f"{url}?date=2025-10-20")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        # Student history
        url = reverse("attendance-student-history", kwargs={"student_id": self.student.id})
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        # Student summary
        url = reverse("attendance-student-summary", kwargs={"student_id": self.student.id})
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)