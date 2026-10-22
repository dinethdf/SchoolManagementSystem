# apps/people/views.py
# API views for managing Students, Teachers, and Parents.
# Implemented using standard DRF Class-Based Views (APIView).

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import StudentProfile, TeacherProfile, ParentProfile
from .serializers import StudentProfileSerializer, TeacherProfileSerializer, ParentProfileSerializer
from .permissions import IsSchoolAdmin, IsTeacherOrAdmin, CanViewStudentProfile


# ==============================================================================
# STUDENT VIEWS
# ==============================================================================

class StudentListCreateView(APIView):
    """
    Endpoint: /api/people/students/
    - GET: List all enrolled students (Teachers and Admins).
           Supports filtering: ?class_id=1, ?search=Kamal
    - POST: Enroll a new student profile (Admin only).
    """

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsSchoolAdmin()]
        return [IsAuthenticated(), IsTeacherOrAdmin()]

    def get(self, request):
        students_query = StudentProfile.objects.all().select_related('user', 'enrolled_class')

        # Optional query filter: ?class_id=1
        filter_class_id = request.query_params.get('class_id')
        if filter_class_id:
            students_query = students_query.filter(enrolled_class_id=filter_class_id)

        # Optional search by admission number, username, or name
        search_query = request.query_params.get('search')
        if search_query:
            students_query = students_query.filter(
                models.Q(admission_number__icontains=search_query) |
                models.Q(user__first_name__icontains=search_query) |
                models.Q(user__last_name__icontains=search_query) |
                models.Q(user__username__icontains=search_query)
            )

        serializer = StudentProfileSerializer(students_query, many=True)
        return Response({
            'success': True,
            'total_count': students_query.count(),
            'students': serializer.data
        }, status=status.HTTP_200_OK)

    def post(self, request):
        """Enroll a new student (Admin only)."""
        serializer = StudentProfileSerializer(data=request.data)

        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Failed to enroll student. Please check input errors.',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        created_student = serializer.save()
        return Response({
            'success': True,
            'message': f"Student '{created_student.admission_number}' enrolled successfully.",
            'student': StudentProfileSerializer(created_student).data
        }, status=status.HTTP_201_CREATED)


