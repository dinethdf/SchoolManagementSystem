# apps/attendance/views.py
# This file contains all the API views for the Attendance system.
# Each view class handles one API endpoint.

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
import datetime

from .models import Attendance
from .serializers import AttendanceSerializer, BulkAttendanceSerializer, AttendanceSummarySerializer
from .permissions import IsTeacherOrAdmin, IsStudent, IsParent
from apps.academics.models import SchoolClass, Subject
from apps.people.models import StudentProfile, ParentProfile


# ==============================================================================
# Helper Function
# ==============================================================================

def calculate_attendance_summary(attendance_queryset):
    """
    Given a queryset of Attendance records, calculate the summary statistics.
    Returns a dictionary with counts and the overall attendance percentage.

    This function is used by multiple views, so we define it once here to avoid repeating code.
    """
    # Count total number of records
    total_days = attendance_queryset.count()

    # Count each status separately using simple filter queries
    present_days = attendance_queryset.filter(status='present').count()
    absent_days = attendance_queryset.filter(status='absent').count()
    late_days = attendance_queryset.filter(status='late').count()
    excused_days = attendance_queryset.filter(status='excused').count()

    # Calculate percentage — (present + late) days count as "attended"
    # We count late as partial attendance since the student did show up
    if total_days == 0:
        # Avoid division by zero if there are no records
        attendance_percentage = 0
    else:
        # Present and Late both count as attended days
        attended_days = present_days + late_days
        attendance_percentage = round((attended_days / total_days) * 100, 2)

    return {
        'total_days': total_days,
        'present_days': present_days,
        'absent_days': absent_days,
        'late_days': late_days,
        'excused_days': excused_days,
        'attendance_percentage': attendance_percentage,
    }


# ==============================================================================
# Teacher / Admin Views
# ==============================================================================

