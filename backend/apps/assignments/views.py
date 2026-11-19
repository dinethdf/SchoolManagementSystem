# apps/assignments/views.py
# This file contains all API views for the Assignments & Homework system.
# Follows standard Django REST Framework class-based views with explicit error handling and comments.

from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Assignment, Submission
from .serializers import (
    AssignmentSerializer,
    SubmissionSerializer,
    StudentSubmitSerializer,
    TeacherGradeSerializer,
)
from .permissions import IsTeacherOrAdmin, IsStudent, IsParent
from apps.people.models import StudentProfile, ParentProfile


# ==============================================================================
# Teacher & Admin Views
# ==============================================================================

class AssignmentListCreateView(APIView):
    """
    GET  /api/assignments/       -> List assignments (optionally filter by class or subject)
    POST /api/assignments/       -> Create a new assignment and initialize pending submissions
    """
    permission_classes = [IsTeacherOrAdmin]

    def get(self, request):
        """Return list of assignments. Can be filtered by class_id or subject_id."""
        assignments_query = Assignment.objects.all().select_related(
            'subject', 'school_class', 'assigned_by'
        ).order_by('-due_date')

        # Optional filter by class ID
        class_id = request.query_params.get('class_id')
        if class_id:
            assignments_query = assignments_query.filter(school_class_id=class_id)

        # Optional filter by subject ID
        subject_id = request.query_params.get('subject_id')
        if subject_id:
            assignments_query = assignments_query.filter(subject_id=subject_id)

        serializer = AssignmentSerializer(assignments_query, many=True)
        serialized_data = serializer.data

        return Response({
            'success': True,
            'total_count': len(serialized_data),
            'data': serialized_data,
            'assignments': serialized_data,
        }, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new assignment and auto-create pending submissions for students in the class."""
        serializer = AssignmentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors,
            }, status=status.HTTP_400_BAD_REQUEST)

        # Save assignment with the logged-in teacher as assigned_by
        new_assignment = serializer.save(assigned_by=request.user)

        # Auto-create pending submission records for every student enrolled in this class
        enrolled_students = StudentProfile.objects.filter(
            enrolled_class=new_assignment.school_class
        )
        for student_profile in enrolled_students:
            Submission.objects.get_or_create(
                assignment=new_assignment,
                student=student_profile,
                defaults={'status': Submission.STATUS_PENDING}
            )

        saved_data = AssignmentSerializer(new_assignment).data
        return Response({
            'success': True,
            'message': f"Assignment '{new_assignment.title}' created successfully.",
            'data': saved_data,
            'assignment': saved_data,
        }, status=status.HTTP_201_CREATED)


class AssignmentDetailView(APIView):
    """
    GET    /api/assignments/<id>/ -> Retrieve single assignment detail
    PUT    /api/assignments/<id>/ -> Update an existing assignment
    DELETE /api/assignments/<id>/ -> Soft-delete / deactivate an assignment
    """
    permission_classes = [IsTeacherOrAdmin]

    def get(self, request, assignment_id):
        """Fetch details of a single assignment by ID."""
        try:
            assignment_instance = Assignment.objects.select_related(
                'subject', 'school_class', 'assigned_by'
            ).get(id=assignment_id)
        except Assignment.DoesNotExist:
            return Response({
                'success': False,
                'error': f"Assignment with ID {assignment_id} not found."
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = AssignmentSerializer(assignment_instance)
        return Response({
            'success': True,
            'data': serializer.data,
            'assignment': serializer.data,
        }, status=status.HTTP_200_OK)

    def put(self, request, assignment_id):
        """Update assignment fields."""
        try:
            assignment_instance = Assignment.objects.get(id=assignment_id)
        except Assignment.DoesNotExist:
            return Response({
                'success': False,
                'error': f"Assignment with ID {assignment_id} not found."
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = AssignmentSerializer(assignment_instance, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        updated_assignment = serializer.save()
        saved_data = AssignmentSerializer(updated_assignment).data
        return Response({
            'success': True,
            'message': "Assignment updated successfully.",
            'data': saved_data,
            'assignment': saved_data,
        }, status=status.HTTP_200_OK)

    def delete(self, request, assignment_id):
        """Deactivate or remove an assignment."""
        try:
            assignment_instance = Assignment.objects.get(id=assignment_id)
        except Assignment.DoesNotExist:
            return Response({
                'success': False,
                'error': f"Assignment with ID {assignment_id} not found."
            }, status=status.HTTP_404_NOT_FOUND)

        # Soft delete by marking as inactive
        assignment_instance.is_active = False
        assignment_instance.save()

        return Response({
            'success': True,
            'message': f"Assignment '{assignment_instance.title}' has been archived."
        }, status=status.HTTP_200_OK)


class AssignmentSubmissionsView(APIView):
    """
    GET /api/assignments/<assignment_id>/submissions/
    Returns the list of all student submissions for a specific assignment.
    """
    permission_classes = [IsTeacherOrAdmin]

    def get(self, request, assignment_id):
        """Fetch all submissions for this assignment."""
        try:
            assignment_instance = Assignment.objects.get(id=assignment_id)
        except Assignment.DoesNotExist:
            return Response({
                'success': False,
                'error': f"Assignment with ID {assignment_id} not found."
            }, status=status.HTTP_404_NOT_FOUND)

        # Retrieve all student submissions linked to this assignment
        submissions_query = Submission.objects.filter(
            assignment=assignment_instance
        ).select_related('student__user', 'assignment__subject', 'graded_by').order_by('student__admission_number')

        serializer = SubmissionSerializer(submissions_query, many=True)
        serialized_submissions = serializer.data

        return Response({
            'success': True,
            'assignment_title': assignment_instance.title,
            'max_marks': assignment_instance.max_marks,
            'total_count': len(serialized_submissions),
            'data': serialized_submissions,
            'submissions': serialized_submissions,
        }, status=status.HTTP_200_OK)


class GradeSubmissionView(APIView):
    """
    POST /api/assignments/<assignment_id>/grade/<submission_id>/
    Allows a teacher to grade a student's submission and enter feedback.
    """
    permission_classes = [IsTeacherOrAdmin]

    def post(self, request, assignment_id, submission_id):
        """Validate marks and save the teacher's grading and remarks."""
        try:
            submission_instance = Submission.objects.select_related('assignment', 'student__user').get(
                id=submission_id,
                assignment_id=assignment_id
            )
        except Submission.DoesNotExist:
            return Response({
                'success': False,
                'error': "Submission not found for this assignment."
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = TeacherGradeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        marks_obtained = serializer.validated_data['marks_obtained']
        teacher_feedback = serializer.validated_data.get('teacher_feedback', "")

        # Verify that marks do not exceed the assignment's max marks
        if marks_obtained > submission_instance.assignment.max_marks:
            return Response({
                'success': False,
                'error': f"Marks ({marks_obtained}) cannot exceed maximum allowed ({submission_instance.assignment.max_marks})."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Update the submission record
        submission_instance.marks_obtained = marks_obtained
        submission_instance.teacher_feedback = teacher_feedback
        submission_instance.status = Submission.STATUS_GRADED
        submission_instance.graded_at = timezone.now()
        submission_instance.graded_by = request.user
        submission_instance.save()

        saved_data = SubmissionSerializer(submission_instance).data
        return Response({
            'success': True,
            'message': "Submission graded successfully.",
            'data': saved_data,
            'submission': saved_data,
        }, status=status.HTTP_200_OK)


# ==============================================================================
# Student Portal Views
# ==============================================================================

class StudentMyAssignmentsView(APIView):
    """
    GET /api/assignments/my-assignments/
    Returns all assignments for the currently logged-in student's class,
    along with the student's submission status, marks, and feedback.
    """
    permission_classes = [IsStudent]

    def get(self, request):
        """Fetch all assignments applicable to the logged-in student."""
        try:
            student_profile = request.user.student_profile
        except StudentProfile.DoesNotExist:
            return Response({
                'success': False,
                'error': "No student profile linked to this account."
            }, status=status.HTTP_404_NOT_FOUND)

        if not student_profile.enrolled_class:
            return Response({
                'success': True,
                'total_count': 0,
                'data': [],
                'assignments': [],
            }, status=status.HTTP_200_OK)

        # Fetch all active assignments for student's class
        assignments_query = Assignment.objects.filter(
            school_class=student_profile.enrolled_class,
            is_active=True
        ).select_related('subject', 'school_class', 'assigned_by').order_by('-due_date')

        # Build list containing assignment details and student's personal submission status
        assignments_list = []
        for current_assignment in assignments_query:
            # Find or initialize submission record for this student
            submission_record, was_created = Submission.objects.get_or_create(
                assignment=current_assignment,
                student=student_profile,
                defaults={'status': Submission.STATUS_PENDING}
            )

            # Check if overdue and still pending
            is_overdue = False
            today_date = timezone.now().date()
            if current_assignment.due_date < today_date and submission_record.status == Submission.STATUS_PENDING:
                is_overdue = True

            teacher_name = "Not Assigned"
            if current_assignment.assigned_by:
                teacher_name = current_assignment.assigned_by.get_full_name() or current_assignment.assigned_by.username

            assignment_item = {
                'id': current_assignment.id,
                'title': current_assignment.title,
                'description': current_assignment.description,
                'subject_name': current_assignment.subject.name,
                'class_name': current_assignment.school_class.name,
                'assigned_by_name': teacher_name,
                'due_date': current_assignment.due_date,
                'max_marks': current_assignment.max_marks,
                'assignment_type': current_assignment.assignment_type,
                'is_overdue': is_overdue,
                # Submission details
                'submission_id': submission_record.id,
                'submission_status': submission_record.status,
                'submission_text': submission_record.submission_text,
                'submitted_at': submission_record.submitted_at,
                'marks_obtained': submission_record.marks_obtained,
                'teacher_feedback': submission_record.teacher_feedback,
                'graded_at': submission_record.graded_at,
            }
            assignments_list.append(assignment_item)

        return Response({
            'success': True,
            'total_count': len(assignments_list),
            'data': assignments_list,
            'assignments': assignments_list,
        }, status=status.HTTP_200_OK)


class StudentSubmitView(APIView):
    """
    POST /api/assignments/<assignment_id>/submit/
    Enables a student to submit their answer text for an assignment.
    """
    permission_classes = [IsStudent]

    def post(self, request, assignment_id):
        """Process student homework submission."""
        try:
            student_profile = request.user.student_profile
        except StudentProfile.DoesNotExist:
            return Response({
                'success': False,
                'error': "No student profile linked to this account."
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            assignment_instance = Assignment.objects.get(id=assignment_id, is_active=True)
        except Assignment.DoesNotExist:
            return Response({
                'success': False,
                'error': f"Assignment with ID {assignment_id} not found or is closed."
            }, status=status.HTTP_404_NOT_FOUND)

        # Validate input
        serializer = StudentSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        answer_text = serializer.validated_data['submission_text']

        # Determine if turned in late
        submission_now = timezone.now()
        submission_status = Submission.STATUS_SUBMITTED
        if submission_now.date() > assignment_instance.due_date:
            submission_status = Submission.STATUS_LATE

        # Get existing submission or create new
        submission_record, was_created = Submission.objects.get_or_create(
            assignment=assignment_instance,
            student=student_profile
        )

        submission_record.submission_text = answer_text
        submission_record.status = submission_status
        submission_record.submitted_at = submission_now
        submission_record.save()

        saved_data = SubmissionSerializer(submission_record).data
        return Response({
            'success': True,
            'message': "Assignment submitted successfully!",
            'data': saved_data,
            'submission': saved_data,
        }, status=status.HTTP_200_OK)


# ==============================================================================
# Parent Portal Views
# ==============================================================================

class ParentChildAssignmentsView(APIView):
    """
    GET /api/assignments/my-children/
    Enables parents to track assignments and submissions for all their linked children.
    """
    permission_classes = [IsParent]

    def get(self, request):
        """Fetch all assignments for children linked to this parent."""
        try:
            parent_profile = request.user.parent_profile
        except ParentProfile.DoesNotExist:
            return Response({
                'success': False,
                'error': "No parent profile found for this account."
            }, status=status.HTTP_404_NOT_FOUND)

        # Retrieve all linked children
        linked_children = parent_profile.children.all().select_related('user', 'enrolled_class')

        children_report = []
        for child in linked_children:
            child_name = child.user.get_full_name() or child.user.username
            class_name = child.enrolled_class.name if child.enrolled_class else "No Class"

            child_assignments_list = []
            if child.enrolled_class:
                assignments_for_child = Assignment.objects.filter(
                    school_class=child.enrolled_class,
                    is_active=True
                ).select_related('subject', 'assigned_by').order_by('-due_date')

                for current_assignment in assignments_for_child:
                    submission_record, was_created = Submission.objects.get_or_create(
                        assignment=current_assignment,
                        student=child,
                        defaults={'status': Submission.STATUS_PENDING}
                    )

                    today_date = timezone.now().date()
                    is_overdue = (
                        current_assignment.due_date < today_date
                        and submission_record.status == Submission.STATUS_PENDING
                    )

                    item = {
                        'assignment_id': current_assignment.id,
                        'title': current_assignment.title,
                        'description': current_assignment.description,
                        'subject_name': current_assignment.subject.name,
                        'due_date': current_assignment.due_date,
                        'max_marks': current_assignment.max_marks,
                        'is_overdue': is_overdue,
                        'status': submission_record.status,
                        'marks_obtained': submission_record.marks_obtained,
                        'teacher_feedback': submission_record.teacher_feedback,
                        'submitted_at': submission_record.submitted_at,
                    }
                    child_assignments_list.append(item)

            children_report.append({
                'student_id': child.id,
                'student_name': child_name,
                'admission_number': child.admission_number,
                'class_name': class_name,
                'total_assignments': len(child_assignments_list),
                'assignments': child_assignments_list,
            })

        return Response({
            'success': True,
            'data': children_report,
            'children': children_report,
        }, status=status.HTTP_200_OK)
