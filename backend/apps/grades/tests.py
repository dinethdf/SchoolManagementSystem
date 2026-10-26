"""
Tests for the Grades API endpoints.

Covers:
- Teacher/Admin: Assessments CRUD, bulk enter grades, student history/report card
- Student: Own grades, own report card
- Parent: Children's grades/report cards
- Permissions: Role-based access control
"""

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

from apps.people.models import StudentProfile, TeacherProfile, ParentProfile
from apps.academics.models import SchoolClass, Subject
from apps.grades.models import Assessment, GradeRecord

User = get_user_model()


class GradesAPITestCase(APITestCase):
    """Base test case with common setup for grades tests."""

    @classmethod
    def setUpTestData(cls):
        # Create class (academic_year is a CharField on SchoolClass)
        cls.school_class = SchoolClass.objects.create(
            name="Class 10A",
            grade_level=10,
            section="A",
            academic_year="2025-2026",
        )

        # Create subjects
        cls.subject_math = Subject.objects.create(
            name="Mathematics",
            code="MATH101",
            school_class=cls.school_class,
        )
        cls.subject_science = Subject.objects.create(
            name="Science",
            code="SCI101",
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
        cls.teacher_user.teaching_subjects.add(cls.subject_math, cls.subject_science)

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

    def _auth(self, user):
        """Helper to authenticate as a user."""
        self.client.force_authenticate(user=user)

    def _create_assessment(self, user, subject=None, max_marks=50, name="Test Exam"):
        """Helper to create an assessment."""
        self._auth(user)
        payload = {
            "name": name,
            "assessment_type": "quiz",
            "subject": (subject or self.subject_math).id,
            "school_class": self.school_class.id,
            "max_marks": max_marks,
            "assessment_date": "2025-10-15",
            "academic_year": self.school_class.academic_year,
        }
        resp = self.client.post(reverse("grades-assessment-list-create"), payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        return resp.json()["assessment"]


class TeacherAdminAssessmentTests(GradesAPITestCase):
    """Tests for teacher/admin assessment endpoints."""

    def test_list_assessments(self):
        """Teacher can list all assessments."""
        self._create_assessment(self.teacher_user, name="Midterm Exam")
        self._create_assessment(self.teacher_user, name="Final Exam")

        self._auth(self.teacher_user)
        resp = self.client.get(reverse("grades-assessment-list-create"))

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.json()["success"])
        self.assertEqual(resp.json()["total_count"], 2)

    def test_create_assessment(self):
        """Teacher can create a new assessment."""
        self._auth(self.teacher_user)

        payload = {
            "name": "Quiz 1",
            "assessment_type": "quiz",
            "subject": self.subject_math.id,
            "school_class": self.school_class.id,
            "max_marks": 20,
            "assessment_date": "2025-10-10",
            "academic_year": self.school_class.academic_year,
        }
        resp = self.client.post(reverse("grades-assessment-list-create"), payload, format="json")

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(resp.json()["success"])
        self.assertEqual(resp.json()["assessment"]["name"], "Quiz 1")

    def test_create_assessment_invalid_max_marks(self):
        """Teacher cannot create assessment with invalid data."""
        self._auth(self.teacher_user)

        payload = {
            "name": "Bad Quiz",
            "assessment_type": "quiz",
            "subject": self.subject_math.id,
            "school_class": self.school_class.id,
            "max_marks": -5,  # Invalid
            "assessment_date": "2025-10-10",
            "academic_year": self.school_class.academic_year,
        }
        resp = self.client.post(reverse("grades-assessment-list-create"), payload, format="json")

        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_assessment_detail(self):
        """Teacher can get assessment details."""
        assessment = self._create_assessment(self.teacher_user, name="Detail Test")

        self._auth(self.teacher_user)
        resp = self.client.get(reverse("grades-assessment-detail", kwargs={"assessment_id": assessment["id"]}))

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.json()["success"])
        self.assertEqual(resp.json()["assessment"]["name"], "Detail Test")

    def test_student_cannot_access_assessments(self):
        """Student gets 403 on assessment endpoints."""
        self._auth(self.student_user)

        resp = self.client.get(reverse("grades-assessment-list-create"))
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

        resp = self.client.post(reverse("grades-assessment-list-create"), {}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


class TeacherAdminGradeRecordTests(GradesAPITestCase):
    """Tests for teacher/admin grade record endpoints."""

    def test_bulk_enter_grades_success(self):
        """Teacher can bulk enter grades for an assessment."""
        assessment = self._create_assessment(self.teacher_user, max_marks=50, name="Bulk Test")

        payload = {
            "assessment": assessment["id"],
            "grade_list": [
                {"student": self.student.id, "marks_obtained": 45, "remarks": "Excellent"},
                {"student": self.student2.id, "marks_obtained": 30, "remarks": "Good"},
            ],
        }

        self._auth(self.teacher_user)
        resp = self.client.post(reverse("grades-bulk-enter"), payload, format="json")

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(resp.json()["success"])
        self.assertEqual(resp.json()["records_saved"], 2)

        # Verify in DB
        records = GradeRecord.objects.filter(assessment_id=assessment["id"])
        self.assertEqual(records.count(), 2)
        self.assertEqual(records.first().letter_grade, "A")  # 90% = A

    def test_bulk_enter_grades_exceeds_max(self):
        """Teacher gets error when marks exceed max_marks."""
        assessment = self._create_assessment(self.teacher_user, max_marks=50)

        payload = {
            "assessment": assessment["id"],
            "grade_list": [
                {"student": self.student.id, "marks_obtained": 60, "remarks": "Too high"},
            ],
        }

        self._auth(self.teacher_user)
        resp = self.client.post(reverse("grades-bulk-enter"), payload, format="json")

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        data = resp.json()
        self.assertEqual(data["records_saved"], 0)
        self.assertTrue(len(data["errors"]) > 0)

    def test_student_grade_history(self):
        """Teacher can view a student's grade history."""
        assessment = self._create_assessment(self.teacher_user)

        # Create grade records
        GradeRecord.objects.create(
            student=self.student,
            assessment_id=assessment["id"],
            marks_obtained=40,
            marked_by=self.teacher_user,
        )
        assessment2 = Assessment.objects.create(
            name="Another Exam",
            assessment_type="exam",
            subject=self.subject_science,
            school_class=self.school_class,
            max_marks=100,
            assessment_date="2025-11-01",
            academic_year=self.school_class.academic_year,
            created_by=self.teacher_user,
        )
        GradeRecord.objects.create(
            student=self.student,
            assessment=assessment2,
            marks_obtained=80,
            marked_by=self.teacher_user,
        )

        self._auth(self.teacher_user)
        resp = self.client.get(reverse("grades-student-history", kwargs={"student_id": self.student.id}))

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.json()["success"])
        self.assertEqual(resp.json()["total_records"], 2)

    def test_student_report_card(self):
        """Teacher can view a student's report card."""
        assessment1 = self._create_assessment(self.teacher_user, subject=self.subject_math, max_marks=50)
        assessment2 = self._create_assessment(self.teacher_user, subject=self.subject_science, max_marks=50)

        GradeRecord.objects.create(
            student=self.student,
            assessment_id=assessment1["id"],
            marks_obtained=45,
            marked_by=self.teacher_user,
        )
        GradeRecord.objects.create(
            student=self.student,
            assessment_id=assessment2["id"],
            marks_obtained=40,
            marked_by=self.teacher_user,
        )

        self._auth(self.teacher_user)
        resp = self.client.get(reverse("grades-student-report-card", kwargs={"student_id": self.student.id}))

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.json()["success"])
        rc = resp.json()["report_card"]
        self.assertEqual(rc["student_name"], self.student.user.get_full_name())
        self.assertEqual(len(rc["subject_summaries"]), 2)
        self.assertIn("overall_percentage", rc)
        self.assertIn("overall_letter_grade", rc)