class BulkMarkAttendanceView(APIView):
    """
    POST /api/attendance/bulk/

    Allows a teacher or admin to mark attendance for all students in a class at once.
    The teacher submits a list of student IDs with their attendance status for a specific date.

    Permissions: Teachers and Admins only.
    """
    permission_classes = [IsTeacherOrAdmin]

    def post(self, request):
        """
        Handle the bulk attendance submission.
        Expects school_class, date, and a list of student statuses.
        """
        # Step 1: Validate the incoming data using our serializer
        serializer = BulkAttendanceSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Step 2: Extract the validated values from the serializer
        validated_data = serializer.validated_data
        school_class_id = validated_data['school_class']
        attendance_date = validated_data['date']
        subject_id = validated_data.get('subject', None)
        attendance_list = validated_data['attendance_list']

        # Step 3: Verify the school class exists
        try:
            school_class_object = SchoolClass.objects.get(id=school_class_id)
        except SchoolClass.DoesNotExist:
            return Response(
                {'success': False, 'error': f'School class with ID {school_class_id} not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Step 4: If a subject was specified, verify it exists
        subject_object = None
        if subject_id:
            try:
                subject_object = Subject.objects.get(id=subject_id)
            except Subject.DoesNotExist:
                return Response(
                    {'success': False, 'error': f'Subject with ID {subject_id} not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )

        # Step 5: Process each student's attendance entry
        saved_records = []     # We'll collect successfully saved records here
        error_messages = []    # And collect any errors here

        for single_entry in attendance_list:
            student_id = single_entry['student']
            attendance_status = single_entry['status']
            teacher_remarks = single_entry.get('remarks', '')

            # Try to find the student
            try:
                student_object = StudentProfile.objects.get(id=student_id)
            except StudentProfile.DoesNotExist:
                error_messages.append(f'Student with ID {student_id} not found.')
                continue  # Skip this entry and move to the next student

            # Use update_or_create so that re-submitting attendance updates existing records
            # instead of causing a duplicate key error
            attendance_record, was_created = Attendance.objects.update_or_create(
                student=student_object,
                school_class=school_class_object,
                date=attendance_date,
                defaults={
                    'status': attendance_status,
                    'subject': subject_object,
                    'marked_by': request.user,
                    'remarks': teacher_remarks,
                }
            )

            # Add the saved record ID to our success list
            saved_records.append(attendance_record.id)

        # Step 6: Return a summary of what happened
        return Response({
            'success': True,
            'message': f'Attendance recorded for {len(saved_records)} students.',
            'records_saved': len(saved_records),
            'errors': error_messages,
        }, status=status.HTTP_201_CREATED)


class ClassAttendanceView(APIView):
    """
    GET /api/attendance/class/<class_id>/?date=YYYY-MM-DD

    Returns all attendance records for a specific class on a specific date.
    Used by teachers to review or edit attendance they already marked.

    Permissions: Teachers and Admins only.
    """
    permission_classes = [IsTeacherOrAdmin]

    def get(self, request, class_id):
        """Return attendance records for a class on a given date."""
        # Step 1: Get the date from the URL query parameter (e.g., ?date=2026-10-23)
        date_string = request.query_params.get('date', None)

        # If no date was provided, use today's date as the default
        if not date_string:
            date_string = datetime.date.today().isoformat()

        # Step 2: Verify the school class exists
        try:
            school_class_object = SchoolClass.objects.get(id=class_id)
        except SchoolClass.DoesNotExist:
            return Response(
                {'success': False, 'error': f'School class with ID {class_id} not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Step 3: Fetch all attendance records for this class on the given date
        attendance_records = Attendance.objects.filter(
            school_class=school_class_object,
            date=date_string
        ).select_related('student', 'student__user', 'subject', 'marked_by')

        # Step 4: Convert to JSON using the serializer
        serializer = AttendanceSerializer(attendance_records, many=True)

        return Response({
            'success': True,
            'class_name': school_class_object.name,
            'date': date_string,
            'total_records': attendance_records.count(),
            'attendance': serializer.data,
        }, status=status.HTTP_200_OK)


class StudentAttendanceHistoryView(APIView):
    """
    GET /api/attendance/student/<student_id>/

    Returns the full attendance history for a specific student.
    Used by teachers and admins to review a student's attendance record.

    Permissions: Teachers and Admins only.
    """
    permission_classes = [IsTeacherOrAdmin]

    def get(self, request, student_id):
        """Return all attendance records for a specific student."""
        # Verify the student exists
        try:
            student_object = StudentProfile.objects.get(id=student_id)
        except StudentProfile.DoesNotExist:
            return Response(
                {'success': False, 'error': f'Student with ID {student_id} not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Fetch all attendance records for this student, newest first
        attendance_records = Attendance.objects.filter(
            student=student_object
        ).select_related('school_class', 'subject', 'marked_by').order_by('-date')

        # Convert to JSON
        serializer = AttendanceSerializer(attendance_records, many=True)

        return Response({
            'success': True,
            'student_name': student_object.user.get_full_name() or student_object.user.username,
            'student_admission_number': student_object.admission_number,
            'total_records': attendance_records.count(),
            'attendance': serializer.data,
        }, status=status.HTTP_200_OK)


class StudentAttendanceSummaryView(APIView):
    """
    GET /api/attendance/student/<student_id>/summary/

    Returns a percentage summary of a specific student's attendance.
    Used by teachers and admins to quickly see how often a student attends.

    Permissions: Teachers and Admins only.
    """
    permission_classes = [IsTeacherOrAdmin]

    def get(self, request, student_id):
        """Return attendance summary (counts + percentage) for a specific student."""
        # Verify the student exists
        try:
            student_object = StudentProfile.objects.get(id=student_id)
        except StudentProfile.DoesNotExist:
            return Response(
                {'success': False, 'error': f'Student with ID {student_id} not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Fetch all attendance records for this student
        attendance_records = Attendance.objects.filter(student=student_object)

        # Use the helper function to calculate the summary statistics
        summary_data = calculate_attendance_summary(attendance_records)

        # Add student info to the response
        summary_data['student_name'] = student_object.user.get_full_name() or student_object.user.username
        summary_data['student_admission_number'] = student_object.admission_number

        return Response({
            'success': True,
            'summary': summary_data,
        }, status=status.HTTP_200_OK)


# ==============================================================================
# Student Views (own attendance only)
# ==============================================================================

class MyAttendanceView(APIView):
    """
    GET /api/attendance/my-attendance/

    Returns the logged-in student's own full attendance history.
    Students can only see their own records.

    Permissions: Students only.
    """
    permission_classes = [IsStudent]

    def get(self, request):
        """Return the current student's complete attendance history."""
        # Find the student profile linked to the currently logged-in user
        try:
            student_profile = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response(
                {'success': False, 'error': 'No student profile found for your account.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Fetch all attendance records for this student, newest first
        attendance_records = Attendance.objects.filter(
            student=student_profile
        ).select_related('school_class', 'subject').order_by('-date')

        # Convert to JSON
        serializer = AttendanceSerializer(attendance_records, many=True)

        return Response({
            'success': True,
            'total_records': attendance_records.count(),
            'attendance': serializer.data,
        }, status=status.HTTP_200_OK)


class MyAttendanceSummaryView(APIView):
    """
    GET /api/attendance/my-attendance/summary/

    Returns the logged-in student's attendance summary (percentages and counts).
    Students use this to see their overall attendance rate on their dashboard.

    Permissions: Students only.
    """
    permission_classes = [IsStudent]

    def get(self, request):
        """Return the current student's attendance summary."""
        # Find the student profile
        try:
            student_profile = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response(
                {'success': False, 'error': 'No student profile found for your account.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get all attendance records for this student
        attendance_records = Attendance.objects.filter(student=student_profile)

        # Calculate the summary using the helper function
        summary_data = calculate_attendance_summary(attendance_records)

        return Response({
            'success': True,
            'summary': summary_data,
        }, status=status.HTTP_200_OK)


# ==============================================================================
# Parent Views (children's attendance)
# ==============================================================================

class MyChildrenAttendanceView(APIView):
    """
    GET /api/attendance/my-children/

    Returns attendance records for all of the logged-in parent's linked children.
    Parents can see data for each of their children enrolled in the school.

    Permissions: Parents only.
    """
    permission_classes = [IsParent]

    def get(self, request):
        """Return attendance history for all children linked to the current parent."""
        # Find the parent profile linked to this user account
        try:
            parent_profile = ParentProfile.objects.get(user=request.user)
        except ParentProfile.DoesNotExist:
            return Response(
                {'success': False, 'error': 'No parent profile found for your account.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get the list of children linked to this parent
        children_list = parent_profile.children.all()

        if not children_list.exists():
            return Response({
                'success': True,
                'message': 'No children are linked to your account.',
                'children': [],
            }, status=status.HTTP_200_OK)

        # Build the response — one section per child
        all_children_data = []

        for child_student in children_list:
            # Get all attendance records for this child
            attendance_records = Attendance.objects.filter(
                student=child_student
            ).select_related('school_class', 'subject').order_by('-date')

            # Calculate summary for this child
            summary_data = calculate_attendance_summary(attendance_records)

            # Serialize the attendance records
            serializer = AttendanceSerializer(attendance_records, many=True)

            # Build the child's data object
            child_data = {
                'student_id': child_student.id,
                'student_name': child_student.user.get_full_name() or child_student.user.username,
                'admission_number': child_student.admission_number,
                'class_name': child_student.enrolled_class.name if child_student.enrolled_class else 'No Class',
                'summary': summary_data,
                'attendance': serializer.data,
            }

            all_children_data.append(child_data)

        return Response({
            'success': True,
            'total_children': len(all_children_data),
            'children': all_children_data,
        }, status=status.HTTP_200_OK)
