# apps/grades/views.py
# This file contains all API views for the Grades and Results system.
# Each view class handles one API endpoint.

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Assessment, GradeRecord
from .serializers import (
    AssessmentSerializer,
    GradeRecordSerializer,
    BulkGradeRecordSerializer,
    ReportCardSerializer,
)
from apps.attendance.permissions import IsTeacherOrAdmin, IsStudent, IsParent
from apps.academics.models import SchoolClass, Subject
from apps.people.models import StudentProfile, ParentProfile


# ==============================================================================
# Helper Function
# ==============================================================================

def calculate_letter_grade_from_percentage(percentage):
    """
    Given a percentage value (0-100), return the corresponding letter grade.
    This is used to calculate the overall letter grade in report cards.

    Grading Scale:
      90%+ → A
      80-89% → B
      70-79% → C
      60-69% → D
      Below 60% → F
    """
    if percentage >= 90:
        return 'A'
    elif percentage >= 80:
        return 'B'
    elif percentage >= 70:
        return 'C'
    elif percentage >= 60:
        return 'D'
    else:
        return 'F'


# ==============================================================================
# Assessment Views (Teacher / Admin)
# ==============================================================================

class AssessmentListCreateView(APIView):
    """
    GET  /api/grades/assessments/       → List all assessments
    POST /api/grades/assessments/       → Create a new assessment

    Teachers and admins use this to:
      - GET:  See all assessments they have created
      - POST: Add a new exam, quiz, or assignment

    Permissions: Teachers and Admins only.
    """
    permission_classes = [IsTeacherOrAdmin]

    def get(self, request):
        """Return the list of all assessments, newest first."""
        all_assessments = Assessment.objects.all().select_related(
            'subject', 'school_class', 'created_by'
        ).order_by('-assessment_date')

        serializer = AssessmentSerializer(all_assessments, many=True)

        return Response({
            'success': True,
            'total_count': all_assessments.count(),
            'assessments': serializer.data,
        }, status=status.HTTP_200_OK)

    def post(self, request):
        """Create a new assessment record."""
        # Validate the incoming data
        serializer = AssessmentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Save the assessment, setting created_by to the currently logged-in teacher
        new_assessment = serializer.save(created_by=request.user)

        return Response({
            'success': True,
            'message': f"Assessment '{new_assessment.name}' created successfully.",
            'assessment': AssessmentSerializer(new_assessment).data,
        }, status=status.HTTP_201_CREATED)


