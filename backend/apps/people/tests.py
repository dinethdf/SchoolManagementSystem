# apps/people/tests.py
# Unit and integration tests for the People app (Students, Teachers, and Parents).
# Run tests using: python manage.py test apps.people

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

from apps.academics.models import SchoolClass
from .models import StudentProfile, TeacherProfile, ParentProfile

User = get_user_model()


class PeopleAPITests(APITestCase):
    """
    Test suite for Student, Teacher, and Parent profile endpoints.
    Verifies that:
    1. Admins can enroll students and assign them to classes.
    2. Students can view their own profile via /api/people/students/me/.
    3. Teachers can view student lists.
    4. Parents can view their children via /api/people/parents/my-children/.
    5. Permissions are strictly enforced for unauthorized access.
    """

    def setUp(self):
        """Set up test users and seed data."""
        # 1. Create Admin
        self.admin_user = User.objects.create_user(
            username='admin_person',
            email='admin@school.lk',
            password='Password123!',
            role='admin'
        )

        # 2. Create Teacher User & Profile
        self.teacher_user = User.objects.create_user(
            username='teacher_person',
            email='teacher@school.lk',
            password='Password123!',
            first_name='Amal',
            last_name='Perera',
            role='teacher'
        )
        self.teacher_profile = TeacherProfile.objects.create(
            user=self.teacher_user,
            employee_id='TCH-001',
            qualification='B.Sc. Mathematics',
            joining_date='2020-01-10',
            department='Mathematics'
        )

        # 3. Create Class
        self.test_class = SchoolClass.objects.create(
            name='Grade 10-A',
            grade_level=10,
            section='A',
            academic_year='2026/2027',
            class_teacher=self.teacher_user
        )

        # 4. Create Student User & Profile
        self.student_user = User.objects.create_user(
            username='student_person',
            email='student@school.lk',
            password='Password123!',
            first_name='Kasun',
            last_name='Silva',
            role='student'
        )
        self.student_profile = StudentProfile.objects.create(
            user=self.student_user,
            admission_number='STU-2026-001',
            enrolled_class=self.test_class,
            roll_number=1,
            admission_date='2026-01-15',
            blood_group='O+'
        )

        # 5. Create Parent User & Profile linked to student
        self.parent_user = User.objects.create_user(
            username='parent_person',
            email='parent@school.lk',
            password='Password123!',
            first_name='Sunil',
            last_name='Silva',
            role='parent'
        )
        self.parent_profile = ParentProfile.objects.create(
            user=self.parent_user,
            occupation='Accountant',
            relationship_to_child='Father'
        )
        self.parent_profile.children.add(self.student_profile)

        # URLs
        self.students_list_url = reverse('student-list-create')
        self.student_me_url = reverse('student-my-profile')
        self.student_detail_url = reverse('student-detail', kwargs={'student_id': self.student_profile.id})
        self.teachers_list_url = reverse('teacher-list-create')
        self.parent_my_children_url = reverse('parent-my-children')

    # =========================================================================
    # STUDENT PROFILE TESTS
    # =========================================================================

    def test_admin_can_enroll_new_student(self):
        """Admin can enroll a newly registered student user."""
        self.client.force_authenticate(user=self.admin_user)

        # Create a fresh student user account
        new_student_user = User.objects.create_user(
            username='fresh_student',
            email='fresh@school.lk',
            password='Password123!',
            role='student'
        )

        payload = {
            'user_id': new_student_user.id,
            'admission_number': 'stu-2026-002',  # should uppercase to STU-2026-002
            'enrolled_class_id': self.test_class.id,
            'admission_date': '2026-02-01',
            'blood_group': 'B+'
        }

        response = self.client.post(self.students_list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['student']['admission_number'], 'STU-2026-002')

    def test_student_can_view_own_profile(self):
        """Logged-in student can retrieve their own academic profile."""
        self.client.force_authenticate(user=self.student_user)

        response = self.client.get(self.student_me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['student']['admission_number'], 'STU-2026-001')
        self.assertEqual(response.data['student']['enrolled_class']['name'], 'Grade 10-A')

    def test_teacher_can_view_student_list(self):
        """Teachers can view list of all students."""
        self.client.force_authenticate(user=self.teacher_user)

        response = self.client.get(self.students_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertGreaterEqual(response.data['total_count'], 1)

    def test_student_cannot_view_other_student_profile(self):
        """A student should be blocked from viewing another student's detail page."""
        # Create second student
        second_student_user = User.objects.create_user(
            username='other_student',
            email='other@school.lk',
            password='Password123!',
            role='student'
        )

        # Authenticate as second student
        self.client.force_authenticate(user=second_student_user)

        # Try to view first student's detail
        response = self.client.get(self.student_detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # =========================================================================
    # PARENT TESTS
    # =========================================================================

    def test_parent_can_view_their_children(self):
        """Logged-in parent can see all their registered children."""
        self.client.force_authenticate(user=self.parent_user)

        response = self.client.get(self.parent_my_children_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['total_children'], 1)
        self.assertEqual(response.data['children'][0]['admission_number'], 'STU-2026-001')

    def test_teacher_list_view(self):
        """Teachers and Admins can view teacher faculty list."""
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.get(self.teachers_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertGreaterEqual(response.data['total_count'], 1)