class StudentDetailView(APIView):
    """
    Endpoint: /api/people/students/<int:student_id>/
    - GET: View a student profile (Admin, Teacher, or the Student themselves, or their Parent)
    - PATCH: Update student profile details (Admin only)
    - DELETE: Remove student profile (Admin only)
    """

    def get_permissions(self):
        if self.request.method in ['PATCH', 'PUT', 'DELETE']:
            return [IsAuthenticated(), IsSchoolAdmin()]
        return [IsAuthenticated(), CanViewStudentProfile()]

    def get_object(self, student_id):
        try:
            return StudentProfile.objects.select_related('user', 'enrolled_class').get(id=student_id)
        except StudentProfile.DoesNotExist:
            return None

    def get(self, request, student_id):
        student = self.get_object(student_id)
        if not student:
            return Response({
                'success': False,
                'error': f'Student with ID {student_id} not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        # Check object-level permission
        self.check_object_permissions(request, student)

        serializer = StudentProfileSerializer(student)
        return Response({
            'success': True,
            'student': serializer.data
        }, status=status.HTTP_200_OK)

    def patch(self, request, student_id):
        student = self.get_object(student_id)
        if not student:
            return Response({
                'success': False,
                'error': f'Student with ID {student_id} not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = StudentProfileSerializer(student, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Student update validation failed.',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        updated_student = serializer.save()
        return Response({
            'success': True,
            'message': 'Student profile updated successfully.',
            'student': StudentProfileSerializer(updated_student).data
        }, status=status.HTTP_200_OK)

    def delete(self, request, student_id):
        student = self.get_object(student_id)
        if not student:
            return Response({
                'success': False,
                'error': f'Student with ID {student_id} not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        admission_number = student.admission_number
        student.delete()
        return Response({
            'success': True,
            'message': f"Student profile '{admission_number}' deleted successfully."
        }, status=status.HTTP_200_OK)


class StudentMyProfileView(APIView):
    """
    Endpoint: GET /api/people/students/me/
    Convenience endpoint for a logged-in student to retrieve their own academic record.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'student':
            return Response({
                'success': False,
                'error': 'This endpoint is only accessible to logged-in student accounts.'
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            student_profile = request.user.student_profile
        except StudentProfile.DoesNotExist:
            return Response({
                'success': False,
                'error': 'No student profile record found for this account. Please contact admin.'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = StudentProfileSerializer(student_profile)
        return Response({
            'success': True,
            'student': serializer.data
        }, status=status.HTTP_200_OK)


# ==============================================================================
# TEACHER VIEWS
# ==============================================================================

class TeacherListCreateView(APIView):
    """
    Endpoint: /api/people/teachers/
    - GET: List all teacher profiles (Teachers and Admins)
    - POST: Create a new teacher profile (Admin only)
    """

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsSchoolAdmin()]
        return [IsAuthenticated(), IsTeacherOrAdmin()]

    def get(self, request):
        teachers = TeacherProfile.objects.all().select_related('user')
        serializer = TeacherProfileSerializer(teachers, many=True)
        return Response({
            'success': True,
            'total_count': teachers.count(),
            'teachers': serializer.data
        }, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = TeacherProfileSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Failed to create teacher profile.',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        created_teacher = serializer.save()
        return Response({
            'success': True,
            'message': f"Teacher profile '{created_teacher.employee_id}' created successfully.",
            'teacher': TeacherProfileSerializer(created_teacher).data
        }, status=status.HTTP_201_CREATED)


class TeacherDetailView(APIView):
    """
    Endpoint: /api/people/teachers/<int:teacher_id>/
    - GET: View teacher profile
    - PATCH: Update teacher profile (Admin only)
    - DELETE: Delete teacher profile (Admin only)
    """

    def get_permissions(self):
        if self.request.method in ['PATCH', 'PUT', 'DELETE']:
            return [IsAuthenticated(), IsSchoolAdmin()]
        return [IsAuthenticated(), IsTeacherOrAdmin()]

    def get_object(self, teacher_id):
        try:
            return TeacherProfile.objects.select_related('user').get(id=teacher_id)
        except TeacherProfile.DoesNotExist:
            return None

    def get(self, request, teacher_id):
        teacher = self.get_object(teacher_id)
        if not teacher:
            return Response({
                'success': False,
                'error': f'Teacher with ID {teacher_id} not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = TeacherProfileSerializer(teacher)
        return Response({'success': True, 'teacher': serializer.data}, status=status.HTTP_200_OK)

    def patch(self, request, teacher_id):
        teacher = self.get_object(teacher_id)
        if not teacher:
            return Response({
                'success': False,
                'error': f'Teacher with ID {teacher_id} not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = TeacherProfileSerializer(teacher, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Teacher update validation failed.',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        updated_teacher = serializer.save()
        return Response({
            'success': True,
            'message': 'Teacher profile updated successfully.',
            'teacher': TeacherProfileSerializer(updated_teacher).data
        }, status=status.HTTP_200_OK)

    def delete(self, request, teacher_id):
        teacher = self.get_object(teacher_id)
        if not teacher:
            return Response({
                'success': False,
                'error': f'Teacher with ID {teacher_id} not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        employee_id = teacher.employee_id
        teacher.delete()
        return Response({
            'success': True,
            'message': f"Teacher profile '{employee_id}' deleted successfully."
        }, status=status.HTTP_200_OK)


# ==============================================================================
# PARENT VIEWS
# ==============================================================================

class ParentListCreateView(APIView):
    """
    Endpoint: /api/people/parents/
    - GET: List all parent profiles (Admin only)
    - POST: Create a new parent profile (Admin only)
    """
    permission_classes = [IsAuthenticated, IsSchoolAdmin]

    def get(self, request):
        parents = ParentProfile.objects.all().select_related('user').prefetch_related('children')
        serializer = ParentProfileSerializer(parents, many=True)
        return Response({
            'success': True,
            'total_count': parents.count(),
            'parents': serializer.data
        }, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ParentProfileSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Failed to create parent profile.',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        created_parent = serializer.save()
        return Response({
            'success': True,
            'message': 'Parent profile created successfully.',
            'parent': ParentProfileSerializer(created_parent).data
        }, status=status.HTTP_201_CREATED)


class ParentDetailView(APIView):
    """
    Endpoint: /api/people/parents/<int:parent_id>/
    - GET: View parent profile (Admin or the parent themselves)
    - PATCH: Update parent profile (Admin only)
    - DELETE: Delete parent profile (Admin only)
    """

    def get_permissions(self):
        if self.request.method in ['PATCH', 'PUT', 'DELETE']:
            return [IsAuthenticated(), IsSchoolAdmin()]
        return [IsAuthenticated()]

    def get_object(self, parent_id):
        try:
            return ParentProfile.objects.select_related('user').prefetch_related('children').get(id=parent_id)
        except ParentProfile.DoesNotExist:
            return None

    def get(self, request, parent_id):
        parent = self.get_object(parent_id)
        if not parent:
            return Response({
                'success': False,
                'error': f'Parent with ID {parent_id} not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        # Allow if admin or if the user is viewing their own profile
        if request.user.role != 'admin' and not request.user.is_staff and parent.user != request.user:
            return Response({
                'success': False,
                'error': 'Permission denied. You can only view your own parent profile.'
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = ParentProfileSerializer(parent)
        return Response({'success': True, 'parent': serializer.data}, status=status.HTTP_200_OK)

    def patch(self, request, parent_id):
        parent = self.get_object(parent_id)
        if not parent:
            return Response({
                'success': False,
                'error': f'Parent with ID {parent_id} not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = ParentProfileSerializer(parent, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Parent update validation failed.',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        updated_parent = serializer.save()
        return Response({
            'success': True,
            'message': 'Parent profile updated successfully.',
            'parent': ParentProfileSerializer(updated_parent).data
        }, status=status.HTTP_200_OK)

    def delete(self, request, parent_id):
        parent = self.get_object(parent_id)
        if not parent:
            return Response({
                'success': False,
                'error': f'Parent with ID {parent_id} not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        parent.delete()
        return Response({
            'success': True,
            'message': 'Parent profile deleted successfully.'
        }, status=status.HTTP_200_OK)


class ParentMyChildrenView(APIView):
    """
    Endpoint: GET /api/people/parents/my-children/
    Convenience endpoint for a logged-in parent to see all their children's details.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'parent':
            return Response({
                'success': False,
                'error': 'This endpoint is only accessible to logged-in parent accounts.'
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            parent_profile = request.user.parent_profile
        except ParentProfile.DoesNotExist:
            return Response({
                'success': False,
                'error': 'No parent profile found for this account.'
            }, status=status.HTTP_404_NOT_FOUND)

        children = parent_profile.children.all().select_related('user', 'enrolled_class')
        serializer = StudentProfileSerializer(children, many=True)
        return Response({
            'success': True,
            'total_children': children.count(),
            'children': serializer.data
        }, status=status.HTTP_200_OK)
