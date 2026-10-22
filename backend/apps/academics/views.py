# apps/academics/views.py
# API views for managing School Classes and Subjects.
# Uses standard Class-Based Views (APIView) for simplicity and transparency.

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import SchoolClass, Subject
from .serializers import SchoolClassSerializer, SubjectSerializer
from .permissions import IsSchoolAdmin, IsTeacherOrAdmin


# ==============================================================================
# SCHOOL CLASS VIEWS
# ==============================================================================

class SchoolClassListCreateView(APIView):
    """
    Endpoint: /api/academics/classes/
    - GET: List all classes (Accessible to Teachers and Admins)
    - POST: Create a new class (Restricted to Admins only)
    """

    def get_permissions(self):
        """Allow teachers and admins to read, but only admins to create."""
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsSchoolAdmin()]
        return [IsAuthenticated(), IsTeacherOrAdmin()]

    def get(self, request):
        """Retrieve a list of all classes, with optional filtering by academic_year or grade_level."""
        classes_query = SchoolClass.objects.all().select_related('class_teacher')

        # Optional query filter: ?academic_year=2026/2027
        filter_academic_year = request.query_params.get('academic_year')
        if filter_academic_year:
            classes_query = classes_query.filter(academic_year=filter_academic_year)

        # Optional query filter: ?grade_level=10
        filter_grade_level = request.query_params.get('grade_level')
        if filter_grade_level:
            classes_query = classes_query.filter(grade_level=filter_grade_level)

        serializer = SchoolClassSerializer(classes_query, many=True)
        return Response({
            'success': True,
            'total_count': classes_query.count(),
            'classes': serializer.data
        }, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new SchoolClass record (Admin only)."""
        serializer = SchoolClassSerializer(data=request.data)

        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Failed to create class. Please check your inputs.',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        created_class = serializer.save()
        return Response({
            'success': True,
            'message': f"Class '{created_class.name}' created successfully.",
            'class': SchoolClassSerializer(created_class).data
        }, status=status.HTTP_201_CREATED)


class SchoolClassDetailView(APIView):
    """
    Endpoint: /api/academics/classes/<int:class_id>/
    - GET: Retrieve details of a single class
    - PUT/PATCH: Update a class (Admin only)
    - DELETE: Remove a class (Admin only)
    """

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated(), IsTeacherOrAdmin()]
        return [IsAuthenticated(), IsSchoolAdmin()]

    def get_object(self, class_id):
        """Helper to find a class by ID or return None if not found."""
        try:
            return SchoolClass.objects.select_related('class_teacher').get(id=class_id)
        except SchoolClass.DoesNotExist:
            return None

    def get(self, request, class_id):
        """View a specific class details."""
        school_class = self.get_object(class_id)
        if not school_class:
            return Response({
                'success': False,
                'error': f'Class with ID {class_id} not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = SchoolClassSerializer(school_class)
        return Response({
            'success': True,
            'class': serializer.data
        }, status=status.HTTP_200_OK)

    def patch(self, request, class_id):
        """Partially update class details (Admin only)."""
        school_class = self.get_object(class_id)
        if not school_class:
            return Response({
                'success': False,
                'error': f'Class with ID {class_id} not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = SchoolClassSerializer(school_class, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Class update validation failed.',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        updated_class = serializer.save()
        return Response({
            'success': True,
            'message': f"Class '{updated_class.name}' updated successfully.",
            'class': SchoolClassSerializer(updated_class).data
        }, status=status.HTTP_200_OK)

    def delete(self, request, class_id):
        """Delete a class from the system (Admin only)."""
        school_class = self.get_object(class_id)
        if not school_class:
            return Response({
                'success': False,
                'error': f'Class with ID {class_id} not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        class_name = school_class.name
        school_class.delete()
        return Response({
            'success': True,
            'message': f"Class '{class_name}' deleted successfully."
        }, status=status.HTTP_200_OK)


# ==============================================================================
# SUBJECT VIEWS
# ==============================================================================

class SubjectListCreateView(APIView):
    """
    Endpoint: /api/academics/subjects/
    - GET: List all subjects (Teachers and Admins)
    - POST: Create a new subject (Admin only)
    """

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsSchoolAdmin()]
        return [IsAuthenticated(), IsTeacherOrAdmin()]

    def get(self, request):
        """List all subjects, with optional filtering by school_class_id or teacher_id."""
        subjects_query = Subject.objects.all().select_related('school_class', 'teacher')

        # Optional query filter: ?class_id=1
        filter_class_id = request.query_params.get('class_id')
        if filter_class_id:
            subjects_query = subjects_query.filter(school_class_id=filter_class_id)

        # Optional query filter: ?teacher_id=3
        filter_teacher_id = request.query_params.get('teacher_id')
        if filter_teacher_id:
            subjects_query = subjects_query.filter(teacher_id=filter_teacher_id)

        serializer = SubjectSerializer(subjects_query, many=True)
        return Response({
            'success': True,
            'total_count': subjects_query.count(),
            'subjects': serializer.data
        }, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new subject assigned to a class (Admin only)."""
        serializer = SubjectSerializer(data=request.data)

        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Failed to create subject. Please check your inputs.',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        created_subject = serializer.save()
        return Response({
            'success': True,
            'message': f"Subject '{created_subject.name}' ({created_subject.code}) created successfully.",
            'subject': SubjectSerializer(created_subject).data
        }, status=status.HTTP_201_CREATED)


class SubjectDetailView(APIView):
    """
    Endpoint: /api/academics/subjects/<int:subject_id>/
    - GET: Retrieve a specific subject's details
    - PUT/PATCH: Update a subject (Admin only)
    - DELETE: Delete a subject (Admin only)
    """

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated(), IsTeacherOrAdmin()]
        return [IsAuthenticated(), IsSchoolAdmin()]

    def get_object(self, subject_id):
        try:
            return Subject.objects.select_related('school_class', 'teacher').get(id=subject_id)
        except Subject.DoesNotExist:
            return None

    def get(self, request, subject_id):
        subject = self.get_object(subject_id)
        if not subject:
            return Response({
                'success': False,
                'error': f'Subject with ID {subject_id} not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = SubjectSerializer(subject)
        return Response({
            'success': True,
            'subject': serializer.data
        }, status=status.HTTP_200_OK)

    def patch(self, request, subject_id):
        subject = self.get_object(subject_id)
        if not subject:
            return Response({
                'success': False,
                'error': f'Subject with ID {subject_id} not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = SubjectSerializer(subject, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Subject update validation failed.',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        updated_subject = serializer.save()
        return Response({
            'success': True,
            'message': f"Subject '{updated_subject.name}' updated successfully.",
            'subject': SubjectSerializer(updated_subject).data
        }, status=status.HTTP_200_OK)

    def delete(self, request, subject_id):
        subject = self.get_object(subject_id)
        if not subject:
            return Response({
                'success': False,
                'error': f'Subject with ID {subject_id} not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        subject_name = subject.name
        subject.delete()
        return Response({
            'success': True,
            'message': f"Subject '{subject_name}' deleted successfully."
        }, status=status.HTTP_200_OK)


class ClassSubjectsListView(APIView):
    """
    Endpoint: /api/academics/classes/<int:class_id>/subjects/
    Returns all subjects taught inside a specific school class.
    """
    permission_classes = [IsAuthenticated, IsTeacherOrAdmin]

    def get(self, request, class_id):
        # Verify the class exists
        try:
            school_class = SchoolClass.objects.get(id=class_id)
        except SchoolClass.DoesNotExist:
            return Response({
                'success': False,
                'error': f'Class with ID {class_id} not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        # Retrieve subjects belonging to this class
        class_subjects = Subject.objects.filter(school_class=school_class).select_related('teacher')
        serializer = SubjectSerializer(class_subjects, many=True)

        return Response({
            'success': True,
            'class_id': school_class.id,
            'class_name': school_class.name,
            'academic_year': school_class.academic_year,
            'total_subjects': class_subjects.count(),
            'subjects': serializer.data
        }, status=status.HTTP_200_OK)
