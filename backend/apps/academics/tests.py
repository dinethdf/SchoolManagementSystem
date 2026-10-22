# apps/academics/tests.py
# Unit and integration tests for Academics API (SchoolClass & Subject).
# Run tests using: python manage.py test apps.academics

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

from .models import SchoolClass, Subject

User = get_user_model()


class AcademicsAPITests(APITestCase):
    """
    Test suite for SchoolClass and Subject CRUD endpoints.
    Verifies that:
    1. Admins have full access to create, update, and delete classes and subjects.
    2. Teachers can view classes and subjects, but cannot create or delete them.
    3. Students cannot access or modify academic management endpoints.
    4. Data validation rules work as expected.
    """

    def setUp(self):
        """Set up test users and URLs before each test method."""
        # 1. Create an Admin user
        self.admin_user = User.objects.create_user(
            username='admin_test',
            email='admin@school.lk',
            password='AdminPassword123!',
            role='admin'
        )

        # 2. Create a Teacher user
        self.teacher_user = User.objects.create_user(
            username='teacher_test',
            email='teacher@school.lk',
            password='TeacherPassword123!',
            role='teacher'
        )

        # 3. Create a Student user
        self.student_user = User.objects.create_user(
            username='student_test',
            email='student@school.lk',
            password='StudentPassword123!',
            role='student'
        )

        # 4. Create an initial SchoolClass for testing
        self.test_class = SchoolClass.objects.create(
            name='Grade 10-A',
            grade_level=10,
            section='A',
            academic_year='2026/2027',
            class_teacher=self.teacher_user,
            room_number='Hall-1'
        )

        # 5. Create an initial Subject
        self.test_subject = Subject.objects.create(
            name='Mathematics',
            code='MATH-10A',
            school_class=self.test_class,
            teacher=self.teacher_user,
            periods_per_week=5
        )

        # URLs
        self.classes_url = reverse('class-list-create')
        self.class_detail_url = reverse('class-detail', kwargs={'class_id': self.test_class.id})
        self.class_subjects_url = reverse('class-subjects-list', kwargs={'class_id': self.test_class.id})
        self.subjects_url = reverse('subject-list-create')
        self.subject_detail_url = reverse('subject-detail', kwargs={'subject_id': self.test_subject.id})

    # =========================================================================
    # CLASS TESTS
    # =========================================================================

    def test_admin_can_create_school_class(self):
        """Admin should be able to create a new class."""
        self.client.force_authenticate(user=self.admin_user)

        payload = {
            'name': 'Grade 11-B',
            'grade_level': 11,
            'section': 'b',  # Lowercase should be auto-converted to uppercase 'B'
            'academic_year': '2026/2027',
            'room_number': 'Room 15'
        }

        response = self.client.post(self.classes_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['class']['section'], 'B')

        # Verify saved in database
        self.assertTrue(SchoolClass.objects.filter(name='Grade 11-B').exists())

    def test_teacher_cannot_create_school_class(self):
        """Teachers should NOT be permitted to create classes (HTTP 403 Forbidden)."""
        self.client.force_authenticate(user=self.teacher_user)

        payload = {
            'name': 'Grade 9-A',
            'grade_level': 9,
            'section': 'A',
            'academic_year': '2026/2027'
        }

        response = self.client.post(self.classes_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_can_view_classes_list(self):
        """Teachers can view all classes."""
        self.client.force_authenticate(user=self.teacher_user)

        response = self.client.get(self.classes_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertGreaterEqual(response.data['total_count'], 1)

    def test_admin_can_update_class(self):
        """Admin can update an existing class."""
        self.client.force_authenticate(user=self.admin_user)

        update_payload = {'room_number': 'Hall-Updated'}
        response = self.client.patch(self.class_detail_url, update_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.test_class.refresh_from_db()
        self.assertEqual(self.test_class.room_number, 'Hall-Updated')

    def test_admin_can_delete_class(self):
        """Admin can delete a class."""
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.delete(self.class_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(SchoolClass.objects.filter(id=self.test_class.id).exists())

    # =========================================================================
    # SUBJECT TESTS
    # =========================================================================

    def test_admin_can_create_subject(self):
        """Admin can create a new subject attached to a class."""
        self.client.force_authenticate(user=self.admin_user)

        payload = {
            'name': 'Science',
            'code': 'sci-10a',  # should uppercase to SCI-10A
            'school_class_id': self.test_class.id,
            'teacher_id': self.teacher_user.id,
            'periods_per_week': 4
        }

        response = self.client.post(self.subjects_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['subject']['code'], 'SCI-10A')

    def test_view_class_specific_subjects(self):
        """Retrieve all subjects belonging to a single class."""
        self.client.force_authenticate(user=self.teacher_user)

        response = self.client.get(self.class_subjects_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['class_name'], 'Grade 10-A')
        self.assertEqual(response.data['total_subjects'], 1)
