# apps/assignments/serializers.py
# Serializers convert Assignment and Submission models to/from JSON format for the REST API.
# They validate incoming HTTP request data before updating the database.

from rest_framework import serializers
from .models import Assignment, Submission
from apps.people.models import StudentProfile


class AssignmentSerializer(serializers.ModelSerializer):
    """
    Serializer for creating, viewing, and updating assignments.
    Includes helpful read-only fields for displaying related subject and class details.
    """

    # Human-friendly names from related foreign key tables
    subject_name = serializers.SerializerMethodField()
    class_name = serializers.SerializerMethodField()
    assigned_by_name = serializers.SerializerMethodField()

    # Submission metrics for teacher dashboards
    total_students_count = serializers.SerializerMethodField()
    submitted_count = serializers.SerializerMethodField()
    graded_count = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = [
            'id',
            'title',
            'description',
            'subject',
            'subject_name',
            'school_class',
            'class_name',
            'assigned_by',
            'assigned_by_name',
            'due_date',
            'max_marks',
            'assignment_type',
            'is_active',
            'total_students_count',
            'submitted_count',
            'graded_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'assigned_by', 'created_at', 'updated_at']

    def get_subject_name(self, assignment_instance):
        """Fetch the subject name (e.g. 'Mathematics')."""
        return assignment_instance.subject.name

    def get_class_name(self, assignment_instance):
        """Fetch the classroom batch name (e.g. 'Grade 10-A')."""
        return assignment_instance.school_class.name

    def get_assigned_by_name(self, assignment_instance):
        """Fetch the name of the teacher who posted this assignment."""
        if assignment_instance.assigned_by:
            user = assignment_instance.assigned_by
            return user.get_full_name() or user.username
        return "Not Assigned"

    def get_total_students_count(self, assignment_instance):
        """Count how many students belong to the class assigned this task."""
        # Find all students enrolled in this assignment's school class
        enrolled_students = StudentProfile.objects.filter(
            enrolled_class=assignment_instance.school_class
        )
        return enrolled_students.count()

    def get_submitted_count(self, assignment_instance):
        """Count how many students have submitted their assignment (submitted or graded or late)."""
        active_submissions = assignment_instance.submissions.exclude(status='pending')
        return active_submissions.count()

    def get_graded_count(self, assignment_instance):
        """Count how many submissions have been fully evaluated and graded."""
        return assignment_instance.submissions.filter(status='graded').count()


class SubmissionSerializer(serializers.ModelSerializer):
    """
    Serializer for viewing a student's submission record.
    Pulls student profile details so teachers can easily identify the student.
    """

    # Student metadata
    student_id = serializers.IntegerField(source='student.id', read_only=True)
    student_name = serializers.SerializerMethodField()
    admission_number = serializers.CharField(source='student.admission_number', read_only=True)
    roll_number = serializers.IntegerField(source='student.roll_number', read_only=True)

    # Assignment metadata
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)
    subject_name = serializers.CharField(source='assignment.subject.name', read_only=True)
    max_marks = serializers.IntegerField(source='assignment.max_marks', read_only=True)
    due_date = serializers.DateField(source='assignment.due_date', read_only=True)

    # Graded by teacher name
    graded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Submission
        fields = [
            'id',
            'assignment',
            'assignment_title',
            'subject_name',
            'max_marks',
            'due_date',
            'student',
            'student_id',
            'student_name',
            'admission_number',
            'roll_number',
            'submission_text',
            'status',
            'submitted_at',
            'marks_obtained',
            'teacher_feedback',
            'graded_at',
            'graded_by',
            'graded_by_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'assignment',
            'student',
            'status',
            'submitted_at',
            'graded_at',
            'graded_by',
            'created_at',
            'updated_at',
        ]

    def get_student_name(self, submission_instance):
        """Fetch the student's full name or username."""
        student_user = submission_instance.student.user
        return student_user.get_full_name() or student_user.username

    def get_graded_by_name(self, submission_instance):
        """Fetch the evaluating teacher's full name."""
        if submission_instance.graded_by:
            teacher_user = submission_instance.graded_by
            return teacher_user.get_full_name() or teacher_user.username
        return None


class StudentSubmitSerializer(serializers.Serializer):
    """
    Serializer used when a student turns in their homework answer text.
    Validates that the answer text is provided and not empty.
    """

    submission_text = serializers.CharField(
        required=True,
        allow_blank=False,
        help_text="The solution, answer, or essay text written by the student."
    )


class TeacherGradeSerializer(serializers.Serializer):
    """
    Serializer used by teachers to grade a student submission.
    Validates that marks_obtained is positive and within the maximum marks.
    """

    marks_obtained = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        required=True,
        min_value=0,
        help_text="The score awarded to the student."
    )
    teacher_feedback = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
        help_text="Optional remarks or advice for the student."
    )
