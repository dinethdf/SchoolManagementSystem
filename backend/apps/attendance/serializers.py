# apps/attendance/serializers.py
# Serializers convert Attendance model data to/from JSON format for the API.
# They also validate incoming data before it is saved to the database.

from rest_framework import serializers
from .models import Attendance
from apps.people.models import StudentProfile


class AttendanceSerializer(serializers.ModelSerializer):
    """
    Converts a single Attendance record to JSON and back.
    Also includes read-only extra fields for display purposes.
    """

    # Extra read-only fields to make the API response more useful
    # These pull data from related models so the frontend doesn't need extra requests

    # The student's full name (e.g. "John Doe") — read-only, for display
    student_name = serializers.SerializerMethodField()

    # The student's admission number (e.g. "STU-2026-001") — read-only, for display
    student_admission_number = serializers.SerializerMethodField()

    # The class name (e.g. "Grade 10-A") — read-only, for display
    class_name = serializers.SerializerMethodField()

    # The subject name (e.g. "Mathematics") — read-only, for display
    subject_name = serializers.SerializerMethodField()

    # Name of the teacher who marked attendance — read-only
    marked_by_name = serializers.SerializerMethodField()

    class Meta:
        # Use the Attendance model
        model = Attendance

        # These are the fields that will appear in the JSON response
        fields = [
            'id',
            'student',
            'student_name',
            'student_admission_number',
            'school_class',
            'class_name',
            'subject',
            'subject_name',
            'date',
            'status',
            'marked_by',
            'marked_by_name',
            'remarks',
            'created_at',
            'updated_at',
        ]

        # These fields are set by the server, not by the user submitting the form
        read_only_fields = ['id', 'created_at', 'updated_at', 'marked_by']

    def get_student_name(self, attendance_record):
        """Return the student's full name from their linked user account."""
        student_user = attendance_record.student.user
        return student_user.get_full_name() or student_user.username

    def get_student_admission_number(self, attendance_record):
        """Return the student's admission/roll number."""
        return attendance_record.student.admission_number

    def get_class_name(self, attendance_record):
        """Return the school class name."""
        return attendance_record.school_class.name

    def get_subject_name(self, attendance_record):
        """Return the subject name, or None if no subject was specified."""
        if attendance_record.subject:
            return attendance_record.subject.name
        return None

    def get_marked_by_name(self, attendance_record):
        """Return the name of the teacher or admin who marked the attendance."""
        if attendance_record.marked_by:
            return attendance_record.marked_by.get_full_name() or attendance_record.marked_by.username
        return None


class BulkAttendanceSerializer(serializers.Serializer):
    """
    Accepts a bulk attendance submission from a teacher.
    The teacher selects a class and date, then submits a list of student statuses at once.

    Expected input format:
    {
        "school_class": 1,
        "date": "2026-10-23",
        "subject": 2,  (optional)
        "attendance_list": [
            {"student": 5, "status": "present", "remarks": ""},
            {"student": 6, "status": "absent", "remarks": "Sick"},
        ]
    }
    """

    # The ID of the class being marked
    school_class = serializers.IntegerField(
        help_text="ID of the school class whose attendance is being taken."
    )

    # The date for which attendance is being recorded
    date = serializers.DateField(
        help_text="Date of attendance in YYYY-MM-DD format."
    )

    # Optional: the specific subject for this attendance session
    subject = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="Optional subject ID if taking subject-specific attendance."
    )

    # The list of individual student attendance entries
    attendance_list = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of student attendance entries — each with student ID and status."
    )

    def validate_attendance_list(self, attendance_list_value):
        """
        Make sure each item in the attendance list has the required 'student' and 'status' fields.
        This runs before any data is saved to the database.
        """
        # Allowed status values
        allowed_status_values = ['present', 'absent', 'late', 'excused']

        # Loop through each entry and check it has the required fields
        for index, single_entry in enumerate(attendance_list_value):
            if 'student' not in single_entry:
                raise serializers.ValidationError(
                    f"Entry at position {index} is missing the 'student' field."
                )
            if 'status' not in single_entry:
                raise serializers.ValidationError(
                    f"Entry at position {index} is missing the 'status' field."
                )
            if single_entry['status'] not in allowed_status_values:
                raise serializers.ValidationError(
                    f"Entry at position {index} has an invalid status: '{single_entry['status']}'. "
                    f"Allowed values are: {allowed_status_values}"
                )

        return attendance_list_value


class AttendanceSummarySerializer(serializers.Serializer):
    """
    Read-only serializer for returning a student's attendance summary.
    This is not backed by a model — it just formats the calculated data.
    """

    # Total number of school days in the period
    total_days = serializers.IntegerField()

    # Number of days the student was present
    present_days = serializers.IntegerField()

    # Number of days the student was absent
    absent_days = serializers.IntegerField()

    # Number of days the student was late
    late_days = serializers.IntegerField()

    # Number of days the student was excused
    excused_days = serializers.IntegerField()

    # Attendance percentage rounded to 2 decimal places
    attendance_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