class AssessmentDetailView(APIView):
    """
    GET /api/grades/assessments/<assessment_id>/

    Returns the full details for a single assessment.
    Permissions: Teachers and Admins only.
    """
    permission_classes = [IsTeacherOrAdmin]

    def get(self, request, assessment_id):
        """Return details for one assessment."""
        # Try to find the assessment in the database
        try:
            assessment_object = Assessment.objects.select_related(
                'subject', 'school_class', 'created_by'
            ).get(id=assessment_id)
        except Assessment.DoesNotExist:
            return Response(
                {'success': False, 'error': f'Assessment with ID {assessment_id} not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = AssessmentSerializer(assessment_object)

        return Response({
            'success': True,
            'assessment': serializer.data,
        }, status=status.HTTP_200_OK)


# ==============================================================================
# Grade Record Views (Teacher / Admin)
# ==============================================================================

class BulkEnterGradesView(APIView):
    """
    POST /api/grades/records/bulk/

    Allows a teacher to enter marks for all students in an assessment at once.
    The teacher submits a list of student IDs and their marks.

    Permissions: Teachers and Admins only.
    """
    permission_classes = [IsTeacherOrAdmin]

    def post(self, request):
        """Handle the bulk grade entry submission."""
        # Step 1: Validate the incoming data
        serializer = BulkGradeRecordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Step 2: Extract validated values
        validated_data = serializer.validated_data
        assessment_id = validated_data['assessment']
        grade_list = validated_data['grade_list']

        # Step 3: Verify the assessment exists
        try:
            assessment_object = Assessment.objects.get(id=assessment_id)
        except Assessment.DoesNotExist:
            return Response(
                {'success': False, 'error': f'Assessment with ID {assessment_id} not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Step 4: Process each student's grade entry
        saved_records = []
        error_messages = []

        for single_entry in grade_list:
            student_id = single_entry['student']
            marks_value = single_entry['marks_obtained']
            teacher_remarks = single_entry.get('remarks', '')

            # Validate that marks do not exceed the maximum
            if float(marks_value) > float(assessment_object.max_marks):
                error_messages.append(
                    f'Student ID {student_id}: marks {marks_value} exceed '
                    f'max marks {assessment_object.max_marks}.'
                )
                continue

            # Try to find the student
            try:
                student_object = StudentProfile.objects.get(id=student_id)
            except StudentProfile.DoesNotExist:
                error_messages.append(f'Student with ID {student_id} not found.')
                continue

            # Use update_or_create so re-submitting grades updates existing records
            grade_record, was_created = GradeRecord.objects.update_or_create(
                assessment=assessment_object,
                student=student_object,
                defaults={
                    'marks_obtained': marks_value,
                    'remarks': teacher_remarks,
                    'marked_by': request.user,
                }
            )
            # Note: letter_grade is auto-calculated in GradeRecord.save()

            saved_records.append(grade_record.id)

        return Response({
            'success': True,
            'message': f'Grades recorded for {len(saved_records)} students.',
            'records_saved': len(saved_records),
            'errors': error_messages,
        }, status=status.HTTP_201_CREATED)


class StudentGradeHistoryView(APIView):
    """
    GET /api/grades/student/<student_id>/

    Returns all grade records for a specific student.
    Used by teachers and admins to review a student's full academic performance.

    Permissions: Teachers and Admins only.
    """
    permission_classes = [IsTeacherOrAdmin]

    def get(self, request, student_id):
        """Return all grade records for a specific student."""
        # Verify the student exists
        try:
            student_object = StudentProfile.objects.get(id=student_id)
        except StudentProfile.DoesNotExist:
            return Response(
                {'success': False, 'error': f'Student with ID {student_id} not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Fetch all grade records for this student
        grade_records = GradeRecord.objects.filter(
            student=student_object
        ).select_related('assessment', 'assessment__subject', 'assessment__school_class', 'marked_by')

        serializer = GradeRecordSerializer(grade_records, many=True)

        return Response({
            'success': True,
            'student_name': student_object.user.get_full_name() or student_object.user.username,
            'total_records': grade_records.count(),
            'grades': serializer.data,
        }, status=status.HTTP_200_OK)


class StudentReportCardView(APIView):
    """
    GET /api/grades/student/<student_id>/report-card/

    Returns an aggregated report card for a specific student.
    Shows per-subject averages and an overall GPA/letter grade.

    Permissions: Teachers and Admins only.
    """
    permission_classes = [IsTeacherOrAdmin]

    def get(self, request, student_id):
        """Return the full report card for a specific student."""
        # Verify the student exists
        try:
            student_object = StudentProfile.objects.select_related(
                'user', 'enrolled_class'
            ).get(id=student_id)
        except StudentProfile.DoesNotExist:
            return Response(
                {'success': False, 'error': f'Student with ID {student_id} not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Build the report card using our helper function
        report_card_data = build_report_card(student_object)

        return Response({
            'success': True,
            'report_card': report_card_data,
        }, status=status.HTTP_200_OK)


# ==============================================================================
# Student Views (own grades)
# ==============================================================================

class MyGradesView(APIView):
    """
    GET /api/grades/my-grades/

    Returns all grade records for the currently logged-in student.
    Students can only see their own grades.

    Permissions: Students only.
    """
    permission_classes = [IsStudent]

    def get(self, request):
        """Return all grades for the current student."""
        # Find the student profile linked to this user
        try:
            student_profile = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response(
                {'success': False, 'error': 'No student profile found for your account.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Fetch all grade records
        grade_records = GradeRecord.objects.filter(
            student=student_profile
        ).select_related('assessment', 'assessment__subject', 'assessment__school_class')

        serializer = GradeRecordSerializer(grade_records, many=True)

        return Response({
            'success': True,
            'total_records': grade_records.count(),
            'grades': serializer.data,
        }, status=status.HTTP_200_OK)


class MyReportCardView(APIView):
    """
    GET /api/grades/my-report-card/

    Returns the current student's full report card.
    Used on the student dashboard to show GPA and per-subject performance.

    Permissions: Students only.
    """
    permission_classes = [IsStudent]

    def get(self, request):
        """Return the report card for the currently logged-in student."""
        # Find the student profile
        try:
            student_profile = StudentProfile.objects.select_related(
                'user', 'enrolled_class'
            ).get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response(
                {'success': False, 'error': 'No student profile found for your account.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Build the report card
        report_card_data = build_report_card(student_profile)

        return Response({
            'success': True,
            'report_card': report_card_data,
        }, status=status.HTTP_200_OK)


# ==============================================================================
# Parent Views (children's grades)
# ==============================================================================

class MyChildrenGradesView(APIView):
    """
    GET /api/grades/my-children-grades/

    Returns grade records and report cards for all children linked to the current parent.
    Permissions: Parents only.
    """
    permission_classes = [IsParent]

    def get(self, request):
        """Return grades for all children of the current parent."""
        # Find the parent's profile
        try:
            parent_profile = ParentProfile.objects.get(user=request.user)
        except ParentProfile.DoesNotExist:
            return Response(
                {'success': False, 'error': 'No parent profile found for your account.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get all children linked to this parent
        children_list = parent_profile.children.select_related('user', 'enrolled_class').all()

        if not children_list.exists():
            return Response({
                'success': True,
                'message': 'No children are linked to your account.',
                'children': [],
            }, status=status.HTTP_200_OK)

        # Build a report card for each child
        all_children_data = []

        for child_student in children_list:
            report_card_data = build_report_card(child_student)
            all_children_data.append(report_card_data)

        return Response({
            'success': True,
            'total_children': len(all_children_data),
            'children': all_children_data,
        }, status=status.HTTP_200_OK)


# ==============================================================================
# Shared Helper Function
# ==============================================================================

def build_report_card(student_object):
    """
    Build a complete report card dictionary for a given student.

    This function:
    1. Fetches all grade records for the student
    2. Groups them by subject
    3. Calculates per-subject averages and letter grades
    4. Calculates the overall average percentage and overall letter grade

    Returns a dictionary containing all the report card data.
    """
    # Get all grade records for this student
    all_grade_records = GradeRecord.objects.filter(
        student=student_object
    ).select_related('assessment', 'assessment__subject')

    # Group the grades by subject name
    # subject_grades_map is a dictionary: { subject_name: [list of GradeRecord objects] }
    subject_grades_map = {}

    for grade_record in all_grade_records:
        subject_name = grade_record.assessment.subject.name

        # If this subject isn't in the map yet, add it
        if subject_name not in subject_grades_map:
            subject_grades_map[subject_name] = []

        # Add this grade record to the subject's list
        subject_grades_map[subject_name].append(grade_record)

    # Now build the per-subject summary list
    subject_summaries_list = []
    all_percentages_list = []  # We'll use this to calculate the overall percentage

    for subject_name, grade_records_for_subject in subject_grades_map.items():
        total_marks_obtained = 0
        total_max_marks = 0
        best_grade = 'F'
        grade_order = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'F': 4}

        # Sum up the marks for this subject
        for single_grade in grade_records_for_subject:
            total_marks_obtained = total_marks_obtained + float(single_grade.marks_obtained)
            total_max_marks = total_max_marks + float(single_grade.assessment.max_marks)

            # Track the best grade this student has received in this subject
            if grade_order.get(single_grade.letter_grade, 4) < grade_order.get(best_grade, 4):
                best_grade = single_grade.letter_grade

        # Calculate the average percentage for this subject
        if total_max_marks == 0:
            subject_average_percentage = 0
        else:
            subject_average_percentage = round((total_marks_obtained / total_max_marks) * 100, 2)

        # Calculate average marks per assessment
        number_of_assessments = len(grade_records_for_subject)
        average_marks = round(total_marks_obtained / number_of_assessments, 2) if number_of_assessments > 0 else 0

        # Determine the overall letter grade for this subject
        subject_letter_grade = calculate_letter_grade_from_percentage(subject_average_percentage)

        # Add this subject's summary to our list
        subject_summaries_list.append({
            'subject_name': subject_name,
            'total_assessments': number_of_assessments,
            'average_marks': average_marks,
            'average_percentage': subject_average_percentage,
            'best_grade': best_grade,
            'overall_letter_grade': subject_letter_grade,
        })

        # Add this subject's percentage to the list for overall average calculation
        all_percentages_list.append(subject_average_percentage)

    # Calculate the overall average percentage across all subjects
    if len(all_percentages_list) == 0:
        overall_percentage = 0
    else:
        total_percentage_sum = 0
        for percentage_value in all_percentages_list:
            total_percentage_sum = total_percentage_sum + percentage_value
        overall_percentage = round(total_percentage_sum / len(all_percentages_list), 2)

    # Determine the overall letter grade
    overall_letter_grade = calculate_letter_grade_from_percentage(overall_percentage)

    # Get student info for the report card header
    student_name = student_object.user.get_full_name() or student_object.user.username
    class_name = student_object.enrolled_class.name if student_object.enrolled_class else 'No Class'

    return {
        'student_name': student_name,
        'student_admission_number': student_object.admission_number,
        'class_name': class_name,
        'academic_year': student_object.enrolled_class.academic_year if student_object.enrolled_class else 'N/A',
        'overall_percentage': overall_percentage,
        'overall_letter_grade': overall_letter_grade,
        'subject_summaries': subject_summaries_list,
    }