class StudentGradesTests(GradesAPITestCase):
    """Tests for student grades endpoints."""

    def test_my_grades(self):
        """Student can view their own grades."""
        assessment = self._create_assessment(self.teacher_user, max_marks=50)

        GradeRecord.objects.create(
            student=self.student,
            assessment_id=assessment["id"],
            marks_obtained=42,
            marked_by=self.teacher_user,
        )

        self._auth(self.student_user)
        resp = self.client.get(reverse("grades-my-grades"))

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.json()["success"])
        self.assertEqual(resp.json()["total_records"], 1)

    def test_my_report_card(self):
        """Student can view their own report card."""
        assessment1 = self._create_assessment(self.teacher_user, subject=self.subject_math, max_marks=50)
        assessment2 = self._create_assessment(self.teacher_user, subject=self.subject_science, max_marks=50)

        GradeRecord.objects.create(
            student=self.student,
            assessment_id=assessment1["id"],
            marks_obtained=45,
            marked_by=self.teacher_user,
        )
        GradeRecord.objects.create(
            student=self.student,
            assessment_id=assessment2["id"],
            marks_obtained=40,
            marked_by=self.teacher_user,
        )

        self._auth(self.student_user)
        resp = self.client.get(reverse("grades-my-report-card"))

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.json()["success"])
        rc = resp.json()["report_card"]
        self.assertEqual(rc["student_name"], self.student.user.get_full_name())
        self.assertEqual(len(rc["subject_summaries"]), 2)
        self.assertAlmostEqual(rc["overall_percentage"], 85.0, places=1)
        self.assertEqual(rc["overall_letter_grade"], "B")

    def test_student_cannot_access_teacher_endpoints(self):
        """Student gets 403 on teacher endpoints."""
        self._auth(self.student_user)

        resp = self.client.get(reverse("grades-assessment-list-create"))
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

        resp = self.client.post(reverse("grades-bulk-enter"), {}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


class ParentGradesTests(GradesAPITestCase):
    """Tests for parent grades endpoints."""

    def test_my_children_grades(self):
        """Parent can view all children's report cards."""
        assessment1 = self._create_assessment(self.teacher_user, subject=self.subject_math, max_marks=50)
        assessment2 = self._create_assessment(self.teacher_user, subject=self.subject_science, max_marks=50)

        GradeRecord.objects.create(
            student=self.student,
            assessment_id=assessment1["id"],
            marks_obtained=45,
            marked_by=self.teacher_user,
        )
        GradeRecord.objects.create(
            student=self.student,
            assessment_id=assessment2["id"],
            marks_obtained=40,
            marked_by=self.teacher_user,
        )

        self._auth(self.parent_user)
        resp = self.client.get(reverse("grades-my-children-grades"))

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.json()["success"])
        self.assertEqual(resp.json()["total_children"], 1)
        child = resp.json()["children"][0]
        self.assertEqual(child["student_name"], self.student.user.get_full_name())
        self.assertEqual(len(child["subject_summaries"]), 2)

    def test_parent_no_children(self):
        """Parent with no linked children gets empty list."""
        # Create parent without children
        lonely_parent = User.objects.create_user(
            username="lonelyparent", email="lonely@test.com", password="testpass123", role="parent"
        )
        ParentProfile.objects.create(user=lonely_parent, occupation="Engineer", relationship_to_child="Father")

        self._auth(lonely_parent)
        resp = self.client.get(reverse("grades-my-children-grades"))

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.json()["success"])
        self.assertEqual(resp.json()["children"], [])
        self.assertIn("message", resp.json())

    def test_parent_cannot_access_teacher_endpoints(self):
        """Parent gets 403 on teacher endpoints."""
        self._auth(self.parent_user)

        resp = self.client.get(reverse("grades-assessment-list-create"))
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

        resp = self.client.post(reverse("grades-bulk-enter"), {}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


class AdminGradesTests(GradesAPITestCase):
    """Tests for admin grades endpoints (full access)."""

    def test_admin_full_access(self):
        """Admin has full access to all grade endpoints."""
        self._auth(self.admin)

        # Create assessment
        resp = self.client.post(
            reverse("grades-assessment-list-create"),
            {
                "name": "Admin Exam",
                "assessment_type": "quiz",
                "subject": self.subject_math.id,
                "school_class": self.school_class.id,
                "max_marks": 100,
                "assessment_date": "2025-12-01",
                "academic_year": self.school_class.academic_year,
            },
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        assessment_id = resp.json()["assessment"]["id"]

        # Bulk enter grades
        resp = self.client.post(
            reverse("grades-bulk-enter"),
            {
                "assessment": assessment_id,
                "grade_list": [{"student": self.student.id, "marks_obtained": 95}],
            },
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

        # Student history
        resp = self.client.get(reverse("grades-student-history", kwargs={"student_id": self.student.id}))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        # Student report card
        resp = self.client.get(reverse("grades-student-report-card", kwargs={"student_id": self.student.id}))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)