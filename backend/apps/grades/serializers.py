# apps/grades/serializers.py
# Serializers convert Assessment and GradeRecord model data to/from JSON for the API.
# They also validate incoming data before it is saved to the database.

from rest_framework import serializers
from .models import Assessment, GradeRecord


class AssessmentSerializer(serializers.ModelSerializer):
    """
    Converts an Assessment record to JSON and back.
    Includes read-only display fields for related models.
    """

    # Read-only display fields pulled from related models
    subject_name = serializers.SerializerMethodField()
    class_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Assessment
        fields = [
            'id',
            'name',
            'assessment_type',
            'subject',
            'subject_name',
            'school_class',
            'class_name',
            'max_marks',
            'assessment_date',
            'academic_year',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']

    def get_subject_name(self, assessment):
        """Return the subject name linked to this assessment."""
        return assessment.subject.name

    def get_class_name(self, assessment):
        """Return the school class name linked to this assessment."""
        return assessment.school_class.name

    def get_created_by_name(self, assessment):
        """Return the name of the teacher or admin who created this assessment."""
        if assessment.created_by:
            return assessment.created_by.get_full_name() or assessment.created_by.username
        return None


class GradeRecordSerializer(serializers.ModelSerializer):
    """
    Converts a single GradeRecord to JSON.
    Includes read-only display fields for related models.
    Also calculates and shows the percentage scored.
    """

    # Read-only display fields pulled from related models
    student_name = serializers.SerializerMethodField()
    student_admission_number = serializers.SerializerMethodField()
    assessment_name = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    class_name = serializers.SerializerMethodField()
    max_marks = serializers.SerializerMethodField()
    percentage = serializers.SerializerMethodField()
    marked_by_name = serializers.SerializerMethodField()

    class Meta:
        model = GradeRecord
        fields = [
            'id',
            'assessment',
            'assessment_name',
            'subject_name',
            'class_name',
            'max_marks',
            'student',
            'student_name',
            'student_admission_number',
            'marks_obtained',
            'percentage',
            'letter_grade',
            'remarks',
            'marked_by',
            'marked_by_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'letter_grade', 'created_at', 'updated_at', 'marked_by']

    def get_student_name(self, grade_record):
        """Return the student's full name."""
        student_user = grade_record.student.user
        return student_user.get_full_name() or student_user.username

    def get_student_admission_number(self, grade_record):
        """Return the student's admission number."""
        return grade_record.student.admission_number

    def get_assessment_name(self, grade_record):
        """Return the assessment title."""
        return grade_record.assessment.name

    def get_subject_name(self, grade_record):
        """Return the name of the subject this assessment belongs to."""
        return grade_record.assessment.subject.name

    def get_class_name(self, grade_record):
        """Return the name of the class this assessment belongs to."""
        return grade_record.assessment.school_class.name

    def get_max_marks(self, grade_record):
        """Return the maximum possible marks for this assessment."""
        return grade_record.assessment.max_marks

    def get_percentage(self, grade_record):
        """
        Calculate the percentage score the student achieved.
        Formula: (marks_obtained / max_marks) * 100
        Returns the percentage rounded to 2 decimal places.
        """
        # Avoid division by zero if max_marks is somehow 0
        if grade_record.assessment.max_marks == 0:
            return 0

        percentage_value = (float(grade_record.marks_obtained) / float(grade_record.assessment.max_marks)) * 100
        return round(percentage_value, 2)

    def get_marked_by_name(self, grade_record):
        """Return the name of the teacher who entered these marks."""
        if grade_record.marked_by:
            return grade_record.marked_by.get_full_name() or grade_record.marked_by.username
        return None


class BulkGradeRecordSerializer(serializers.Serializer):
    """
    Accepts a bulk grade submission from a teacher.
    The teacher selects an assessment, then submits marks for all students at once.

    Expected input format:
    {
        "assessment": 3,
        "grade_list": [
            {"student": 5, "marks_obtained": 85, "remarks": "Well done"},
            {"student": 6, "marks_obtained": 72, "remarks": ""},
        ]
    }
    """

    # The assessment ID that these marks belong to
    assessment = serializers.IntegerField(
        help_text="ID of the assessment for which marks are being entered."
    )

    # List of individual student grade entries
    grade_list = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of student grade entries — each with student ID and marks_obtained."
    )

    def validate_grade_list(self, grade_list_value):
        """
        Validate that each entry in the grade list has the required 'student' and 'marks_obtained' fields.
        Also check that marks_obtained is a non-negative number.
        """
        for index, single_entry in enumerate(grade_list_value):
            if 'student' not in single_entry:
                raise serializers.ValidationError(
                    f"Entry at position {index} is missing the 'student' field."
                )
            if 'marks_obtained' not in single_entry:
                raise serializers.ValidationError(
                    f"Entry at position {index} is missing the 'marks_obtained' field."
                )
            # Make sure marks are not a negative number
            try:
                marks_value = float(single_entry['marks_obtained'])
                if marks_value < 0:
                    raise serializers.ValidationError(
                        f"Entry at position {index}: marks_obtained cannot be negative."
                    )
            except (ValueError, TypeError):
                raise serializers.ValidationError(
                    f"Entry at position {index}: marks_obtained must be a valid number."
                )

        return grade_list_value


class ReportCardSubjectSerializer(serializers.Serializer):
    """
    Read-only serializer representing a student's performance in one subject.
    Used inside the full report card response.
    """
    subject_name = serializers.CharField()
    total_assessments = serializers.IntegerField()
    average_marks = serializers.DecimalField(max_digits=5, decimal_places=2)
    average_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    best_grade = serializers.CharField()
    overall_letter_grade = serializers.CharField()


class ReportCardSerializer(serializers.Serializer):
    """
    Read-only serializer for the full student report card.
    Contains per-subject summaries and overall GPA.
    """
    student_name = serializers.CharField()
    student_admission_number = serializers.CharField()
    class_name = serializers.CharField()
    academic_year = serializers.CharField()
    overall_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    overall_letter_grade = serializers.CharField()
    subject_summaries = ReportCardSubjectSerializer(many=True)
